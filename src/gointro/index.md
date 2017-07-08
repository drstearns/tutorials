Back in 2009 Google released the first version of their open-source new systems programming language known as Go. Since then it has [grown significantly in popularity](http://www.zdnet.com/article/googles-go-beats-java-c-python-to-programming-language-of-the-year-crown/), especially among those working on newer network services and tools. This rise isn't terribly surprising, as the language combines the performance of fully-compiled languages like C and C++ with the ease and safety of garbage-collected languages like Java and C#, while offering a sparse and simple syntax like Python and Swift. The accompanying tools and IDE plug-ins provide a fluid coding experience, while also encouraging best practices like automated testing.

## What is Go?

Go is a statically-typed, fully-compiled, statically-linked, garbage-collected, concurrent systems programming language. Let's break that down a bit:

- **Statically-Typed** means that all variables and parameters are declared with a specific data type, so the compiler can verify at compile-time that all values assigned to those variables/parameters are of the correct type. For example, a statically-typed language makes it impossible to pass a string to a function parameter that expects an integer without first converting that string to an integer and handling any errors that might occur. Although this may seem inflexible, it tends to avoid numerous problems and errors that might occur at runtime in languages with more dynamic typing, such as JavaScript. Static typing makes your programs much more predictable, and allows the compiler to catch all kinds of errors at compile-time.
- **Fully-Compiled** means that Go programs are compiled all the way down to native machine code for a particular chip architecture, so when they execute, no further interpretation or compilation is necessary. Languages like JavaScript and Python are interpreted at run-time, meaning that a runtime engine parses, compiles, and executes your source code as the program runs. Languages like Java and C# compile your source code at compile-time, but they compile it to an intermediate virtual machine code that still has to be translated at run-time into the actual machine code supported by the chip architecture on which the program is running. Go programs, like C and C++ programs, are fully-compiled so they require no run-time engine and no run-time translation. In practical terms, this means that [Go programs will typically run much faster than Python or JavaScript programs](https://benchmarksgame.alioth.debian.org/u64q/compare.php?lang=go&lang2=python3), especially if your program makes heavy use of the system CPU or RAM.
- **Statically-Linked** means that all the code you use from Go's standard library, as well as third-party packages, is compiled into your built executable. When combined with the fully-compiled quality, this means that distributing a Go program to another machine is literally as simple as copying a single file. Go also supports compiling your program for other architectures, so you can produce a Windows executable on your Mac or a Linux executable on a Windows machine, and just copy that to the target computer.
- **Garbage-Collected** means that you don't have to explicitly free memory that your program allocates, just like in Java. Older languages like C and C++ required developers to explicitly allocate and free memory, which often resulted in memory leaks if your forgot to free something under particular conditions. For short-running programs this isn't so bad, as the operating system reclaims the leaked memory after your program exits, but for long-running programs like a web service, a small leak could amount to significant amounts of memory over time, ultimately causing your program to run out of memory and crash. Garbage collection is slightly less efficient than manual memory management, so a well-written C program will typically outperform a Go program, but not by an amount you'd typically notice at a normal scale on today's computers.
- **Concurrent** means that Go was designed from the start to support [concurrent processing](https://www.youtube.com/watch?v=cN_DpYBzKso) within a single executable. Go makes it easy to start multiple independent routines that take full advantage of multiple CPU cores. The basic Go web server provided in the standard library, uses this feature to process each HTTP request on its own concurrent "goroutine," enabling your services to transparently scale up to the number of CPU cores available on the current machine.
- **Systems Programming** means that Go was designed for building everything from simple system commands to complex network services. The Go standard library has a rich array of functionality, so building a sophisticated web server requires only a few additional packages.

## Installing Go

To install Go on your development machine, follow the instructions below for your particular operating system.


### MacOS

You can install Go on MacOS using either the [Homebrew package manager](https://brew.sh/), or the [package installer on the Go downloads page](https://golang.org/dl/). 

If you installed a previous version of Go via their package installer, [stick with that technique](https://golang.org/doc/install#osx). If you haven't installed a previous version, I'd highly recommend installing [Homebrew package manager](https://brew.sh/) and using that to install Go or any other command-line utility you might need. 

If you want to install Go using Homebrew, run this command:

```bash
brew install go 
```

You can then upgrade Go at any time in the future using the command

```bash
brew upgrade go
```

### Windows

On Windows, download and run the MSI file from the [Go downloads page](https://golang.org/dl/). See their [documentation on the MSI installer](https://golang.org/doc/install#windows) for details about what it does.

### Linux

On Linux, download the latest tarball from the [Go downloads page](https://golang.org/dl/), and [untar it](https://golang.org/doc/install#tarball) into `/usr/local`. Then add `/usr/local/gp/bin` to your `PATH` [environment variable](../env/#secthepathvariable).

## Configuring Go

### Create the Go Workspace

Many of the Go tools assume a single "workspace" directory in which you keep your source code, and in which the tools install and compile packages. The typical place for this workspace directory is a directory named `go` inside your home directory (i.e., `$HOME/go`). If you're OK with this, create a directory inside your home directory named `go`. If you want to put it somewhere else (e.g., `$HOME/code/go`), that's fine.

Wherever you put your workspace directory, create two subdirectories inside it named `src` and `bin`. You will clone all your source repositories into the `src` branch, and the `go install` command will install your built executables to the `bin` directory.

In order for the Go tools to know where your workspace is, you need to [define a persistent environment variable](../env/#secdeclaringpersistentuserglobalvariables) named `GOPATH` that is set to your workspace directory's path. This will also make it easier to refer to this workspace directory in other environment variables, such as your `PATH`.

### Add Workspace Bin to Path

Since your built executables will be installed to `$GOPATH/bin`, you should also add that directory to your path. [Update your `PATH` environment variable](../env/#secthepathvariable) to include the `$GOPATH/bin` directory at the end.

### Watch out for GOROOT

Older versions of Go also used an environment variable named `GOROOT` that was set to the directory containing the Go build tools. This is not needed anymore, and should only be used if you choose to install Go to some other location than its default. But if you have an older version installed that set this variable, and you install a new version to a different directory, you builds may fail. To see if this environment variable is set use `echo $GOROOT`. If it prints something other than a blank line, [remove that persistent environment variable](../env/#secdeclaringpersistentuserglobalvariables) from your profile script.

## Testing Your Installation

After installing and configuring the Go workspace, you can verify the installation by first executing:

```bash
go version
```

If you see the version information, all is well. If you get a "command not found" error, something went wrong. Verify that Go was installed and that your `PATH` environment variable was updated to include the installation directory (i.e., `echo $PATH`). Remember that adjustments to persistent environment variables defined in a profile script are not visible to existing command-line shells. Either open a new command-line window, or [use the `source` command](../env/#secmacos) to re-run the profile script in your current terminal window.

Once you verify that `go version` prints version information, you can then test your workspace configuration by doing the following:

- create a new directory at `$GOPATH/src/testinstall`
- create a file in that directory named `main.go` and put the following code into it:

```go
package main

import (
	"fmt"
)

func main() {
	fmt.Println("Hello world, go is installed!")
}
```

- at the command line, execute the following:

```bash
cd $GOPATH/src/testinstall
go install
```

If the `go install` command didn't produce any errors, you are good to go! (there will be many go puns throughout these tutorials). If you got an error, ensure that your `GOPATH` variable is set to your Go workspace directory path (`echo $GOPATH`).  

The `go install` command compiled and installed your executable to the `$GOPATH/bin` directory. If you added that to your `PATH` environment variable as instructed above, you can run it simply by enter the name of the executable: `testinstall` on MacOS/Linux; or `testinstall.exe` on Windows.

```bash
# on MacOS/Linux
testinstall

# on Windows
testinstall.exe
```

## Searching for Help

**Pro Tip:** If you run into problems, use the term "golang" when searching for solutions. The word "Go" is far too common and ambiguous, so most help forums will use the more indexable term "golang" instead.

## Learn the Language

Now that you know what Go is, and have a working installation, continue on by [learning the basics of the language](../golang)!
