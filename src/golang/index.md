
Although Go is [fully-compiled](../gointro/) like C and C++, its syntax and built-in types are more akin to higher-level languages like Python and JavaScript. This makes the language very approachable and functional right out of the box.

## Language Syntax

The syntax of Go is based on the C family of languages, with a few contemporary upgrades, so Java and JavaScript developers will find most of it very familiar. Most of the contemporary upgrades are best described in context, but a few general differences should be noted at the outset.

First, Go eliminates the need to put semi-colons at the end of single-statement lines (🎉 hooray!). Semi-colons are still necessary to separate compound statements on the same line (e.g., a `for` loop with initializer, test, and step exprssions), but in all other cases you can omit them.

Second, Go eliminates the need for parentheses around various structures like `if` and `for` expressions. For example, `if` statements in most C-like languages look like this:

```javascript
if (x == 5) {
	//...
}
```

but those parenthesis around the condition aren't really necessary for the parser, so Go eliminates them, resulting in a cleaner syntax like this;

```go
if x == 5 {
	//...
} 
```

Third, as opposed to JavaScript, string literals in Go are always expressed in double-quotes. Single quotes are only used for a single character, which Go refers to as a "rune." Go also allows you to wrap string literals in a back-tick symbol, which allows for multi-line strings that preserve embedded line breaks and tabs:


```go
"my string" //a string of UTF-8 characters
'x'         //a single UTF-8 character

`this is a
	multi-line string
with embedded line breaks and tabs`
```

Go defines a strict code style that is enforced by the `gofmt` tool. Most editor/IDE extensions will automatically run this tool on your source code whenever you save the file, and it will adjust your source code as needed. Go noobs are often taken-aback when this happens, but this is actually a good thing: it makes everyone's Go code consistent and easy-to-read. The good news is that if you use `gofmt`, you'll never loose points for sloppy code style!

## Hello World in Go

When describing a new programming language, it's traditional to show what it takes to print "Hello, World!" to the screen. In Go, that program looks like this:

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello, World!")
}
```

This rather simple program gives us a chance to learn some of the basic constructs of Go that you will use in every program.

### Packages and Code Organization

The first line is the package declaration. All Go source files are organized into packages, and the package name `main` is used for the source file containing your program's `main()` function. When your program runs, this `main()` function is invoked, so it serves as the entry point for the program.

You can put all of the code for a given program in the `main` package, but this quickly becomes unwieldy as your code base grows. Instead, most Go developers (affectionately known as "[gophers](https://blog.golang.org/gopher)") organize their code into packages with the same name as the subdirectory in which the code files exist. For example, a web server might use a code organization along these lines:

```nohighlight
$GOPATH/src/github.com/username/reponame
├── handlers
│   └── users.go (package handlers)
├── models
│   └── user.go  (package models)
└── main.go      (package main)
```

For details on the organization of the `$GOPATH/src` directory, including what `username` and `reponame` should be replaced with, see the [Introduction to Go Tutorial](../gointro/#secstructureofthesrcsubdirectory).

Packages are also Go's main encapsulation mechanism. All functions, global variables, and structure fields within a package are accessible by all other code in that same package, but code in other packages can only access exported functions, globals, and fields. This allows us to write reusable libraries that protect their data while providing a public API to other packages.

Interestingly, Go doesn't include an `export` keyword for exporting things from a package. Instead, it uses a simple convention: all identifiers that start with a capital letter are exported, and all that start with a lower-case letter are not. This may seem strangely arbitrary at first, but since the exported/unexported nature of the identifier is encoded into its name, it does make it easy to determine if an identifier is exported or not when you are debugging a block of code that someone else wrote (or that you wrote a long time ago).

These subtleties show that Go was a language designed by people who have spent decades writing production software. Go's creators set out to design a language that would make it easier to not only build, but also _maintain_ large, complex, long-lived software systems.

### Importing Other Packages

The next line of our hello world program demonstrates how one imports code from other packages:

```go
import "fmt"
```

This line imports [the `fmt` package](https://golang.org/pkg/fmt/) from the Go standard library, which exports several functions for writing formatted output. The package name becomes a prefix for all functions exported by the package, so calling one of those functions looks like this:

```go
fmt.Println("Hello, World!")
```

Syntactically, it looks like `fmt` is an object that has a method named `Println`, but `Println` is really just an exported function in the `fmt` package. Using the package as a prefix allows different packages to export functions of the same name, while still allowing the importing code to distinguish them.

When importing packages from the standard library, you only need to list the package name after the `import` keyword, but when importing your own packages, or those defined in other reusable libraries, you need to use a path to the source code that is relative to the `$GOPATH/src` directory. For example, to import the `handlers` package shown in the directory listing above, your import statement would look like this:

```go
import "github.com/username/reponame/handlers"
```

Importing multiple package is typically done using this parenthetical syntax:

```go
import (
	"fmt"
	"os"
	"log"
)
```

If you use one of the excellent editor/IDE extension for Go, you generally don't need to type these import statements: as soon as you type a line like `fmt.Println()` the extension will call the `goimports` tool (or similar) to automatically maintain the imports list based on the code you've written.

### Functions

As noted earlier, the main entry point for all Go programs is the `main()` function in the `main` package. Declaring this function looks like this:

```go
func main() {
	//function body
}
```

This function has no arguments, and no return value, so it's pretty simple to declare. The `func` keyword starts a function declaration, the function name follows, and inside the parenthesis are the parameters. To declare a function that takes a single string parameter, the syntax looks like this:

```go
func sayHello(name string) {
	fmt.Printf("Hello %s!\n", name)
}
```

Note how the data type `string` _follows_ the parameter name rather than proceeding it. This is [becoming common](https://golang.org/doc/faq#declarations_backwards) in newer languages such as Go and Swift (for more details on why Go does this, see their [Go Declaration Syntax](https://blog.golang.org/gos-declaration-syntax) article). If you have multiple parameters of the same type, you can omit the type on all but the last one:

```go
func sayHello(title, name string) {
	fmt.Printf("Hello %s %s!\n", title, name)
}
```

If your function returns a value, you must also declare what type it returns. Just like the parameters, the return type of a function _follows_ the function declaration rather than proceeding it:

```go
func getGreeting(title, name string) string {
	return fmt.Sprintf("Hello %s %s!", title, name)
}
```

One of the nice features of Go is that we can also [return _multiple_ values](https://golang.org/doc/effective_go.html#multiple-returns) from a single function, and this is commonly used for error handling. When returning multiple values, wrap the return type list in parentheses.

```go
//getGretting returns a greeting for a name, or an error
//if `name` is zero-length
func getGreeting(title, name string) (string, error) {
	if len(name) == 0 {
		return "", fmt.Errorf("the 'name' parameter is required")
	}
	return fmt.Sprintf("Hello %s %s!", title, name), nil
}
```

Unlike Java and JavaScript, [Go doesn't support exceptions](https://golang.org/doc/faq#exceptions) with `try/catch` handling. Instead, any function that might generate an error returns that error as the last return value. If an error occurs, the error is returned, but if no error occurs, the function returns `nil` for the error (similar to `null` in other languages). The calling function then checks whether the returned error is non-nil, and handles the error accordingly. For example:

```go
greeting, err := getGreeting("Mr", "Anderson")
if err != nil {
	//handle error
}
```

## Variables

Variables in Go are statically typed, and may not change their type over time. They are formally declared like so:

```go
//declares a string variable named `name` initialized to "Anderson" 
var name string = "Anderson"
```

Just like the parameters above, note that the type _follows_ the variable name.

This longer form is rarely used, because the Go compiler can work out from the initializing expression that `name` is a string, and the keyword `var` is not strictly necessary for the parser to recognize that this is a variable declaration. So Go offers this much more compact syntax for declaring and initializing variables in one step:

```go
//treated the same as above
name := "Anderson"
```

You can declare and initialize multiple variables in the same statement, which is exactly what we did earlier when we declared variables to hold he results of the `getGreeting()` function.

```go
//declare and initialize both `title` and `name`
title, name := "Mr", "Anderson"

//pass them to getGreeting() and 
//declare/init `greeting` and `err` with the results
greeting, err := getGreeting(title, name)
```

Variables are block-scoped in Go, just as they are in Java: variables declared within a block are visible only within that block. When combined with Go's `if` statement initializers, this comes in handy when checking for errors:

```go
if err := doSomethingThatCouldFail(); err != nil {
	//the `err` variable is visible only within this if block
}
```

In the code above, the expression before the `;` is executed, and the result is assigned to a new variable named `err`. The expression after the `;` then checks if that variable is non-nil, and if so, the `if` block body is executed. That `err` variable is visible only within the `if` block, and as soon as it exits, the variable falls out of scope and is eventually gargage collected.

## Other Simple Types

In addition to strings, Go offers several other simple types:

- `bool`: true/false booleans
- `int` and `uint`: implementation-dependent signed and unsigned integers (64 or 32 bits depending on the target architecture)
- `int8`, `int16`, `int32`, `int64`, and the unsigned equivalents `uint8`, `uint16`, `uint32`, `uint64`: specific-sized signed and unsigned integers
- `float32` and `float64`: 32 and 64-bit floating point numbers
- `complex64` and `complex128`: complex numbers containing both the real and imaginary parts
- `byte`: an alias for `uint8`
- `rune`: an alias for `int32`

When working with large amounts of data in memory, consider whether you really need 64 bits to hold your numeric values, or whether you could get away with 32, 16, or even 8 bits per number. If so, you will significantly reduce the amount of memory consumed by using `int32`, `int16`, `int8` rather than `int`.

## Structs

Many times we want to combine a set of variables into a single unit so that we can work with them together. In object-oriented languages, we define a class and include the variables as data members. Although Go has some features that quasi-object-oriented, there are no classes like there are in Java. But we can define a simple struct instead: 

```go
type Rectangle struct {
	Top int
	Left int
	Width int
	Height int
}
```

This declares a new type with the name `rectangle`, which is a structure containing the four fields described in the body of the declaration. After we declare this type, we can then create instances of this struct and access the fields:

```go
//construct a Rectangle
//the fields are initialized in the order
//they are declared
r := Rectangle{10, 20, 30, 40}

//directly access the fields
fmt.Printf("area is %d\n", r.Width*r.Height)
```

The syntax `Rectangle{}` is known as a static initializer. If you supply only a list of values, the struct fields are initialized with those values in the order in which they are declared (i.e., the first value goes into the `Top` fields, the second into the `Left` field, and so on). If you want to be more explicit, or use a different order, you can also name the fields as you initialize them, similar to a JavaScript object declaration:

```go
r := Rectangle{
	Width: 30, 
	Height: 40,
	Top: 10, 
	Left: 20, 
}
```

Note that when you spread the values onto separate lines, Go syntax requires a comma after _every_ value _including the last one_. This is different than JavaScript, but it's actually a good thing, as it makes it much easier to add a new value to the end of the list when you add a new field to the struct. Since every line gets a comma on the end, you don't need to alter the current last line to add another one after it.

Since `Rectangle` is now a type, we can declare function parameters to be that type, and the Go compiler will ensure that only a `Rectangle` instance can be passed to that parameter:

```go
func Area(r Rectangle) int {
	return r.Width * r.Height
}

func main() {
	r := Rectangle{10, 20, 30, 40}
	fmt.Printf("area is %d\n", Area(r))
}
```

## Pointers

In the `Area()` function above, the `Rectangle` instance is actually passed by value, meaning that the four integers are copied in memory as the `Rectangle` is passed to the function. Although that's generally fine for simple types like single integers and immutable strings, copying larger structs can result in unnecessary memory allocations and copying.

In Go we can pass any type by reference by using pointers, which are simple integers that represent the address in memory where the actual value lies. For example, we can adjust the `Area()` function to accept _a pointer to_ a `Rectangle` rather than _a copy of_ a `Rectangle`, and pass the address of our `Rectangle` instance to the function:

```go
func Area(r *Rectangle) int {
	return r.Width * r.Height
}

func main() {
	r := Rectangle{10, 20, 30, 40}
	fmt.Printf("area is %d\n", Area(&r))
}
```

Now when we call the `Area()` function, we are passing only one 64-bit number rather than four of them. When passing by reference, the function may also make changes to the struct that are visible in the calling code when the function returns.

The pointer to a type is expressed syntactically as `*T` where `T` is the name of the type. The `&` operator takes the address of the variable to the right, and in this case, that address is passed to the `Area()` function. Note that code inside that function didn't have to change: Go will let you use `.` to access the fields of a struct, even if the value on the left is a pointer to the struct instead of the struct value. This is in contrast to C/C++ where you have to use a different operator with pointers.

Since the data type of `r` in the code above is `Rectangle` and not `*Rectangle`, we have to use the `&` operator to get a pointer to the `Rectangle` value assigned to the `r` variable. But we can instead declare and initialize `r` to a `*Rectangle` from the start by using the `&` operator in the initialization expression:

```go
func Area(r *Rectangle) int {
	return r.Width * r.Height
}

func main() {
	r := &Rectangle{10, 20, 30, 40}
	fmt.Printf("area is %d\n", Area(r))
}
```

This code creates a `Rectangle` struct, but then takes the address of it and assigns that address to `r`, making that variable's type a `*Rectangle`. We can then pass that directly to `Area()`.

## Receivers

The adjusted `Area()` function above accepts a `*Rectangle` as a parameter, but in object-oriented languages, we would commonly make this a method of the `Rectangle` class so that you can call it using an expression like `r.Area()`. In Go, we can do something similar, but since there are no classes, we use a slightly different mechanism called a "receiver" parameter:

```go
//the parameter just moves to the left
//of the function name and becomes a
//"receiver", which allows us to call
//the function using the syntax `r.Area()`
func (r *Rectangle) Area() int {
	return r.Width * r.Height
}

func main() {
	r := &Rectangle{10, 20, 30, 40}
	fmt.Printf("area is %d\n", r.Area())
}
```

A receiver is just like a parameter, except that it is declared on the left side of the function name. You can give the receiver parameter whatever name you want, but we typically use something short like the first letter of the receiver's data type. You then use that name in the function's code, just like any other parameter. In the example above, I literally just moved the parameter declaration to the left, while the function body remained unchanged.

The main benefit of using a receiver is syntax-sugar on the calling side: you can now call this function using the syntax `r.Area()` rather than `Area(r)`. The former feels more like an object-oriented method. In truth, the compiler just turns this into `Area(r)`, so the compiled code will be pretty much the same. But receivers do become very handy when working with functions that must conform to a particular parameter signature, such as Go's HTTP handler functions (more on those later).

If this all sounds weird, it really isn't. Have you ever wondered how the magic `this` keyword works in Java? Go's receivers are just a more explicit form of what happens with Java's `this` keyword under the hood. When you invoke something like `r.Area()` in Java, it must bind the `this` keyword to the object instance assigned to `r`, and then call the `Area()` function. That's the same thing as passing the object instance as a special parameter that you don't see in your source code, but is nevertheless there on the call stack. Go just makes this hidden parameter explicit, and allows you to give it whatever name you want. To drive this home, we can rename the receiver parameter to `this` and you'll probably start to see the resemblance to object-oriented languages like Java:

```go
//receivers are just a more explicit form of `this`
func (this *Rectangle) Area() int {
	return this.Width * this.Height
}

func main() {
	r := &Rectangle{10, 20, 30, 40}
	fmt.Printf("area is %d\n", r.Area())
}
```

You won't commonly see Go programmers using `this` for receiver names, as it implies that Go is more object-oriented than it really is, but it is legal since `this` is not (yet) a keyword in the language.

## Comments and Documentation

Comments in Go are the same as in all other C-like languages: `//` makes everything following to the end of the current line a comment, and `/* */` allows for multi-line comments. But like Java and other more recent languages, comments before types and functions are used by the `godoc` tool to generate documentation automatically. Unlike [Javadoc](http://www.oracle.com/technetwork/articles/java/index-137868.html) or [JSDoc](http://usejsdoc.org/about-tutorials.html), the format used in Go is very simple and uncomplicated:

```go
//Rectangle represents a Rectangle.
type Rectangle struct {
	Top int
	Left int
	Width int
	Height int
}

//Area returns the area of the Rectangle on which it is called.
func (r *Rectangle) Area() int {
	return r.Width * r.Height
}
```

By convention, your comment should start with the name of the function or struct, and then form a full sentence that describes what the struct represents, or what the function does. The field/parameter names and types are extracted automatically from the code. If you want to explain more about a struct field, add a comment above the field. If you want to explain more about a function parameter, just refer to it by name in the comment above the function.

In IDEs like Visual Studio Code, this documentation is automatically loaded as you add it, and shown whenever you refer to the struct or function.

## Keep Learning

To learn more about the Go language, complete their [interactive tour](https://tour.golang.org/welcome/1). This walks you through the language features, step-by-step, while allowing you to experiment in their sand-boxed [Go Playground](https://play.golang.org/).
