HTML and CSS allow you to build beautiful static web sites, but to make those sites interactive, or to build sophisticated web applications, you must learn JavaScript. This tutorial introduces you to the JavaScript language itself, which now runs in many environments beyond web browsers.

> Note: this tutorial assumes you already know introductory programming in an imperative language like Java. If you don't, or if your knowledge is rusty, please read a [basic programming tutorial](https://en.wikiversity.org/wiki/Introduction_to_Programming) first and/or review your notes from your basic programming course.

## Program Structure and Syntax

JavaScript is an **interpreted language** meaning that the interpreter parses and executes each statement in your script at runtime. This is in contrast to Java, which requires you to compile your program using `javac` before you try to run it. This makes development in JavaScript especially quick: just write/edit your code and re-run. Of course, this convenience comes with a few trade-offs: interpreting code at runtime is naturally slower than executing compiled code; and without a compile step, errors in your program will manifest at runtime rather than compile time, making it more difficult to know that your code is correct before you put it into production. Thankfully, the slower performance rarely matters for script running in a web browser, and various [linting](https://eslint.org/) and [automated](https://mochajs.org/) [testing](https://facebook.github.io/jest/) tools can help us catch common errors before they occur in production.

As opposed to Java, you also don't have to define a `main()` function that serves as the program's entry point. Instead, the JavaScript interpreter starts at the top of your script file, and executes each statement until it reaches the bottom.

Lastly, the syntax of JavaScript is similar to that of Java and other C-like languages, with a few important differences. Statements should end with semi-colons, but the interpreter can generally figure out where the end of the statement is even if you omit them. Like Java, blocks of code are demarcated by braces `{...}`, though not all variable declaration syntaxes are block-scoped (more on that below). Comments, `if/then/else` conditionals, and `for` loops use all the same syntax as Java.

This syntactical similarity might lull you into the feeling that JavaScript is just a slightly different form of Java, but resist the temptation to think of it that way. JavaScript is a _very_ different language under the hood. Conflating the two will only confuse you.

## Variables and Constants

One of the first significant differences between JavaScript and other statically-typed languages like Java is that variables and function parameters in JavaScript are **dynamically typed**. When you declare a variable or function parameter, you don't specify the type of data that variable or parameter should hold. Instead, it can hold any type, and you can even switch the type of data it holds over its lifetime. Try running the following to illustrate this:

<script src="//repl.it/embed/KxQ0/1.js"></script>

To declare a variable, use the `let` keyword followed by the variable's name, and an optional initializing expression. If you omit the initializing expression, the variable is automatically initialized to the constant value `undefined`.

### let vs var

If you've programmed in JavaScript before, or have read older tutorials, you might have seen the `var` keyword used instead of `let` when declaring variables. The `let` keyword is relatively new, and there's an important difference between the two: `let` is block-scoped, while `var` is not. The difference is best explained with a quick example. Let's start with `var`: what do you think this program will print to the console after it runs?

<script src="//repl.it/embed/KxSg/1.js"></script>

If you thought it would print `5`, you are probably used to block-scoped variables in Java. In JavaScript, a variable declared with `var` is actually function-scoped, not block-scoped. The variable `x` in the example above is not actually re-declared inside the `if` condition. Instead, the variable declared on line 0 is simply reused and reassigned on line 2 and 3. After you exit the `if` condition, the variable `x` still points to that reassigned value, which is why this program prints `2` instead of `5`.

If you use `let` instead, the variable will become block-scoped, so the `let x = 1;` inside the `if` condition will be a new variable that can be seen and used only within the `if` block. Outside the `if` block, the global `x` variable will be seen instead. Try running this code, which is exactly the same, only using `let` instead of `var`:

<script src="//repl.it/embed/KxSx/0.js"></script>

In general, you should use `let` instead of `var` unless you are writing code that must run in [Internet Explorer (IE) version 10 or earlier](http://caniuse.com/#feat=let) without modification. IE 11 and Edge both support the `let` keyword, and you can use a "transpiler" like [Babel](https://babeljs.io/) to translate the new `let` keyword into `var` for older browsers until they are no longer a concern.

### Constants

Another relatively new keyword in JavaScript is `const`. As the name implies, it's used for declaring constants, which are variables that may be assigned a value only once. Declaring a constant looks similar to declaring a variable:

```javascript
const ISCHOOL_URL = "https://ischool.uw.edu";
```

The key difference is that the value assigned to a constant may not change during the lifetime of the program. Attempting to do so will generate a runtime errors. Although you can give a constant any name you want, we typically use all upper-case names by convention. This signals to other developers that this is a read-only constant value.

Just like `let`, the `const` keyword [isn't support in IE 10 or earlier](http://caniuse.com/#feat=const). In those browsers, you have to use `var` instead, or use [Babel](https://babeljs.io/) to transpile `const` into `var`.

## Primitive Types

JavaScript has just a few primitive types:

- string: `"Hello, World!"`
- number, which includes both integers and floating-point numbers: `10`, `3.14`
- boolean: `true` or `false`
- `undefined`
- `null`, which is similar to, but not quite the same as `undefined`.

### Strings

Strings in JavaScript are **immutable**, which means that you cannot change the contents of a string value directly, but you can easily reassign the value of a given string variable to the result of an expression involving the original string. For example, if you want to append a character to the end of a string, you reassign the value of the variable to the result of a string concatenation expression:

```javascript
//declare and assign a string to `x`
var x = "abcd";
//assign the concatenation of the current value of `x` 
//and the literal string "e"
x = x + "e"; 
console.log(x); //=> "abcde"
```

### Numbers

Numbers work like they do in most other programming languages, though JavaScript doesn't delineate between integers and floating-point numbers in the type system: `5` and `5.5` are both typed as `number`. A special constant `NaN` is used to represent a value of `number` type that is not actually a valid number (e.g., the result of attempting to get the square root of -1 with `Math.sqrt(-1)`).

### Booleans and "Truthiness"

Similar to other languages, Booleans in JavaScript are true/false values, but JavaScript has some odd ways of converting other primitive types to Booleans when they are used in Boolean expressions. For example, the `if` statement requires a Boolean expression, so if you use an expression of some other type, JavaScript just coerces that type to a Boolean and evaluates the expression. Try this code:

<script src="//repl.it/embed/Kx4V/4.js"></script>

If you're somewhat surprised by the output of the previous code, you're not alone. This is one of the strangest behaviors of JavaScript, and it's known as "Truthiness" (a reference to the classic [Steven Colbert "Truthiness" segment](http://www.cc.com/video-clips/63ite2/the-colbert-report-the-word---truthiness)). JavaScript uses these rules when coercing non-Boolean primitive values to Booleans:

- strings: empty strings (`""`) coerce to `false`; all other strings coerce to `true`
- numbers: `0` coerces to `false`; all other numbers coerce to `true`
- `undefined` and `null` always coerce to `false`.

JavaScript developers often take advantage of this behavior to test whether variable and parameters contain valid values or not. We will see a few examples of that as we go along.

## Operators

JavaScript offers the same set of operators you'd find in most other programming languages, but it adds a few new ones you may not have seen before: `===` and `!==`. These are "strict equality operators" and they test whether two values are not only equal, but also of the same data type.

If you compare a string to a number in most statically-typed languages, you'll get a compilation error, or possibly a `false` result. But in JavaScript, the interpreter will attempt to coerce the values to a common type, and then compare those coerced values. For example, this code will run without error, and the `==` comparison will be true, while the `===` comparison will be false:

<script src="//repl.it/embed/Kx7w/0.js"></script>

Automatic type coercion can be nice in some circumstances, but it typically leads to problems as your programs get larger and more complex. Thus, it's recommended these days to always use `===` and `!==` instead of `==` and `!=`. But beware: `null === undefined` will return false!

## Objects and Arrays


## Conditionals and Loops


## Functions


## Closures












