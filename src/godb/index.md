Web-based information systems need to store and manage large amounts of data, so they typically enlist the help of a persistent database management system (DBMS). These are separate server processes that encapsulate and manage the actual data and index files on disk, while supporting simultaneous access by multiple clients.

This tutorial assumes you've already taken [a relational DBMS course](https://www.washington.edu/students/crscat/info.html#info340) and already know the basics of the Structure Query Language (SQL). I will show you how to interact with a relational DBMS from Go, and how to avoid SQL injection attacks.

I will also show you how to interact with the popular document-oriented DBMS MongoDB. As opposed to a relational database that stores data in flat tables with columns, MongoDB stores full JSON documents that can have arbitrary schema, nested objects, arrays, etc. This flexibility is handy for many types of information systems, but it does come with a few trade-offs that I will discuss in more detail below.

## Interacting with Relational DBMSs

In order to interact with a relational database from Go, we need a relational DBMS instance we can connect to and play with. Since you now know how to use [Docker](../docker/), we can use it to spin-up any of the popular open-source relational DBMSs: MySQL/MariaDB, PostgreSQL, etc. There are endless debates about which of these is the best choice, and in truth, the answer depends on what you need the DBMS to do and how willing you are to tune it. 

For purposes of this tutorial, let's use MySQL, though the code will be nearly identical if you choose a different DBMS. The only real differences will be which package you import, and what dialect of SQL you use for your queries.

### Running the MySQL Docker Container

Like many relational DBMSs, MySQL implements its own security system, with its own user accounts and passwords that are distinct from the host operating system. New instances automatically have one super-user account, known as `root`, but you need to supply the password you want that account to have. The easiest way to do that is to create an environment variable to store that. In a terminal window, define a new environment variable for the root account password:

```bash
export MYSQL_ROOT_PASSWORD="some super-secret password"
```

If you just want a randomly-generated password, you can use the `rand` subcommand of `openssl`:

```bash
# generate 18 random bytes and base64 encode them
export MYSQL_ROOT_PASSWORD=$(openssl rand -base64 18)
# echo it so that you can see what it generated
echo $MYSQL_ROOT_PASSWORD
```

This sets the environment variable in the host shell, but remember that Docker containers are completely isolated by default, so we need to forward this environment variable into the container when we run it. We also want to publish the default MySQL port number (3306) so that we can connect to MySQL server from our Go program running on the host. In production, we would use a Docker private network and run both our Go server and the MySQL server containers in that private network, but for now we will connect directly from a host process.

To start the MySQL server with these settings, use this command

```bash
docker run -d \
-p 3306:3306 \
--name testmysql \
-e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
mysql
```

Use `docker ps` to make sure the server is running. If it's not listed, use `docker logs testmysql` to see what error it wrote to the log file.

If you want to connect to this running MySQL instance using the MySQL CLI, you can run another container instance, overriding the default entry point:

```bash
docker run -it \
--rm \
--network host \
-e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
mysql sh -c 'mysql -h127.0.0.1 -uroot -p$MYSQL_ROOT_PASSWORD'
```

Try executing `show databases;` to see the default list of databases. Execute the `exit` command to exit the CLI and return to your host prompt. Since we used the `--rm` flag, this CLI container will automatically be removed after it exits.

### Installing the MySQL Client Package

The Go standard library defines a common set of functions and structs in the [database/sql](https://golang.org/pkg/database/sql/) package that are used for all relational DBMSs. This code in turn uses a RDBMS-specific package, known as a **driver**, to actually communicate with the database. These drivers implement the interfaces defined in the [database/sql/driver](https://golang.org/pkg/database/sql/driver/) package for the specific RDBMS protocol.

To install the [MySQL diver for Go](https://github.com/go-sql-driver/mysql) on your system, use this command:

```bash
go get github.com/go-sql-driver/mysql
```

If it worked, you won't see any output: no news is good news!

### Connecting From a Go Program

Create a new directory within your `$GOPATH/src` directory, and in that directory create a new file named `main.go`. Add this code to that file:

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
	//user, password, server address (defaults to 127.0.0.1)
	//and the default database (defaults to none)
	dsn := fmt.Sprintf("root:%s@/", os.Getenv("MYSQL_ROOT_PASSWORD"))

	//create a database object, which manages a pool of
	//network connections to the database server
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Printf("error opening database: %v\n", err)
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

The `_ "github.com/go-sql-driver/mysql"` import line might look strange, but it is essentially importing the MySQL driver without creating a local name for the package in our code. Since we will always be using the common functions and structs in the `database/sql` package, we will never need to call the MySQL driver directly. As you might have noticed before, Go requires that you actually use all variables you declare, and package names are just like variables, so if you import a package but never use anything from it, the Go compiler will generate an error, and the `goimports` tool will simply remove the import. But if we don't import the package, its code won't be in our built executable. To import a package that you never call, you can assign the blank identifier (`_`) to the imported package.



