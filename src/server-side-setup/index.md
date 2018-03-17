If you are taking INFO 344, or just want to learn Server-Side Web Development by going through these tutorials, you need to install a few tools and sign up for a few accounts. All of these things are free and available on all major platforms (Windows, OS X, and Linux).

## File Management

Building a web server means wrangling a lot of files. If you work with others, coordinating changes to those files is almost impossible without a good version control system (VCS). The most popular VCS these days is git, which is often paired with the repository hosting service GitHub.

- [Install git](https://git-scm.com/downloads).
- [Sign-up for a free GitHub account](https://github.com/join). If you are a student, also sign up for the [GitHub Student Developer Pack](https://education.github.com/) to get free private repositories, and lots of other discounts.

> **Mac Users:** If you're on a Mac, you might want to [install Homebrew](https://brew.sh/) and then use that to install git and other command-line tools. After you install Homebrew, execute `brew install git` to install git. Whenever git releases a new version, you can upgrade using the command `brew upgrade git`.

## Code Editing

Building web servers from scratch requires a good code editor that is optimized for web development. There are many to choose from, and you are free to use any editor you wish (including `vi` 😱 ), but here are a few I recommend:

- [Visual Studio Code](https://code.visualstudio.com/): A free, cross-platform integrative development environment (IDE) from Microsoft that is nicely optimized for web development. It's remarkably good, and comes with just about everything you'd want pre-installed. Interestingly, it's actually a web application: the entire thing is built using HTML, CSS, and JavaScript, yet it still feels very snappy.
- [Sublime Text](http://www.sublimetext.com/): A very fast cross-platform code editor that sells for $70 ([no student discounts](https://www.sublimetext.com/sales_faq), but you can register the license on many machines). It ships with less features than VSCode, but it can be easily extended using the [Package Control](https://packagecontrol.io/) add-in. It's written in C++ so it is much snappier than VSCode and does a better job with large files.
- [JetBrains GoLand](https://www.jetbrains.com/go/): An incredibly powerful IDE optimized for Go development, from the same people who develop IntelliJ IDEA. They charge a yearly subscription fee, but you can get a [free license while you are a student](https://www.jetbrains.com/student/). It's implemented in Java, so it's a little slow to start, and can sometimes feel more sluggish than Sublime or VSCode.

## Standards-Compliant Web Browser with Developer Tools

The various web browsers have become increasingly standards-compliant over the last few years, so you can use just about any browser now. I would recommend [Chrome](https://www.google.com/chrome/) or [Firefox](https://www.mozilla.org/en-US/), as they have very good [developer tools](https://developer.chrome.com/devtools) you can use to debug your HTML, CSS, and JavaScript.

## Go

Install the Go tools and configure a Go workspace. See the [Introduction to Go](../gointro/#secinstallinggo) tutorial for instructions.

## Node.js and Related Utilities

[Install Node.js and NPM](https://nodejs.org/en/download/) so that you can build web servers in Node, and run various Node-based utilities. 

> **Mac Users:** If you're on a Mac, you might want to [install Homebrew](https://brew.sh/) and then use that to install Node.js. After you install Homebrew, execute `brew install node` to install Node.js. Whenever Node releases a new version, you can upgrade using the command `brew upgrade node`.

After installing Node (which includes NPM), also install these other handy utilities that run on top of Node:

- [Live Server](https://github.com/tapio/live-server): starts a local development server for your web clients and automatically refreshes the page whenever the source files change. Install using the command `npm install -g live-server`

## Docker

We will use Docker to not only run things like database servers and message queues on our development machines, but also package and deploy our own servers to production. Like many open-source projects, Docker offers a free "community edition (CE)" as well as an expensive "enterprise edition (EE)" with more features. For this course, and for most open-source work, you only need the free community edition.

Mac and Windows users should install the Docker CE Desktop App for their respective platform:

- [Mac](https://store.docker.com/editions/community/docker-ce-desktop-mac)
- [Windows 10 Professional or Enterprise](https://store.docker.com/editions/community/docker-ce-desktop-windows)

> *Windows 10 Home Edition Users:* please [upgrade to at least the Professional edition](https://ischool.uw.edu/microsoftimagine). The Home edition does not include a native hypervisor, so the current versions of Docker won't run on it. There is an older "Docker Toolbox" that you can use, but it requires installing a Virtual Machine Manager (VirtualBox) and a full Linux VM. It also causes a lot of headaches and is won't be supported in the future. 

These desktop apps install a minimal Linux VM for the Docker daemon process, and use your OSs native hypervisor to run it. You communicate with the daemon process using the command line tools, which run on your host OS, and can be used from your normal terminal application.

Linux users should follow the [install instructions](https://docs.docker.com/engine/installation/#server) for their respective distro.

## Postman

When testing an API that uses HTTP methods other than GET, it's often helpful to have a tool that will let you do that interactively. [Postman](https://www.getpostman.com/) is ideal for that job. Install the full application (not the browser extension), and [get to know what it can do for you](https://www.getpostman.com/docs/).

