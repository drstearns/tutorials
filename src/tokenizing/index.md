Go makes it really easy to build not only HTTP servers, but also HTTP clients. That is, you can quickly write programs that make HTTP requests and process the results. If the results are HTML, Go also makes it rather easy to tokenize that HTML and examine the results.

## Create a Simple Go Program

To show you how this all works, let's create a program that will fetch some HTML and extract the value of its `<title>` element.

Create a new directory within your `$GOPATH/src` directory named `pagetitle`. Inside that directory create a file named `main.go` and add this basic Go program boilerplate to it:

```go
package main

func main() {

}
```

We could hard-code a URL here, but our program would be much more versatile if we read the URL from a command-line argument. Those are available via the `os.Args` slice. The first element in the slice is the command used to execute your program, so the first parameter is actually at `os.Args[1]`. If the user doesn't supply that parameter, we should describe how to use the program and exit with a non-zero code, which indicates an error happened:

```go
package main

import (
	"fmt"
	"os"
)

func main() {
	//if the caller didn't provide a URL to fetch...
	if len(os.Args) < 2 {
		//print the usage and exit with an error
		fmt.Printf("usage:\n  pagetitle <url>\n")
		os.Exit(1)
	}

	URL := os.Args[1]
}
```

You might be wondering why I used `URL` for the variable name here rather than `url`. There are two reasons. The first is that there is a Go standard library package named `url`, so it's best to avoid using that as a variable name. If you try to import the `url` package later (say to parse a URL into its component parts), your local variable will shadow the variable created by the imported package, and you won't be able to access the package's functions while your local variable is still in scope.

The second reason is that Go is very opinionated about code style. Their style rules say that acronyms in variable names should be in uppercase. If you create a variable name `myUrl`, the go linter will generate a warning saying that `myUrl` should be `myURL`.

## Fetch the URL

Now that we know what URL to fetch, it's time to do that. Thankfully, Go makes this ridiculous easy. Their `http` package has a `Get()` function that does exactly what we need:

```go
//GET the URL
resp, err := http.Get(URL)

//if there was an error, report it and exit
if err != nil {
	//.Fatalf() prints the error and exits the process
	log.Fatalf("error fetching URL: %v\n", err)
}

//make sure the response body gets closed
defer resp.Body.Close()
```

The `Get()` function returns a pointer to an [http.Response](https://golang.org/pkg/net/http/#Response) struct and potentially an error. If the error is non-nil, it's generally best to assume that the response pointer will also be nil. So it's a very common pattern to check whether `err != nil`, and if it is, return the error to the caller. Since we are in the `main()` function still, we just use `log.Fatalf()` to print an error message and exit the process with an error code.

If there was no error, we have a valid response, and our `resp` variable will now hold all of the response information: status code, headers, and the content body. This body is an `io.ReadCloser`, which gives us a hint that we need to close this body stream before exiting our program. Here we use Go's [defer statement](https://gobyexample.com/defer) to ensure that the `.Close()` method is called on the response body regardless of how we exit the current function.

In order for us to process this response as an HTML page, we still need to verify two things before proceeding:

- The status code == http.StatusOK (200)
- The `Content-Type` header starts with `text/html`

If the user gave us a URL that doesn't match anything on the server, the server will respond with a `404 Not Found` error, and the response body won't be of any use to us. And if the user gave us a URL to something like an image or a CSS stylesheet, the response body won't parse as valid HTML. We can verify these things with a few checks:

```go
//check response status code
if resp.StatusCode != http.StatusOK {
	log.Fatalf("response status code was %d\n", resp.StatusCode)
}

//check response content type
ctype := resp.Header.Get("Content-Type")
if !strings.HasPrefix(ctype, "text/html") {
	log.Fatalf("response content type was %s not text/html\n", ctype)
}
```

The `strings` package offers a number of handy string-related functions. Here we use `HasPrefix()`, which returns true if the string passed as the first parameter starts with the string passed as the second parameter.

> **NOTE:** we are using `log.Fatalf()` here because this is a command-line utility, and we want to exit the process in the event of an error. If you are fetching and tokenizing HTML in a web server, do not use log.Fatalf(), as exiting the process will stop your web server. Instead, handle errors by responding to your client using the `http.Error()` function. This writes the error to the client and leaves your server running.

## Tokenize the HTML

Now we are ready to tokenize the response HTML and extract the page title. If you are unfamiliar with that word 'tokenize', it's simply the process of breaking a stream of characters into discrete tokens defined by the particular grammar—in this case, HTML. The tokens in HTML are start-tag (`<tag>`), self-closing tag (`<tag/>`), end-tag (`</tag>`), and plain text content within an element.

Tokenizing is the first step to parsing the document into a tree of element and text nodes, like the DOM. That full tree is really helpful to a program like a web browser, which allows manipulation and re-rendering of the tree over time, but it comes at a cost: it consumes a lot of memory to construct all of those tree nodes, and we have to process the entire document, even if all we want is one element in the `<head>` section. It would be much more efficient to simply tokenize the page, looking for the `<title>` element in particular, and exit as soon as we find it.

HTML tokenizing and parsing isn't quite yet in the Go standard library, but the Go team has released [a "supplementary package" for this](https://godoc.org/golang.org/x/net/html). These supplementary packages typically become part of the standard library in a future release (e.g., the `context` package began as a supplementary one), but only after the Go team is satisfied with the API. Because they guarantee source-code backwards compatibility with each release, they add things to the standard library only when they are sure they can freeze the API.

But developers can start using the supplementary packages right away; the Go team actually encourages developers to do so and send them feedback. To get this supplementary HTML tokenizing and parsing package, use this command in your command-line terminal:

```bash
go get golang.org/x/net/html
```

This will download the source code for the package to your `$GOPATH`, compile it, and install the resulting object file to your `$GOPATH/pkg` directory. 

To use this package in our project, we need to import it. Add the package's import path to your `import` list:

```go
import (
	//...existing imports...

	"golang.org/x/net/html"
)
```

Because the import path is the same thing you pass to `go get`, your dependencies are totally self-describing. If other developers clone your repo, all they need to do is execute `go get` with no arguments, and it will automatically download and install all imported packages.

Start by creating a new tokenizer over the response body:

```go
//create a new tokenizer over the response body
tokenizer := html.NewTokenizer(resp.Body)
```

If you look at [the package documentation](https://godoc.org/golang.org/x/net/html#NewTokenizer), the `NewTokenizer()` function actually takes an `io.Reader` interface. This allows the parser to work on any HTML stream that implements the very minimal [io.Reader interface](https://golang.org/pkg/io/#Reader). For example, it can tokenize HTML returned from an HTTP request, or read from a file, or fetched from a database: any source that satisfies the `io.Reader` interface.

The tokenizer has a `.Next()` method which returns just the next token type. You should call this in a loop that exits only when you find the `<title>` element, or after you encounter an error (including the end of the stream). Go's `for` loop handles this by simply omitting the start, comparison, and iteration expressions:

```go
//loop until we find the title element and its content
//or encounter an error (which includes the end of the stream)
for {
	//get the next token type
	tokenType := tokenizer.Next()

	//if it's an error token, we either reached
	//the end of the file, or the HTML was malformed
	if tokenType == html.ErrorToken {
		err := tokenizer.Err()
		if err == io.EOF {
			//end of the file, break out of the loop
			break
		}
		//otherwise, there was an error tokenizing,
		//which likely means the HTML was malformed.
		//since this is a simple command-line utility,
		//we can just use log.Fatalf() to report the error
		//and exit the process with a non-zero status code
		log.Fatalf("error tokenizing HTML: %v", tokenizer.Err())
	}

	//process the token according to the token type...
}
```

The `tokenType` returned from `tokenizer.Next()` will be one of their [token type constants](https://godoc.org/golang.org/x/net/html#TokenType). Here we check if it's an error token, and deal with the error. Error tokens occur either because we reached the end of the input stream, or because there was a true error tokenizing the HTML. If the former case, we just break out of the loop, but in the latter case we need to report the error and exit. Since this is just a simple command-line utility, we can use `log.Fatalf()` to do that. In a web server or other long-running process, you should report the error in some other way and continue running.

If the token was not an error token, the type will be one of the following:

- `html.StartTagToken`: a start tag such as `<title>`
- `html.EndTagToken`: an end tag such as `</title>`
- `html.SelfClosingTagToken`: a self-closing tag such as `<img ... />`
- `html.TextToken`: text content within a tag
- `html.CommentToken`: an HTML comment such as `<!-- comment -->`
- `html.DoctypeToken`: an document type declaration such as `<!DOCTYPE html>`

Since we are after the contents of the `<title>` token, we need to look for an `html.StartTagToken`, and in this case we can safely ignore the other types.


```go

//...existing looping and
//error-checking code from above...

//if this is a start tag token...
if tokenType == html.StartTagToken {
	//get the token
	token := tokenizer.Token()
	//if the name of the element is "title"
	if "title" == token.Data {
		//the next token should be the page title
		tokenType = tokenizer.Next()
		//just make sure it's actually a text token
		if tokenType == html.TextToken {
			//report the page title and break out of the loop
			fmt.Println(tokenizer.Token().Data)
			break
		}
	}
}
```

The `tokenizer.Token()` method constructs and returns a [populated `html.Token` struct](https://godoc.org/golang.org/x/net/html#Token) with information about the token. For a start-tag token, the `.Data` field contains the name of the tag. Tag names are already converted to lowercase by the tokenizer, so we can simply compare it against `"title"`. If it is the title element, we can then read the next token, which should be the element's text content. 

Since the page title is the _only_ thing we are after, we can break out of the loop as soon as we get it. If you need to continue processing other tags, don't break, but in this case we can since the title is all we need. Since this is the last code in the `main()` function, our program exits after we break out of the loop.

## Refactor the Code

This works, but all of the code is in the `main()` function, which will make it difficult to add features or build upon this. As an exercise for the reader, refactor the code into several functions like this:

```go
//fetchHTML fetches the provided URL and returns the response body or an error
func fetchHTML(URL string) (io.ReadCloser, error) {
	//TODO: put HTTP get code and error checking here
	//return errors if GET fails, if response status code
	//is != 200, or if Content-Type is not HTML
}

//extractTitle returns the content within the <title> element
//or an error
func extractTitle(body io.ReadCloser) (string, error) {
	//TODO: put the tokenization code here, and return 
	//the page title or an error
}

//fetchTitle fetches the page title for a URL
func fetchTitle(URL string) (string, error) {
	//TODO: fetch the HTML, extract the title, and make sure the body gets closed
}

func main() {
	//if the caller didn't provide a URL to fetch...
	if len(os.Args) < 2 {
		//print the usage and exit with an error
		fmt.Printf("usage:\n  pagetitle <url>\n")
		os.Exit(1)
	}

	title, err := fetchTitle(os.Args[1])
	if err != nil {
		log.Fatalf("error fetching page title: %v\n", err)
	}

	//print the title
	fmt.Println(title)
}
```

By splitting the code into separate re-usable functions, we can easily add more features in the future, such as handling multiple URLs at a time.

## Give it a Whirl

To run this program, execute these commands from within the `pagetitle` directory (Windows users should run `pagetitle.exe`):

```bash
go install
pagetitle http://google.com 
```

You should get back the value of the `<title>` element on the Google home page.

You can combine these in the Bash shell into one line, making it easier to re-compile and run after making changes:

```bash
go install && pagetitle http://google.com 
```

## Extend It

One you have it working, try extending this to handle multiple URLs passed as separate command-line arguments. Iterate over the `os.Args` slice starting at element `1`, pass each command-line argument to your `fetchTitle()` function, and print the result.
