HTTP handler functions in Go must have a very particular signature: `func(http.ResponseWriter, *http.Request)`. The web server implementation in the standard library needs to call these functions, so they must conform to a type declared in the `http` package, and that type only allows for those two parameters. But what if those handler functions need access to some values that are created and initialized during your program's `main()` function? For example, what if they need to use a database connection that is created and initialized based on environment variables read at startup?

There are four possible approaches I know of, but only two that I recommend, and one that I prefer. Let's look at each of them so that you can see why I recommend the ones I do.

## Global Variables

The first possible but very flawed approach is to use global variables that are initialized during your `main()` function, and read by your handler functions. Although this would work, it's not a good idea, and professional developers will chastise you for doing it. The primary reason is that global variables obfuscate the dependencies between different parts of your code.

The Go compiler can catch a wide range of programming errors because the language is statically-typed, but it can't ensure that a global variable is initialized before it is used, nor that it never gets used after it is cleared. This makes it easy to forget that the global needs initialization, or to introduce subtle runtime bugs that only show up under particular circumstances.

For example, say you used a global to hold your MongoDB master session, initialized it during your `main()` function, and then used it in your handlers. Now say that you add lots of other time-consuming initialization code to your `main()` function, so you decide to move the initialization code into a separate goroutine so that it runs concurrently. You've now introduced a subtle timing bug: if the web server starts and receives a request before your initialization code finishes, your handler function will try to use an uninitialized global variable, and generate a panic.

The root problem here is that your handler function is not making its dependencies explicit in a way that's obvious to other developers, nor in a way the compiler can enforce. A better approach is to use a technique where your handler function can't be added to the server mux without receiving references to the global values it needs.

## http.Handler Implementations

One way to make your dependencies obvious and force (or at least encourage) initialization is to make all of your handlers be structs that implement the [http.Handler](https://golang.org/pkg/net/http/#Handler) interface instead of simple handler functions. As discussed in the [Go Web Servers](../goweb/) tutorial, a handler can either be a simple function with the signature `func(http.ResponseWriter, *http.Request)`, or it can be a struct that implements the `http.Handler` interface. Since a struct must be created and initialized before it's used, we can add fields to that struct for each value our handler needs.

For example, a set of handlers that all need an `*mgo.Session` to talk to a MongoDB server could be written like this:

```go
type MyHandler struct {
	Session *mgo.Session
}

func (h *MyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	//...use h.Session to query the database...
}

type MyOtherHandler struct {
	Session *mgo.Session
}

func (h *MyOtherHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	//...use h.Session to query the database...
}

func main() {
	//dial MongoDB using environment variables
	//to get the host address
	mongosess, err := mgo.Dial(...)

	mux := http.NewServeMux()
	
	//add an instance of MyHandler, 
	//initializing it with the mongo session
	mux.Handle("/some/api", &MyHandler{mongosess})
	mux.Handle("/some/other/api", &MyOtherHandler{mongosess})
}
```

This approach makes the dependencies much more explicit, but it also requires a lot more code. Instead of writing a single function per handler, we now have to declare a new struct type and a `ServeHTTP()` method for it. If you have ten handlers that all need that same `*mgo.Session`, you have to declare ten different struct types, each with a field for the session, and ten `ServeHTTP()` methods.

This approach also doesn't strictly require the code that creates an instance of `MyHandler` to initialize all the fields with valid values. If no values are included in the static initializer expression (e.g., `&MyHandler{}`), the `Session` field will remain `nil`. If the `ServeHTTP()` method tries to use that field, it will generate a runtime panic, but not until that handler is first called. One could make the `Session` field unexported and provide a `NewMyHandler()` constructor function, but that would be even more code, as you'd have to write a constructor for every handler struct type.

## Closures

Another approach that allows you to check initialization at startup is to use closures. You might remember closures from JavaScript, but if you don't, they are created when a function is declared inside another function. The closure gives the inner function access to the stack of the outer function, which includes all of its parameters and local variables.

For example, instead of declaring `MyHandler` as a struct with fields for all the values the handler needs, we can create a function that accepts those values as parameters, checks them, and returns the actual HTTP handler function. The closure gives the HTTP handler function access to all of the parameters passed to the outer function. It would look something like this:

```go
func MyHandler(mongosess *mgo.Session) func(http.ResponseWriter, *http.Request) {
	if mongosess == nil {
		panic("nil MongoDB session!")
	}
	return func(w http.ResponseWriter, r *http.Request) {
		//use `mongosess` to access the database
	}
}

func MyOtherHandler(mongosess *mgo.Session) func(http.ResponseWriter, *http.Request) {
	if mongosess == nil {
		panic("nil MongoDB session!")
	}
	return func(w http.ResponseWriter, r *http.Request) {
		//use `mongosess` to access the database
	}
}

func main() {
	mongosess, err := mgo.Dial(...)
	mux := http.NewServeMux()
	
	//call functions passing the session,
	//and pass their return values to HandleFunc()
	mux.HandleFunc("/some/api", MyHandler(mongosess))
	mux.HandleFunc("/some/api", MyOtherHandler(mongosess))
}
```

This requires less code than the handler struct approach, and it allows us to check the values of our dependencies at startup. Instead of passing a reference to the `MyHandler` function to `mux.HandleFunc()`, we _call_ `MyHandler()` passing the parameters it wants. It then _returns_ a reference to the actual HTTP handler function, which gets passed to `mux.HandleFunc()`. Since functions are values, we can return a function from a function, thereby creating a closure!

If you have many HTTP handler functions that all need the same values, you can create just one outer function that returns a map, slice, or struct containing all of your HTTP handler functions. This would allow you to check the values just once, but the code in your `main()` function would have to capture the return value and read from it while adding the handler functions to the mux.

This technique works quite well, and it's one that I recommend, but I have found that some inexperienced developers are confused by closures and thus tend to make mistakes when using them. Thankfully, there's one more approach that is easier to understand, and works just as well.

## Receivers

As I discussed in the [Go Language](../golang/#secreceivers) tutorial, a function can have one "receiver" parameter, which is essentially like the `this` keyword in object-oriented languages. Receivers are used to add methods to a type, typically a struct type. The methods use the receiver parameter to reference the current value of the struct fields.

Interestingly, this receiver is not considered to be part of the function's type. That means an HTTP handler function can have a receiver and still match the type `func(http.ResponseWriter, *http.Request)`, which is what the `.HandleFunc()` method wants. This further means that we can add the same receiver type to many HTTP handler functions, and they all can use that receiver to reference the same values.

I call this receiver type the "handler context" because it defines a context within which the handler function is called. Continuing with our MongoDB session example, the handler context struct would look like this:

```go
type HandlerContext struct {
	mongosess *mgo.Session
}

//NewHandlerContext constructs a new HandlerContext,
//ensuring that the dependencies are valid values
func NewHandlerContext(mongosess *mgoSession) *HandlerContext {
	if mongosess == nil {
		panic("nil MongoDB session!")
	}
	return &HandlerContext{mongosess}
}

func (ctx *HandlerContext) MyHandler(w http.ResponseWriter, r *http.Request) {
	//...use ctx.session to query the database...
}

func (ctx *HandlerContext) MyOtherHandler(w http.ResponseWriter, r *http.Request) {
	//...use ctx.session to query the database...
}

func main() {
	mongosess, err := mgo.Dial(...)
	//construct the handler context
	hctx := NewHandlerContext(mongosess)
	
	mux := http.NewServeMux()
	//pass a reference to MyHandler and
	//MyOtherHandler, bound to our
	//handler context instance
	mux.HandleFunc(hctx.MyHandler)	
	mux.HandleFunc(hctx.MyOtherHandler)	
}
```

Here we declare a struct for the handler context, adding a field for each value the handlers need. We also provide a constructor function that checks the values before returning a new instance. We then add a receiver to each HTTP handler function, which is a pointer to one of these handler context structs. The HTTP hander functions can then reference any of the fields in the handler context struct.

When we add these HTTP handler functions to the mux, we prefix the function name with an instance of the handler context struct. This effectively binds the function to that struct instance. When the HTTP server calls the function, the receiver will already be set to the handler context instance, allowing the handler function to read all of its fields.

This approach works just as well (or in some cases better) than the closure approach, and many developers find it easier to understand. Thus, this is the approach I recommend the most.

## Request-Scoped Values

A final word of warning: these techniques are for values that are shared between all requests and not for values that are specific to a given request. For example, a connection to your persistent database is something that would typically be shared across all requests, while session state related to the value of the `Authorization` header is particular to the current request.

Values that are specific to a request are known as **request-scoped values** and these must be stored in the [request context](https://golang.org/pkg/net/http/#Request.Context). The Go web server processes requests concurrently, so it may invoke your handler multiple times at the same time. Since each request generates a new `http.Request` struct, you can safely store request-specific data in its context.

Request-scoped values are most typically used when implementing [middleware](../gomiddleware/), which is the subject of our next tutorial....

