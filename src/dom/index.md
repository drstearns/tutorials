Now that you know the basics of the JavaScript language, we can learn how to use that language to add some interactivity to our web pages. Specifically, we will learn how to respond to user interactions, modify the contents of elements, and add/remove style classes to alter formatting.

## Adding Scripts to the Page

The browser only knows about the HTML page it loads, and other files that it links to. So to add some script to our web page, we need to add an element that points to the script file. That element looks like this:

```html
<script src="path/to/javascript/file.js"></script>
```

Strangely enough, you do need both a start and end tag, even though the element should have no content. The `src` attribute can be an absolute or relative URL to your script file. Absolute paths are typically used when loading a library of functions from a CDN location, while a relative path will be used to load your own JavaScript files from a `js` sub-folder.

You can add as many `<script>` elements to a page as you want. The browser will download and execute each script in order, and they all will share a common global name space. So if the first script defines a global variable or function, scripts added after that one will also be able to reference that variable, or call that function, defined in the previous script.

Because the browser pauses to download and execute scripts when it encounters them, we typically put these `<script>` elements at the end of the `<body>` section, just before the `</body>` tag. That way the page content will render and the user can click on hyperlinks while the scripts are still downloading.

Most browsers now support adding a `defer` attribute to the `<script>` element that tells the browser to defer downloading and running the script until the page is fully loaded and rendered to the screen. With this attribute, you can put the `<script>` element anywhere in the page. But beware about this for the short-term: it's [not supported in older browsers](http://caniuse.com/#feat=script-defer) like IE 8. Those browsers will simply download and execute the script as soon as they encounter the `<script>` element.

## The Document Object Model (DOM)

When the browser executes a script, it adds a few objects to the global name space that are just "there." You don't have to create these objects or load them from anywhere&mdash;they are simply available because the browser added them before running your script.

These global objects, and the objects they link to, are known as the [Document Object Model (DOM)](http://www.w3schools.com/js/js_htmldom.asp). The DOM contains a JavaScript object for each element in your web page, organized in a tree data structure just like the elements. The root of that tree is accessible via a browser-supplied global variable named `document`. That variable is an object that represents the entire page, and it has many properties and methods you can use to traverse, interrogate, and even manipulate the elements within then page.

### Getting References to Elements

To interrogate or manipulate an element in your page, you first need to get a reference to the corresponding [DOM Element object](https://developer.mozilla.org/en-US/docs/Web/API/element) that the browser created for that element when it parsed the page. This can be done using one of two methods.

If the element you want to interact with has an `id` attribute, you can use `document.getElementById()` to get a reference to it. For example, this line of code would get a reference to the element with an `id` attribute set to `first-name-input`:

```javascript
var nameInput = document.getElementById("first-name-input");
```

This method works only for elements with an `id` attribute, but there's another much more flexible and powerful method that will let you select elements using the same CSS selector syntax you've already learned. The method is `document.querySelector()`, and this is how you would use it to select the first element with the style class `output-paragraph`:

```javascript
var outputPara = document.querySelector(".output-paragraph");
```

The `document.querySelector()` method accepts any sort of CSS selector: element, ID, class, descendant, group, etc. For example, this selector will find the `<tbody>` element that exists within an element with the style class `output-table`:

```javascript
var outputTableBody = document.querySelector(".output-table tbody");
```

Note that `document.querySelector()` finds only *the first* element that satisfies that selector. To get *all* elements that satisfy the given selector, use `document.querySelectorAll()`. That method will return a [NodeList object](https://developer.mozilla.org/en-US/docs/Web/API/NodeList), which is like an array, but not quite. It has a `.length` property and you can retrieve an element by index, but it doesn't support all the other methods that JavaScript arrays currently support. The safest way to iterate a `NodeList` at the present time is to use a standard `for` loop:

```javascript
//select all hyperlink elements
var links = document.querySelectorAll("a");

//for each link returned...
var idx;
for (idx = 0; idx < links.length; idx++) {
	//set its `target` attribute to "_blank"
	//so that it automatically opens in a new browser tab
	links[idx].target = "_blank";
}
```

### Getting/Setting The Content of an Element

Once you have a reference to an element, you can do several things with it. First, you can get or set its content using  the `textContent` property:

```javascript
//get a reference to the first element that has the style class `alert`
var alert = document.querySelector(".alert");

//get the existing text content (just to demonstrate)
console.log(alert.textContent)

//reset the text content--this will update the element's text on screen
alert.textContent = "This is a new alert message!";
```

The `textContent` property is considered "safe," meaning that if you try to set it to a string that contains HTML, the browser will not interpret the string as HTML, and will instead display the HTML as plain text inside the element. This is a good thing. When we build web applications, these strings often come from the user in the first place, and devious users will often try to enter crafty HTML that when executed, can steal private information from a user. This is known as a [Code Injection Attack](https://en.wikipedia.org/wiki/Code_injection), and it can be avoided by using this `textContent` property when setting an element's content.

There is another property named `innerHTML` that is not safe. It sets the element's content, but that content will be interpreted as HTML, and may result in code being executed. This is generally not a good property to use unless you are absolutely certain the content came from a trusted source.

You can also clear the content within an element by setting the `textContent` or `innerHTML` properties to an empty string:

```javascript
//get a reference to the first element that has the style class `alert`
var alert = document.querySelector(".alert");

//clear the content
alert.textContent = "";
```

### Getting/Setting Attributes

You can also get or set any attributes that might be supported by an element you select. Each attribute is typically exposed as a property of the returned element. So if you want to change the `src` attribute of an `img` element to show a different picture, you would use code like this:

```javascript
//get a reference to the image element
var img = document.querySelector("img");

//reset it's `src` attribute to load a different image
img.src = "https://...."
```

If you want to get all attributes, or if you're not sure which attributes are available on the element, use the `.attributes` property, which returns a [NamedNodeMap](https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap) object. This isn't commonly necessary, but it can be handy in cases where you are trying to write code that works with any kind of element.

### Getting/Setting the Value of an Input

The [`<input>`](http://www.w3schools.com/tags/tag_input.asp) element is used for gather input from the user, but it is a self-closing tag, and thus doesn't have any content. The value the user types into the input is actually stored in a `value` property which you can get or set. This property is updated every time the user types into the input.

```javascript
//get a reference to the input with the class name `name-input`
var nameInput = document.querySelector(".name-input");

//get the string the user has typed into that input
console.log(nameInput.value);

//clear the input
nameInput.value = "";
```

### Getting/Setting the Selected Option of a Select

The [`<select>`](http://www.w3schools.com/tags/tag_select.asp) and [`<option>`](http://www.w3schools.com/tags/tag_option.asp) elements are used to let the user choose from a fixed list of available options. The associated DOM element also has a `value` property which you can use to get the `value` attribute of the selected `<option>` element. But if you want to get the display text of the `<option>` element instead, you can use the `.selectedIndex` property to get the selected option's index, and then access the option element object to get its content:

```javascript
//get a reference to the input with the class name `state-select`
var stateSelect = document.querySelector(".state-select");

//get the `value` attribute of the selected option
console.log(stateSelect.value);


//get the display text of that selected option instead
console.log(stateSelect.options.item(stateSelect.selectedIndex).textContent);
```

### Adding/Removing Style Classes

In addition to manipulating the content of element, you can also alter its formatting via JavaScript. The best way to do this is to add or remove CSS style classes that are defined in your stylesheet. Adding a new class to an element is done like so:

```javascript
var p = document.querySelector("p");

//show all existing style classes on the element
console.log(p.className);

//add the `my-style-class` to the set of classes
p.classList.add("my-style-class");

//will now include the new style class at the end
console.log(p.className);
```

Removing a style class is done using `.classList.remove()`.

If you want to modify just one specific style property and leave the list of style classes alone, you can do that using the element's `.style` property. For example, this change the element's `background-color` style (note the name in JavaScript is `backgroundColor`):

```javascript
p.style.backgroundColor = "#CCCCCC";
```

## Listening for Events

All of this manipulation is neat, but you typically want to perform this manipulation *in response* to some kind of user interaction: clicking, typing, scrolling, etc. Since these events occur after the page has loaded, and after your script has run, you need to ask the browser to call some of your code whenever these events occur. You can do that using the element's `.addEventListener()` method.

For example, say you have a `<button>` element in your page, and you want the browser to run some code whenever the user clicks that button. You first get a reference to the DOM Element object for that button, and then pass a function reference to its `.addEventListener()` method:

```javascript
//this function should be called each time 
//the user clicks the button
function onButtonClick() {
	console.log("my button was clicked!");
}

//get a reference to the button element
var button = document.querySelector("button");

//tell the browser to call my onButtonClick() function
//whenever the "click" event occurs
button.addEventListener("click", onButtonClick);
```

Each time the user clicks the button, the browser will call your `onButtonClick()` function. In that function you can select other elements, manipulate their content, or add/remove style classes.

Note that the second parameter to `.addEventListener()` is just the name of the function with no parentheses after it. That name is like a variable name. It *refers* to the function. Putting parentheses after the name would *call* the function, and pass the function's return value as the second parameter to `.addEventListener()`, which is not what you want. When registering an event listener, always pass a function *reference*; don't *call* the function. You want the browser to call your function later. Passing the function reference to the browser allows it to call your function whenever the event occurs.

You can alternatively provide the event listener function in-line if you want to, and this is commonly done in the JavaScript world. Instead of defining the event listener as a function with a name, and passing that name as a function reference, you can provide an **inline anonymous function**:

```javascript
//get a reference to the button element
var button = document.querySelector("button");

//tell the browser to call the inline anonymous function
//whenever the "click" event occurs
button.addEventListener("click", function() {
	console.log("my button was clicked!");
});
```

Notice that we simply moved the function declaration down into the spot where we had previously used the function name. This is known as a **function value** and it doesn't need a name anymore, as the function is declared and passed as a reference in one operation.

Either approach works, but the latter is more compact and doesn't require naming the function, so it's commonly used by professionals.

As the name implies, `.addEventListener()` will *add* a function to the list of listeners for that event. You can add multiple functions for the same event, and the browser will call all of them, in the order they were added. 

This is good for code re-use: JavaScript libraries can safely add event listeners without having to coordinate with other code that might be added to the same page. Initially, the DOM supported only one event listener for a given element, and the listener was registered by setting a property named `onEventName`, where `EventName` was the name of the event you wanted to listen for. If another bit of script reset that property, the browser would only call the newly set function, and the previous one as well. The `.addEventListener()` method was added to fix this problem, so it's good practice to use it.

The `.addEventListener()` also enabled something the previous mechanism didn't support at all: adding a listener that should be called only once for the next occurrence of the event. This is handy when you need to clean up something after an asynchronous operation is complete (e.g., [an element animation](#sec-animationevents)). To register a one-time event listener, just pass a JavaScript object with a property named `once` set to `true` as the third parameter:

```javascript
//tell the browser to call the inline function
//only once after the next click
button.addEventListener("click", function() {
	console.log("my button was clicked!");
}, {once: true});
```

## Commonly-Used Events

For a full list of events you can listen for, see the [Event Reference](https://developer.mozilla.org/en-US/docs/Web/Events), but the following sections describe several of the most commonly-used events.

### Mouse Events

Every HTML element will raise a `"click"` event when the element is clicked. This will also occur on touch screens when the element is tapped, though after a very short delay. Touch screens will also raise `touchstart` and `touchend` events when the user starts and stops touching an element.

Elements also raise a `"doubleclick"` event when the element is double-clicked/tapped, and `"contextmenu"` when the user clicks with the alternate button.

### Window Events

When the user scrolls the page, the `window` object (another global like `document`) will raise a `"scroll"` event. This allows you to alter the page as the user scrolls down. For example, a navigation bar might start scrolling with the overall page, but become fixed to the top of the viewport once it reaches the top of the viewport.

If the user resizes the browser window, the `window` object will raise a `"resize"` event. This allows you to adjust your page layout in ways that go beyond what you can do with CSS media rules.

### Input Events

As noted earlier, `<input>` elements create a box into which users can enter text. These elements raise an event named `"input"` whenever the contents of the box is changed by the user. This happens with each keystroke, so it's a handy way to respond as the user types:

```javascript
var fNameInput = document.querySelector(".first-name-input");

fNameInput.addEventListener("input", function() {
	console.log("user typed:", fNameInput.value);
});
```

These elements raise another event name `"change"`, but this fires only when the user tabs or clicks out of the input box (known as "losing focus"). This event can be useful when you want to let the user type a longer bit of text and only process it once the user leaves the input.

### Animation Events

Adding a style class that refers to an [animation](https://daneden.github.io/animate.css/) will cause the browser to animate the element asynchronously. But if you try to add that same style class again to the element, the browser will simply ignore that operation, as the class already exists on the element. Attempting to remove the class and add it again in two successive lines won't work either, as the browser will wait to look for style class changes until your event listener function completes.

To trigger an animation repeatedly, you must listen for the `"animationend"` event that will be raised once the browser has finished animating the element. During this event, your code can remove the style class. That way, the next time you add that style class, the browser will notice that it wasn't there before, and animate the element again.

For example, this code adds the `bounce` animation style class from the [animate.css](https://daneden.github.io/animate.css/) stylesheet to an element each time a button is clicked:

```javascript
//assuming the animate.css stylesheet is included in the page
//and thus their animation style classes are defined...

//select the element to animate
var animateElem = document.querySelector(".elem-to-animate");

//when the animate button is clicked...
var animateButton = document.querySelector(".animate-button");
animateButton.addEventListener("click", function() {
	//add the `bounce` style class to trigger a bounce animation
	animateElem.classList.add("bounce");

	//when the animation ends, remove that `bounce` style class
	animateElem.addEventListener("animationend", function() {
		animateElem.classList.remove("bounce");
	}, {once: true});
});
```

Note that I added the `{once: true}` as a third parameter to the `addEventListener()` method. This tells the browser that I only want this function to run for the next `"animationend"` event, and not when that event occurs again in the future. The browser will call my event listener the next time that `"animationend"` event occurs, but after my event listener function exits, the browser will remove my listener so that it's not called again in the future. This is a handy way to clean up after an asynchronous operation, such as a CSS animation, completes.

## Conclusion

The DOM plus the ability to add event listener functions gives us total control over our web pages. We can literally rewrite the page in response to user interactions, which allows us to build highly-interactive web sites and applications.

Now try some of this yourself. Use [this CodePen](http://codepen.io/drstearns/pen/BpBxZo) or create your own page and script.