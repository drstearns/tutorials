HTML and CSS allow you to build beautiful static web sites, but to make those sites interactive, or to build sophisticated web applications, you must learn JavaScript. This tutorial introduces you to the JavaScript language itself, which now runs in many environments beyond web browsers.

> Note: this tutorial assumes you already know introductory programming in an imperative language like Java. If you don't, or if your knowledge is rusty, please read a [basic programming tutorial](https://en.wikiversity.org/wiki/Introduction_to_Programming) first and/or review your notes from your basic programming course. This tutorial will focus on how JavaScript differs from languages like Java.

## Imperative vs Declarative

HTML and CSS are what we call **declarative languages**. You declare what you want to achieve, and some other computer program figures out the exact steps required to achieve that. For example, a CSS rule declares a selector and a set of formatting properties to apply, but the browser has to turn that into a series of step-by-step instructions that find those elements and apply those properties. SQL is another declarative language: you declare the data you want and the database engine's query processor turns that into a series of specific actions known as a query plan.

In contrast, C/C++, Go, Java, C#, Python, and JavaScript are all **imperative languages**. Instead of simply declaring what you want, you give the computer a series of step-by-step commands to execute: declare this variable; set it to this value; if the value is greater than some other value, do these commands, else do these other commands; etc. An imperative language allows you to encode an algorithm into something the computer can understand an execute. While declarative languages are typically specialized for just one type of task, imperative languages can be used to program just about anything because you can use them to encode any algorithm you can dream up.

Because computers do exactly what you tell them to do, these instructions must be very explicit, and very accurate. Unfortunately, [human beings are not very good at providing clear and precise instructions](https://www.youtube.com/watch?v=cDA3_5982h8). We take for granted a lot of contextual and experiential knowledge that computers don't have. Computers are very fast and accurate, but they are also very dumb and must be told _exactly_ what to do. Much of the task of programming involves breaking down a problem or goal into a series of precisely-defined steps, what we call [algorithmic thinking](https://www.youtube.com/watch?v=6hfOvs8pY1k). Imperative languages then help us encode that algorithm so that the computer can execute it.

## Interpreted vs Compiled

JavaScript is also an **interpreted language** meaning that the interpreter parses and executes each statement in your script at runtime. This is in contrast to Java, which requires you to compile your program using `javac` before you try to run it. 

This makes development in JavaScript especially quick: just write/edit your code and re-run. Of course, this convenience comes with a few trade-offs:

- Interpreting code at runtime is naturally slower than executing compiled code
- Without a compile step, programming errors will manifest at runtime rather than compile time, making it more difficult to know that your code is correct before you put it into production. 

Thankfully, the slower performance rarely matters for the kind of tasks we use JavaScript for in the browser. Most of the hard work is done by the browser itself, which is typically written in a compiled language like C++.

To make up for the loss of compile-time error checking, JavaScript developers make heavy use of various various [linting](https://eslint.org/) and [automated](https://mochajs.org/) [testing](https://facebook.github.io/jest/) tools. The linters flag common problems in your source code that may lead to errors at runtime, and automated testing tools ensure that your code behaves correctly given various types of inputs. Many code editors can be configured to run these tools every time you save your files, giving you instant feedback about potential problems.

## Program Structure and Syntax

Now that you understand a bit about JavaScript in general, let's dive into the specifics of the language. 

You might recall that all Java programs start by running a `public static void main(String[] args)` method on the class you pass to the `java` command. C/C++ and Go programs also start by running a function named `main()`. But JavaScript takes a much simpler approach: the interpreter starts at the beginning of your script file and executes each statement in turn until it reaches the end of the file. You can declare functions and call them, but you don't need to create a specially-named `main()` function that acts as the program's entry point. Just start writing code at the top of the file and the interpreter will run it!

Like Java, C#, and Go, JavaScript uses a garbage collector to automatically reclaim memory used for a value that is no longer reachable. In short, this means that you don't have to explicitly free memory like you do in C/C++.

The basic syntax used by JavaScript is based on that of Java and other C-like languages, so it will seem mostly familiar. Source code comments look like this:

```javascript
//this is a single line comment

/*
	this is a multi-line
	comment, just like in Java
*/
```

JavaScript also uses the exact same syntax as Java for `if/else` conditionals and `for` loops:

```javascript
if (x > 0) {
	//code that executes if the condition is true
} else {
	//code that executes if the condition is false
}

//standard for loop
//note that the `i` variable is declared without
//an explicit data type--see the next section
for (let i = 0; i < 10; i++) {
	//code that executes each time through the loop
}
```

JavaScript also supports the same `try/catch/finally` exception handling as Java:

```javascript
try {
	//do something that might generate an exception
} catch(err) {
	//handle the exception
} finally {
	//runs whether an exception occurred or not
}
```

Although you should end each statement with a semi-colon, JavaScript is less picky about this than other languages. In nearly all cases the interpreter can figure out where the end of each statement is even if you forget to include a semi-colon, so omitting them doesn't generate any errors. There are a few cases where this can bite you, however, so it's still considered good practice to end each statement with a semi-colon.

All of this syntactical similarity might lull you into the feeling that JavaScript is just a simpler form of Java, but resist the temptation to think of it that way. JavaScript is a _very_ different language under the hood. Conflating the two will only confuse you. The next sections will illustrate why.

## Variables and Constants

One of the first significant differences between JavaScript and other statically-typed languages like Java is that variables and function parameters in JavaScript are **dynamically typed**. When you declare a variable or function parameter, you don't specify the type of data that variable or parameter should hold. Instead, it can hold any type, and you can even switch the type of data it holds over its lifetime. Try running the following to illustrate this:

<script src="//repl.it/embed/KxQ0/1.js"></script>

To declare a variable, use the `let` keyword followed by the variable's name, and an optional initializing expression. If you omit the initializing expression, the variable is automatically initialized to the constant value `undefined`.

### let vs var

If you've programmed in JavaScript before, or have read older tutorials, you might have seen the `var` keyword used instead of `let` when declaring variables. The `let` keyword is relatively new, and there's an important difference between the two: `let` is block-scoped, while `var` is not. The difference is best explained with a quick example. Let's start with `var`. what do you think this program will print to the console after it runs? Take a guess and then run the script to find out if you were right.

<script src="//repl.it/embed/KxSg/2.js"></script>

If you thought it would print `5`, you are probably used to block-scoped variables in Java. In JavaScript, a variable declared with `var` is actually function or global-scoped, not block-scoped. The variable `x` in the example above is not actually re-declared inside the `if` condition block. Instead, the variable declared on line 0 is simply reused and reassigned on line 2 and 3. After you exit the `if` condition block, the variable `x` still points to that reassigned value, which is why this program prints `2` instead of `5`.

If you use `let` instead, the variable will become block-scoped, so the `let x = 1;` inside the `if` condition block will declare a _new_ variable that can be seen and used only within the `if` block. Outside the `if` block, the global `x` variable will be used instead. Try running this code, which is exactly the same, only using `let` instead of `var`:

<script src="//repl.it/embed/KxSx/1.js"></script>

In general, you should use `let` instead of `var` unless you are writing code that must run in [Internet Explorer (IE) version 10 or earlier](http://caniuse.com/#feat=let). IE 11 and Edge both support the `let` keyword, and Microsoft no longer supports earlier versions of IE, but [a small percentage of desktops still run Windows XP with IE 8](https://www.netmarketshare.com/browser-market-share.aspx?qprid=2&qpcustomd=0). If you must support these browsers, you can use a "transpiler" like [Babel](https://babeljs.io/) to translate source code with the new `let` keyword into equivalent code that uses `var`, at least until those older browsers are no longer a concern.

### Constants

Another relatively new keyword in JavaScript is `const`. As the name implies, it's used for declaring constants, which are variables that may be assigned a value only once. Declaring a constant looks similar to declaring a variable:

```javascript
const ISCHOOL_URL = "https://ischool.uw.edu";
```

The key difference is that the value assigned to a constant may not change during the lifetime of the program. Attempting to do so will generate a runtime errors. Although you can give a constant any name you want, we typically use all upper-case names by convention. This signals to other developers that this is a read-only constant value.

Just like `let`, the `const` keyword [isn't support in IE 10 or earlier](http://caniuse.com/#feat=const). In those browsers, you have to use `var` instead, or use [Babel](https://babeljs.io/) to transpile `const` into `var`.

## Strict Mode

JavaScript has traditionally been a very forgiving language. If you forgot to declare a variable before you referenced it, the interpreter would just automatically declare the variable for you and keep going. This seemed like a good feature for JavaScript's original target audience: web designers and self-taught programmers. But this behavior created some significant problems that the language creators didn't anticipate. For example, try running this code:

<script src="//repl.it/embed/LDcR/2.js"></script>

Do you see the error? On line 3 we try to set the `firstName` variable, but we made a typo and referred to `fistName` instead. The JavaScript interpreter saw this and decided we meant to create a new variable named `fistName` and assign a value to it, so that's what it did. We then ask for the value of `firstName` and unexpectedly get `undefined`.

The language creators eventually realized that this behavior was probably more of a pitfall than a benefit, but they couldn't change the behavior without potentially breaking old code that might have relied on automatic variable declarations. So they introduced "strict mode," which you can enable by adding `"use strict";` to the top of your script, or to the top of a particular function. Older interpreters will simply evaluate this as a string literal that you never assign to a variable, so it effectively gets ignored. But newer interpreters that implement strict mode interpret this as a signal to switch into strict mode. This [disables a number of the forgiving "features"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) in the original language specification, making it more reliable and predictable.

For example, with strict mode enabled, that same code will generate a runtime error instead of silently creating an unexpected result. This error will help you as a developer discover your mistake right away.

<script src="//repl.it/embed/LDcR/3.js"></script>

It is considered good practice to always use strict mode. Just add `"use strict";` at the top of each of your script files. If you end up using build tools that combine your script files with other scripts you get from the web, and you're concerned that they might not work when strict mode is enabled, you can wrap your code in a function and put `"use strict";` at the start of that function instead. This will enforce strict mode only within that function, and not elsewhere in the script file.


## Primitive Types

Now that you know how to declare variables, let's see what kinds of data you can assign to them. JavaScript has just a few primitive types:

- strings, which are surrounded by single or double quotes: `"Hello, World!"` or `'Hello, World!'`
- numbers, which include both integers and floating-point numbers: `10`, `3.14`
- booleans: `true` or `false`
- `undefined`, which is used for uninitialized variables and parameters, but you can also assign this value to a variable at any time
- `null`, which is similar to, but not quite the same as `undefined`

## Arrays and Objects

In addition to these primitive types, JavaScript also has built-in support for two complex types: arrays and objects.

### Arrays

You probably remember arrays from your introductory computer science course: they are ordered lists of **elements** that can be randomly accessed. JavaScript arrays are similar to arrays in other languages, except that the dynamic typing of JavaScript means that array elements can be of any data type, and you can mix types within a single array (though that can get confusing so it's not advisable).

JavaScript has a simple syntax for creating new arrays:

```javascript
//declare an array with 5 numbers
let odds = [1,3,5,7,9];

//the .length property returns the array's length
odds.length; // returns 5

//you can access any element using the `[index]` syntax
//indexes are zero-based
odds[0]; // => 1
odds[4]; // => 9

//you can use a standard `for` loop to iterate the array
for (let i = 0; i < odds.length; i++) {
	let curElement = odds[i];
}
```

To add a new item to an array, use the `.push()` method:

```javascript
//you can add one element at a time
odds.push(11);

//or many elements at once
odds.push(13,15,17,19);
```

Arrays have [lots of built-in methods](https://www.w3schools.com/jsref/jsref_obj_array.asp), and we will examine many of them in the [functional programming tutorial](../jsfunctional/).

### Objects

Objects in JavaScript are a bit of a misnomer. Those coming from object-oriented languages like Java might be tempted to think of them like an instance of some class, but they are really much simpler than that. In JavaScript an object is really just a [hash table](https://en.wikipedia.org/wiki/Hash_table), which is a data structure that stores a set of key-and-value pairs. It's like a dictionary with words (keys) and definitions (values), or a contacts list with names (keys) and contact records (values). You can add a new key/value pair, or ask for the value associated with a particular key. Both operations are very fast regardless of how many entries are in the hash table.

To create an object in JavaScript, we use this syntax:

```javascript
//creates a new object with three properties
let player = {
	firstName: "Mary"		//properties can be of any type
	lastName: "Rodriguez",	//and are separated by commas
	ranking: 4				//the last one having no trailing comma
};

//you can get the value associated with a key
//using the `.` syntax
player.firstName; // => "Mary"
```

An object literal is a list of key/value pairs surrounded by braces (`{...}`). Each key is separated from its value using a colon (`:`). The keys must be strings, but the values can be of any type, including another object or array. If the key is not a legal JavaScript identifier (e.g., contains spaces), you must wrap the key in quotation marks.

Getting the value associated with a key is done using the `.` notation shown above. Since this syntax is similar to how you get the value of an object's property in Java, the keys of a JavaScript object are often referred to as **properties** of the object. But remember, JavaScript objects are not like Java classes: they are just hash tables that store key/value pairs. These so-called "properties" can be added to or removed from an object instance at runtime. Requesting the value for a key that doesn't yet exist simply returns `undefined` and does not produce an error. Assigning a value to a key that doesn't yet exist will add that key/value to the object:

```javascript
//getting a value for a key that doesn't yet exist
//just returns `undefined` with no error
player.email; // => undefined

//add a new key/value pair to the object
player.email = "maryr@example.com";

//get the value associated with that new key
player.email; // => "maryr@example.com"
```

You can also delete properties from an object:

```javascript
//delete the key "email" and its associated value
delete player.email;

//getting the value for the key "email"
//now returns `undefined`
player.email; // => undefined
```

Since getting the value for a key that doesn't exist returns `undefined`, you might be wondering if there's a way to distinguish between the key not being there at all, and the key being there with an explicit value of `undefined`. To tell the difference, use the `.hasOwnProperty()` method, which is available on every object:

```javascript
//test whether the key "email" exists
if (player.hasOwnProperty("email")) {
	// "email" key/value exists in the object
} else {
	// no "email" key/value in the object
}
```

The `.` notation works whenever you know what the key name is, and only if that key name is a legal JavaScript identifier (e.g., no spaces). If the key is stored in a variable, or if the key is not a legal JavaScript identifier, you must use an array-like syntax instead when getting or setting the associated value.

```javascript
let propName = "ranking";

//get value associated with a key
//that is stored in a variable
player[propName]; // => 4


//same syntax is used if the key is
//not a legal JavaScript identifier
player["key with spaces"] = "some value";
```

### Combining Arrays and Objects

Since array elements can be of any type, and objects are a type, you can build arrays of objects just as you would build an array of primitive types: 

```javascript
//create an array of objects
//each element in the array is an object with 3 properties
let players = [
	{
		firstName: "Mary", 
		lastName: "Rodriguez", 
		ranking: 4
	},
	{
		firstName: "John", 
		lastName: "Chen", 
		ranking: 5
	},
	{
		firstName: "Susan", 
		lastName: "Smith", 
		ranking: 6
	}
];

//get the firstName property of the first element
players[0].firstName; // => "Mary"
```

And since the values of object properties can be of any type, and arrays are a type, you can set an object's property to an array, even an array that stores other objects:

```javascript
let player = {
	firstName: "Mary",
	lastName: "Rodriguez",
	ranking: 4,
	//the value of `emails` is an array of objects
	//each of which has two properties
	emails: [
		{label: "work", email: "m.rodriguez@example.com"},
		{label: "personal", email: "maryr@example.com"}
	]
};
```

This ability to nest arrays in objects and objects in arrays allows us to model just about any sort of data in JavaScript.

## Operators

JavaScript sports the same set of [operators](https://www.w3schools.com/jsref/jsref_operators.asp) you'd find in most other languages, with a few notable differences. The first is the strict equality and strict inequality operators: `===` and `!==`. To understand these, you have to understand how JavaScript does automatic type coercion.

### Equality and Coercion

In most languages, the compiler prohibits you from doing silly things like comparing a number to a string using the `==` operator, but in JavaScript, that's totally legal. For example this code will execute without error, and you might be a little surprised by the result:

<script src="//repl.it/embed/LAfJ/1.js"></script>

When JavaScript sees the `==` operator used with disparate types, it attempts to coerce one of the values to the type of the other value, according to some rules. In this case it converts the number `10` to the string `"10"` because that is a safe operation that will never fail (you can always convert a number to a string, but not all strings can be converted to numbers). It then compares `"10"` to `"10"` and finds them equal.

Although this automatic type coercion can be handy at times, it's dangerous in general and can lead to subtle bugs. Therefore, JavaScript also has a more strict equality operator: `===`. This operator does not do automatic type coercion, and will evaluate to `false` if the two values are of different types. Try running this code, which is exactly the same except for the operator used:

<script src="//repl.it/embed/LAfl/0.js"></script>

In general, it's best practice to use `===` and `!==` wherever possible, but beware that since `null` and `undefined` are technically different data types, `null == undefined` but `null !== undefined`. If you want to test whether a value is something other than `null` or `undefined`, you might want to take advantage of JavaScript's "truthy" and "falsy" behavior.

### Boolean Expressions and Truthiness

JavaScript does automatic type coercion when evaluating Boolean expressions as well, even when you don't use any operators. For example, the following code will run, but the result may surprise you:

<script src="//repl.it/embed/Kx4V/6.js"></script>

When the JavaScript interpreter sees `if (x)`, it knows it has to evaluate `x` as a Boolean expression (something that returns either `true` or `false`). In most languages, this would result in a compile error because a bare string isn't a Boolean value. But in JavaScript the interpreter just coerces `x` to a Boolean value and evaluates it for the condition. So what Boolean value should an empty string coerce to? Why, `false` of course! And what about a non-empty string? Well, that should obviously be `true`! And what about the literal string `"false"`? Well that's not empty, so it coerces to the Boolean value `true`. Makes perfect sense, right?

If this all sounds crazy to you, it kind of is, but it turns out to be really useful in many situations. The following non-Boolean values all coerce to `false` when used as a Boolean expression:

- `0`
- `""`
- `undefined`
- `null`
- `NaN` (not a number)

Most of the time, it makes sense to treat all of these values as `false`. For example, a player object with an empty string, `0`, `null`, or `undefined` value for the `lastName` property is probably invalid, so you can catch all of these cases with one `if ()` check:

```javascript
//will be `true` if lastName is null, undefined, 0, or empty string
if (!player.lastName) {
	throw new Error("you must supply a last name!");
}
```

Similarly, we can use this [truthiness](http://www.cc.com/video-clips/63ite2/the-colbert-report-the-word---truthiness) behavior with the Boolean `||` operator to set default values if no actual values were supplied:

```javascript
//define a player object somewhere
let player = {firstName: "Mary", lastName: "Rodriguez"};

//somewhere else, default the `ranking` property
//to the max numeric value if it's undefined, null, 
//zero or an empty string (all invalid values)
player.ranking = player.ranking || Number.MAX_VALUE;
```

The JavaScript interpreter will evaluate that last line by first evaluating the Boolean `||` (OR) condition on the right. JavaScript, like many languages, does short-circuiting Boolean OR comparisons, so if the left side of the `||` operator is "truthy," it will use that value and not even consider the right side. But if the left is side is "falsy," it will ignore the left side and use the "truthy" value on the right. Since the `ranking` property was never set when we created the `player` object, `player.ranking` evaluates to `undefined`, which is falsy. Thus the `ranking` property gets set to `Number.MAX_VALUE` (the maximum numeric value). If the `ranking` property had been set, then `player.ranking` would be truthy and the interpreter would just reset the `ranking` property to its current value and ignore the right side. This allows us to set default values using a very simple and compact syntax.


### Ternary Condition Operator

JavaScript also has a ternary condition operator that comes in very handy. This is essentially an `if/else` expression. Instead of writing this:

```javascript
let y;
if (x) {
	y = "foo"
} else {
	y = "bar"
}
```

You can do that all in one ternary condition expression, like this:

```javascript
let y = x ? "foo" : "bar";
```

The general syntax is:

```
expression ? value-expression-if-true : value-expression-if-false;
```

Each element can be a complex expression, and the value expressions after the `?` and `:` can be another ternary condition operator, though that can get very confusing very quickly, so it's not encouraged.

## Functions

Like most other languages, JavaScript allows you to organize your code into functions that can be called from other functions or global statements. Unlike Java, however, JavaScript functions don't have to be attached to a class; they are just declared with a name, and you can call that function by referencing its name.

```javascript
//declare a new function that returns a 
//greeting given a name
function greet(name) {
	//the + operator does string concatenation
	return "Hello, " + name + "!";
}

//call that function
greet("Mary"); // => "Hello, Mary!"
```

A function declaration starts with the keyword `function` and is followed by the function's name and list of parameters. Note that the parameters, like the variables described above, have no explicit data type. You just specify the parameter name, which can be any name you want to give that parameter within your function. 

To return a value from a function you use the `return` keyword followed by an expression. The interpreter evaluates that expression and returns the result to the code that called your function. If your function doesn't return anything, it implicitly returns `undefined`.

### Functions are Values

So far functions probably seem very similar to methods in Java, but this where things will start to get really weird. In JavaScript, _functions are values_. That is to say, a function can be used anywhere you can use a value (primitive values, arrays, or objects). You can assign a function to a variable, or pass a function as a parameter to another function, or even set an object property to a function (which is how we do [object-oriented programming in JavaScript](../jsoop/)).

This might be a bit to take in, so let's start with something simple, though trivial. For example, we can assign our `greet()` function above to a variable, and then call that function using the variable instead of the function's name:

```javascript
function greet(name) {
	return "Hello, " + name + "!";
}

//declare a variable and set its value
//to the function we defined above
//notice we use just the function's name,
//and there are no () after the name
let x = greet;

x("Mary"); // => "Hello, Mary!"
```

The expression `greet` in the code above returns a _reference_ to the `greet()` function itself, and since that's a value, you can assign that to a variable. Note that the expression `greet` doesn't _invoke_ the function—it simply returns a reference to the function itself. To invoke that function via the variable, just use `()` passing any parameters the function needs. In JavaScript `()` is actually an operator, like `++` or `--`. It is the "invocation operator" and it will invoke the function the variable refers to.

As you might expect, when you declare a function with a name, you are actually creating a new global variable that is set to that function value. So in the example above, `greet` is actually a global variable set to a function value, and when we execute `greet()`, the interpreter is just applying the invocation operator to the global variable `greet`. In fact, you can rewrite your function declarations like this and they will work in exactly the same way:

```javascript
const greet = function(name) {
	return "Hello, " + name + "!";
}

greet("Mary"); // => "Hello, Mary!"
```

All we did here was change the syntax around: instead of declaring a function with a name, we declare a constant with that name and set it equal to a function. The interpreter handles either of these syntaxes in exactly the same way.

Since functions are values, you can create an array of functions, and invoke each of them as you iterate the array. For example, say you created several functions, each of which could validate that a value conformed to a particular rule. You could then create an array of those functions and execute each to verify that a particular value passes all the rules:

```javascript
//returns true if `value` is an even number
function isEven(value) {
	return value % 2 === 0;
}

//returns true if value is a double-digit number
function isDoubleDigit(value) {
	return value >= 10 && value <= 99;
}

//returns true if `value` passes all validation
//functions in the `validators` array
function isValid(value, validators) {
	//iterate over the `validators` array
	//which is an array of *function references*
	for (let i = 0; i < validators.length; i++) {
		//get the current function reference
		let validate = validators[i];

		//invoke the function, passing the value
		//if it returns false, return false to the caller
		if (!validate(value)) {
			return false;
		}
	}
	//if we got here all validation functions passed!
	return true;
}

//create an array of validation function references
let myValidators = [isEven, isDoubleDigit];

//test various values
//should return true only if value is even *and* is double-digit
isValid(10, myValidators);  // => true  (even and double-digit)
isValid(11, myValidators);  // => false (double-digit, but not even)
isValid(12, myValidators);  // => true  (even and double-digit)
isValid(100, myValidators); // => false (even, but not double-digit)
```

Because JavaScript treats functions as values, and because it uses dynamic-typing and late-binding, we can write code like you see above. The `isValid()` function doesn't have to know anything about the function references stored in the `validators` array. As long as those functions accept one parameter, the `isValid()` function can invoke each of those functions using the invocation operator `()`, passing `value` as the parameter. If any of those functions return `false` (or in this case any "falsy" value), `isValid()` will return false. Otherwise, it returns `true`. Developers can add new validation functions over time, and our `isValid()` function will happily invoke them.

### Passing Functions to Functions

If functions are values, we can also pass functions to other functions as parameters. If that makes your head hurt, let's start with a relatively simple example. Say we want to sort an array. JavaScript arrays have a built-in `.sort()` method, but because arrays elements can be of any type, that method coerces each array element to a string (anything can be coerced to a string) and sorts them alphabetically. If you want to sort your array elements numerically instead, or if your array elements are complex types like objects and you want to sort by a property of those objects, you need to give the `.sort()` method some help. 

The `.sort()` method implements the core sorting algorithm, but it also lets you provide a function for comparing one element to another. The sorting algorithm will invoke this function many times, passing different array elements to your function for you to compare. That function must return a negative number if the first element is less than the second, a zero if they are equal to each other, or a positive number if the first element is greater than the second. Given that information, the sorting algorithm can sort the array's elements.

So to sort an array of numbers numerically, we first need a function that can compare two numbers and return values according to those rules. That function would look like this:

```javascript
//returns a negative number if n1 < n2,
//zero if n1 equals n2,
//or a positive number if n1 > n2
function compareNums(n1, n2) {
	//just subtract n2 from n1
	return n1 - n2;
}
```

By subtracting `n2` from `n1` we fulfill the rules of the sort comparison function. If `n1` is less than `n2` the value will be negative; if they are equal the value will be zero; and if `n1` is greater than `n2` the value will be positive.

Now let's use it to sort an array of numbers:

<script src="//repl.it/embed/LA4B/1.js"></script>

When we call `nums.sort(compareNums)` we are passing a reference to our `compareNums` function to the `.sort()` method as a parameter. This allows the `.sort()` method to invoke our `compareNums` function as many times as it needs to in order to sort the numbers.

This sort of technique is also necessary when you want to sort an array of objects. The `.sort()` method can't know which property you want to sort the objects by, so you must supply a function that compares the elements by their property values. For example, say you had an array of objects and you wanted to sort by the `ranking` property:

```javascript
let players = [
	{ /* ... */, ranking: 4},
	{ /* ... */, ranking: 2},
	{ /* ... */, ranking: 1},
	{ /* ... */, ranking: 3},
];

function comparePlayersByRank(p1, p2) {
	//p1 and p2 are elements in the array
	//so they are objects with a numeric 
	//`ranking` property
	return p1.ranking - p2.ranking;
}

//sort the players array by their `ranking` property
players.sort(comparePlayersByRank);
```

Since `players` is an array of objects, each element in the array is an object with a numeric `ranking` property. When we sort that array, the sorting algorithm will invoke our comparison function several times, passing two elements from the array each time. Since those elements are objects, and since they both have a `ranking` property, we can return the result of subtracting the ranking property of the second parameter from the same property of the first parameter.

When passing a function to a function like this, you can either declare the function with a name and use the name to reference the function (as we've done so far), or you can actually supply the function declaration in-line.

```javascript
//sort the players array by their `ranking` property
players.sort(function(p1, p2) {
	//p1 and p2 are elements in the array
	//so they are objects with a numeric 
	//`ranking` property
	return p1.ranking - p2.ranking;	
});
```

Notice that we've effectively replaced the `comparePlayersByRank` function reference with the function declaration. Since we are declaring and passing this function in-line, we don't need to give it a name, so there is no name in the declaration. We call this an **anonymous function value**, as it has no name and it's just like any other literal value in the language (e.g., `10` or `"hello"`). You will see these in-line anonymous function values quite a lot in professionally-written JavaScript code.

### Returning Functions from Functions

Since functions are values, you can also return a function from a function. This comes in handy in many situations. For example, say you wanted to sort those numbers in descending order instead of ascending order. You could write another `compareNumsDesc()` function that reverses the logic in your `compareNums()` function, but that wouldn't help when you want a descending sort of strings or objects. Instead, we can write one `descending()` function that accepts a comparison function as a parameter, and returns a new comparison function that invokes the original comparator and negates the result.

```javascript
// `comparator` is a sort comparison function
// (i.e., takes two array elements and returns a number)
function descending(comparator) {
	//return a new sort comparison function...
	return function(elem1, elem2) {
		//...that invokes `comparator` and negates the result
		// (i.e., if comparator() returns a positive number,
		// we return a negative number and vice versa;
		// -0 === 0, so negating zero doesn't change the result).
		return -comparator(elem1, elem2);
	};
}
```

If this looks strange to you, pause and interpret it as the computer would, given what you've learned so far. This function `descending()` takes one parameter, which is a function. Like any function, it can return a value, and here we are returning another function (remember, functions are values!). That returned function accepts two parameters and returns a number, so it's a sort comparison function. When that returned function is eventually invoked by the sorting algorithm, it will in turn invoke the `comparator` function that was passed to `descending()` as a parameter, and negate the result: if `comparator()` returns a positive number, the new returned function will return a negative number instead, and vice-versa. Thankfully `-0 === 0` in JavaScript, so negating a zero doesn't change the results.

### Closures

If you're paying attention, you might be wondering how the returned function can make use of the `comparator` parameter passed to the `descending()` function, especially considering that the returned function will be invoked later, after the `descending()` function has finished executing. This is made possible by something known as a **closure**. When you declare a function inside another function (as we are doing here), the inner function retains a reference to the outer function's stack, which includes all parameters and local variables. When the inner function is invoked, it can refer to those parameters and variables, even if the outer function can finished executing.

To use this `descending()` function, we invoke it, passing another comparison function, and pass the new returned function to `.sort()`. Run this to see it in action!

<script src="//repl.it/embed/LDXl/1.js"></script>

The power of doing it this way is that we can now use `descending()` to do a descending sort with _any_ sort comparison function. For example, we could use this same `descending()` function with the `comparePlayersByRank()` function defined in the previous section to sort the array of player objects by the `ranking` property in descending order:

```javascript
//sort the players by rank descending
players.sort(descending(comparePlayersByRank));
```

If you've been paying attention, you are probably already thinking, "hey couldn't we also use this technique to create one comparison function that compares any numeric object property? Instead of writing `compareByRank()` and `compareByID()`, could we just write one `compareByNumericProp()` and pass the property _name_ as the parameter?" Why yes, my Padawan learner, you could!

```javascript
function compareByNumericProp(propName) {
	//return a new comparison function...
	return function(obj1, obj2) {
		//...that compares the numeric values associated
		//with the property name
		//since `propName` is a variable holding a key name
		//use the array-like syntax [ ] to access the 
		//associated value
		return obj1[propName] - obj2[propName];
	};
}
```

Just as in the `descending()` example above, when we declare the new returned function, it creates a closure, allowing us to refer to the `propName` parameter inside the returned function. Since this is a string containing a key name, we must use the array-like `[]` syntax to get the associated value. See the sections on [Objects](#secobjects) above for why that syntax is necessary.

You can then use this like so:

```javascript
let players = [
	{id: 2, ranking: 4, /* ... */},
	{id: 1, ranking: 3, /* ... */},
	{id: 4, ranking: 1, /* ... */},
	{id: 3, ranking: 2, /* ... */},
];

//sort by ranking
players.sort(compareByNumericProp("ranking"));
//sort by id
players.sort(compareByNumericProp("id"));
```

Notice how we didn't have to define two different comparison functions for the two different numeric properties. Instead, we can define just one function and pass the property name as a parameter.

And since our `descending()` function can work with any comparison function, you can combine the two to sort descending by a particular numeric property!

```javascript
//sort by ranking descending
players.sort(descending(compareByNumericProp("ranking")));
```

## Conclusion

JavaScript might seem simple at first glance, but as you've seen in this tutorial, it can get quite complex in a hurry. Like all languages, fluency comes with practice and time. There is no short-cut. If you want to be proficient in JavaScript, you must practice. The [Practice-It](https://practiceit.cs.washington.edu/problem/list) system created by UW CSE now includes JavaScript problem sets, and the W3 Schools offers a [large set of practice exercises](https://www.w3resource.com/javascript-exercises/) you can use to hone your skills. If you're taking INFO 343 with us, you'll also get plenty of practice both in-class and during your weekly challenges!

Once you have a good grasp on the basics of JavaScript, move on to the [Functional Programming in JavaScript](../jsfunctional/) and the [Object-Oriented Programming in JavaScript](../jsoop/) tutorials.

