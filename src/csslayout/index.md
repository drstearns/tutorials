By default, the elements in a web page flow from left-to-right, top-to-bottom. The browser will ensure that all content is visible and if the content is longer than a single line, it wraps to the next line. 

In many cases, this default layout is exactly what you want, but in some cases you may want to break a few elements out of the normal flow. CSS allows us to do this in a number of interesting ways. In this tutorial, I will describe three commonly-used techniques: floated, fixed, and absolute positioning.

## Floated Elements

The first way you can break elements out of the normal flow is to set their `float` property to `left` or `right`. This is commonly done with images, but it can also be done with any element. For example, suppose we had some HTML like this:

```html
<div class="float-demo">
	<img src="img/bunny.jpg" alt="cute bunny">
	<p>Lorem ipsum ...</p>
</div>
```

By default, the browser will render the image on the left side of the window, then do a line break and render the paragraph of text under the image. If you want to have the image appear on the right and have the paragraph text float up and wrap around the image, use CSS like this:

```css
/* select the `img` element within a `class="float-demo"` element */
.float-demo img {
	float: right; /* float it to the right */
}
```

The result looks like this:

<div class="screenshot">
	<img src="img/bunny-sm.jpg" alt="cute bunny" style="float: right">
	<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sapiente velit dolores, voluptate vero et, excepturi illo nam sequi! Obcaecati molestiae numquam expedita repudiandae cumque tempora illo, eaque ipsam, nesciunt quisquam velit vero, laborum reiciendis ad harum corporis vel praesentium eveniet perspiciatis corrupti sequi saepe maiores. Dolorem dolor, nemo maiores hic.</p>
	<p>Mollitia, unde placeat, voluptates quam odio maxime illo deserunt similique pariatur. Quasi magnam reiciendis dignissimos optio veritatis excepturi dolore odio sunt esse ab consequuntur, placeat, unde commodi, repellat ex sit iste minus vel suscipit cupiditate id. Tempore expedita voluptatem iste sed necessitatibus harum adipisci, recusandae laboriosam, sapiente ut voluptatum minima.</p>
	<p>Perspiciatis saepe impedit libero ipsam nostrum molestias sequi cupiditate ipsa perferendis rem. Impedit dolores eveniet ea tenetur aut inventore non voluptas, mollitia error rerum porro nihil obcaecati dicta, maiores suscipit facere velit ipsam voluptatem fugit, recusandae quod hic numquam! Atque aspernatur omnis magni at nemo facilis maiores! Deleniti, reiciendis, vitae.</p>
</div>
<div style="clear:both"></div>

Once you float an element, the browser will lift all of the following elements up and wrap them around the floated element. If you want to stop that behavior at some point and force a new line in the layout, you can set the `clear` property on the element you want to start a new line. You can set `clear` to `right` to clear floats to the right, set it to `left` to clear floats to the left, or `both` to clear both directions.

For example, say we wanted to have only the first paragraph above to wrap around the image, but have the second paragraph start a new line after the image. We can add a CSS rule like this:

```css
/* select the second `p` element within a `class="float demo"` element */
.float-demo p:nth-of-type(2) {
	clear: both; /* clear the float layout */
}
```
The result would look like this:

<div class="screenshot">
	<img src="img/bunny-sm.jpg" alt="cute bunny" style="float: right">
	<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sapiente velit dolores, voluptate vero et, excepturi illo nam sequi! Obcaecati molestiae numquam expedita repudiandae cumque tempora illo, eaque ipsam, nesciunt quisquam velit vero, laborum reiciendis ad harum corporis vel praesentium eveniet perspiciatis corrupti sequi saepe maiores. Dolorem dolor, nemo maiores hic.</p>
	<p style="clear:both">Mollitia, unde placeat, voluptates quam odio maxime illo deserunt similique pariatur. Quasi magnam reiciendis dignissimos optio veritatis excepturi dolore odio sunt esse ab consequuntur, placeat, unde commodi, repellat ex sit iste minus vel suscipit cupiditate id. Tempore expedita voluptatem iste sed necessitatibus harum adipisci, recusandae laboriosam, sapiente ut voluptatum minima.</p>
	<p>Perspiciatis saepe impedit libero ipsam nostrum molestias sequi cupiditate ipsa perferendis rem. Impedit dolores eveniet ea tenetur aut inventore non voluptas, mollitia error rerum porro nihil obcaecati dicta, maiores suscipit facere velit ipsam voluptatem fugit, recusandae quod hic numquam! Atque aspernatur omnis magni at nemo facilis maiores! Deleniti, reiciendis, vitae.</p>
</div>

## Fixed Elements

Another way you can break elements out of the default layout flow is to make them fixed to the **viewport** (i.e., the browser window). Fixed elements don't scroll with the page, so this option is commonly used with components like navigation bars that remain at the top of the viewport, or social media links that remain vertically-centered on the right even as the page is scrolled.

For example, the following example shows how to create a navigation bar that is fixed at the top of the viewport. Scroll the results pane and note how the navigation bar always remains at the top.

<p data-height="300" data-theme-id="19831" data-slug-hash="rzvxXN" data-default-tab="css,result" data-user="drstearns" data-embed-version="2" data-pen-title="Fixed Navbar" class="codepen">See the Pen <a href="https://codepen.io/drstearns/pen/rzvxXN/">Fixed Navbar</a> by Dave Stearns (<a href="https://codepen.io/drstearns">@drstearns</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

To make an element fixed to the viewport, set its `position` property to `fixed`, and then set its `left`, `right`, `top`, or `bottom` properties to indicate where you want it to be anchored. Fixed elements are only as wide as their contents by default, so set `width` or `height` to `100%` if you want the element to stretch across the entire viewport. For example, a status bar fixed to the viewport would have styling like this:

```css
/* select all `nav` elements */
nav {
  position: fixed; /* make it fixed */
  left: 0;         /* starting at the left edge */
  top: 0;          /* starting at the top edge */
  width: 100%;     /* stretching across the entire viewport width */
}
```

Fixed elements are taken out of the layout flow, so they will overlay the elements that follow. To ensure that the next element is visible, add some margin or padding to push it down below the fixed element. As the user scrolls, the non-fixed elements will appear to scroll under the fixed element. 

## Absolutely Positioned Elements

By default, an element's left and top coordinates are determined by the position of its containing element and any sibling elements that proceed it. But with CSS we can absolutely position an element within some containing element, giving it an exact `left` and `top` offset. This is especially useful when building games, as you typically need to position elements precisely in an X/Y coordinate system.

Absolute positioning can also be handy when adding overlay images, such as badges. For example, say we wanted to dynamically overlay a "new" badge on the top-left corner of our cute bunny picture. We could do that using this markup and CSS:

```html
<div class="new-item">
	<img src="img/bunny.jpg" alt="cute bunny">
	<img class="badge" src="img/new.png" alt="new badge">
</div>
```

```css
/* coordinates of elements positioned absolutely 
within `class="new-item"` elements will be relative
to those `class="new-item"` elements */
.new-item {
	position: relative;	
}
/* position the badge absolutely in the top-left corner */
.new-item .badge {
	position: absolute;
	top: 0;
	left: 0;
}
```

<div class="screenshot"><div style="position:relative"><img src="img/bunny.jpg" alt="cute bunny"><img src="img/new.png" alt="new badge" style="position:absolute;top:0;left:0"></div></div>

When you absolutely-position an element, you provide explicit top/left coordinates, but those coordinates need to be relative to some other element. By default, they will be relative to the entire body of the page, but you can change this by setting `position: relative` on any ancestor element of the absolutely-positioned element. Here we set that on a `<div>` that contains both the bunny image and the new badge. The new badge is then positioned absolutely within that `<div>`, so it overlays the bunny image.

We could make this even more automatic by using the [::after CSS pseudo selector](https://www.w3schools.com/cssref/sel_after.asp) to inject the new badge image automatically:

```html
<div class="new-item">
	<img src="img/bunny.jpg" alt="cute bunny">
</div>
```

```css
.new-item {
	position: relative;
}
.new-item::after {
	content: url(img/new.png);
	position: absolute;
	left: 0;
	top: 0;
}
```

Here's a working example:

<p data-height="384" data-theme-id="19831" data-slug-hash="ZJoOjr" data-default-tab="css,result" data-user="drstearns" data-embed-version="2" data-pen-title="Absolute Positioning with Auto Badge Injection" class="codepen">See the Pen <a href="https://codepen.io/drstearns/pen/ZJoOjr/">Absolute Positioning with Auto Badge Injection</a> by Dave Stearns (<a href="https://codepen.io/drstearns">@drstearns</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Use Sparingly

Floated, fixed, and absolutely-positioned elements are powerful tools in your toolbox, but use them sparingly. They can create troubles on small mobile screens, and they may not always behave correctly on obscure platforms. If possible, work with the browser's default layout and not against it.


## More Information

- [float reference](https://developer.mozilla.org/en-US/docs/Web/CSS/float)
- [position reference](https://developer.mozilla.org/en-US/docs/Web/CSS/position)

