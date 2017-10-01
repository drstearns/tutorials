In the early days of the web, pages were very static. Browsers did a great job rendering fonts, colors, and pictures, but the content typically didn't move or change after the page was loaded. When JavaScript and the Document Object Model (DOM) was added in the late-1990s, developers started experimenting with more interactive user interfaces and content, which made the web feel more alive, but the relatively slow execution speed of JavaScript resulted in fairly jerky and unpredictable animations on slower machines. JavaScript also couldn't take advantage of the specialized hardware-based animation accelerations being added to graphics cards at this time.

In the late 2000s, browser vendors began adding new CSS properties to create smooth hardware-based animations and transitions. These properties are now part of the core CSS specification, and are [supported by all the major browsers](https://caniuse.com/#feat=css-animation). You can use them to create both 2D and [3D animations](https://desandro.github.io/3dtransforms/).

> **WARNING:** animations are cool, but they are also quite distracting. Like fine chocolate, a little goes a long way! Use them to add some motion and excitement, but keep it subtle so that people interacting with your page don't get annoyed or distracted.

# Defining an Animation

To define a new animation, you declare a `@keyframes` rule in your CSS, like so:

```css
@keyframes fadeIn {
    from {
    	opacity: 0;
    }
    to {
    	opacity: 1;
    }
}
```

The keyword `@keyframes` starts a new animation definition, and is followed by a name you want to give this animation. Inside the curly braces, you define style rules that are applied at various stages of the animation. The selector for each of these rules is a percentage of the animation duration, like `0%` or `25%`. The keywords `from` and `to` are synonyms for `0%` and `100%` respectively.

In the example above, I named the animation `fadeIn` because it animates the `opacity` property from `0` to `1`. Recall that `opacity` controls how opaque an element is: a value of `0` makes the element entirely transparent (i.e., invisible), and a value of `1` makes the element entirely opaque (i.e., fully-visible).

The `from` selector is synonymous with `0%`, so the formatting properties in that rule are applied at the start of the animation. The `to` selector is synonymous with `100%`, so the formatting properties in that rule are the ending target for the animation. The browser then handles creating a smooth transition between the starting values and the ending values. In this case, the browser will smoothly increase the `opacity` from `0` to `1`, making the element fade-in. 

Note that you don't specify the animation timing in the definition: we will specify that when we apply this animation to an element. That allows us to define the animation once using relative stages, but apply it at different speeds on different elements.

You can define as many stages in the animation as you want. If multiple stages in the animation share the same properties, you can use a group selector syntax to specify those properties only once. For example, if we wanted an animation that fades-in and then fades-out again, we could specify it like this:

```css
@keyframes fadeOutIn {
    from, to {
    	opacity: 1;
    }
    50% {
    	opacity: 0;
    }
}
```

Here we say that `opacity` should be `1` at both the start and end of the animation, but should be `0` at the mid-point of the animation.

## Which Properties Can Be Animated?

In general, [any continuous property can be animated](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties). Discrete properties like `display`, `font-family`, or `background-image` can't be animated because there is no way to transition smoothly from one value to another.

That said, [not all continuous properties will result in really smooth animations](https://medium.com/outsystems-experts/how-to-achieve-60-fps-animations-with-css3-db7b98610108). Browsers have to do a lot of work to layout a page, so any property that changes the overall page layout will naturally be tough to animate at 60 frames-per-second. These properties include:

- width, max-width, min-width
- height, max-height, min-height
- margin, padding
- flex, flex-basis
- font-size
- text-indent
- line-height, letter-spacing, word-spacing

Properties that only affect the element being animated will work much better. Those include:

- color
- background-color
- border and border-radius
- box-shadow

And those that affect only the final compositing of elements on screen will work the best. Those include:

- opacity
- transform

## Animating Multiple Properties

Although the examples above animated only one property, you can specify as many properties as you want in the stage rules. For example, you can animate both the `opacity` and the `transform` at the same time:

```css
/* spins and fades out */
@keyframes spinOut {
    from {
        opacity: 1;
        transform: rotate(0deg);
    }
    to {
        opacity: 0;
        transform: rotate(360deg);
    }
}
```

<p data-height="300" data-theme-id="19831" data-slug-hash="borrqY" data-default-tab="css,result" data-user="drstearns" data-embed-version="2" data-pen-title="CSS Animations Multiple Props" class="codepen">See the Pen <a href="https://codepen.io/drstearns/pen/borrqY/">CSS Animations Multiple Props</a> by Dave Stearns (<a href="https://codepen.io/drstearns">@drstearns</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

# Applying an Animation

After we define an animation, we can apply it to one or more elements. This is typically done in response to an event, like the user clicking on something or pressing a key on the keyboard, but that requires JavaScript. Since we haven't [learned JavaScript](../javascript) yet, we will use the `:hover` pseudo-selector to trigger the animation when a user hovers the mouse over an element.

Assume that the element we want to do this on is a `<div class="animate-me">` element. We can use the `.animate-me` class selector to refer to this element specifically, and the `:hover` pseudo-selector to create a rule that should be applied only when the mouse is hovering over that element.

```css
/* this rule applies when the user hovers the mouse over
any element with class="animate-me" */
.animate-me:hover {
	animation: fadeOutIn 1s;
}
```

Here's what it looks like in action. Hover your mouse over the orange square (if you're on a touchscreen, touch the white part and then drag over the orange square instead):

<p data-height="300" data-theme-id="19831" data-slug-hash="JryyRg" data-default-tab="css,result" data-user="drstearns" data-embed-version="2" data-pen-title="CSS Animations" class="codepen">See the Pen <a href="https://codepen.io/drstearns/pen/JryyRg/">CSS Animations</a> by Dave Stearns (<a href="https://codepen.io/drstearns">@drstearns</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

The `animation` property should be set to a value containing at least the animation name (defined in the `@keyframes` rule) and a duration. Here we use `1s` to specify one second. You can use `s` for seconds, or `ms` for milliseconds (`1000ms` is the same as `1s`).

## Timing Function

By default the animation uses a timing function that is not linear. Instead, it has a slow start, gets faster in the middle, and then slows down again at the end. This is a commonly-used timing function that approximates how physical objects move in the world: they start slow as they build momentum, then slow down again as they lose that momentum. But you can change that to make it linear if you'd like. Just add the keyword `linear` to the end of the value:


```css
/* this rule applies when the user hovers the mouse over
any element with class="animate-me" */
.animate-me:hover {
	animation: fadeOutIn 500ms linear; /* use a linear timing instead of ease timing */
}
```

CSS offers [several pre-defined timing functions](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function), but you can also use the `cubic-bezier()` function to [define your own](http://callmenick.com/post/level-up-your-css-animations-with-cubic-bezier).

## Iterations

By default the animation goes through only one cycle, but you can change that by specifying an [iteration count](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count). You can use the keyword `infinite` to make the animation continue indefinitely.

```css
/* this rule applies when the user hovers the mouse over
any element with class="animate-me" */
.animate-me:hover {
    animation: fadeOutIn 500ms infinite; /* keep animating while the mouse is over the element */
}
```

# 3D Animations

The value of the `transform` property can utilize [several different transformation functions](https://developer.mozilla.org/en-US/docs/Web/CSS/transform), some of which work in three dimensions. This allows you to create 3D animations that appear leap off the page. 

For example, the `rotate3d()` function allows you to rotate an object on its x, y, and z axes in 3D space. You can rotate on just one axis or all three, as this example demonstrates:

```css
@keyframes spin3d {
    from {
        transform: rotate3d(1,1,1,0deg);
    }
    to {
        transform: rotate3d(1,1,1,360deg);
    }
}
```

Here's what it looks like in action. Hover your mouse over the box (on touchscreens, touch the white area and then drag over the box):

<p data-height="300" data-theme-id="19831" data-slug-hash="MEvvGL" data-default-tab="css,result" data-user="drstearns" data-embed-version="2" data-pen-title="CSS Animations 3D" class="codepen">See the Pen <a href="https://codepen.io/drstearns/pen/MEvvGL/">CSS Animations 3D</a> by Dave Stearns (<a href="https://codepen.io/drstearns">@drstearns</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

For 3D animations, you can adjust the perspective using the `perspective()` function, or you can set the `perspective` property on _the parent element_ of the element you are animating. The value is a distance you want the viewer to be away from the element on the Z axis in 3D space, expressed in any distance unit (pixels, inches, centimeters, or even rems). A larger number makes the 3D effect more subtle, as the viewer is farther away from the animated element, while a smaller number makes it more pronounced.

For a fun example of how you can combine multiple elements into a 3D cube with animated rotations, see [David DeSandro's 3D cube](https://desandro.github.io/3dtransforms/examples/cube-02-show-sides.html).


