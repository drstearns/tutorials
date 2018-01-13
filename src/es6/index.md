The official name of the JavaScript language is actually "ECMAScript" because the committee that defines the language specification is part of the European Computer Manufacturers Association (ECMA). In 2015 they released a new version of that specification, officially known as "ECMAScript 2015," but many developers refer to it by the working name "ES6," as it was considered the sixth version of the language.

This version introduced several new features that were sorely missing from the language, but it also included entirely new syntax that makes particular styles of programming easier. One framework in particular has eagerly embraced these new syntax features: React. This tutorial will familiarize your with the key ES6 features that React utilizes heavily so that you're better prepared to learn the React framework.

Even if you don't use React, these new ES6 features might be useful to you. But remember, older browsers with older JavaScript interpreters won't be able to recognize these new syntax features unless you compile them to their ES5 equivalents. The easiest way to do that is to use the [Babel compiler](https://babeljs.io/), which can translate all of the new ES6 syntax and features into equivalent ES5 code that older JavaScript interpreters can understand. The React build process invokes Babel automatically, but if you're not using React, you can still [install and invoke the Babel compiler yourself](https://babeljs.io/docs/setup/#installation). 

## Modules

As you've no doubt noticed by now, all JavaScript files added to a web page share the same global namespace. In some ways this is good: library scripts can define new global functions that your scripts can call. But in other ways this can cause lots of problems: if a new library script defines global functions or variables that happen to have the same name as those defined by another script, the second one added to the page will silently overwrite the values associated with those globals, causing all kinds of errors.

To fix this, ES6 defined new syntax for organizing code into modules, each of which has its own namespace. Anything you want to share with other modules can be explicitly exported, and when you import those shared things into another module, their names can be prefixed with the module name, or adjusted to avoid naming conflicts.

> **NOTE: Browsers don't yet support support this module syntax natively,** but the React framework includes a module loader named [webpack](https://webpack.github.io/) that provides support for this feature. The ECMAScript committee is currently working on [a specification for browser-native module loaders](https://whatwg.github.io/loader/), but until that is ratified and implemented by all the browser vendors, third-party loaders in tools like webpack will be necessary.

For example, say we wanted to create a reusable library of functions, and we wanted to use the new ES6 syntax to avoid name collisions. Also say we want to have some private helper functions or variables that are not available to other modules. We can do this by creating a script where all of our exported identifiers are prefixed with the keyword `export`.

```javascript
//file: fibonacci.js

//since these variables are not exported
//they are private to the module. Code
//in other modules can't reference them
let fib1 = 0;
let fib2 = 1;

/**
 * next() returns the next number in the Fibonacci sequence.
 * @returns {number}
 */
export function next() {
	let current = fib1;
	fib1 = fib2;
	fib2 = current + fib1;
	return current;
}

/**
 * reset() resets the Fibonacci generator.
 */
export function reset() {
	fib1 = 0;
	fib2 = 1;
}
```

To use the exported function in another module, we use the new `import` syntax:

```javascript
//file: index.js

//use relative file path to module
//you are importing from
import * as fibonacci from "./fibonacci.js";

let (i = 0; i < 20; i++) {
	console.log(fibonacci.next());
}

fibonacci.reset();
```

If you only need a subset of the exported functions, you can import just those you need using this alternative `import` syntax:

```javascript
//syntax for importing one or more specific identifiers
//use comma to separate multiple specific identifiers
import {next} from "./fibonacci.js"

let n = next();
```

Each module may also export one identifier as its "default" export, and other modules can then import that default export using a slightly different `import` syntax:

```javascript
//file: fibonacci.js
export default function next() {
	//...
}
```
```javascript
//file: index.js
import next from "./fibonacci.js"
let n = next();
```

This `export default` technique is commonly used in object-oriented frameworks like React, where each JavaScript module file contains the code for just one React component. The component's class or function declaration is marked as the default export, so that other modules can import it using the syntax `import MyComponent from "./MyComponent.js"`.

## Classes

JavaScript supported object-oriented programming from the beginning, but the syntax for defining something akin to a class, and calling superclass methods, was cumbersome and error-prone. ES6 defines a new `class` syntax with a `super` keyword that is very reminiscent of other OOP languages like Java:

```javascript
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distanceTo(otherPoint) {
        let xDiff = Math.abs(this.x - otherPoint.x);
        let yDiff = Math.abs(this.y - otherPoint.y);
        return Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
    }
}

class Circle extends Point {
    constructor(x, y, radius) {
        super(x, y); //calls superclass constructor
        this.radius = radius;
    }

    area() {
        return Math.PI * (this.radius * this.radius);
    }
}

//construct a new instance of Circle
let c = new Circle(0,0,10);
//get its area
let area = c.area();
//measure distance between centers of two circles
let c2 = new Circle(10,10,10)
let distance = c.distanceTo(c2);
```

If you already know Java, the code above will likely make perfect sense to you. The first class defines a `Point` that tracks an x/y coordinate. It has a `distanceTo()` method that returns the length of a line between this point and another point. But because parameters in JavaScript don't have a defined type, the `otherPoint` parameter doesn't get explicitly typed as `Point`. Instead, the interpreter allows callers to pass any value as that parameter. As long as the caller passes some sort of object with `x` and `y` properties set to numbers, it will work.

> This is where VisualStudio Code's type checking can really come in handy. If you use jsdoc comments to declare that the `otherPoint` parameter must be a `Point` object, vscode will flag any code that tries to pass something different. But this type-checking only occurs at coding time: the runtime interpreter will still allow any value to be passed.

The `Circle` class extends the `Point` class, adding a radius. Since a `Circle` is a `Point`, you can still call the `distanceTo()` method on a `Circle` and it will measure the distance between the circle's center and another point. We can also add more methods to `Circle`, like the `area()` method shown here. Just as with other OOP languages, the `area()` method will be available only on instances of `Circle` and not on instances of `Point`.

> **NOTE:** although the syntax above looks like Java, it's important to remember that **JavaScript class instances are still just maps, just like any other JavaScript object**. For example, calling code can always add properties to an instance of your `Point` class, because that instance is really still just a map. Calling code can also overwrite the value of any property, or even delete properties from an instance. Although it looks like a Java class, it doesn't really behave like one.

Unlike Java classes, JavaScript classes also don't have any access control keywords on the members: essentially everything is `public`. There are [various techniques for creating private data members](http://2ality.com/2016/01/private-data-classes.html), but there's no built-in `private` or `protected` keywords like there are in Java.

Like functions, classes can be exported from modules. If you have only one class per-module, then use `export default` so that other modules can more easily import and use it:

```javascript
//file: point.js
export default class Point {
	//..same code as above
}
```
```javascript
//file: circle.js
import Point from "./point.js";

export default class Circle extends Point {
	//..same code as above
}
```

This is the common pattern used for React components, which can either be classes or functions.

## Lambda Functions

As I noted in the [JavaScript tutorial](../javascript), JavaScript lets you pass in-line anonymous function values as parameters to other functions. For example, when sorting an array of numbers, it's very common to write code like this:

```javascript
let nums = [1,10,2,20,3,30];
nums.sort(function(n1, n2) {
	return n1 - n2;
});
```

This is such a common technique in functional programming that ES6 introduced a simpler and more compact syntax for providing these in-line anonymous function values:

```javascript
let nums = [1,10,2,20,3,30];
//equivalent to code above
nums.sort((n1, n2) => n1 - n2);
```

These are officially known as **lambda functions**, though some developers refer to them as "arrow functions." Essentially, you leave off the `function` keyword, and if your function returns the result of an expression, you can omit the `{ }` around the function body, as well as the `return` keyword. Just put the expression you want evaluated and returned on the right side of the `=>` (as shown above). 

If your function takes only one parameter, you can also leave off the `()` around the parameters:

```javascript
let evens = nums.filter(n => n % 2 === 0);
```

If your function takes no parameters, you still must include the empty `()`:

```javascript
document.querySelector("button")
	.addEventListener("click", () => {
		console.log("button was clicked");
	});
```

Here we used `()` because our lambda function required no parameters, and we used `{}` because we don't want to just return the result of an expression. Instead, we want to perform an action: writing a message to the console. If you want to perform actions, use `{}` around the function body. If you just want to return the result of an expression, omit the `{}`.

Besides a simpler and more-compact syntax, lambda functions also treat the `this` keyword differently. This is best explained with an example. By default, when an event listener function is invoked by the browser, the `this` keyword is bound to the _HTML Element that raised the event_, not the event listener method's object instance. For example, this code won't work like you'd expect:

```javascript
class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		//WON'T WORK:
		//tell the browser to call our shiftRight()
		//method when the shift right button is clicked
		document.querySelector("#shift-right-button")
			.addEventListener("click", this.shiftRight);
	}

	shiftRight() {
		this.x++;
	}
}
```

When the click event occurs on the button, the browser calls the `shiftRight()` function, but the `this` keyword will be bound the `<button id="shift-right-button">` element, and not the current instance of `Point` to which the `shiftRight()` method belongs. Sadly, the code above will run without a runtime error, but it also won't affect the `x` property of your `Point` object. Instead, it will create a new property on the HTML Button element named `x` and increment its value. But since no other code ever looks at that property, incrementing it will have no effect.

You might think you could provide an in-line anonymous function that turns around and calls `this.shiftRight()`, but that won't work either. Since the `this` keyword still refers to the HTML button element, it will try to invoke the `.shiftRight()` method on the button element, which doesn't exist. You'll get a cryptic runtime error saying something like "cannot call undefined."

If you use a lambda function instead, it will work, because lambda functions evaluate the `this` keyword within the lexical scope in which the lambda function is created. For example, if we change the code to this, it will work as expected:

```javascript
class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		//WORKS:
		//tell the browser to call our shiftRight()
		//method when the shift right button is clicked
		document.querySelector("#shift-right-button")
			.addEventListener("click", () => this.shiftRight());
	}

	shiftRight() {
		this.x++;
	}
}
```

When our lambda function is invoked, the interpreter resolves the `this` keyword within the `constructor()` function's scope, so `this` will still refer to the current instance of the `Point` object, similar to how `this.x` referred to the `x` property of our current `Point` object.

Because `this` is lexically-scoped in lambda functions, they are commonly used in React for DOM event listeners. React components render their data as a sub-tree of HTML elements, and if the component wants to add an event listener on one of those elements, we use a lambda function to call one of our component's methods. That way we have access to the component's current data, which are stored as properties of the object.

> If the scoping rules for lambda functions seem confusing, just remember it this way: if your callback function needs `this` to refer to the current instance of your object, use a lambda function. If you don't need to refer to `this` at all, you can use either a lambda or a traditional in-line anonymous function.

## Default Values for Function Parameters

Many languages let you define a default value for a function parameter, and if the caller doesn't supply that parameter, the compiler sets the parameter to the default value. We can now do this in JavaScript as well:

```javascript
function getGreeting(name = "World") {
	return "Hello, " + name + "!";
}

console.log(getGreeting());           // => "Hello, World!"
console.log(getGreeting("Gorgeous")); // => "Hello, Gorgeous!"
```

## Template Strings

Several programming languages allow you to embed expressions within strings that are evaluated and replaced with the resulting value as the string is created. ES6 added these to JavaScript using the back-tick quote characters instead of the single or double-quote characters:

```javascript
function getGretting(name) {
	return `Hello, ${name}!`;
}

getGretting("Gorgeous"); // => "Hello, Gorgeous!"
```

Each `${...}` token within a back-tick-quoted string is replaced by the result of evaluating the expression between the `{...}`. This expression can refer to anything in the current scope: variables, parameters, functions, methods, etc. Here we just use the value of the `name` parameter that was passed to our function. But we can also use more complex expressions:

```javascript
function getGretting(name) {
	return `Hello, ${name.substr(0,1).toUpperCase() + name.substr(1)}!`;
}

getGretting("gorgeous"); // => "Hello, Gorgeous!"
```

In general, the expressions in these token strings should be kept relatively short and simple so that the string remains readable. If your expression get too long or complicated, simply move them to the line above and declare a temporary variable if necessary.

```javascript
function getGretting(name) {
	name = name.substr(0,1).toUpperCase() + name.substr(1);
	return `Hello, ${name}!`;
}
```

## Destructuring and Spreading

ES6 also introduced destructing assignments, which make it easy to separate the elements of arrays, or the properties of objects, into different variables. For example, say you want to `.split()` a string by some separator and deal with each piece as an independent variable. In ES5, you'd have to do something like this:

```javascript
let size = "10x20";
//split size into two-element array
let sizeSegments = size.split("x"); //returns ["10", "20"]

//extract each element into separate variable
let width = sizeSegments[0];
let height = sizeSegments[1];

console.log(width);  // => 10
console.log(height); // => 20
```

With a destructuring assignment, you can do all of this in one step:

```javascript
let size = "10x20";

//destructure array returned by .split()
//into two different variables, width & height
let [width, height] = size.split("x");

console.log(width);  // => 10
console.log(height); // => 20
```

If the array contains more than two elements, the code above will ignore those extra elements. But you can capture the remaining elements using the spread operator (a literal `...`):

```javascript
let size = "10x20x30x40";
let [width, height, ...rest] = size.split("x");
console.log(width);  // => 10
console.log(height); // => 20
console.log(rest);   // => ["30", "40"];
```

Destructuring works on objects as well:

```javascript
let shape = {x: 10, y: 20, width: 30, height: 40};

//extract just the x and y properties
//into separate variables
let {x, y} = shape;
console.log(x); // => 10
console.log(y); // => 20
```

Most browser don't yet support using `...rest` in an object destructuring assignment, but the Babel compiler will let you use it, and translate it into the equivalent ES5 code:

```javascript
let shape = {x: 10, y: 20, width: 30, height: 40};

//extract just the x and y properties
//into separate variables, and put
//any remaining properties into rest
let {x, y, ...rest} = shape;
console.log(x);    // => 10
console.log(y);    // => 20
console.log(rest); // => {width: 30, height; 40}
```

Finally, you can use the spread operator to spread the elements of an array into separate parameters when you call a function. For example, say we had a function that took two parameters. Let's also say we have an array with two elements. We can use the spread operator to spread those two array elements into two separate parameters when we call the function:

```javascript
function sum(n1, n2) {
	return n1 + n2;
}

let nums = [10,20];
//spread array elements into separate parameters
console.log(sum(...nums)); // => 30
```

All of this gets really fun when we use the spread operator to define functions that can accept a variable number of arguments (known as **variadic functions**). For example, we could augment our `sum()` function to take a variable number of inputs by declaring the parameter as `...nums`. That parameter will be an array containing one element for each parameter passed to the function. Since it's an array, we can use the `.reduce()` method to calculate the sum of all the inputs, regardless of how many there were:

<script src="//repl.it/embed/NPB2/1.js"></script>


## Further Reading

This tutorial has introduced you to a few of the ES6 features that are especially useful when building web applications in React, but there are lots more to explore. The following sources describe all of the new ES6 features:

- [ECMAScript 6](https://github.com/lukehoban/es6features/blob/master/README.md)
- [ES6 Features](http://es6-features.org/#Constants) (also shows equivalent ES5 syntax where possible)




