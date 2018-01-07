[HTML](../html), [CSS](../css), [JavaScript](../javascript), and [the Document Object Model](../dom) give us everything we need to build just about any web application we could imagine. But if you sit down and try to build something complex like a browser-based game, you will quickly realize that you are still missing something important: how to structure a complex, interactive application so that it's easy to implement, reason about, and extend. That is to say, you need to learn how to _architect_ interactive applications, and how to express that architecture in JavaScript.

## State

At the core of any program are the data values that the program is tracking or manipulating, which we refer to as the program's **state**. This state is stored in the program's variables and function parameters. As the program executes, it reads this state to decide what to do, and sometimes modifies the state based on the results of some operation. At any moment, this state determines where the program is at and what it will do next.

For example, a simple game like [single-player Pong](https://en.wikipedia.org/wiki/Pong) has only a few state values that it needs to track:

- the x/y position of the "ball"
- the vector on which the ball is currently traveling (i.e., which direction its going)
- the y position of the "paddle"
- the width/height of the "court"

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
//overall state
let state = {
	//court object
	court: {
		width: window.innerWidth,  //browser window width
		height: window.innerHeight //browser window height
	},
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

Given this data and a few hard-coded values (e.g., ball radius, paddle `x` coordinate), we could render the current game state to the browser window in various ways. The simplest would be creating [SVG elements](https://developer.mozilla.org/en-US/docs/Web/SVG) for each game object (`<circle>` for the ball, `<rect>` for the paddle). Another more high-performance approach would be to draw shapes on to an HTML [`<canvas>` element](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial).

### Event Listeners

After initializing the state, the program would next need add event listeners for at least two events:

- a timer event that occurs at a regular interval, which we will use to adjust the x/y position of the ball
- the mouse move event, which we will use to adjust the y position of the paddle

To add the timer, use the `setInterval()` function in the DOM. It takes a function to call and the number of milliseconds between each timer event:

```javascript
function advanceBall() {
	//adjust the ball's x/y coordinate
	state.ball.x += state.ball.vectorX;
	state.ball.y += state.ball.vectorY;

	//if the ball has hit the top or bottom wall
	//negate vectorY so that it bounces back
	if (state.ball.y - state.ball.radius <= 0 ||
		state.ball.y + state.ball.radius >= state.court.height) {
		state.ball.vectorY *= -1;
	}

	//if the ball has hit the right wall
	//negate vectorX so that it bounces back
	if (state.ball.x + state.ball.radius >= state.court.width) {
		state.ball.vectorX *= -1;
	}

	//update the screen to match
	//TODO:
}

//call advanceBall() every 16 milliseconds
state.ballTimer = setInterval(advanceBall, 16);
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
	state.paddle.y = eventObj.clientY - (state.paddle.height / 2);

	//update the screen to match
	//TODO:
}

document.body.addEventListener("mousemove", adjustPaddle)
```

These two event listeners are all you need. The first updates the state of the ball, and the second updates the state of the paddle. The first will be called on a regular basis to animate the ball, and the second will be called whenever the user moves the mouse.

The only things left to do to make this game function are as follows:

- Add code to render the game state to the page. You can either create an SVG `<circle>` element for the ball and an SVG `<rect>` element for the paddle, or you can draw shapes on a `<canvas>` element.
- Update the position of your rendered SVG elements, or redraw the shapes on the `<canvas>`, during the event listener functions.
- During `advanceBall()` detect if the ball has gone to the left of the paddle, and if so, end the game.

Give it a try!









