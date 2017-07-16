Back in the early 2000s, web browsers started allowing JavaScript to make HTTP requests without requiring a page navigation. This was very exciting, as it enabled a new form of web application that felt more like a native desktop application. But the browser vendors faced a difficult question: should we allow JavaScript to make requests to a different [origin](../http/#secorigin) than the origin the current page came from? In other words, should JavaScript loaded into a page served from `example.com` be able to make HTTP requests to `example.com:4000` or `api.example.com` or even `some-other-domain.com`?

On the one hand, browsers long allowed page authors to include images and script files served from other origins: this was how one could include a JavaScript library file hosted on a [Content Delivery Network (CDN)](https://en.wikipedia.org/wiki/Content_delivery_network). This resulted in an HTTP request to a different origin, so why not let JavaScript do that directly?

On the other hand, there were some very significant security concerns with allowing cross-origin requests initiated from JavaScript. Many sites use cookies to track authenticated sessions, and browsers automatically send any cookies they have for an origin when they make a request to it. If a user was signed-in to sensitive site like their bank, and if that user was lured to a malicious page on `evil.com`, JavaScript within that page could easily make HTTP requests to the user's bank, and the browser would happily send along the authenticated session cookie. Thus the malicious page could conduct transactions on the user's behalf without the user even knowing that it's occurring.

Not surprisingly, the browser vendors decided to restrict cross-origin HTTP requests made from JavaScript. This posed issues for emerging web services that wanted to provide APIs that were callable from any web application, regardless of what origin the application came from.

Several creative hacks were developed to make this possible, the most popular being the [JSONP technique](https://en.wikipedia.org/wiki/JSONP). But these were always acknowledged as short-term hacks that needed to be replaced by a long-term solution. The great minds of the Web got together to figure out how to enable open API web services without compromising security. The result was the [Cross-Origin Resource Sharing](https://www.w3.org/TR/cors/) standard, more commonly referred to as CORS.

## How CORS Works

The CORS standard defines a few new HTTP headers, and some rules concerning how browsers and servers negotiate a cross-origin HTTP request from JavaScript. The rules discuss two different scenarios: simple requests, and more dangerous requests that require a preflight authorization request.

### Simple Requests

Simple cross-origin requests are defined as follows:

- The method is GET, HEAD, or POST
- The request may contain only "safe" headers, such as `Accept`, `Accept-Language`, `Content-Type`, and `Viewport-Width`. These headers are considered safe because they only provide harmless meta-data, and are not typically used during data-mutating requests.
- If a `Content-Type` header is included, it may only be one of the following:
	- `application/x-www-form-urlencoded` (format used when posting an HTML `<form>`)
	- `multipart/form-data` (format used when posting an HTML `<form>` with `<input type="file">` fields)
	- `text/plain` (just plain text)

If JavaScript in a page makes an HTTP request that meets these conditions, the browser will send the request to the server, adding an `Origin` header set to the current page's origin. The server may use this `Origin` request header to determine where the request came from, and decide if it should process the request.

If the server does process the request and responds with a 200 (OK) status code, it must also include a response header named `Access-Control-Allow-Origin` set to the value in the `Origin` request header, or `*`. This tells the browser that it's OK to let the client-side JavaScript see the response.

This header protects older servers that were built before the CORS standard, and are therefore not expecting cross-origin requests to be allowed. Since this header was defined with the CORS standard, older servers will not include it in their responses, so the browser will block the client-side JavaScript from seeing those responses.

Supporting simple cross-origin requests on the server-side is therefore as simple as adding one header to your response: `Access-Control-Allow-Origin: *`. If you want to restrict access to only a small set of white-listed origins, you can compare the `Origin` request header against that list and respond accordingly.

### Preflight Requests

If the client-side JavaScript makes a cross-origin request that doesn't conform to the restrictive simple request criteria, the browser does some extra work to determine if the request should be sent to the server. The browser sends what's known as a "preflight request," which is a separate HTTP request for the same resource path, but using the `OPTIONS` HTTP method instead of the actual request method. The browser also adds the following headers to the preflight request:

- `Access-Control-Request-Method` set to the method the JavaScript is attempting to use in the actual request.
- `Access-Control-Request-Headers` set to a comma-delimited list of non-safe headers the JavaScript is attempting to include in the actual request.



## CORS Middleware in Go
