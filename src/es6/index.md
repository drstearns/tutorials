The official name of the JavaScript language is actually ECMAScript, as the standard that governs the language is now controlled by the European Computer Manufacturers Association (ECMA). In 2015 they released a new version of that standard, officially known as ECMAScript 2015, but many developers refer to it by the working name "ES6," as it was considered the sixth version of the language.

This version introduced several new features that were sorely missing from the language, but it also included entirely new syntax that makes particular styles of programming easier. One framework in particular has eagerly embraced these new syntax features: React. This tutorial will familiarize your with the key ES6 features that React utilizes heavily so that you're better prepared to develop React applications.

Even if you don't use React, these new ES6 features might be useful to you. But remember, older browsers with older JavaScript interpreters won't be able to recognize these new syntax features unless you compile them to their ES5 equivalents. The easiest way to do that is to use the [Babel compiler](https://babeljs.io/), which can translate all of the new ES6 syntax and features into equivalent ES5 code that older JavaScript interpreters can understand. The React build process invokes Babel automatically, but if you're not using React, you can still [install and invoke the Babel compiler yourself](https://babeljs.io/docs/setup/#installation). 

## Modules

As you've no doubt noticed by now, all JavaScript files added to a web page share the same global namespace. In some ways this is good: library scripts can define new global functions that your scripts can call. But in other ways this can cause lots of problems: if a new library script defines global functions or variables that happen to have the same name as those defined by another script, you second one added to the page will silently overwrite the values associated with those globals, causing all kinds of errors.

To fix this, ES6 defined new syntax for organizing code into modules, each of which has its own global namespace. Anything you want to share with other modules can be explicitly exported, and when you import those shared things into another module, their names can prefixed with the module name, or adjusted to avoid naming conflicts.

> **NOTE: Browsers don't yet support support this module syntax natively,** but the React framework includes a module loader named [webpack](https://webpack.github.io/) that provides support for this feature. The ECMAScript committee is currently working on [a specification for browser-native module loaders](https://whatwg.github.io/loader/), but until that is ratified and implemented by all the browser vendors, third-party loaders in tools like webpack will be necessary.

For example, say we wanted to create a reusable library of functions, and we wanted to use the new ES6 syntax to avoid name collisions. Also say we want to have some private helper functions or variables that are not available to other modules. Our code would use the `export` keyword on only the functions we want to export:

```javascript
//file: fibonacci.js

//put interpreter into strict mode
//affects this module only
"use strict";

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
import {next, reset} from "./fibonacci.js"

let n = next();
```

Each module may also export one identifier as its "default" export, and other modules can then import that default export using a slightly different `import` syntax:

```javascript
export default function next() {
	//...
}
```
```javascript
import next from "./fibonacci.js"
let n = next();
```

This `export default` technique is commonly used in object-oriented frameworks like React, where each JavaScript module file contains the code for just one React component class/function. The component is marked as the default export, so that other modules can import it using the syntax `import MyComponent from "./MyComponent.js"`.

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

If you already know Java, the code above will likely make perfect sense to you. The first class defines a `Point` that tracks an x/y coordinate. It has a `distanceTo()` method that returns the length of a line between this point and another point. Since parameters in JavaScript don't have a defined type, the `otherPoint` parameter doesn't get explicitly typed as `Point`. Instead, you can pass any object as that parameter, as long as that object has `x` and `y` properties that are set to numbers.

The `Circle` class extends the `Point` class, adding a radius. Since a `Circle` is a `Point`, you can still call the `distanceTo()` method on a `Circle` and it will measure the distance between the circle's center and another point. We can also add more method to `Cicle`, like the `area()` method shown here. Just as with other OOP languages, the `area()` method will be available only on instances of `Circle` and not on instances of `Point`.

Unlike Java classes, JavaScript classes don't have any access control keywords on the members: essentially everything is `public`. There are [various techniques for creating private data members](http://2ality.com/2016/01/private-data-classes.html), but there's no built-in `private` or `protected` keywords like there are in Java.

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

These are officially known as **lambda functions**, though some developers refer to them as "arrow functions." Essentially, you leave off the `function` keyword, and if your function returns the result of an expression, you can omit the `{ }` as well and just include the expression you want evaluated and returned. 

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

Here we used `()` because our lambda function required no parameters, and we used `{}` because our lambda function needed to execute code and not simply return the result of an expression.

Besides a simpler and more-compact syntax, lambda functions also treat the `this` keyword differently. By default, when a function passed to another function is called, the `this` keyword is actually bound to the global object, not to any object instance to which that function might be attached. In the case of JavaScript running in the web browser, the global object is the `window` object. So any expression involving `this` will actually be referring to the global `window` object, _even if the function being invoked is a method of an object_. For example, this code won't work like you'd expect it to:

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

When the click event occurs on the button, the browser calls the `shiftRight()` function, but the `this` keyword will be bound the `window` object, and not the current instance of `Point`. Sadly, the code above will run without a runtime error, but it also won't affect the `x` property of your `Point` object. Instead, it will create a new property on the global `window` object named `x` and increment its value. But since no other code ever looks at that property, incrementing it will have no effect.

You might thing you could provide an in-line anonymous function that turns around and calls `this.shiftRight()`, but that won't work either. Since the `this` keyword refers to the global `window` object, it will try to invoke `window.shiftRight()`, which doesn't exist. You'll get a cryptic runtime error saying something like "cannot call undefined."

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

When our lambda function is invoked, the interpreter resolves the `this` keyword within the `constructor()` function's scope, so `this` will still refer to the current instance of the `Point` object, just like it did when we did `this.x = x` to set the `x` property.

Because `this` is lexically-scoped in lambda functions, they are commonly used in React for DOM event listeners. React components render their data as a sub-tree of HTML elements, and if the component wants to add an event listener on one of those elements, we use a lambda function to call one of our component's methods. That way we have access to the component's current data, which are stored as properties of the object.

## Enhanced Object Literals



## Template Strings


## Destructuring and Spreading


