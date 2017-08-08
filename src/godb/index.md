Web-based information systems need to store and manage large amounts of data, so they typically enlist the help of a persistent database management system (DBMS). These are separate server processes that encapsulate and manage the actual data and index files on disk, while supporting simultaneous access by multiple clients.

This tutorial assumes you've already taken [a relational DBMS course](https://www.washington.edu/students/crscat/info.html#info340) and already know the basics of the Structure Query Language (SQL). I will show you how to interact with a relational DBMS from Go, and how to avoid SQL injection attacks.

I will also show you how to interact with the distributed document-oriented DBMS MongoDB. As opposed to a relational database that stores data in flat tables with columns, MongoDB stores full JSON documents that can have arbitrary schema, nested objects, arrays, etc. This flexibility is handy for many types of information systems, but it does come with a few trade-offs that I will discuss in more detail below.

## Interacting with Relational DBMSs

In order to interact with a relational database from Go, we need a relational DBMS instance we can connect to and play with. Since you know how to use [Docker](../docker/), we can use it to spin-up any of the popular open-source relational DBMSs: MySQL/MariaDB, PostgreSQL, etc. There are endless debates about which of these is the best choice, and in truth, the answer depends on what you need the DBMS to do and how willing you are to tune it. 

For purposes of this tutorial, let's use MySQL, though the code will be nearly identical if you choose a different DBMS. The only real differences will be which package you import, and which dialect of SQL you use for your queries.

### Running the MySQL Docker Container

Like many relational DBMSs, MySQL implements its own security system, with its own user accounts and passwords that are distinct from the host operating system. New instances automatically have one super-user account, known as `root`, but you need to supply the password you want that account to have. Let's start by defining a new environment variable to hold this password. Enter this into a new terminal window:

```bash
export MYSQL_ROOT_PASSWORD="some super-secret password"
```

If you want a randomly-generated password, you can use the `rand` subcommand of `openssl`:

```bash
# generate 18 random bytes and base64 encode them
export MYSQL_ROOT_PASSWORD=$(openssl rand -base64 18)
# echo it so that you can see what it generated
echo $MYSQL_ROOT_PASSWORD
```

This sets the environment variable in the host shell, but remember that Docker containers are completely isolated by default, so we need to forward this environment variable into the container when we run it using the `-e` flag on the `docker run` command.

In production, we would run the MySQL container within a [Docker private network](../sessions/#secrunningredis) so that it's accessible only by our other containers, but during development, you typically want to connect to it from your web server running directly on your host, so that you can quickly restart and debug it. So in this case, we also want to publish port 3306, which is the default MySQL port.

Although you can create multiple databases within a MySQL server, web applications typically put all of their tables in just one database, so we also want to create a new database when the container starts. You can do this automatically by setting the MYSQL_DATABASE environment variable to the name you want to give this new database.

To start the MySQL server with these settings, use this command

```bash
docker run -d \
-p 3306:3306 \
--name mysqldemo \
-e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
-e MYSQL_DATABASE=demo \
mysql
```

Here we use the `-e` flag to set the `MYSQL_ROOT_PASSWORD` environment variable within the container. The value we use for this variable is the current value of the same variable name defined in our host shell (`$MYSQL_ROOT_PASSWORD`). This effectively forwards the environment variable into the container, though there is no lasting relationship between the two variables: if you change the variable defined in your host shell, it will have no effect on the variable defined within the running container.

Use `docker ps` to make sure the server is running. If it's not listed, use `docker logs mysqldemo` to see what error it wrote to the log file.

If you want to connect to this running MySQL instance using the MySQL CLI, you can run another container instance, overriding the default entry point:

```bash
docker run -it \
--rm \
--network host \
mysql sh -c "mysql -h127.0.0.1 -uroot -p$MYSQL_ROOT_PASSWORD"
```

You've seen [many of these flags](../docker/) before, but the `--network host` might be new to you. This tells Docker to run this container using the host machine's network stack rather than its own isolated network stack. When using this setting, the container's network can see everything your host's network can see, including that published 3306 port from the other MySQL container.

The expression `sh -c "mysql -h127.0.0.1 -uroot -p$MYSQL_ROOT_PASSWORD"` that follows the `mysql` container image name overrides the default entry point command for that container, running the MySQL CLI instead. That CLI needs to know the host, user, and password to use when connecting, and we supply those values in the command arguments. Since we used double-quotes around the command, our host's shell will expand the `$MYSQL_ROOT_PASSWORD` environment variable we set earlier, and pass that expanded value into the container when it starts. 

If all goes well, you should now be at a MySQL CLI prompt, talking to your MySQL server container. Try executing the `show databases;` query to see the list of databases, and `select version();` to get the database version number. 

Execute the `exit` command to exit the CLI and return to your host prompt. Since we used the `--rm` flag, this CLI container will automatically be removed after it exits, but the server container will continue running. Use `docker ps` to verify.

### Installing the MySQL Client Package

Relational databases are very similar to each other, and it's not uncommon for a project to switch engines over time. To make this easier, the Go standard library defines a common set of functions and structs in the [database/sql](https://golang.org/pkg/database/sql/) package that are used when interacting with any relational DBMSs. This code in turn uses an easily-replaceable RDBMS-specific package, known as a **driver**, to actually communicate with the database. These drivers implement the interfaces defined in the [database/sql/driver](https://golang.org/pkg/database/sql/driver/) package for the specific RDBMS protocol.

To install the [MySQL diver for Go](https://github.com/go-sql-driver/mysql) on your system, use this command:

```bash
go get github.com/go-sql-driver/mysql
```

If it worked, you won't see any output: no news is good news!

### Connecting From a Go Program

Now let's see how to connect to our MySQL server instance from a Go program. Create a new directory at `$GOPATH/src/mysqldemo`, and in that directory create a new file named `main.go`. Add this code to that file:

```go
package main

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	//create the data source name, which identifies the
	//user, password, server address, and default database
	dsn := fmt.Sprintf("root:%s@tcp(127.0.0.1:3306)/", os.Getenv("MYSQL_ROOT_PASSWORD"))

	//create a database object, which manages a pool of
	//network connections to the database server
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Printf("error opening database: %v\n", err)
		os.Exit(1)
	}

	//ensure that the database gets closed when we are done
	defer db.Close()

	//for now, just ping the server to ensure we have
	//a live connection to it
	if err := db.Ping(); err != nil {
		fmt.Printf("error pinging database: %v\n", err)
	} else {
		fmt.Printf("successfully connected!\n")
	}
}
```

To run this program, execute this at the command line:

```bash
go run main.go
```

The `_ "github.com/go-sql-driver/mysql"` import line might look strange, but it is essentially importing the MySQL driver without creating a local name for the package in our code. Since we will be using only the common functions and structs in the `database/sql` package, we will never need to call the MySQL driver directly. As you might have noticed before, Go requires that you actually use all variables you declare, and package names are just like variables, so if you import a package but never use anything from it, the Go compiler will generate an error, and the `goimports` tool will simply remove the import. But if we don't import the package, its code won't be in our built executable, which will cause an error at runtime. To import a package that you never call, you can assign the blank identifier (`_`) to the imported package. This ensures the package gets into your built executable, but avoids the compile error you'd normally get from not calling any functions within that package.

The code in `main()` starts by creating a **data source name** string, the [format](https://github.com/go-sql-driver/mysql#dsn-data-source-name) of which is defined by the MySQL driver package. Here we tell it to connect as the `root` user, supplying the value of the `MYSQL_ROOT_PASSWORD` environment variable as the password. We also specify that we want to connect to the server via TCP/IP at the address `127.0.0.1:3306`. The final `/demo` specifies the database name you want to use after connecting to the server. Here we ask for the database named "demo", which is the name we used in the `MYSQL_DATABASE` environment variable when we started the server.

The `sql.DB` object returned from the `sql.Open()` function is actually a reference to a whole pool of connections to the database server. A Go web server processes HTTP requests concurrently, so many requests may need to interact with the database at the same time. Since you can execute only one query at a time on a given database connection, the Go SQL package automatically maintains a pool of those connections, creating new ones as necessary to ensure that none of your HTTP requests are blocked waiting to talk to the database.

Since new connections are only made as needed, the last bit of code here just pings the server to ensure that we are able to connect to it. You don't typically need to do this, as it will open a connect the first time you query the database, but for now this will ensure that your Go program can actually connect and interact with the server.

### Bootstrapping the Database Schema

The MySQL database container starts clean with only the basic system tables, so you need to create whatever schema your app needs. You can do this from your Go program by executing `create table` queries:

```go
	//create a new table in the database named "contacts"
	//with columns for an auto-incremented ID, email
	//first name, last name, etc.
	sql := `create table if not exists contacts (
		id int not null auto_increment primary key,
		email varchar(128) not null,
		first_name varchar(64) not null,
		last_name varchar(128) not null
	)`
	if _, err := db.Exec(sql); err != nil {
		fmt.Printf("error creating table: %v\n", err)
	}
```

This works, but it becomes awkward as your schema gets larger and more complex. A better alternative is to build your own Docker container image, based on the MySQL image, adding a schema creation script. The MySQL container will execute any `.sql` scripts you put into the `/docker-entrypoint-initdb.d/` directory within the container when the container instance starts.

To try this, put the `create table` SQL above into a file named `schema.sql` and then create this Dockerfile:

```docker
FROM mysql
COPY boostrap-script.sql /docker-entrypoint-initdb.d/schema.sql
```

Then build the new image, giving it a name that starts with your Docker Hub user name:

```bash
docker build -t your-dockerhub-name/mysqldemo .
```

To run an instance, use all of the same flags as above, but replace the `mysql` container image name with `your-dockerhub-name/mysqldemo`. Remember to stop and remove the existing container you ran earlier before running this new one.

For more details, see the "Initializing a fresh instance" section of the [MySQL Docker container documentation](https://hub.docker.com/_/mysql/).

### Inserting and Getting Auto-Assigned IDs

To insert new rows into the database, use the `db.Exec()` method, but this time use the first return value to get the newly-assigned ID for the row:

```go
	//insert a new row into the "contacts" table
	//use ? markers for the values to defeat SQL
	//injection attacks
	q = "insert into contacts(email, first_name, last_name) values (?,?,?)"
	res, err := db.Exec(q, "test@test.com", "Test", "Tester")
	if err != nil {
		fmt.Printf("error inserting new row: %v\n", err)
	} else {
		//get the auto-assigned ID for the new row
		id, err := res.LastInsertId()
		if err != nil {
			fmt.Printf("error getting new ID: %v\n", id)
		} else {
			fmt.Printf("ID for new row is %d\n", id)
		}
	}
```

### Guarding Against SQL Injection Attacks

Many of the SQL statements you will execute from your web server will include values posted to your server by the web client. The first rule of web security is **assume all requests are hostile**, and the second related rule is **never trust data posted to your web server**. Many amateur developers simply concatenate posted values into their SQL statements, which creates a [SQL injection](https://www.owasp.org/index.php/SQL_Injection) vulnerability. For example **you should never do this**:

```go
//NEVER DO THIS!
searchQuereyFromClient := r.FormValue("q")
sql := "select * from contacts where last_name='" + searchQueryFromClient + "'"
```

The trouble is that SQL is an interpreted language, and this approach allows clients to inject arbitrary code into your SQL that will be interpreted by the RDBMS. For example, an attacker could post this search query:

```
' or 'a'='a
```

When concatenated as above, this results in the following SQL query

```sql
select * from contacts where last_name='' or 'a'='a'
```

This would select all contacts, even if that shouldn't be allowed. 

A much more destructive hacker could also take advantage of the way most RDBMSs allow clients to execute multiple statements separated by `;`. This hacker could post the following, much more devious search query:

```
'; drop table contacts; select '
```

When concatenated as above, this results in the following SQL

```sql
select * from contacts where last_name=''; drop table contacts; select ''
```

If you send this to your RDBMS, it will execute the first select statement, resulting in zero rows, then drop the entire contacts table, and finally select an empty string. As you might expect, the results would be rather damaging!

The correct way to incorporate values posted from a web client is to use parameter markers `?`, as shown in the previous section. The driver will ensure that these values are encoded or handled separately so that these kinds of SQL injection tricks won't succeed.

### Selecting Rows

When selecting rows, use the `db.Query()` method. This will execute the query and allow you to read one row at a time from the response stream. To work with the column values, we **scan** them into struct fields or variables:

```go
	//Contact represents a contact record
	type Contact struct {
		ID        int
		Email     string
		FirstName string
		LastName  string
	}
	
	//select rows from the table
	rows, err := db.Query("select id,email,first_name,last_name from contacts")
	//ensure the rows are closed
	defer rows.Close()
	
	//iterate over the returned rows, printing
	//then to std out
	fmt.Printf("rows\n-----\n")

	//while there are more rows
	for rows.Next() {
		//create a contact struct and scan
		//the columns into the fields
		contact := Contact{}
		if err := rows.Scan(&contact.ID, &contact.Email,
			&contact.FirstName, &contact.LastName); err != nil {
			fmt.Printf("error scanning row: %v\n", err)
		}

		//print the struct values to std out
		fmt.Printf("%d, %s, %s, %s\n", contact.ID, contact.Email,
			contact.FirstName, contact.LastName)
	}

	//if we got an error fetching the next row, report it
	if err := rows.Err(); err != nil {
		fmt.Printf("error getting next row: %v\n", err)
	}
```

There are a few things to note here. First, Go doesn't buffer the entire result set in memory, which could be enormous. Instead, the `.Query()` method returns a `sql.Rows` object, which lets you load one row at time into memory, and scan the columns into struct fields or variables. Each time you call `rows.Next()`, the internal current row buffer is overwritten with the next row data, so only one row remains in memory at a time.

Second, to actually work with the column data, you have to scan it into struct fields or variables. This is done using the `rows.Scan()` method, passing the address of the target fields/variables. The order of the arguments you pass to `.Scan()` should match the order of the columns in your `select` SQL statement. Ensure that the data type of your target field/variable is compatible with the data in the source column.

Third, errors could happen at any point: executing the select query; reading the next row; or scanning column values. Check for returned errors and report them in whatever way makes sense for your application. Here we just write to standard out, but in a web server, you'd use the `http.Error()` function instead.

### Cleaning Up

To stop and remove your MySQL container, use this command, but note that this will also permanently delete all the data in the database:

```bash
docker rm -f mysqldemo
```

If you want to keep the actual data files between container runs, you need to mount a volume when running the server. See the [Where to Store Data section](https://hub.docker.com/_/mysql/) of the MySQL Docker image documentation, as well as the [Managing Data in Containers](https://docs.docker.com/engine/tutorials/dockervolumes/) article in the Docker documentation for more details.


## Interacting with MongoDB

Distributed document-oriented DBMSs have become a popular alternative to relational DBMSs, as they allow you to shift your schema easily over time, and distribute your data amongst multiple machines in a cluster. Instead of storing data in tables with rows and columns, these DBMSs store flexible "documents" that contain whatever data you want. The most popular of these in the open-source world is [MongoDB](https://www.mongodb.com/).

A MongoDB server can have one or more databases, each of which contains one or more **collections** of JSON documents. These collections are sort of like tables in a relational database, but they don't enforce any sort of schema on those documents (though recent versions of MongoDB now support [simple document validation](https://docs.mongodb.com/manual/core/document-validation/)). Instead collections are just groups of documents that you want to organize together, and they are commonly used to group documents by type (e.g., all user profile documents are saved in a "users" collection).

Since collections don't really establish schema, they are created automatically as you insert documents into them. Databases are created automatically as well the first time you reference them. This means that a MongoDB server requires no bootstrapping: you can just run it and start inserting documents.

This lack of schema enforcement is handy in the early days of a system, when requirements and data models are rapidly shifting, but it's also one of the significant drawbacks of document-oriented database like MongoDB. If you want to avoid putting crap into your database, you have to validate the data somewhere, and if the DBMS doesn't do it, your application has to. The burden of validation is still there: it just shifts from the DBMS to your own code.

The other significant drawback of MongoDB is that it can't join related data in the server. MongoDB does offer some powerful query operations on collections, but it doesn't join related data across collections like the SQL `JOIN` operator can. Instead, MongoDB encourages you to denormailze your data, duplicating information on the assumption that it changes far less frequently than you will have to read it. Denormalizing definitely increases read performance, but the burden of updating data that has been added to multiple documents falls upon the application developer, and it's easy to forget.

### Running the MongoDB Docker Container

Just like MySQL, MongoDB releases an official Docker container image with the name `mongo`. Although you can setup a root user password for the MongoDB server, you don't have to. If you run both your MongoDB and application container in a Docker private network, only your application will be allowed to connect to it, so there's not really any need to setup a root password unless you don't trust your system engineers (which is a much bigger problem).

Just as before, we are going to publish the server's default port (27017 for MongoDB) for this tutorial so that a Go programming running on our host will be able to connect to it. In production, use a private Docker network instead.

```bash
docker run -d \
-p 27017:27017 \
--name mongodemo \
mongo
```

Use `docker ps` to ensure that it's running. If you want to connect to it via the MongoDB CLI use the same container but override the default entry point, just as we did with MySQL:

```bash
docker run -it \
--rm \
--network host \
mongo sh -c 'exec mongo 127.0.0.1/demo'
```

If all goes well, the MongoDB CLI will connect to the server instance you ran, and leave you at the CLI prompt inside a new database named `demo`. Execute `help` to see a list of commands or refer to the [Mongo Shell Quick Reference](https://docs.mongodb.com/manual/reference/mongo-shell/). To insert a new test document, use this command:

```javascript
db.contacts.insertOne({"email": "test@test.com", "firstName": "Test", "lastName": "Tester"})
```

The `db` variable refers to the current database, and `.contacts` refers to a collection named "contacts." Since this collection doesn't exist yet, MongoDB just creates it for you automatically. The `.insertOne()` method of the collection inserts one new JSON document, which is supplied as the first parameter.

MongoDB automatically assigns an `_id` property to every new document by default, set to a new `ObjectId` value. This is a globally-unique value that won't collide with other document IDs in this database or anywhere else.

To see this new property, use the following command to find all the documents in the "contacts" collection:

```javascript
db.contacts.find()
```

To clean up, drop the "contacts" collection with this command:

```javascript
db.contacts.drop()
```

Enter the `exit` command to exit the CLI and return to your host's shell prompt. Just as in the MySQL example, the server container will continue running in the background, but the CLI container will be stopped and removed automatically because we used the `--rm` flag when running it.

### Installing the MongoDB Client Package

Since MongoDB is not a relational database, it doesn't implement a driver for the `database/sql` package. Instead you use the [mgo package](https://labix.org/mgo) (pronounced "mango"). To install it, use this command:

```bash
go get gopkg.in/mgo.v2
```

Remember, no news is good news!

### Connecting from a Go Program

Create a new directory at `$GOPATH/src/mongodemo` and create a `main.go` file within that directory with the following code:

```go
package main

import (
	"fmt"

	"gopkg.in/mgo.v2"
)

func main() {
	sess, err := mgo.Dial("127.0.0.1")
	if err != nil {
		fmt.Printf("error dialing mongo: %v\n", err)
	} else {
		fmt.Printf("connected successfully!")
	}
}
```

Here we use the `mgo.Dial()` function to connect to the MongoDB server running on the localhost (127.0.0.1). As opposed to the `database/sql` package, this function does actually attempt a network connection, so if it succeeds, your Go application is able to connect to your server. The `sess` variable is a reference to an `mgo.Session` object, which has several methods for manipulating the database.

### Inserting Data

The `mgo` package can save any Go struct as a MongoDB document, and read any document back into that struct. This makes it super easy to save and read data, but there's one trick to it. Recall that MongoDB uses a field named `_id` for the unique document ID, but unexported Go struct fields can't be read by the `mgo` package, so we can't name our field `_id`. Thankfully, we can use a struct field tag, just like we did with JSON encoding, to override the name of the field as its saved/read from MongoDB:

```go
	type Contact struct {
		ID        bson.ObjectId `bson:"_id"` //saved to mongo as `_id`
		Email     string
		FirstName string
		LastName  string
	}
```

This declares a struct for a Contact, but unlike the MySQL example, we add a `bson` tag to the `ID` field that renames the field to `_id`. The name `bson` refers to "binary JSON," which is the format used when storing documents in MongoDB.

When creating an instance of this Contact struct, use `bson.NewObjectId()` to generate a new ObjectId for the `ID` struct field:

```go
	c := &Contact{
		ID:        bson.NewObjectId(),
		Email:     "test@test.com",
		FirstName: "Test",
		LastName:  "Tester",
	}
```

If you have a Go extension installed in your editor, it should add an import for "gopkg.in/mgo.v2/bson" automatically, but if not, add that to your list of imports. The `bson` package provides an implementation of these globally unique ObjectIds used by MongoDB, and doesn't depend upon anything in the `mgo` package, so you can actually use the `bson` package on its own, with DBMSs other than MongoDB.

To insert this new struct instance into the database, use this relatively simple code:

```go
	if err := sess.DB("demo").C("contacts").Insert(c); err != nil {
		fmt.Printf("error inserting document: %v\n", err)
	} else {
		fmt.Printf("new ID = %s\n", c.ID.Hex())
	}
```

The `sess.DB("demo")` part selects the "demo" database in the server (creating it automatically if necessary), and the `.C("contacts")` part selects the "contacts" collection (creating it automatically if necessary). The `.Insert()` method inserts the struct instance as a new document, and returns an error if something went wrong.

### Finding Data

### Updating Data

