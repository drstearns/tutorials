[HTML](../html), [CSS](../css), [JavaScript](../javascript), and [the Document Object Model](../dom) give us everything we need to build just about any web application we could imagine. But if you sit down and try to build something complex like a browser-based game, you will quickly realize that you are still missing something important: how to structure a complex, interactive application so that it's easy to implement, reason about, and extend. That is to say, you need to learn how to _architect_ interactive applications, and how to express that architecture in JavaScript.

## State

At the core of any program are the data values that the program is tracking or manipulating, which we refer to as the program's **state**. This state is stored in the program's variables and function parameters. As the program executes, it reads this state to decide what to do, and sometimes modifies the state based on the results of some operation. At any moment, this state determines where the program is at and what it will do next.

For example, a simple game like [single-player Pong](https://en.wikipedia.org/wiki/Pong) has only a few state values that it needs to track:

- the x/y position of the "ball"
- the vector on which the ball is currently traveling (i.e., which direction its going)
- the y position of the "paddle"

Given these dynamic state values, as well as some hard-coded ones (e.g., radius of the ball), one could easily render the current game objects to the screen. If we change these values and update the screen on a regular basis (e.g., within a `for` loop), the game will appear to animate.

## Event-Driven Programming

Many of the programs you wrote in your introductory computer science courses were non-interactive. These programs have an internal state, and they might initialize some of that state based on command-line arguments provided by the user, but once they start running they don't allow the user to modify that state via input interactions. All state modifications are done by the program's own internal logic, and the program generates some outputs before exiting.

![simple non-interactive architecture diagram](img/simple.png)

Interactive applications, on the other hand, allow the user to modify the program's state while it's running via various input methods (keyboard, mouse, gesture, specialized controller, voice, etc.). These programs are typically written in an **event-driven** programming style, where the program has two distinct phases:

- The **initialization phase**, during which the program initializes its state and adds various event listener functions. These event listener functions will be invoked whenever the requested event occurs (e.g., mouse click, key press, page scroll, timer, etc.)
- The **event phase**, during which the program waits for those events to occur. Each time an event occurs, the corresponding event listener function is invoked. That function in turn modifies the program's state, and updates the screen to match.

![event-driven interactive architecture diagram](img/interactive.png)

Event-driven programming is especially useful when your program needs to respond to multiple types of events. You can write your program in the style of "when this happens, execute this function." Your program can be structured so that each event listener function handles only one kind of event, modifying the program's state and updating the screen accordingly. The program's state remains the "single source of truth" for the program.

## Example

Let's return to our single-player Pong example to see how this interactive architecture and event-driven style can be expressed in a browser-based JavaScript application.

### State

In a browser-based JavaScript application, the program's state is commonly held in one global (or top-level scope) object that has one property for each state value you need to track. For example, at the start of our Pong game JavaScript, we could declare one global variable named `state`, and add various properties for our game objects:

```javascript
//constants
const BALL_RADIUS = 5;
const PADDLE_X = 5;
const PADDLE_WIDTH = 5;
const PADDLE_HEIGHT = 15;

//application state
let state = {
	//ball object
	ball: {
		x: //...random x value...,
		y: //...random y value...,
		vectorX: 1,
		vectorY: 1
	},
	//paddle object
	paddle: {
		y: 0
	}
}
```

Note that the `state` object tracks only the values that are likely to change while the application runs. Values that never change, such as the radius of the ball or the dimensions of the paddle, are better encoded as constants that we can refer to elsewhere in our code.

### Rendering

To make this state visible on screen, we need to create some HTML elements, and write a function that synchronizes those elements' attributes with the current application state values. The ball is best rendered as a circle, and the paddle as a rectangle, so [SVG elements](https://developer.mozilla.org/en-US/docs/Web/SVG) would be a sensible choice. Alternatively, one could use an [HTML `<canvas>` element](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial) and re-draw the shapes using JavaScript after each state change.

The SVG elements would look something like this:

```html
<body>
	<!-- SVG scene -->
	<svg xmlns="http://www.w3.org/2000/svg">
		<!-- ball -->
		<circle cx="0" cy="0" r="5"/>
		<!-- paddle -->
		<rect x="5" y="0" width="5" height="15"/>
	</svg>
</body>
```

To make that `<svg>` element cover the entire browser viewport, add some style rules like this:

```css
/* remove any default margins/padding from the body */
body {
	margin: 0;
	padding: 0;
}
/* make the svg element cover the entire viewport */
svg {
	width: 100vw;
	height: 100vh;
}
```

Finally, we define a function that accepts the current application state, and adjusts the attributes of those SVG elements to match:

```javascript
//select the elements once at startup
let circle = document.querySelector("svg circle");
let rect = document.querySelector("svg rect");

//render will render the state to the page elements
function render(state) {
	//adjust element attriutes to match current state
    circle.setAttribute("cx", state.ball.x);
	circle.setAttribute("cy", state.ball.y);
	rect.setAttribute("y", state.paddle.y);
}
```

Given this, we can now render our application state to the screen whenever it changes. To render the initial state, just add this to the end of your JavaScript:

```javascript
//render the initial state
render(state);
```

> **Note:** I added the SVG elements to the source HTML page to keep this example simple and easy-to-understand, but our program would be more flexible if the `render()` method _created_ the necessary SVG elements if they were not already in the page. That way we could add new game objects to the state over time and they would automatically get added to the page the next time `render()` was called. But since SVG is a dialect of XML, creating SVG elements using JavaScript is a bit more cumbersome than creating normal HTML elements. To create new SVG elements, you must use the `document.createElementNS()` method in the DOM, and supply the string `"http://www.w3.org/2000/svg"` as the namespace argument.

### Event Listeners

After initializing and rendering the state, the program would next need add event listeners for at least two events:

- a timer event that occurs at a regular interval, which we will use to adjust the x/y position of the ball
- the mouse move event, which we will use to adjust the y position of the paddle

To add the timer, use the `setInterval()` function in the DOM. It takes a function to call and the number of milliseconds between each timer event:

```javascript
function animate() {
	//adjust the ball's x/y coordinate
	state.ball.x += state.ball.vectorX;
	state.ball.y += state.ball.vectorY;

	//if the ball has hit the top or bottom of the browser window
	//negate vectorY so that it bounces back
	if (state.ball.y - BALL_RADIUS <= 0 ||
		state.ball.y + BALL_RADIUS >= window.innerHeight) {
		state.ball.vectorY *= -1;
	}

	//if the ball has hit the right edge of the browser window
	//negate vectorX so that it bounces back
	if (state.ball.x + BALL_RADIUS >= window.innerWidth) {
		state.ball.vectorX *= -1;
	}

	//if the ball has hit the paddle, negate vectorX so that
	//the ball bounces back
	if (state.ball.x - BALL_RADIUS <= PADDLE_X + PADDLE_WIDTH && 
		state.ball.y >= state.paddle.y && 
		state.ball.y <= state.paddle.y + PADDLE_HEIGHT) {
		state.ball.vectorX *= -1;
	}

	//render the adjusted state
	render(state);
}

//call animate() every 16 milliseconds
state.ballTimer = setInterval(animate, 16);
```

The `setInterval()` function returns a timer object that you can use to [stop the timer](https://www.w3schools.com/jsref/met_win_clearinterval.asp) when the game ends. You can store this in a separate variable, or you can simply add it to your game state as a new property.

> **NOTE:** most browsers now support a more efficient mechanism for this animation timer. Instead of calling `setInterval()` call `requestAnimationFrame()` instead. For more details, see [the documentation for this function](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame). Note that `requestAnimationFrame()` calls your listener function only once, so you must call `requestAnimationFrame()` again at the end of your listener function if you want to continue animating.

To listen for the mouse move event, use the `addEventListener()` method on the element the mouse will move over. In this case we can simply using the `<body>` element, as our "court" will take up the entire page.

```javascript
//eventObj is provided by the DOM and it contains info about the event
//see https://developer.mozilla.org/en-US/docs/Web/Events/mousemove
function adjustPaddle(eventObj) {
	//adjust the paddle's y coordinate so that
	//the middle of the paddle is at the same spot
	//as the mouse pointer
	state.paddle.y = eventObj.clientY - (PADDLE_HEIGHT / 2);

	//render the adjusted state
	render(state);
}

document.body.addEventListener("mousemove", adjustPaddle)
```

These two event listeners are all you need. The first updates the state of the ball, and the second updates the state of the paddle. The first will be called on a regular basis to animate the ball, and the second will be called whenever the user moves the mouse.

The only thing left to add is the logic that checks whether the ball has gone behind the paddle. When that occurs, the game should end. Try adding that to create a complete Pong game!









