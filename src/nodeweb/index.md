You can build a web server in any language that allows you to listen on a port for HTTP requests, and respond accordingly. So far we've [seen how to do that in Go](../goweb/), but you can build web servers in many different languages, including JavaScript.

Some students find it difficult to understand how one could build a web _server_ in JavaScript because their only use of JavaScript thus far was in the web browser. But the web browser is only one possible execution environment for the general JavaScript language. Shortly after Google open-sourced their V8 JavaScript interpreter, a few enterprising folks realized they could use it to run JavaScript at the command-line. And if they injected a few global functions and objects written in C, they could allow that JavaScript to do all kinds of fun things: read from/write to the file system; listen on ports and write responses; make network requests and process the results; etc.

The project was named "Node.js" because they wanted to use this runtime engine primarily for writing low-level network services. But their first release in 2011 also included a basic HTTP server that allowed one to build a full web service in JavaScript (albeit with a lot of effort).

Web server frameworks from the Ruby on Rails world were quickly ported over to this new exciting platform, the most popular of them being [Express.js](https://expressjs.com/). These frameworks make it easier to build full-featured web servers on top of Node's somewhat minimalist HTTP module, so they are very commonly used. Express is now starting to show its age, and new frameworks based on ES6 features are starting to vie for dominance (e.g., [Koa.js](http://koajs.com/)).

## Getting Setup

Since JavaScript is an interpreted language, the Node.js runtime must be installed on any machine that will run your code. Node.js also comes with the `npm` package manager, which helps you install various open-source packages, including Express.js.

### Mac Users

If you are on a Mac and you have [homebrew](https://brew.sh/) installed, use it to install Node.js:

```bash
# Mac Homebrew users
brew install node
```

If you don't want to use homebrew, [download and run the Node.js installer](https://nodejs.org/en/download/current/) for Mac.

### Windows Users

If you are on Windows, [download and run the Node.js installer](https://nodejs.org/en/download/current/) for Windows.

### Linux Users

If you are on Linux, [follow the installation instructions for your distro](https://nodejs.org/en/download/package-manager/).


## Starting a New Project

Create a new directory somewhere on your development machine and `cd` into that directory (unlike Go, Node.js doesn't have a central workspace directory, so you can create this directory anywhere). To start a new Node.js project in that directory run this command:

```bash
# creates a new package.json file
npm init -y
```

`npm` is the package manager installed with the Node.js runtime, and it has several sub-commands. The `init` command creates a new `package.json` file, which is used to track meta-data about your project (a "package" in npm-speak). By default it uses the directory name as your package name, and if that directory is a git repository, it will also add a `repository` key containing the URL to your `origin` remote (i.e., URL to your repo on GitHub). You should add and commit this file to your git repo

This `package.json` file will also track all the other packages your package depends upon. So far that is blank, but let's add a few dependencies:

```bash
# installs packages and records dependencies in package.json
npm install --save express body-parser morgan
```

The `install` sub-command will download the packages you name from the [central npm package repository](https://www.npmjs.com/) and install them into a `node_modules` sub-directory. These packages are just a bunch of JavaScript that someone else wrote, so you can look inside that directory and read all the code.

Since anyone can publish packages to this repository, be careful how you spell the names of the packages you want to install. There have already been several [typosquatting attacks](https://www.theregister.co.uk/2017/08/02/typosquatting_npm/) where developers published packages with names very similar to the most popular packages, but containing malicious code.

The `--save` option not only downloads and installs the packages, but also adds them to the `dependencies` key in your `package.json` file. After you add/commit the updated `package.json` file to your repo, other developers will be able not know which packages this project depends upon. Those other developers will also be able to install all dependencies with the simple command:

```bash
# installs all dependencies listed in package.json
npm install
```

## Building an HTTP Server

The three packages we installed above are as follows:

- `express`: a popular web server framework that makes it easy to build HTTP servers
- `body-parser`: middleware that automatically decodes JSON in request bodies
- `morgan`: request logging middleware

As described in the [Middleware Patterns in Go](../gomiddleware) tutorial, middleware is code that can do pre- and post-processing of every request. The Express.js framework has [built-in support for middleware](http://expressjs.com/en/guide/using-middleware.html), and there are [many middleware packages](http://expressjs.com/en/resources/middleware.html) already in existence that do just about everything you'd ever need to do.

To see how you can use the Express.js framework and these middleware packages, let's create a simple HTTP server. Create a new file in your project directory named `index.js`, open it in your favorite code editor, and add this to it:

```javascript
//put interpreter into strict mode
"use strict";

//require the express, body-parser, and morgan packages
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

//create a new express application
const app = express();
```

The `"use strict";` directive is always a good idea to add, as it [disables several forgiving JavaScript features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) that make it very easy to introduce subtle bugs.

The `require()` function is a global function added by Node when it executes your script. This function loads packages from your `node_modules` sub-directory, or your own packages defined in other files. If the string you pass does not start with `./` or `../`, the function will look for a sub-directory within `node_modules` that matches the supplied name (e.g., `node_modules/express`). If the string does start with `./` or `../`, the function will treat that as a relative path to the other JavaScript file.

The `require()` function loads the requested package and returns a reference to the package's exported API. This API might be a JavaScript object with several properties and methods, or it might be a single function. The `express` package exports a single function that you can use to create a new Express application, which is what we do in that last line.

You might be wondering why I used `const` instead of `var`: because our code will run by the Node.js runtime, and because we control which version of that runtime is used, it's safe to use newer JavaScript features, including all of the ES6 features supported by the V8 interpreter. Since the value of `express` should never be change during our script, it's best to use `const` to define it.

### Reading Environment Variables

Just as we did when we wrote web servers in Go, it's good practice to let those running your web server specify the network address at which the server should listen. An easy way to do that is via an environment variable. Node exposes all environment variables via the global `process.env` object. Each environment variable is a key on that object:

```javascript
//get ADDR environment variable,
//defaulting to ":80"
const addr = process.env.ADDR || ":80";
//split host and port using destructuring
const [host, port] = addr.split(":");
```

After getting the `ADDR` environment variable, we use an [ES6 destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) to split apart the host and port segments of the address. The express application will make us pass these values separately to its `.listen()` method, so we have to split the address apart.

It's safe to use this new destructuring assignment because we control the version of the interpreter running our code. It's also safe to destructure the result of `.split()`: asking for an array index that doesn't yet exist simply returns `undefined` in JavaScript, with no runtime error.

### Adding the Middleware

Next add the JSON body-parsing and request-logging middleware to your express application:

```javascript
//add the JSON request body parsing middleware
app.use(bodyParser.json());
//add the request loggin middleware
app.use(morgan("dev"));
```

Global middleware that should be invoked on every request are added using `app.use()`. The `body-parser` package's [API](https://github.com/expressjs/body-parser#api) is an object with several methods, and here we invoke the `.json()` method to get a reference to the JSON-parser middleware handler. This middleware function will automatically parse any JSON in the request body, making it available to our handlers as a `body` property on the request object.

The `morgan` package's [API](https://github.com/expressjs/morgan#api) is a single function that takes a request logging format string, or a function that does custom formatting. In this case we use the predefined `"dev"` logging format, which is helpful when doing development. The middleware handler function returned from `morgan("dev")` will log each request to standard out.

As opposed to middleware in Go, each of these middleware handler functions are being added to a chain of functions that are called during each request. When the first one finishes, it specifically tells Express to call the next function in the chain. If a handler function in the chain doesn't tell Express to call the next handler in the chain, the processing of the request ends.

### Adding Your Own Handlers

Next add a handler for `GET` requests to the root resource path `/`:

```javascript
//add handler for `GET /`
app.get("/", (req, res, next) => {
    res.set("Content-Type", "text/plain");
    res.send("Hello, Node.js!");
});
```

Handlers are added by invoking a method on the application that has the same name as the HTTP method you want to handle: in this case `app.get()` for an HTTP `GET` request. The first parameter is the resource path you want to handle requests for, and the second is a JavaScript function that will be invoked when the server receives a request for that resource path, using that HTTP method. 

If you want your handler function to be called for _any_ HTTP method, then call `app.use()` instead, but still pass the resource path as the first parameter. It will then be up to your code to example the actual HTTP method on the request object.

```javascript
//handler for *any* HTTP method
app.use("/", (req, res, next) => {
	//req.method contains the actual request method
	switch (req.method) {
		//...cases for different methods
	}
});
```

For the handler function itself, we are using an [ES6 lambda-style function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), also known as an "arrow function." This simply new-fangled syntax for a more traditional in-line anonymous function, so the following is equivalent:

```javascript
//equivalent to code above
app.get("/", function(req, res, next) {
    res.set("Content-Type", "text/plain");
    res.send("Hello, Node.js!");
});
```

> **NOTE:** JavaScript lambda functions do have an important difference from traditional in-line anonymous functions: the `this` keyword is lexically-scoped in the former, where it's globally-scoped (by default) in the latter. In this case it doesn't matter, as we aren't using the `this` keyword in the handler function, and there would be little reason to do so.

Express handler functions are passed three parameters:

- `req`: an object containing [information about the request](https://expressjs.com/en/4x/api.html#req)
- `res`: an object that lets you [send responses back to the client](https://expressjs.com/en/4x/api.html#res)
- `next`: a function to call if you [encounter an error](https://expressjs.com/en/guide/error-handling.html), or if you want other handler functions registered for the same resource path and method to be invoked.

The `req` parameter is similar to the `*http.Request` in Go, and the `res` parameter is similar to the `http.ResponseWriter` in Go. 

The `next` parameter is unique to Express: specific resource path handlers like this one typically handle the request and therefore don't need to invoke the next handler in the chain, so they only call `next()` to report an error. General middleware handlers added to the beginning of the chain call `next()` once they have finished their preprocessing work. This triggers Express to call the next handler in the chain, until some handler (like our specific resource path handler above) doesn't call `next()`. At that point, the request processing is finished.

### Start Listening for Requests

After adding your various resource path handlers, the last thing to do is tell the application to listen on the requested host and port:

```javascript
//start the server listening on host:port
app.listen(port, host, () => {
    //callback is executed once server is listening
    console.log(`server is listening at http://${addr}...`);
});
```

Note that the `port` number comes first, followed by the `host`. You can omit the `host` parameter, and the server will then listen for requests sent to any host.

The last parameter can be a function that will be invoked once the server has bound to the port. Here we provide a function that simply writes a message to standard out that the server is listening at the requested address. We use the new [ES6 template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) feature to dynamically insert the value of the `addr` variable into the middle of the string.

## Try it Out!

At this point your script is ready to run. In your terminal, run these commands to start the server:

```bash
export ADDR=localhost:4000
node index.js
```

The first command sets the `ADDR` environment variable so that our server will listen on port 4000 and only accept requests through the loopback address. The second command runs our script using the Node.js runtime engine. 

If you did everything correctly, you should see the message `server is listening at http://localhost:4000...` printed to your terminal, but you won't get your prompt back. Since the server is still running, it occupies that terminal window. You'll see the request logging messages printed there.

Now open <http://localhost:4000> in your web browser. You should see "Hello, Node.js!" as the response. Congratulations! You just wrote your first Node/Express web server!


## Responding with JSON

In the example above, we responded to the client with plain text, but Express also makes it very easy to respond with JSON instead. For example:

```javascript
app.get("/v1/channels", (req, res, next) => {
    //assuming some function that gets all
    //of the defined channel records from the database 
    let allChannels = getAllChannelsFromDatabase();

    //write those to the client, encoded in JSON
    res.json(allChannels);
});
```

The `.json()` method on the response object accepts any value, runs it through `JSON.stringify()`, and writes the result to the client. It also sets the `Content-Type` header to `application/json` automatically, so you don't have to do that yourself.

## Error Handling

As noted earlier, specific resource handlers don't typically call the `next()` function unless they need to report an error. By default, if your JavaScript handler function throws an exception, Express will catch that exception and write the error with a full stack trace back to the client. That's fine during development, but a stack trace in the response doesn't look very professional in production, and it does leak information that could be helpful to an attacker.

To handle errors more appropriately, add one more handler function to your Express application, but this time, define it to take four parameters instead of three:


```javascript
//error handler that will be called if
//any handler earlier in the chain throws
//an exception or passes an error to next()
app.use((err, req, res, next) => {
    //write a stack trace to standard out,
    //which writes to the server's log
    console.error(err.stack)

    //but only report the error message
    //to the client, with a 500 status code
    res.set("Content-Type", "text/plain");
    res.status(500).send(err.message);
});
```

The first parameter `err` will be a reference to the `Error` object that was thrown by the handler, or passed to the `next()` function. The other three are the same as the ones passed to any other handler.


