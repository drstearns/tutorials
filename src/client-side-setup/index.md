If you are taking INFO 343, or just want to learn Client-Side Web Development by going through these tutorials, you need to install a few tools and sign up for a few accounts. All of these things are free and available on all major platforms (Windows, OS X, and Linux).

## File Management

Building a web site or application means wrangling a lot of files. If you work with others, coordinating changes to those files is almost impossible without a good version control system (VCS). The most popular VCS these days is git, which is often paired with the repository hosting service GitHub.

### Install git

If you are on a Mac and have [Homebrew](https://brew.sh/) installed, use it to install git: `brew install git`. Otherwise, [download and run their installer](https://git-scm.com/downloads). After installing, open a new terminal window and use this command to verify that it's working:

```bash
git version
```

If you see a version number, you're good to go. If you get a "command not found" error, something went wrong. Try installing it again and watch for error messages during the install process.

### Sign-Up for GitHub

If you don't already have a GitHub account [sign-up for a free account](https://github.com/join). This will let you create centralized code repositories in the cloud that are always backed-up. Free accounts can only create public repositories, but students can request the [GitHub Student Developer Pack](https://education.github.com/), which gives you free private repositories, and a slew of other discounts.

If you're taking INFO 343, you will use GitHub Classroom to create a private repository for all of your solutions to our challenges. Click the link in the first challenge assignment on Canvas to get started.

## Code Editing

Building web sites and applications from scratch requires a good code editor that is optimized for web development. There are many to choose from, and you are free to use any editor you wish (including `vi` 😱 ), but here are a few I recommend:

- [Visual Studio Code](https://code.visualstudio.com/): A free, cross-platform integrative development environment (IDE) from Microsoft that is nicely optimized for web development. It's remarkably good, and comes with just about everything you'd want pre-installed. Interestingly, it's actually a web application: the entire thing is built using HTML, CSS, and JavaScript, yet it still feels very snappy.
- [Sublime Text](http://www.sublimetext.com/): A very fast cross-platform code editor that sells for $70 ([no student discounts](https://www.sublimetext.com/sales_faq), but you can register the license on many machines). It ships with less features than VSCode, but it can be easily extended using the [Package Control](https://packagecontrol.io/) add-in. It's written in C++ so it is much snappier than VSCode and does a better job with large files.
- [JetBrains WebStorm](https://www.jetbrains.com/webstorm/): An incredibly powerful IDE optimized for web development, from the same people who develop IntelliJ IDEA. They charge a yearly subscription fee, but you can get a [free license while you are a student](https://www.jetbrains.com/student/). It's implemented in Java, so it takes a little while to start, and can sometimes feel more sluggish than Sublime or VSCode.

## Standards-Compliant Web Browser with Developer Tools

The various web browsers have become increasingly standards-compliant over the last few years, so you can use just about any browser now. I would recommend [Chrome](https://www.google.com/chrome/) or [Firefox](https://www.mozilla.org/en-US/), as they have very good [developer tools](https://developer.chrome.com/devtools) you can use to debug your HTML, CSS, and JavaScript.

## Other Helpful Tools

As web development has gotten more complicated, developers have created new tools to handle the complexity. Most of these run under Node.js, which is an engine for running JavaScript at the command-line.

- [Node.js](https://nodejs.org/en/): if you are on a Mac and have [Homebrew](https://brew.sh/) installed, you can use it to install node with the command: `brew install node`. Otherwise, just [download and run their installer](https://nodejs.org/en/).
- [Live Server](https://github.com/tapio/live-server) or [Browser Sync](https://www.browsersync.io/): These are little command-line tools that will auto-reload your browser whenever your source files change. These are insanely handy when doing client-side development, and they will save you a ton of time. Both require [Node.js](https://nodejs.org/en/) to run, and you can install both using `npm`, which comes with [Node.js](https://nodejs.org/en/). Run `npm install -g browser-sync` and `npm install -g live-server` at the command line.
