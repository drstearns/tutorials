# Tutorials Framework

This repo contains a general framework for writing tutorials in Markdown that are converted into HTML and merged with a single template. Source code highlighting is also done at build-time. The built tutorials are saved in the `docs/` directory so that you can easily publish them using [GitHub Pages](https://pages.github.com/).

All tutorial source files go into the `src/` directory. Create a new directory under `src/` for each tutorial. Each tutorial must have an `index.md` file for the tutorial content, and a `meta.json` file for meta-data. Currently the meta-data JSON may only have the properties `title` and `subtitle`.

```json
{
	"title": "Title of the Tutorial",
	"subtitle": "Subtitle of the tutorial"
}
```

Common library files go into `src/lib/` and common images go into `src/img/`.

# Template

The common template is in `src/template.html`. This is a simple [Handlebars](http://handlebarsjs.com/) template that is merged with the `meta.json` object from each tutorial directory, with a `contents` property added containing the tutorial contents converted into HTML. The merged and minified page will be saved to `docs/tutorial/index.html`, where `tutorial` is replaced with the name of the tutorial source folder.

# Table of Contents

The table of contents is in `src/index.html`, and it will be minimized into `docs/index.html`. This will be the home page of the GitHub Pages site, so it can be whatever you want it to be.

# Installing Dependencies

After cloning for the first time, run this command from the project root directory to install all dependencies (required Node.js):

```bash
npm install
```

# Building

To rebuild any tutorials that have changed since the last build, run this command:

```bash
npm run build
```

This runs the `scripts/build.js` script.

If the template changes, all tutorials will be rebuilt.

# Watching

Use this command while working on a tutorial:

```bash
npm start
```

This will build the tutorials and run `live-server` on the `docs/` directory. It will also watch the `src/` directory and automatically trigger a build if anything changes. This script is in `scripts/start.js`.
