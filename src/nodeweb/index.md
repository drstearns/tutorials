You can build a web server in any language that allows you to listen on a port for HTTP requests, and respond accordingly. So far we've [seen how to do that in Go](../goweb/), but you can build web servers in many different languages, including JavaScript.

Some students find it difficult to understand how one could build a web _server_ in JavaScript because their only use of JavaScript thus far has been in the web _browser_. But the web browser is only one possible execution environment for the JavaScript language. Shortly after Google open-sourced their V8 JavaScript interpreter, a few enterprising folks realized they could use it to run JavaScript at the command-line instead. And if they injected a few global functions and objects written in C, they could allow that JavaScript to do all kinds of fun things: read from/write to the file system; listen on network ports and respond to requests; make requests to other servers and process the results; etc.

The project was named "Node.js" because they wanted to use this runtime engine primarily for writing low-level network node services. But their first release in 2011 also included a basic HTTP server that allowed one to build a simple web service entirely in JavaScript.

Web server frameworks were quickly developed on top of this new exciting platform, the most popular of them being [Express.js](https://expressjs.com/), [Koa.js](http://koajs.com/), [Meteor](https://www.meteor.com/), [hapi](https://hapijs.com/), and [Sails](http://sailsjs.com/). These frameworks make it easier to build full-featured web servers on top of Node's somewhat minimalist HTTP module, so they are very commonly used.

## Getting Setup

Since JavaScript is an interpreted language, the Node.js runtime must be installed on any machine that will run your code. Node.js also comes with the `npm` package manager, which helps you install various open-source packages, including the aforementioned frameworks like Express.js.

### Mac Users

If you are on a Mac and you have [homebrew](https://brew.sh/) installed, use it to install Node.js:

```bash
# Mac users with Homebrew
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

`npm` is the package manager installed with the Node.js runtime, and it has several sub-commands. The `init` command creates a new `package.json` file, which is used to track meta-data about your project (a "package" in npm-speak). By default it uses the directory name as your package name, and if that directory is a git repository, it will also add a `repository` key containing the URL to your `origin` remote (i.e., URL to your repo on GitHub). You should add and commit this file to your git repo.

This `package.json` file will also track all the other packages your package depends upon. So far that is blank, but let's add a few dependencies:

```bash
# installs packages and records dependencies in package.json
npm install --save express morgan
```

The `install` sub-command will download the packages you name from the [central npm package repository](https://www.npmjs.com/) and install them into a `node_modules` sub-directory. These packages are just a bunch of JavaScript that someone else wrote, so you can look inside that directory and read all the code.

> Since anyone can publish packages to this repository, be careful how you spell the names of the packages you want to install. There have already been several [typosquatting attacks](https://www.theregister.co.uk/2017/08/02/typosquatting_npm/) where developers published packages with names very similar to the most popular packages, but containing malicious code.

The `--save` option not only downloads and installs the packages, but also adds them to the `dependencies` key in your `package.json` file. After you add/commit the updated `package.json` file to your repo, other developers will be able to know which packages this project depends upon. Those other developers will also be able to install all dependencies with the one simple command:

```bash
# installs all dependencies listed in package.json
npm install
```

## Building an HTTP Server

The two packages we installed above are as follows:

- `express`: a popular web server framework that makes it easy to build HTTP servers
- `morgan`: express middleware that logs all requests

As described in the [Middleware Patterns in Go](../gomiddleware) tutorial, middleware is code that can do pre- and post-processing of every request. The Express.js framework has [built-in support for middleware](http://expressjs.com/en/guide/using-middleware.html), and there are [many middleware packages](http://expressjs.com/en/resources/middleware.html) already in existence that do just about everything you'll ever need to do.

To see how you can use the Express.js framework and these middleware packages, let's create a simple HTTP server. Create a new file in your project directory named `index.js`, open it in your favorite code editor, and add this to it:

```javascript
//put interpreter into strict mode
"use strict";

//require the express and morgan packages
const express = require("express");
const morgan = require("morgan");

//create a new express application
const app = express();
```

Adding the `"use strict";` directive is always a good idea, as it [disables several forgiving JavaScript features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) that make it very easy to introduce subtle bugs.

The `require()` function is a global function added by Node. This function loads packages from your `node_modules` sub-directory, or your own packages defined in other files. If the string you pass does not start with `./` or `../`, the function will look for a sub-directory within `node_modules` that matches the supplied name (e.g., `node_modules/express`). If the string does start with `./` or `../`, the function will treat that as a relative path to the other JavaScript module file.

The `require()` function loads the requested package and returns a reference to the package's exported API. This API might be a JavaScript object with several properties and methods, or it might be a single function. The `express` package exports a single function that you can use to create a new Express application, which is what we do in that last line.

Those familiar with ES6 features may wonder what the difference is between `require()` and the ES6 `export` and `import` module system. The Node.js project defined `require()` long before the ES6 module feature, so they are two separate things that achieve similar ends. The Node.js folks have written [a few articles detailing the problems with replacing the former with the later](https://medium.com/the-node-js-collection/an-update-on-es6-modules-in-node-js-42c958b890c), so it's unlikely to occur anytime soon. One can use [Babel to transpile the latter to the former](https://babeljs.io/docs/plugins/transform-es2015-modules-commonjs/), but it's easier to simply use the built-in `require()` function.

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

It's safe to use this new destructuring assignment because we control the version of the interpreter running our code, and [the current V8 interpreter supports destructuring](http://node.green/). It's also safe to destructure the result of `.split()` in JavaScript, even if the string doesn't contain the delimiter: asking for an array index that doesn't yet exist simply returns `undefined` in JavaScript, with no runtime error.

### Adding the Middleware

Next add the JSON body-parsing and request-logging middleware to your express application:

```javascript
//add JSON request body parsing middleware
app.use(express.json());
//add the request logging middleware
app.use(morgan("dev"));
```

Global middleware that should be invoked on every request are added using `app.use()`. The first one we add here is a middleware handler function that automatically parses any JSON that might be in the request body. The parsed JSON data will be available on the `.body` property of the request object, which all other handler functions can read. This particular middleware handler function is built-in to the express package since version 4.16.0.

> **NOTE:** if you are using a version of express prior to 4.16.0, you must install the `body-parser` package and use the `bodyParser.json()` method to get this JSON-parsing middleware handler instead. For details on this package, see their [API documentation](https://github.com/expressjs/body-parser).

The `morgan` package's [API](https://github.com/expressjs/morgan#api) is a single function that takes a request logging format string, or a function that does custom formatting. In this case we use the predefined `"dev"` logging format, which provides colorful output that is helpful when doing development. The middleware handler function returned from `morgan("dev")` will log each request to standard out (i.e., your terminal, or wherever you've redirected standard out).

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

Handlers are added by invoking a method on the application that has the same name as the HTTP method you want to handle: in this case `app.get()` for an HTTP `GET` request. The first parameter is the resource path you want to handle requests for, and the second is a JavaScript function that will be invoked when the server receives a request with the specified method for the specified resource path. 

If you want your handler function to be called for _any_ HTTP method, then call `app.use()` instead, but still pass the resource path as the first parameter. It will then be up to your code to examine the actual HTTP method on the request object.

```javascript
//handler for *any* HTTP method
app.use("/", (req, res, next) => {
	//req.method contains the actual request method
	switch (req.method) {
		//...cases for different methods
	}
});
```

In Express, middleware and specific resource handler functions are really the same thing: they are just functions that take the three arguments: `req`, `res`, and `next`. If you add them with `app.use()` and don't supply a resource path in the first parameter, they are invoked on every request. If you use a specific HTTP method name, such as `app.get()`, then the handler functions are invoked only when the HTTP method matches that method name. If you provide a resource path as the first parameter, the handler functions are invoked only when the requested resource path matches the resource path you pass as the first parameter.

For the handler function itself, we are using an [ES6 lambda-style function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), also known as an "arrow function." This is just new-fangled syntax for a more traditional in-line anonymous function, so the following is equivalent:

```javascript
//equivalent to code above
app.get("/", function(req, res, next) {
    res.set("Content-Type", "text/plain");
    res.send("Hello, Node.js!");
});
```

> **NOTE:** JavaScript lambda functions do have one important difference from traditional in-line anonymous functions: the `this` keyword is lexically-scoped in the former, where it's globally-scoped (by default) in the latter. In this case it doesn't matter, as we aren't using the `this` keyword in the handler function, and there would be little reason to do so.

Express handler functions are passed three parameters:

- `req`: an object containing [information about the request](https://expressjs.com/en/4x/api.html#req)
- `res`: an object that lets you [send responses back to the client](https://expressjs.com/en/4x/api.html#res)
- `next`: a function to call if you [encounter an error](https://expressjs.com/en/guide/error-handling.html), or if you want the remaining handler functions in the chain to be called.

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

To stop your server and get your command prompt back, switch back to your terminal window and hit `Ctrl+c`.


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

## Resource Path Parameters

When you specify a resource path when adding a handler function, that path can be a literal string, or a [regular expression](https://expressjs.com/en/guide/routing.html). You can also ask Express to accept any token for a path segment, and make the value of that token available in the handler function. For example, say you wanted to add a handler for the resource path `/channels/<channel-id>` where `<channel-id>` could be any valid channel ID. In express, you'd use a resource path like so:

```javascript
app.get("/channels/:chanid", (req, res, next) => {
    //actual channel ID value is in req.params.chanid
    console.log("client asked for " + req.params.chanid);
});
```

A colon (`:`) in front of a path segment tells Express to accept any token in that segment, and make the actual token requested available on the `req.params` object. This object will have one key for each colon-prefixed path segment. The associated value will be whatever token was in the actual requested resource path.

## Asynchronous I/O

Since JavaScript is single-threaded, Node.js forces you to do all I/O operations asynchronously. Every time you read from a file, read from the network, or talk to a database, it's done asynchronously. To get the results, you must supply a callback function, similar to how AJAX requests work in the browser.

Most of the [core Node.js API functions](https://nodejs.org/api/) accept your callback function as the last parameter passed to the API function. This is fine for a single request, but it can lead to "callback hell" when you need to do several I/O operations in a row. In these cases, consider using the [bluebird.js](http://bluebirdjs.com/docs/getting-started.html) library to wrap these sorts of APIs with [Promises](https://drstearns.github.io/tutorials/ajax/#secasynchronousrequestsandpromises).

Many of the popular NPM packages now return Promises from their APIs, which makes serializing several asynchronous requests into a chain much easier. If you've never used Promises before, see the [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) topic in the MDN documentation, as well as the Google article [JavaScript Promises: an Introduction](https://developers.google.com/web/fundamentals/primers/promises).

## Error Handling

As noted earlier, specific resource handlers don't typically call the `next()` function unless they need to report an error. By default, if your JavaScript handler function throws an exception, Express will catch that exception and write the error with a full stack trace back to the client. That's fine during development, but a stack trace in the response doesn't look very professional in production, and it does leak information that could be helpful to an attacker.

To handle errors more appropriately, add another handler function to your Express application, but this time, define it to take four parameters instead of three:


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

## Creating Your own Modules

As noted earlier, the `require()` function can load not only published packages installed to your `node_modules` directory, but also your own packages defined in other JavaScript files. A "package" is just a JavaScript file that exports a public API. That public API is exported by setting the value of the `module.exports` property.

```javascript
//some-module.js
"use strict"

function someExportedFunction() {
    //...
}

function anotherExportedFunction() {
    //...
}

function privateNonExportedFunction() {
    //...
}

//export the public functions
module.exports = {
    someExportedFunction,
    anotherExportedFunction
}
```

Here we set `module.exports` to an object containing two keys: `someExportedFunction`, and `anotherExportedFunction`. The values associated with those keys are the functions of the same name defined in this package. Whatever you set `module.exports` to will become your package's public API returned from the `require()` function:

```javascript
//myModule is set to the module.exports value
//defined in `some-module.js`
let myModule = require('./some-module.js');

//use the public API functions
myModule.someExportedFunction();
myModule.anotherExportedFunction();
```

Like the `express` package, you can set `module.exports` to a function instead if you only need to export one function.

## Dockerizing a Node Web Server

A Go web server is fully-compiled to machine code for the target platform, but a Node.js web server is just JavaScript so it still requires the Node.js runtime in order to execute. That means any Docker container image created for a Node.js app must have the Node.js runtime installed within it. Thankfully, the Node.js team maintains [several official Docker container images with Node.js pre-installed](https://hub.docker.com/_/node/).

To create a Docker container image for your Node.js web server, create a `Dockerfile` like this:

```docker
# use `node` image as the base
FROM node
# set the current working directory to /app
WORKDIR /app
# copy the package.json and package-lock.json files to the work directory
COPY package.json package-lock.json ./
# run npm install to install all dependent packages
RUN npm install
# copy your JavaScript source files
COPY . .
# declare that your server will listen on port 80
EXPOSE 80
# set the entrypoint command
ENTRYPOINT ["node", "index.js"]
```

The `WORKDIR` command creates a directory within the new container image and sets that as the current working directory. All other paths within the container image are then evaluated as relative to that working directory.

We next `COPY` the package.json and package-lock.json files to the working directory and `RUN` the command `npm install` to install all of our dependent packages. We run this command within the container so that any packages that include native code will be compiled for Linux rather than our host OS. Most NPM packages contain only JavaScript, which doesn't require compilation, but some packages include a bit of native C code to do things that aren't yet possible through the Node.js API. By running `npm install` within the new container image, we ensure that any native code is compiled for the container's OS, which is Linux.

Lastly, we copy our own JavaScript source files into the container image, declare our port number, and set the entrypoint command to be `node index.js`.

Since we are executing `npm install` within the new container image, we don't need nor want to copy the packages in our own `node_modules` sub-directory on our host OS. To ignore those files, create a `.dockerignore` file in the same directory as your `Dockerfile`. Like the `.gitignore` file, this file tells Docker to ignore specific files and directories when building. Set your `.dockerignore` file to contain the following:

```
node_modules
npm-debug.log
```

You can then build and run your new Docker container using the usual commands:

```bash
# build the container image
docker build -t your-dockerhub-name/your-container-name .

# run an instance of the container, publishing port 80
docker run -d -p 80:80 your-dockerhub-name/your-container-name
```

## Further Reading

This tutorial introduced you to the basics of building a web server in Node.js and Express.js. To learn more, see the following resources:

- [Node.js API documentation](https://nodejs.org/api/)
- [Express.js documentation](https://expressjs.com/)
- [NPM documentation](https://docs.npmjs.com/)
- [Dockerizing a Node.js web app](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)


