So far you've seen how to build a [Go web server](../goweb/) that routes requests to different functions depending on the requested URL. But what if you want execute some code before and after _every_ request, regardless of the requested URL? For example, what if you wanted to log all requests made to your server, or allow all of your APIs to be callable [cross-origin](../cors/), or ensure that the current user has authenticated before calling the handler for a secure resource? We can do all of these things easily and efficiently using a middleware handler.

A **middleware handler** is simply an `http.Handler` that wraps another `http.Handler` to do some pre- and/or post-processing of the request. It's called "middleware" because it sits in the middle between the Go web server and the actual handler.

![architectural diagram showing middleware in the request/response flow](img/flow.png)

## Logging Middleware

To see how this works, let's build a simple web server with a logging middleware handler. Create a new directory inside your `$GOPATH/src` directory, and create a file within that directory named `main.go`. Add this code to that file:

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

func HelloHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello, World!"))
}

func CurrentTimeHandler(w http.ResponseWriter, r *http.Request) {
	curTime := time.Now().Format(time.Kitchen)
	w.Write([]byte(fmt.Sprintf("the current time is %v", curTime)))
}

func main() {
	addr := os.Getenv("ADDR")

	mux := http.NewServeMux()
	mux.HandleFunc("/v1/hello", HelloHandler)
	mux.HandleFunc("/v1/time", CurrentTimeHandler)

	log.Printf("server is listening at %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
```

You can run this server by setting the `ADDR` environment variable and using `go run main.go`:

```bash
export ADDR=localhost:4000
go run main.go
```

Once the server is running, you can open <http://localhost:4000/v1/hello> in your browser to see the `HelloHandler()` response, and <http://localhost:4000/v1/time> to see the `CurrentTimeHandler()` response.

Now suppose we want to log all requests made to this server, listing the request method, resource path, and how long it took to handle. We could add similar code to every handler function, but it would be much better if we could handle that logging in just one place. We can use a middleware handler to do just that.

Start by defining a new struct that implements the `ServeHTTP()` method of the `http.Handler` interface. The struct should have a field to track the real `http.Handler`, which it will call in between the pre- and post-processing of the request.

```go
//Logger is a middleware handler that does request logging
type Logger struct {
	handler http.Handler
}

//ServeHTTP handles the request by passing it to the real
//handler and logging the request details
func (l *Logger) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	l.handler.ServeHTTP(w, r)
	log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
}

//NewLogger constructs a new Logger middleware handler
func NewLogger(handlerToWrap http.Handler) *Logger {
	return &Logger{handlerToWrap}
}
```

The `NewLogger()` constructor function takes an `http.Handler` to wrap and returns a new `Logger` instance wrapped around it. Since an `http.ServeMux` satisfies the `http.Handler` interface, you can wrap an entire mux with the logger middleware. And Since `Logger` implements the `ServeHTTP()` method, it also satisfies the `http.Handler` interface, so you can pass it to the `http.ListenAndServe()` function instead of the mux you wrapped. Change your `main()` function to look like this:

```go
func main() {
	addr := os.Getenv("ADDR")

	mux := http.NewServeMux()
	mux.HandleFunc("/v1/hello", HelloHandler)
	mux.HandleFunc("/v1/time", CurrentTimeHandler)
	//wrap entire mux with logger middleware
	wrappedMux := NewLogger(mux)

	log.Printf("server is listening at %s", addr)
	//use wrappedMux instead of mux as root handler
	log.Fatal(http.ListenAndServe(addr, wrappedMux))
}
```

Now restart your web server and re-request your APIs. Because we wrapped the entire mux, you should see all requests logged to your terminal, regardless of which resource path is requested!

## Chaining Middleware

Because every middleware handler constructor both accepts and returns an `http.Handler`, you can chain multiple middleware handlers together. For example, say we also want to add CORS support to all of the handlers added to that mux. We would first create a CORS middleware handler.

```go
//CORS is a middleware handler that adds CORS support
type CORS struct {
	handler http.Handler
}

//ServeHTTP handles the request by adding the CORS headers
//and calling the real handler if the method is something other
//then OPTIONS (used for pre-flight requests)
func (ch *CORS) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	//set the various CORS response headers depending on
	//what you want your server to allow
	w.Header().Add("Access-Control-Allow-Origin", "*")
	//...more CORS response headers...

	//if this is preflight request, the method will
	//be OPTIONS, so call the real handler only if
	//the method is something else
	if r.Method != "OPTIONS" {
		ch.handler.ServeHTTP(w, r)
	}
}

//NewCORS constructs a new CORS middleware handler
func NewCORS(handlerToWrap http.Handler) *CORS {
	return &CORS{handlerToWrap}
}
```

To use this and the logger middleware handler at the same time, just wrap one around the other:

```go
func main() {
	//...existing code...

	//wrap entire mux with logger and CORS middleware
	wrappedMux := NewCORS(NewLogger(mux))

	log.Printf("server is listening at %s", addr)
	//use wrappedMux instead of mux as root handler
	log.Fatal(http.ListenAndServe(addr, wrappedMux))
}
```

You can chain together as many middleware handlers as you want by wrapping each around the others. This works fine when you have only a few middleware handlers (which is typical), but if you find yourself adding many, you should try the [Adapter pattern](https://medium.com/@matryer/writing-middleware-in-golang-and-how-go-makes-it-so-much-fun-4375c1246e81) outlined in Mat Ryer's excellent article [Writing Middleware in #golang and how Go makes it so much fun](https://medium.com/@matryer/writing-middleware-in-golang-and-how-go-makes-it-so-much-fun-4375c1246e81). The Adapter pattern can be difficult to understand, but it allows you to chain many middleware handlers together in a very elegant way.

## Middleware and Request-Scoped Values

Now let's consider a slightly more complicated example. Say we have a sessions library that can fetch session state given an `http.Request` instance, and say we want to ensure that the session state has an authenticated user before calling a particular of handlers for secure resources. Although fetching session state from a store like redis is quite fast, it's still not something we want to do twice for every request. If we fetch it once, we want to share that fetched session state with the actual handlers.












