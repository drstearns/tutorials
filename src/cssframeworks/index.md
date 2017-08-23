In the [Essential CSS](../css/) and [Responsive CSS](../responsive/) tutorials, you learned how to write style rules that change the appearance of your web pages. Although you could implement a entire site with only custom style rules, most professionals build upon a well-tested **CSS framework** instead. A CSS framework is a stylesheet that does the following for you: 

- **Normalizes browser default styling:** most frameworks just include [normalize.css](https://necolas.github.io/normalize.css/) at the start of their stylesheet, and others include something like it.
- **Applies consistent and attractive formatting to all HTML elements:** your pages will instantly look better thanks to a bunch of style rules utilizing element selectors. Default fonts, line spacing, margins, padding, and link styling are all applied as soon as you add the framework's stylesheet to your page.
- **Defines several style classes you can use for common UI components:** the framework stylesheet includes classes you can add to your markup to create badges, alerts, cards, responsive navigation bars, tabs, drop-down buttons, tool tips and popovers, sliders, switches, carousels, etc. They also typically define classes for multi-column layouts.

The important thing to realize is that **a CSS framework is just a stylesheet with a bunch of rules that someone else wrote for you**. There's nothing magic about it. You can look at the stylesheet and see all the rules that are defined in there, and it's all stuff you could have written yourself (though some of it can get quite advanced). But those rules have been crafted by professionals and tested on a wide array of browsers to ensure consistent results, so it's a good idea to build on top of them.

## Popular CSS Frameworks

There are several popular CSS frameworks to choose from. All of them provide beautiful formatting of HTML elements, pre-defined responsive multi-column layout grids that work on all the popular browsers, and many of the common UI elements you see on most web sites.

### Bootstrap

The most commonly-used CSS framework on the web is [Bootstrap](http://getbootstrap.com/). It was originally created at Twitter to enforce some consistency among their internal tools, but after they released it as an open-source project in 2011, it became *very* widely used. That wide use has benefits and drawbacks: it's very well tested, documented, and supported, but it's also so prevalent that it's default look has become cliché. Thankfully, their newest release (version 4, which is currently in beta) has an updated look, and makes it relatively easy to make your own [customized build](https://getbootstrap.com/docs/4.0/getting-started/options/). Version 4 also incorporates a grid based on the new [flexbox standard](../flexbox/).

### Foundation

Bootstrap's chief rival is [Foundation](http://foundation.zurb.com/). It has the reputation of being more ahead-of-the-curve than Bootstrap, introducing new features sooner. They were the first framework to use a responsive mobile-first design, and they incorporated a [flexbox-based responsive grid](http://foundation.zurb.com/sites/docs/flex-grid.html) long before Bootstrap did. Foundation has most of the same UI elements as Bootstrap, but with a different default look at feel, which can also be [customized](http://foundation.zurb.com/sites/download.html/#customizeFoundation) to match your own branding through an easy web-based tool.

### Material Components for the Web

Bootstrap and Foundation defined their own visual design language, but if you are a fan of Google's [Material Design](https://material.google.com/) instead, there are a few CSS frameworks based upon that. The official Google implementation is known as [Material Components for the Web](https://material.io/components/web/), or MCW for short. Material Design is *very opinionated* so MCW is very difficult to customize. The MCW style class names are also *very verbose*, as they follow the [Block, Element, Modifier](https://en.bem.info/methodology/) (BEM) naming method.

### Materialize

The other popular Material Design implementation is [Materialize](http://materializecss.com/). This is an open-source project, so it's not provided nor supported by Google. Regardless, a lot of people use it, primarily because it's easy to learn if you are coming from Bootstrap.

## Adding a Framework to your Page

Each framework has a "getting started" page that describes your various options for adding the framework to your HTML page. Nearly all of them will let you link to their production files on a Content Delivery Network (CDN), download them as a zip file, or add them to your project via a package manager like `npm` or `bower`. Each method has its benefits and drawbacks.

### Linking to a CDN

Linking to a CDN is a very easy option that has several benefits. The first is **simplicity**. For example, linking to Bootstrap's version 4 beta files on a CDN is as simple as adding these elements to the `<head>` section of your web page:

```html
<!-- Bootstrap stylesheet -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">

<!-- Bootstrap JavaScript files, which are only necessary if you use the interactive components -->
<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js" integrity="sha384-b/U6ypiBEHpOf/4+1nzFpr53nxSS+GLCkfwBdFNTxtclqqenISfwAzpKaMNFNmj4" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js" integrity="sha384-h0AbiXch4ZDo7tp9hKZ4TsHbi047NrKGLO3SEJAg45jXxnGIfYzk4Si90RDIqNm1" crossorigin="anonymous"></script>
```

>Note that this loads version 4 Beta specifically. Always check the [Bootstrap Getting Started page](https://getbootstrap.com/docs/4.0/getting-started/introduction/#quick-start) to get the elements for their most current version.

Simplicity is one benefit, but **download speed** is another. Content Delivery Networks are a set of web servers that can deliver commonly-requested content very quickly all over the world. CDNs replicate their content to machines in several regions of the world, and use dynamic Domain Name Service (DNS) resolution to steer users to the machine nearest them. So a user in Australia might download the Bootstrap CSS from a server located in Singapore, while a user in France might get the same CSS file from a server located in Ireland. Although it may seem like the Internet is instantaneous, dragging files halfway around the world is still relatively slow. If the files are large, it can create a noticeable delay.

Another reason that CDNs increase download performance is **browser caching**. If multiple sites all use the CDN version of Bootstrap, then the browser only has to download that file the first time you visit one of those sites. The browser can then reuse the previously downloaded file for all other sites that link to the same URL. With popular frameworks like Bootstrap, it's highly likely that your user has already visited a site that links to Bootstrap's CDN version, and thus the Bootstrap CSS and JavaScript are already in the user's browser cache.

Another benefit is **dynamic patching**. If the developers of your framework discover a bug that can be patched without breaking existing code, they can re-release the patched file to the CDN. Your users' will automatically pick it up the next time they visit your site without you having to make any code changes. Some developers see this more as a potential danger than a benefit, as it relies on the framework developers being disciplined about renaming the file paths if they make breaking changes.

The only real drawback of linking to a CDN is that it won't work when you are offline. If you commonly do your development offline, or if you are building a web application that is meant to run offline, you must download the CSS framework files into your project directory using one of the other two methods.

### Downloading a Zip

The second method for adding a CSS framework is downloading the files as a zip and unpacking them into your project directory. As noted above, one primary benefit of this approach is that the framework files will be **available even when you are offline**. 

A second potential benefit is that framework sites often let you customize the contents of the zip, adjusting fonts, colors, etc. For example, Foundation's [customize page](http://foundation.zurb.com/sites/download.html/#customizeFoundation) allows you to select only the components you need, and adjust base styling properties before downloading your customized zip file.

A third benefit is realized if you use the [Sass](http://sass-lang.com/) or [Less](http://lesscss.org/) CSS pre-compilers. These tools extend the CSS syntax to include features found in most other programming languages: variables, functions, inheritance, includes, mix-ins, etc. Most CSS frameworks are built using one of these two pre-compilers, and their **source files are commonly included in the downloaded zip**. You can then refer to these source files directly in your own Sass or Less code, including only the parts of the framework you actually plan on using. You can also override their standard fonts, colors, sizes, etc., simply by resetting their variables.

A fourth benefit is realized if you use a build system like gulp or webpack. It's common to link your HTML page to both your CSS framework's stylesheet and a few of your own, but this will result in one network round-trip per CSS file. If you download the framework's stylesheet, you can concatenate it with your own stylesheets, creating only one CSS file to download. This can enhance the page load experience, especially on slower mobile networks.

There are two main drawbacks to this method. First, it **adds large framework files to your code repository** that could easily be downloaded from the web as needed. Second, these **zips may not include other libraries that the framework depends upon**. To eliminate both of these drawbacks, use a package manager.

### Using a Package Manager

Package managers are command-line programs that consult online directories of available packages, find all other packages a given package depends upon, and download all of them to a subdirectory within your project directory. They also commonly record the set of packages your program is using in a special file that you can add to your project's code repository. This takes the guess-work out of determining the set of packages you need for a given framework, and makes it really simple for a new developer joining your project to get all the packages your project needs in order to run.

In the web development space, the most commonly-used package managers are [`npm`](https://www.npmjs.com/) and [`bower`](https://bower.io/). The former was originally created for the server-side Node.js environment, while the latter was a fork of the former, adjusted for the special needs of client-side web development projects. Since then, `npm` has expanded to include both server and client-side packages, so these days you can just use `npm` in most circumstances.

Let's see how we can use `npm` to install the Bootstrap CSS framework. The `npm` command is installed with Node.js, which you should have installed during the [Getting Setup](../client-side-setup/) tutorial:

To use `npm` in a project, you first run this command **within your project directory** to create the file it uses to track meta-data about your project, including the packages your project depends on:

```bash
npm init -y 
```

This creates a file named `package.json` to capture all the meta-data about your project. You should [add, commit, and push](../git/) this file to your code repository.

You can then install Bootstrap's files, and record your dependency upon it using this command:

```bash
npm install --save bootstrap@4.0.0-beta jquery popper.js
```

This will download the files for the Bootstrap, jQuery, and popper.js packages to a new directory named `node_modules`. You can then include them in your page by adding these elements to your `<head>` section:

```html
<!-- Bootstrap css file -->
<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
<!-- jQuery JavaScript library -->
<script defer src="node_modules/jquery/dist/jquery.slim.min.js"></script>
<!-- popper.js JavaScript library -->
<script defer src="node_modules/popper.js/dist/popper.min.js"></script>
<!-- Bootstrap JavaScript library -->
<script defer src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
```

Note that the URLs in the `href` attributes are no longer absolute URLs pointing to a CDN. Instead they are relative URLs pointing to a sub-directory named `node_modules`. This directly will need to be on your web server so that the server can send these files to the user's browser. 

When new developers join your project, they can quickly install all the packages listed in the `package.json` file, as well as all of their dependencies, using this one command:

```bash
npm install
```

Because this simple command will install the packages on-demand, it's customary to add the `node_modules` directory to your [.gitignore file](../git/#secaddagitignorefile). That way the files in that directory won't be added to your repository. The only exception to this rule is if you are using **GitHub pages** to host your site. If so, the `node_modules` directory must be added to your repo so that GitHub pages can serve the files to the browser.

> **NOTE:** If you are publishing a site using GitHub Pages, you **must** add the `node_modules` folder to your repository so that it will be available on the server. If you are publishing your site somewhere else, you can list `node_modules` in your `.gitignore` file to keep it out of your repo.

You can also use `npm` to upgrade packages, or remove them from your project. See the [npm documentation](https://docs.npmjs.com/) for more details.

### Which is Best? CDN or Download?

If you ask a group of developers which is the better approach—linking to a CDN or downloading via a package manager—you'll probably start a very heated debate. It's kind of like the [spaces *v.* tabs](https://www.youtube.com/watch?v=SsoOG6ZeyUI) debate. Each method has its benefits and drawbacks, and neither option is clearly superior to the other. But choose you must, and your choice should be something you stick with. The one thing you don't want to do is mix the two approaches in one project.

If you are new to web development and can't decide which approach to use, link to the CDN version. It's simple and the lack of offline support probably won't affect you much.


## Adjusting the Defaults

Once you include a CSS framework's stylesheet on your page, you might find cases where you want to adjust a few of the framework's settings. You can do this quite easily without altering the framework itself. Recall that you can add multiple stylesheets to a single HTML page, and those added later can override settings made by those added earlier.

For example, say you wanted to use Bootstrap, but wanted to alter their default font stack. Add the Bootstrap stylesheet first, followed by a stylesheet of your own that resets the `font-family` property on the `body` element:

```html
<!-- HTML File -->
<head>
	<!-- Bootstrap stylesheet -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">

	<!-- Open Sans font from Google Fonts -->
	<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">

	<!-- our own stylesheet, which can override settings made by Bootstrap -->
	<link rel="stylesheet" href="css/styles.css">	
</head>
```

```css
/* CSS File */
body {
	font-family: "Open Sans", -apple-system, system-ui, "Segoe UI", "Helvetica Neue", Arial, Helvetica, sans-serif;
}
```

## Containers

Most of the frameworks will define a style class that acts as a container for content in a page or section. These containers usually have a fixed or maximum width, so that your line lengths don't get ridiculously long on wide desktop monitors, and they horizontally-center themselves if the viewport is wider than their max width. They also typically add a little padding around the content so that it's not right up against the edge of the viewport on narrow mobile screens.

If you want your background color or image to stretch "full bleed" (i.e., to the edges of the viewport) but keep the content with a section constrained, use one of these container classes. For example, here's what the markup would look like using Bootstrap's `container` style class:

```html
<section>
	<div class="container">
		<h2>Section Title</h2>
		<p>...</p>
	</div>
</section>
```

<p><a href="https://codepen.io/drstearns/pen/brKKBK" class="button is-primary">Open in CodePen</a></p>

If you set a `background-color` or `background-image` on the `section` element, it will stretch full bleed, but the content within the `<div class="container">` element will be constrained in width on wide screens.

Bootstrap also defines a `container-fluid` style class that doesn't constrain the width, but still adds a bit of padding. Use this when you want your content to stretch almost full-bleed.

## Responsive Grids

Most CSS frameworks also define a set of style classes to create [responsive multi-column grid layouts](https://getbootstrap.com/docs/4.0/layout/grid/). In the past, these used complex floats and clears that were very tricky to make work consistently across all browsers, so using a well-tested framework was a smart idea. These days the framework style classes are just thin wrappers on the [flexbox](../flexbox/) standard, so they are less necessary than they were in the past, but they do save you some time.

For example, the responsive four-column layout we built in the [flexbox](../flexbox/) tutorial could be done using just Bootstrap style classes:

```html
<div class="container">
	<div class="row">
		<div class="col-sm">...</div>
		<div class="col-sm">...</div>
		<div class="col-sm">...</div>
		<div class="col-sm">...</div>
	</div>
</div>
```

Bootstrap uses `row` to start a flexbox, and `col-sm` for elements that should be stacked on narrow mobile screens, but become side-by-side columns on "small" screens and wider (defined as `576px` and wider). Alternatively, you can use `col-md` to make them side-by-side on screens `768px` and wider, `col-lg` for screens `992px` and wider, or `col-xl` for screens `1200px` or larger.

A Bootstrap `.row` element must always be a direct child of a `.container` or `.container-fluid` element, as shown above. This is due to the way they add and remove padding to handle the various ways you can use these style classes. The container adds a bit of padding, the row removes that padding, and the columns add it back again. This might sound strange, but the reason they do this is because you can nest grids within grid cells, just as you can [nest flexboxes within flexboxes](../flexbox/#secnesting). For example, a `.col-sm` cell can contain a `.row` element with more `.col-sm` elements. Since all columns adds some padding, the nested row must remove it from the parent column. If the row didn't remove the padding added by the parent cell, the first nested column would add more padding, creating twice as much white space as normal.

Just as with flexbox, you can specify relative or exact widths on the columns, and CSS frameworks like Bootstrap define a few style classes for you with common widths. Bootstrap divides the row into 12 equal segments, and defines classes that let you size a column to consume any number of those segments. For example, adding the style class `col-sm-6` to a column element would cause it to take up half the row on small screens and wider (6 out of 12 segments), while `col-md-4` would cause it to take up a third of the row on medium screens and wider (4 out of 12 segments).

These style classes can be combined on the same element to create the same sort of multi-breakpoint responsive layout we created later in the [Flexbox Tutorial](../flexbox/). For example, a four-column Bootstrap grid that is stacked on mobile, two-by-two on small screens, and four-by-one on medium screens and wider can be done with HTML like this:

```html
<div class="container">
	<div class="row">
		<div class="col-sm-6 col-md-3">...</div>
		<div class="col-sm-6 col-md-3">...</div>
		<div class="col-sm-6 col-md-3">...</div>
		<div class="col-sm-6 col-md-3">...</div>
	</div>
</div>
```

<p><a href="https://codepen.io/drstearns/pen/XaYBXp" class="button is-primary">Open in Code Pen</a></p>

For more details on Bootstrap's grid system, see their [Grid documentation page](https://getbootstrap.com/docs/4.0/layout/grid/).

## UI Components

CSS frameworks also define style classes for various kinds of components you often see in web user interfaces: badges, alerts, cards, responsive navigation bars, tabs, drop-down buttons, tool tips and popovers, sliders, switches, carousels, etc. These make it easy and quick to build sophisticated and attractive-looking UIs.

For example, basic HTML buttons are very ugly; they look like this:

<div class="screenshot"><button type="button">Click Me!</button></div>

A CSS framework adjusts the styling to make them look much more attractive, and often adds subtle hover and click effects:

<div class="screenshot"><button type="button" class="button is-primary">Click Me!</button></div>

CSS frameworks also define new components that don't have a direct HTML equivalent. For example, an in-page notification that you want users to notice would look like this:

<div class="screenshot">
	<div class="notification is-danger">Something went wrong! Pay attention to me!</div>
</div>

Cards are another component you commonly see in CSS frameworks now that Google has made them popular. In Bootstrap 4, the [required markup for a card](https://getbootstrap.com/docs/4.0/components/card/) is quite simple, but flexible. A basic card requires HTML like this:

```html
<div class="card">
	<img src="..." alt="card image" class="card-img-top">
	<div class="card-body">
		<h4 class="card-title">A Card Title</h4>
		<p class="card-text">Some card text that appears below the card title.</p>
		<a href="#" class="card-link">Action Link 1</a>
		<a href="#" class="card-link">Action Link 2</a>
	</div>
</div>
```

<p><a href="https://codepen.io/drstearns/pen/yoEqRM" class="button is-primary">Open in CodePen</a></p>

You can of course customize the content within the `.card-body` element, adding icons or other HTML content. The links at the bottom can be styled as hyperlinks or buttons: just add the style classes `btn btn-primary` to make them look like buttons instead.

## Static vs Interactive Components

Buttons, alerts, and cards are examples of static components that only require the CSS file from the framework, as they only need the style classes defined in the stylesheet. Other components in the framework do require a bit of JavaScript in order to respond to mouse clicks and other events. These interactive components require the framework's JavaScrpt files, as well as any other JavaScript libraries the framework depends upon.

For example, Bootstrap defines an interactive modal dialog component that you can add to your page using markup like this:

```html
<!-- note that the `id` attribute is set to "exampleModal" -->
<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">Some content shown in the body of the modal</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>
```

To open the modal when the user clicks a button, create a `<button>` element with a few extra `data-` attributes:

```html
<!-- data-toggle must be set to "modal" and data-target must be set to 
the value of the `id` attribute on the element that starts your modal markup -->
<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">Open the Modal</button>
```

<p><a href="https://codepen.io/drstearns/pen/dzKqNB" class="button is-primary">Open in CodePen</a></p>

Bootstrap's JavaScript file looks for elements with these `data-toggle` and `data-target` attributes, adds click event listeners, and automatically shows the target modal dialog when those elements are clicked. It also dismisses the dialog when the user clicks a button in the modal with the `data-dismiss="modal"` attribute.

The JavaScript included with these CSS frameworks can be handy, but a word of warning: **they do not play well with more advanced JavaScript frameworks like React**. When we get to learning React, you will need to switch to libraries like [reactstrap](https://reactstrap.github.io/), which use the Bootstrap 4 CSS stylesheet, but re-implement the JavaScript portions to fit into the React framework.

## More Information

Each of the popular CSS frameworks has complete documentation with lots of examples. To dive deeper, pick a framework and start reading!

- [Bootstrap Documentation](https://getbootstrap.com/docs/4.0/getting-started/introduction/)
- [Foundation Documentation](http://foundation.zurb.com/sites/docs/)
- [Materialize Documentation](http://materializecss.com/getting-started.html)
- [Material Components for the Web Documentation](https://material.io/components/web/docs/)

