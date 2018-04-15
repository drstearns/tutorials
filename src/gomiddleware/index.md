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

Start by defining a new struct that implements the `ServeHTTP()` method of the [http.Handler](https://golang.org/pkg/net/http/#Handler) interface. The struct should have a field to track the real `http.Handler`, which it will call in between the pre- and post-processing of the request.

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

The `NewLogger()` constructor function takes an `http.Handler` to wrap and returns a new `Logger` instance wrapped around it. Since an `http.ServeMux` satisfies the `http.Handler` interface, you can wrap an entire mux with the logger middleware. And since `Logger` implements the `ServeHTTP()` method, it also satisfies the `http.Handler` interface, so you can pass it to the `http.ListenAndServe()` function instead of the mux you wrapped. Change your `main()` function to look like this:

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

Because every middleware constructor both accepts and returns an `http.Handler`, you can chain multiple middleware handlers together. For example, say we also want to add a header to all responses written by all of the handlers added to that mux. We would first create another middleware handler.

```go
//ResponseHeader is a middleware handler that adds a header to the response
type ResponseHeader struct {
	handler http.Handler
	headerName string
	headerValue string
}

//NewResponseHeader constructs a new ResponseHeader middleware handler
func NewResponseHeader(handlerToWrap http.Handler, headerName string, headerValue string) *ResponseHeader {
	return &ResponseHeader{handlerToWrap, headerName, headerValue}
}

//ServeHTTP handles the request by adding the response header
func (rh *ResponseHeader) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	//add the header
	w.Header().Add(rh.headerName, rh.headerValue)
	//call the wrapped handler
	rh.handler.ServeHTTP(w, r)
}

```

To use this and the logger middleware handler at the same time, just wrap one around the other:

```go
func main() {
	//...existing code...

	//wrap entire mux with logger and response header middleware
	wrappedMux := NewLogger(NewResponseHeader(mux, "X-My-Header", "my header value"))

	log.Printf("server is listening at %s", addr)
	//use wrappedMux instead of mux as root handler
	log.Fatal(http.ListenAndServe(addr, wrappedMux))
}
```

You can chain together as many middleware handlers as you want by wrapping each around the others. This works fine when you have only a few middleware handlers (which is typical), but if you find yourself adding many, you should try the [Adapter pattern](https://medium.com/@matryer/writing-middleware-in-golang-and-how-go-makes-it-so-much-fun-4375c1246e81) outlined in Mat Ryer's excellent article [Writing Middleware in #golang and how Go makes it so much fun](https://medium.com/@matryer/writing-middleware-in-golang-and-how-go-makes-it-so-much-fun-4375c1246e81). The Adapter pattern can be difficult to understand, but it allows you to chain many middleware handlers together in a very elegant way.

## Middleware and Request-Scoped Values

Now let's consider a slightly more complicated example. Say we have several handlers that all require an authenticated user, and let's also say that we have a function that can return that authenticated user or an error from an `http.Request`. For example:

```go
func GetAuthenticatedUser(r *http.Request) (*User, error) {
	//validate the session token in the request,
	//fetch the session state from the session store,
	//and return the authenticated user
	//or an error if the user is not authenticated
}

func UsersMeHandler(w http.ResponseWriter, r *http.Request) {
	user, err := GetAuthenticatedUser(r)
	if err != nil {
		http.Error(w, "please sign-in", http.StatusUnauthorized)
		return
	}

	//GET = respond with current user's profile
	//PATCH = update current user's profile
}
```

The `UsersMeHandler()` needs the currently authenticated user, so it calls `GetAuthenticatedUser()` and handles any errors that are returned. This works fine, but what if we start adding more handlers that also require the currently authenticated user? We could duplicate this block of code at the start of every handler, but duplicating code is never a good idea. Instead, let's use a middleware handler to ensure that the user is authenticated before calling the ultimate handler.

We can start by defining a middleware handler similar to those above:

```go
type EnsureAuth struct {
	handler http.Handler
}

func (ea *EnsureAuth) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	user, err := GetAuthenticatedUser(r)
	if err != nil {
		http.Error(w, "please sign-in", http.StatusUnauthorized)
		return
	}
	
	//TODO: call the real handler, but how do we share the user?
	ea.handler.ServeHTTP(w, r)
}

func NewEnsureAuth(handlerToWrap http.Handler) *EnsureAuth {
	return &EnsureAuth{handlerToWrap}
}
```

The `ServeHTTP()` method starts with that same block of code, and if `GetAuthenticatedUser()` returns an error, our middleware handler will respond and never call the real handler. But we still have a problem: how do we share the `user` variable with the real handler? 

Since this value is specific to the request, we don't want to share it using the techniques discussed in the [Sharing Values with Go Handlers Tutorial](../gohandlerctx/), as those are for values shared amongst all requests. Instead, we should store this user in the **request context**.

Request contexts were introduced in Go version 1.7, and they allow several advanced techniques, but the one we are concerned with here is the storage of **request-scoped values**. The request context gives us a spot to store and retrieve key/value pairs that stay with the `http.Request` object. Since a new instance of that object is created at the start of every request, anything we put into it will be particular to the current request.

Start by defining a key type and value for the authenticated user we need to store:

```go
type contextKey int
const authenticatedUserKey contextKey = 0
```

And now use them in the `ServeHTTP()` method of our middleware handler to add the currently authenticated user to the request context:

```go
func (ea *EnsureAuth) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	user, err := GetAuthenticatedUser(r)
	if err != nil {
		http.Error(w, "please sign-in", http.StatusUnauthorized)
		return
	}

	//create a new request context containing the authenticated user
	ctxWithUser := context.WithValue(r.Context(), authenticatedUserKey, user)
	//create a new request using that new context
	rWithUser := r.WithContext(ctxWithUser)
	//call the real handler, passing the new request
	ea.handler.ServeHTTP(w, rWithUser)
}
```

Note that putting the user into the request context involves creating a new context based on the current one, adding the user to it as a value, and creating a new request object with that new context. We then pass that new request to the real handler so that it can retrieve the value from the context. This ensures that middleware handlers earlier in the chain don't see these values when our middleware handler returns. 

Retrieving the value in our handler function looks like this:

```go
func UsersMeHandler(w http.ResponseWriter, r *http.Request) {
	//get the authenticated user from the request context
	user := r.Context().Value(authenticatedUserKey).(*User)

	//do stuff with that user...
}
```

Here we use the `authenticatedUserKey` constant to retrieve the value from the context, but the return type of the `.Value()` method is `interface{}`. Recall that the empty interface type (`interface{}`) in Go is like the `Object` type in Java: it allows us to store any type we want, but to do anything with that value when we retrieve it, we must cast it back into the real type. In Go, we do a [**type assertion**](https://tour.golang.org/methods/15), which the last bit of that line: `.(*User)`. This checks the real type of the value, and if it is `*User`, it assigns that type to our `user` variable.

### An Alternative

The syntax for storing and retrieving request-scoped values is a bit clumsy-looking, and it tends to obscure dependencies, so [some developers have argued against using it](https://medium.com/@cep21/how-to-correctly-use-context-context-in-go-1-7-8f2c0fafdf39). Instead, they advocate modifying the function signature of handlers that require additional request-scoped values. If these handler functions truly require these values, then they should make those dependencies explicit, and require some sort of middleware adapter when being added to a web server mux.

For example, our `UsersMeHandler()` from above could be changed to look like this:

```go
func UsersMeHandler(w http.ResponseWriter, r *http.Request, user *User) {
	//do stuff with the `user`...
}
```

Adding this extra parameter means that this function no longer conforms to the HTTP handler function signature, so to use this with an `http.ServeMux`, we need to adapt it. We could do this using a slightly modified version of the middleware handler above:

```go
//authenticatedHandler is a handler function that also requires a user
type AuthenticatedHandler func(http.ResponseWriter, *http.Request, *User)

type EnsureAuth struct {
	handler AuthenticatedHandler
}

func (ea *EnsureAuth) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	user, err := GetAuthenticatedUser(r)
	if err != nil {
		http.Error(w, "please sign-in", http.StatusUnauthorized)
		return
	}
	
	ea.handler(w, r, user)
}

func NewEnsureAuth(handlerToWrap AuthenticatedHandler) *EnsureAuth {
	return &EnsureAuth{handlerToWrap}
}
```

Here we define a new type for an `AuthenticatedHandler`, which is a handler function that takes one additional parameter of type `*User`. We then change our `EnsureAuth` middleware to wrap one of these authenticated handler functions rather than an `http.Handler`. Our `ServeHTTP()` method can then simply pass the user to the authenticated handler function as a third parameter.

The slight drawback to this approach is that `EnsureAuth` is now an adapter that must be wrapped around every authenticated handler function as we add it to a mux. For example, this is how we would use it in the `main()` function:

```go
mux.Handle("/v1/users/", NewEnsureAuth(UsersHandler))
mux.Handle("/v1/users/me", NewEnsureAuth(UsersMeHandler))
```

Instead of wrapping an entire mux just once, we have to wrap each of our authenticated handler functions as we add them to the mux. This is because the `.HandleFunc()` method requires a function with only two parameters, not three.

This slight drawback could be overcome by creating your own `AuthenticatedServeMux` struct, with methods that accept `AuthenticatedHandler` functions instead of the normal HTTP handler functions. You could then create an instance of this authenticated mux, add all of your authenticated handlers to it, and then add the authenticated mux to the main server mux.



