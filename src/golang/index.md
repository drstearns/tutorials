
Although Go is [fully-compiled](../gointro/) like C and C++, its syntax and built-in types are more akin to higher-level languages like Python and JavaScript. This makes the language very approachable and functional right out of the box.

## Language Syntax

The syntax of Go is based on the C family of languages, so Java and JavaScript developers will find most of it very familiar, but it eliminates some of the symbols that were actually unnecessary. For example, `if` statements in most C-like languages look like this:

```javascript
if (x == 5) {
	//...
}
```

but those parenthesis around the condition aren't really necessary for the parser, so Go eliminates them, resulting in syntax like this;

```go
if x == 5 {
	//...
} 
```

Strings in Go are encoded in [UTF-8](https://en.wikipedia.org/wiki/UTF-8) and string literals are always expressed in double-quotes. Single quotes are only used for a single UTF-8 character, which they refer to as a "rune."

```go
"my string" //a string of UTF-8 characters
'x'         //a single UTF-8 character
```

Go also allows you to wrap string literals in a back-tick symbol, which allows for multi-line strings that preserve embedded line breaks and tabs:

```go
`this is a
multi-line string
with embedded line breaks`
```

If you commonly forgot the semi-colons at the end of statements in Java or C/C++ and were frustrated by all the compiler errors, good news: Go gets rid of those almost completely! Semi-colons are still necessary to separate compound statements on the same line, but in all other cases you can omit them.

Go also defines a strict code style that is enforced by the `gofmt` tool. Most editor/IDE extensions will automatically run this tool on your source code whenever you save the file, and it will adjust your source code as needed. Go noobs are often taken-aback when this happens, but this is actually a good thing: it makes everyone's Go code consistent and easy-to-read. The good news is that if you use `gofmt`, you'll never loose points for sloppy code style!

## Packages and Imports


## Functions

## Variables and the Simple Data Types

## The Tour

To learn more about the Go language, complete their [interactive tour](https://tour.golang.org/welcome/1). This walks you through the language features, step-by-step, while allowing you to experiment in their sand-boxed [Go Playground](https://play.golang.org/).
