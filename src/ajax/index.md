Now that you know how to create page content from data stored in a local variable, the next logical step is to learn how to fetch those data dynamically from a web service. This allows you to get up-to-date data each time your page loads, and even automatically refresh those data while the user remains on the page. JavaScript allow us to make requests to other web services, and process the results, without navigating or refreshing the page.

## AJAX

Back in the early days of the web (early 1990s), all data fetching and template merging happened on the server. Web browsers received fully-merged static HTML pages, and if you wanted fresher data, you had to refresh the page. If you wanted to send data back to the server, you filled out a form and let the browser submit the form to the server, where the data were processed and a new response page was generated. At that time, browsers were more like the "dumb terminals" of the mini-computer era, and all the real work happened on the server-side.

JavaScript was added to web browsers starting in 1995, which made it possible to execute code on the client-side. But that code couldn't do very much until 1997, when both Netscape Navigator and Internet Explorer added the Document Object Model (DOM). Now one could conceivably build page content from data, but the data still had to be included in the initial set of files downloaded for the page. Refreshing the data still required a full page refresh.

In the late 1990s, Microsoft started building a web-based version of their email and calendaring application Outlook, and they wanted a way to check for new mail and send new messages without triggering a full page refresh. Initially they toyed around with using a hidden `<iframe>` element, but the technique was clumsy and full of potential security issues. So they eventually proposed a new programming interface that would let JavaScript make an asynchronous HTTP request back to the web server from which the page came, and process the results once they returned. In response, the Internet Explorer team added a new global object named `XMLHttpRequest`, which could do just that.

The name of the object began with `XML` because at that time XML was all the rage, and the Outlook Web Access team figured they would encode data transmitted from the server to the client in XML. The `XMLHttpRequest` object would let them make an HTTP request to their server, and would automatically parse the returned data as XML so that they could work with it in their JavaScript. Since HTML was a variant of XML, they could use the same DOM interface when working with the returned data.

When I first saw this in action, my jaw hit the floor. Up until that point, the web was a pretty mediocre application platform, barely better than what we had in the 1980s with mini-computers and dumb terminals. Now with the `XMLHttpRequest` object, we could build rich, interactive graphical client-side applications, like we had been building on desktop GUI operating systems like Windows, but with no installation step required. A user could simply navigate to a web site, and start using the downloaded application.

This technique quickly became popular, and was given a name: **AJAX**, which was an acronym for **A**synchronous **J**avaScript **A**nd **X**ML. The "Asynchronous" part came from the fact that HTTP requests needed to be done asynchronously so that they didn't block the rest of your JavaScript. Since JavaScript is single-threaded, they couldn't just pause all of your script while waiting for the server to respond (which could take a while on a slow network). If the user clicked something in the meantime and your click event listener function didn't run, the user would think that the application was broken. So the HTTP request is done asynchronously, and your code provides a callback function, which is invoked once the server responds.

By the mid-2000s, all major web sites were adding AJAX-based functionality, and new web applications were architected entirely around AJAX. These new application architectures were more reminiscent of the client-server era, where servers exposed Application Programming Interfaces (APIs) that returned and accepted *raw data*, encoded in some sort of easily interchanged format. Transforming that data into something a user could see was the job of the client application, and one could build many types of client applications against the same server. Since only data flowed back and forth over the network and not a presentation language like HTML, one could build both a web client and a native desktop client that spoke to the same server. As soon as smart mobile devices came along, they became just one more type of client application, interacting with the same server APIs.

## JSON

In a client-server architecture, the client and server applications are commonly implemented in different programming languages, so the data that is sent between them must be encoded into a format that is easy to generate and parse by all languages. In the late-1990s and early-2000s, the encoding format of choice was XML, but JavaScript developers became frustrated with how difficult it was to work with XML data in the web browser. In contrast, JavaScript arrays and objects were very easy to work with, and there was already a simple text-based format for declaring those that any language could consume, so why not use that instead?

The result was the **JSON** encoding scheme, which stands for **J**ava**S**cript **O**bject **N**otation. The format is much simpler and more compact than XML, and it can be parsed directly into native JavaScript arrays and objects. It also supports a wider set of value literals&mdash;all attributes and element content in XML must be encoded as a string so extra meta-data is required to indicate the actual data type (number, boolean, etc). JSON defines a syntax for literal strings, numbers, booleans, and nulls. 

JSON was also very familiar to JavaScript developers, as it looks almost identical to the way one declares arrays and objects in code. For example, here is a JSON-encoded object:

```json
{
	"id": 42,
	"fname": "John",
	"lname": "Doe",
	"active": true,
	"description": null
}
```

The only real difference between JSON and a JavaScript object declaration is that the property names **must** be wrapped in quotes, even if they are legal JavaScript identifiers. In a JavaScript object declaration, we can omit the quotes around property names that are legal identifiers, but it also doesn't hurt to include the quotes.

Note that the value for the `"id"` property is a literal number, so it's included without quotes. This tells any program parsing this data that the value is numeric and should be parsed as such. Similarly, the value for `"active"` is a boolean literal `true`, which will be parsed into a boolean value (as opposed to a string or a number). And the value for `"description"` is a literal `null`, which will be parsed into a null data type.

JavaScript has built-in support for generating and parsing JSON. To parse the JSON above, you can use `JSON.parse()`:

```javascript
var json = "..."; //JSON-encoded string from above

//parse the JSON string into a JavaScript object
//`obj` will be a native JavaScript object with 
//the same properties as you see in the JSON
var obj = JSON.parse(json);
```

And to generate JSON, you can use `JSON.stringify()`:

```javascript
//create a JavaScript object
var obj = {id: 43, fname: "Jane", lname: "Lee"};

//convert to JSON-encoded string
var json = JSON.stringify(obj);
```

JSON quickly displaced XML as the data-encoding format of choice for web applications, and [parsers were developed for all major programming languages](http://www.json.org/). We still refer to the general technique as "AJAX", but it's rare to find a web application these days that uses XML as the primary data-encoding format.

## The `fetch()` Function

The `XMLHttpRequest` object allows JavaScript developers to request JSON or XML-encoded data from the server, but the programming interface it exposed is quite complex to use. For example, here is the code necessary to make a simple request for some data:

```javascript
//create a new XMLHttpRequest object
var request = new XMLHttpRequest();

//configure it to do an asynchronous GET request for some URL
request.open("GET", "/my/data/url", true);

//add a listener for the "load" event, which
//will happen when the data returns
request.addEventListener("load", function() {
	if (request.status >= 200 && request.status < 400) {
		// Success!
		var data = JSON.parse(request.responseText);
	} else {
		// We reached our target server, but it returned an error
		//handle error...
	}
});

//add a listener for the "error" event, which
//will happen if there was a network error
request.addEventListener("error", function() {
	//handle error...
})

//finally, send the request to the server
request.send();
```

That's quite a lot of code for a rather simple operation. Understandably, developers quickly built libraries to simplify the common case. The most used was the [`.getJSON()`](http://api.jquery.com/jQuery.getJSON/) method that was added to the popular [jQuery library](https://jquery.com/). It replaced the code above with this:

```javascript
//assuming that the jQuery library has been added to the page...
//second parameter is a function to be called when the request
//is complete and the data has been returned
$.getJSON("/my/data/url", function(data) {
	//`data` is the already-parsed JSON data returned from the server
});
```

This was a much easier programming interface, but it required the entire jQuery library to be included in the page, which added another `87KB` of script to your application. And since [the need for the jQuery library has largely gone away](http://youmightnotneedjquery.com/), developers started asking for something like the jQuery `.getJSON()` method to be built-in to the browser as a native API.

The result was the `fetch()` API, which is [now supported in all major browsers except IE 11 and Safari 10](http://caniuse.com/#feat=fetch). For those browsers, we just have to add [a small polyfill library](https://github.com/github/fetch) that implements the `fetch()` function using the existing `XMLHttpRequest` object.

A **polyfill** library is one that adds a feature that is not yet supported natively by the browser by implementing that feature in JavaScript using existing functionality. The fetch polyfill implements the new `fetch()` function using the existing `XMLHttpRequest` interface. If the library detects the native implementation, it simply exits and does nothing.

To add the `fetch()` polyfill library from [its CDN](https://cdnjs.com/libraries/fetch), simply include this `script` element in your HTML page, *before* any script where you use the `fetch()` function:

```html
<!-- fetch() polyfill, version 2.0.1 -->
<!-- for the most recent version, see https://cdnjs.com/libraries/fetch -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.1/fetch.min.js"></script>

<!-- your script -->
<script src="js/app.js"></script>
```

## Asynchronous Requests and Promises

Because HTTP requests are done asynchronously, the `fetch()` function returns an object known as a **Promise**. A Promise represents an asynchronous operation that will eventually complete successfully or fail. A Promise allows developers to add functions that should be called when either of those conditions occurs. These are just like event listeners, except there are only two events: success (aka resolve), and fail (aka reject). So the Promise object provides two different methods, one for registering a success listener (`.then()`), and one for registering a failure listener (`.catch()`).

To fetch a URL, call the `fetch()` function passing the URL you want to fetch. It returns a Promise, which you can use to register a callback function that will be invoked when the server responds:

```javascript
var promise = fetch("/my/data/url");

//add a function to be called when the request completes successfully
promise.then(function(response) {
	//parse response as JSON
	return response.json();
});
```

Declaring that intermediate variable `promise` is unnecessary in JavaScript, so we typically combine those two statements above into one:

```javascript
fetch("/my/data/url").then(function(response) {
	//parse response as JSON
	return response.json();
});
```

And to make the code a bit more readable, we typically insert a line break after the call to `fetch()` and before the call to the Promise's `.then()` method:

```javascript
fetch("/my/data/url")
	.then(function(response) {
		//this is called after the server responds to our request
		//parse response as JSON
		return response.json();
	});
```

The function we pass to the Promise's `.then()` method will be called once the server begins to respond. The `response` object passed to this function as the first parameter allows us to do several things, but most commonly, you will want to parse the response body as JSON-encoded data. To do that, simply `return response.json()`.

The `response.json()` method is another asynchronous operation, so it actually returns a new Promise as well. But the neat thing about promises is that if you return a new Promise from a `.then()` callback function, the outer Promise will take on the state of the new returned Promise. That allows us to add another `.then()` callback function, which will be called once the JSON parsing has completed:

```javascript
fetch("/my/data/url")
	.then(function(response) {
		//parse response as JSON
		return response.json();
	})
	.then(function(data) {
		//this is called after the JSON parsing is complete
		//`data` will be the parsed data (Object or Array)
		console.log(data)
	});
```

The return value of the first `.then()` method is the same Promise object, so syntactically we can keep chaining `.then()` methods, one after the other.

All of this code so far assumes that the network request completes successfully, but when computer networks are involved, you should always assume that the request could fail. The client's WiFi connection might be down, or their connection to their ISP could be down, or the server could be down.

To respond to a network failure, we can use the Promise's `.catch()` method to register a function that will be called if the request fails. Your function will be handed an [Error object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) as the first parameter, which will contain details about the error.

```javascript
fetch("/my/data/url")
	.then(function(response) {
		return response.json();
	})
	.then(function(data) {
		console.log(data)
	})
	.catch(function(err) {
		//write the full error object to the console
		console.error(err);

		//show the error message to the user
		//you could instead set the `.textContent` of some
		//DOM element you use to show errors
		alert(err.message);
	});
```

The really nice thing about Promises is that the function we pass to `.catch()` will be called if any error occurs either during the fetch, or in the JSON parsing. If any of the functions passed to `.then()` cause an error to occur, execution will automatically jump to your `.catch()` function, skipping any intermediary `.then()` functions. This allows you to centralize your error handling in one place, and avoid calling code that depends upon the previous code executing without errors.

## Trying it Out

There are [many, many sources of live data on the web](https://www.programmableweb.com/), but the one we will use for a quick demo, and for your challenge, is the [data.seattle.gov](https://data.seattle.gov) site. This site hosts public data for the city of Seattle, and one interesting dataset is the [hourly bicycle traffic counts across the Fremont bridge](https://data.seattle.gov/Transportation/Fremont-Bridge-Hourly-Bicycle-Counts-by-Month-Octo/65db-xm6k).

All of the datasets on the site can be returned in JSON format, and you can supply extra parameters on the URL to filter and sort the data. For example, this URL will return the most-recent 24 hours of data. Click on the URL to see the JSON data in your browser.

> [https://data.seattle.gov/resource/4xy5-26gy.json?$order=date%20desc&$limit=24](https://data.seattle.gov/resource/4xy5-26gy.json?$order=date%20desc&$limit=24);

You can see that it returns an array of objects, one for each hour. The objects have three properties each: `date` (date and time of observation), `fremont_bridge_nb` (number of bikes traveling on the east sidewalk), and `fremont_bridge_sb` (number of bikes traveling on the west sidewalk).

Once we fetch this data and parse it as JSON, we can render it to an HTML table, similar to how to rendered the `people` array in the previous tutorial, or the `MOVIES` array in the previous challenge. 

```javascript
//last 24-hours of data from Fremont Bridge bike traffic
var dataURL = "https://data.seattle.gov/resource/4xy5-26gy.json?$order=date%20desc&$limit=24";

function parseAsJSON(response) {
	return response.json();
}

function handleError(err) {
	console.error(err);
	alert(err.message);
}

function renderRecord(record) {
	//create a <tr> and <td> elements for each property
	//...
}

function renderTable(data) {
	//`data` is an array of objects
	//loop over the array calling renderRecord()
	//for each record, and appending the returned
	//<tr> to the <tbody>
	//...
}

//fetch the data
fetch(dataURL)
	.then(parseAsJSON)
	.then(renderTable)
	.catch(handleError);
```

Because the parsing as JSON and handling of errors is something that will be similar for all `fetch()` requests, it makes sense to define these functions once and simply pass a reference to them to the `.then()` and `.catch()` methods. I also defined a function for the table rendering, similar to what we had done before. When passing just the function names (i.e., references), it makes the Promise chain read almost like English: "fetch this URL, then parse it as JSON, then render it to a table, and handle any errors that happen along the way."

To see this in action, visit [my fetch example on CodePen](http://codepen.io/drstearns/pen/pRJxrP).