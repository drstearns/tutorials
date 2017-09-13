HTML and CSS allow you to build beautiful static web sites, but to make those sites interactive, or to build sophisticated web applications, you must learn JavaScript. This tutorial introduces you to the JavaScript language itself, which now runs in many environments beyond web browsers.

> Note: this tutorial assumes you already know introductory programming in an imperative language like Java. If you don't, or if your knowledge is rusty, please read a [basic programming tutorial](https://en.wikiversity.org/wiki/Introduction_to_Programming) first and/or review your notes from your basic programming course. This tutorial will focus on how JavaScript differs from languages like Java.

## Imperative vs Declarative

HTML and CSS are what we call **declarative languages**. You declare what you want to achieve, and some other computer program figures out the exact steps required to achieve that. For example, a CSS rule declares a selector and a set of formatting properties to apply, but the browser has to turn that into a series of step-by-step instructions that find those elements and apply those properties. SQL is another declarative language: you declare the data you want and the database engine's query processor turns that into a series of specific actions known as a query plan.

In contrast, C/C++, Go, Java, C#, Python, and JavaScript are all **imperative languages**. Instead of simply declaring what you want, you give the computer a series of step-by-step commands to execute: declare this variable; set it to this value; if the value is greater than some other value, do these commands, else do these other commands; call this function and set this variable equal to the return value; etc. While declarative languages are typically specialized for just one type of task, imperative languages can be used to program just about anything.

Because computers do exactly what you tell them to do, these instructions must be very explicit, and very accurate. Unfortunately, [human beings are not very good at providing clear and precise instructions](https://www.youtube.com/watch?v=cDA3_5982h8). We take for granted a lot of contextual and experiential knowledge that computers don't have. Computers are very fast and accurate, but they are also very dumb and must be told _exactly_ what to do.

Thus, becoming a competent imperative language programmer requires learning not only the syntax of the language you are using, but also how to break down a problem into a series of very explicit steps; what we call "[algorithmic thinking](https://publik.tuwien.ac.at/files/PubDat_140308.pdf)." If you struggled in your introductory computer science courses, it's likely that you never really developed this way of thinking. You may have gotten so hung-up in the syntax of the language they used in that course that you missed the forest for the trees.

If you feel like you never developed this algorithmic way of thinking, start by watching [What is an algorithm?](https://www.youtube.com/watch?v=6hfOvs8pY1k) and the [algorithmic thinking lecture of Harvard's CS 50 course](https://video.cs50.net/2017/fall/lectures/0?t=16m5s). Then practice writing out algorithms to accomplish simple everyday tasks, and have someone else try to follow your instructions like a computer would. With practice, you'll start to learn how to express a complex task as a series of simple instructions that a computer can follow. Only then will you be able to turn requirements into code, leveraging the features of the language you're using.

## Interpreted vs Compiled

JavaScript is an **interpreted language** meaning that the interpreter parses and executes each statement in your script at runtime. This is in contrast to Java, which requires you to compile your program using `javac` before you try to run it. 

This makes development in JavaScript especially quick: just write/edit your code and re-run. Of course, this convenience comes with a few trade-offs:

- Interpreting code at runtime is naturally slower than executing compiled code
- Without a compile step, errors in your program will manifest at runtime rather than compile time, making it more difficult to know that your code is correct before you put it into production. 

Thankfully, the slower performance rarely matters for the kind of tasks we use JavaScript for in the browser. Most of the hard work is done in the browser itself, which is typically written in a compiled language like C++.

To make up for the loss of compile-time error checking, JavaScript developers make heavy use of various various [linting](https://eslint.org/) and [automated](https://mochajs.org/) [testing](https://facebook.github.io/jest/) tools. The linters flag common problems in your source code that may lead to errors at runtime, and automated testing tools ensure that your code behaves correctly given various types of input. Many code editors can be configured to run these tools every time you save your files, giving you instant feedback about potential problems.

## Program Structure and Syntax

Now that you understand a bit about JavaScript in general, let's dive into the specifics of the language, and see how it differs from languages you already know, like Java. 

You might recall that all Java programs start by running a `public static void main(String[] args)` method on the class you name when executing the `java` command. C/C++ and Go programs also start by running a function named `main()`. But JavaScript takes a much simpler approach: the interpreter starts at the beginning of your script file and executes each statement in turn until it reaches the end of the file. You can declare functions and call them, but you don't need to crate a specially-named `main()` function that acts as the program's entry point. Just start writing code and the interpreter will run it!

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
//note that the `x` variable is declared without
//an explicit data type--see the next section
for (let x = 0; x < 10; x++) {
	//code that executes each time through the loop
}
```

Although you should end each statement with a semi-colon, JavaScript is less picky about this than other languages. In nearly all cases the interpreter can figure out where the end of each statement is even if you forget to include a semi-colon, so omitting them doesn't generate any errors. There are a few cases where this can bite you, however, so it's still considered good practice to end each statement with a semi-colon.

This syntactical similarity might lull you into the feeling that JavaScript is just a slightly different form of Java, but resist the temptation to think of it that way. JavaScript is a _very_ different language under the hood. Conflating the two will only confuse you. The next sections will illustrate why.

## Variables and Constants

One of the first significant differences between JavaScript and other statically-typed languages like Java is that variables and function parameters in JavaScript are **dynamically typed**. When you declare a variable or function parameter, you don't specify the type of data that variable or parameter should hold. Instead, it can hold any type, and you can even switch the type of data it holds over its lifetime. Try running the following to illustrate this:

<script src="//repl.it/embed/KxQ0/1.js"></script>

To declare a variable, use the `let` keyword followed by the variable's name, and an optional initializing expression. If you omit the initializing expression, the variable is automatically initialized to the constant value `undefined`.

### let vs var

If you've programmed in JavaScript before, or have read older tutorials, you might have seen the `var` keyword used instead of `let` when declaring variables. The `let` keyword is relatively new, and there's an important difference between the two: `let` is block-scoped, while `var` is not. The difference is best explained with a quick example. Let's start with `var`: what do you think this program will print to the console after it runs? Take a guess and then run the script to find out if you were right.

<script src="//repl.it/embed/KxSg/2.js"></script>

If you thought it would print `5`, you are probably used to block-scoped variables in Java. In JavaScript, a variable declared with `var` is actually function-scoped, not block-scoped. The variable `x` in the example above is not actually re-declared inside the `if` condition block. Instead, the variable declared on line 0 is simply reused and reassigned on line 2 and 3. After you exit the `if` condition block, the variable `x` still points to that reassigned value, which is why this program prints `2` instead of `5`.

If you use `let` instead, the variable will become block-scoped, so the `let x = 1;` inside the `if` condition block will be a _new_ variable that can be seen and used only within the `if` block. Outside the `if` block, the global `x` variable will be used instead. Try running this code, which is exactly the same, only using `let` instead of `var`:

<script src="//repl.it/embed/KxSx/1.js"></script>

In general, you should use `let` instead of `var` unless you are writing code that must run in [Internet Explorer (IE) version 10 or earlier](http://caniuse.com/#feat=let). IE 11 and Edge both support the `let` keyword, and Microsoft no longer supports earlier versions of IE, but [a small percentage of desktops still run Windows XP with IE 8](https://www.netmarketshare.com/browser-market-share.aspx?qprid=2&qpcustomd=0). If you must support these browsers, you can use a "transpiler" like [Babel](https://babeljs.io/) to translate source code with the new `let` keyword into equivalent code that uses `var`, at least until those older browsers are no longer a concern.

### Constants

Another relatively new keyword in JavaScript is `const`. As the name implies, it's used for declaring constants, which are variables that may be assigned a value only once. Declaring a constant looks similar to declaring a variable:

```javascript
const ISCHOOL_URL = "https://ischool.uw.edu";
```

The key difference is that the value assigned to a constant may not change during the lifetime of the program. Attempting to do so will generate a runtime errors. Although you can give a constant any name you want, we typically use all upper-case names by convention. This signals to other developers that this is a read-only constant value.

Just like `let`, the `const` keyword [isn't support in IE 10 or earlier](http://caniuse.com/#feat=const). In those browsers, you have to use `var` instead, or use [Babel](https://babeljs.io/) to transpile `const` into `var`.


## Primitive Types

Now that you know how to declare variables, let's see what kinds of data you can assign to them. JavaScript has just a few primitive types:

- strings, which are surrounded by single or double quotes: `"Hello, World!"` or `'Hello, World!'`
- numbers, which includes both integers and floating-point numbers: `10`, `3.14`
- booleans: `true` or `false`
- `undefined`, which is used for uninitialized variables and parameters, but you can also assign this value to a variable at any time
- `null`, which is similar to, but not quite the same as `undefined`

## Arrays and Objects

In addition to these primitive types, JavaScript also has built-in support for two complex types: arrays and objects.

### Arrays

You probably remember arrays from your introductory computer science course: they are an ordered list of **elements** that can be randomly accessed. JavaScript arrays are similar to arrays in other languages, except that the dynamic typing of JavaScript means that array elements can be of any data type, and you can mix types within a single array (though that can get confusing so it's not advisable).

To create an array in JavaScript, we use this syntax:

```javascript
//declare an array with 5 numbers
let odds = [1,3,5,7,9];
//the .length property returns the array's length
console.log(odds.length); // => 5
//you can access any element using the `[index]` syntax
//indexes are zero-based
console.log(odds[0]); // => 1
console.log(odds[4]); // => 9
```

To add a new item to an array, use the `.push()` method:

```javascript
//you can add one element at a time
odds.push(11);
//or many elements at once
odds.push(13,15,17,19);
```

Arrays have [lots of built-in methods](https://www.w3schools.com/jsref/jsref_obj_array.asp), and we will examine many of them in the functional programming tutorial.

### Objects

Objects in JavaScript are a bit of a misnomer. Those coming from Object-Oriented languages like Java might be tempted to think of them like an instance of some class, but they are really much simpler than that. In JavaScript an object is really just a [hash table](https://en.wikipedia.org/wiki/Hash_table), which is a data structure that stores a set of key-and-value pairs. It's like a dictionary with words (keys) and definitions (values), or a contacts list with names (keys) and contact records (values). You can add a new key/value pair, or ask for the value associated with a particular key. Both operations are very fast regardless of how many entries are in the hash table.

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
console.log(player.firstName); // => "Mary"

//if the key is stored in a variable, use the
//array-like syntax instead
let key = "ranking";
console.log(player[key]); // => 4
```

An object literal is a list of key/value pairs surrounded by braces (`{...}`). Each key is separated from its value using a colon (`:`). The keys must be strings, but the values can be of any type, including another object or array.

Getting the value associated with a key is done using the `.` notation shown above. Since this syntax is similar to how you get the value of an object's property in Java, the keys of a JavaScript object are often referred to as **properties** of the object. But remember, JavaScript objects are not like Java classes: they are just hash tables that store key/value pairs. These so-called "properties" can be added to or removed from an object instance at runtime. Requesting the value for a key that doesn't yet exist simply returns `undefined` and does not produce an error. Assigning a value to a key that doesn't yet exist will add that key/value to the object:

```javascript
//getting a value for a key that doesn't yet exist
//just returns `undefined` with no error
console.log(player.email); // => undefined

//add a new key/value pair to the object
player.email = "maryr@example.com";

//get the value associated with that new key
console.log(player.email); // => "maryr@example.com"
```

You can also delete properties from an object:

```javascript
//delete the key "email" and its associated value
delete player.email;

//getting the value for the key "email"
//now returns `undefined`
console.log(player.email); // => undefined
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

### Combining Arrays and Objects

Since array elements can be of any type, you can build arrays of objects just as you would build an array of primitive types: 

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
console.log(players[0].firstName); // => "Mary"
```

And since the values of object properties can be of any type, they can also store arrays, and those arrays could contain objects:

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

JavaScript sports the same set of [operators](https://www.w3schools.com/jsref/jsref_operators.asp) you'd find in most other languages, with a few notable differences. The first is the strict equality and not strict equality operators: `===` and `!==`. To understand these, you have to understand how JavaScript does automatic type coercion.

### Equality and Coercion

In most languages, the compiler prohibits you from doing silly things like comparing a number to a string using the `==` operator, but in JavaScript, that's totally legal. For example this code will execute without error, and you might be a little surprised by the result:

<script src="//repl.it/embed/LAfJ/1.js"></script>

When JavaScript sees the `==` operator used with disparate types, it attempt to coerce one of the values to the type of the other value, according to some rules. In this case it converts the number `10` to the string `"10"` because that is a safe operation that will never fail (you can always convert a number to a string, but not all strings can be converted to numbers). It then compares `"10"` to `"10"` and finds them equal.

Although this automatic type coercion can be handy at times, it's dangerous in general and can lead to difficult to diagnose bugs. Therefore, JavaScript also has a more strict equality operator: `===`. This operator does not do automatic type coercion, and will evaluate to `false` if the two values are of different types.

<script src="//repl.it/embed/LAfl/0.js"></script>

In general, it's best practice to use `===` and `!==` wherever possible, but beware that since `null` and `undefined` are technically different data type, `null == undefined` but `null !== undefined`. If you want to test whether a value is something other than `null` or `undefined`, you might want to take advantage of JavaScript's "truthiness" behavior.

### Boolean Expressions and Truthiness

JavaScript does automatic type coercion when evaluating Boolean expressions as well, even when you don't use any operators. For example, the following code will run, but the result may surprise you:

<script src="//repl.it/embed/Kx4V/5.js"></script>

When the JavaScript interpreter sees `if (x)`, it knows it has to evaluate `x` as a Boolean expression (something that returns either `true` or `false`). In most languages, this would result in a compile error, but in JavaScript, the interpreter just coerces `x` to a Boolean value and evaluates it for the condition. So what Boolean value should an empty string coerce to? Why, `false` of course! And what about a non-empty string? Well, that should obviously be `true`!

If this all sounds crazy to you, it kind of is, but it turns out to be really useful in many situations. The following non-Boolean values all coerce to `false`:

- `0`
- `""`
- `undefined`
- `null`

Most of the time, it makes sense to treat all of these values as `false`. For example, a player object with an empty string, `0`, `null`, or `undefined` value for the `lastName` is probably invalid, so you can catch all of these cases with one `if ()` check:

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

### Functions as Values

So far functions probably seem very similar to methods in Java, but this where things will start to get really weird. In JavaScript, _functions are values_. That is to say, a function can be used anywhere you can use a value (primitive values, arrays, or objects). You can assign a function to a variable, or pass a function as a parameter to another function, or even add a key/value pair to an object where the value is a function (which is how we do object-oriented programming in JavaScript).

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



For example, arrays have a built-in `.sort()` method that sorts the array's elements, but by default it will sort those elements alphabetically as strings. If you want to sort numbers instead, you have to give the `.sort()` method a little help. You need to supply a function it can call to compare two elements in the array. That function must return a negative value if the first element is less than the second, a zero if they are equal, or a positive value if the first element is greater than the second.

Let's start by declaring a function to compare two numbers according to those rules:

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

When we call `nums.sort(compareNums)` we are passing a reference to our `compareNums` function to the `.sort()` method on the array. This allows the `.sort()` method to call our `compareNums` function as many times as it needs to in order to sort the numbers. We are passing a function to a function so that the latter can call the former.

This ability to treat functions as values is common in functional programming languages. We will dive into this more in the functional programming tutorial.














