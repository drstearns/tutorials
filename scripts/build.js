#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const htmlMinify = require("html-minifier").minify;
const showdown = require("showdown");
const handlebars = require("handlebars");
const moment = require("moment");

var Prism = require('prismjs/components/prism-core.js');
require('prismjs/components/prism-markup.js');
require('prismjs/components/prism-clike.js');
require('prismjs/components/prism-css.js');
require('prismjs/components/prism-javascript.js');
require('prismjs/components/prism-http.js');
require('prismjs/components/prism-bash.js');
require('prismjs/components/prism-json.js');
require('prismjs/components/prism-go.js');
require('prismjs/components/prism-docker.js');
require('prismjs/components/prism-yaml.js');
require('prismjs/components/prism-sql.js');

const codeRegExp = /<pre>\s*<code\s*class="([^"]+)">([^<]*)<\/code>\s*<\/pre>/g;

const htmlMinifyOpts = {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true
};
const showdownTableExtension = function() {
    return [{
        type: 'output',
        regex: '<table>',
        replace: '<table class="table is-striped">'
    }];
};
const mdConverter = new showdown.Converter({
    omitExtraWLInCodeBlocks: true,
    prefixHeaderId: "sec-",
    parseImgDimensions: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tables: true,
    extensions: [showdownTableExtension]
});

const srcDir = path.join(__dirname, "../src");
const docsDir = path.join(__dirname, "../docs");

const templatePath = path.join(srcDir, "template.html")
const template = fs.readFileSync(templatePath, "utf-8");
const mergeWithTemplate = handlebars.compile(template);

const sharedCSS = fs.readFileSync(path.join(srcDir, "shared.css"), "utf-8");

function isNewer(srcPath, destPath) {
    if (!fs.existsSync(srcPath)) {
        return false;
    }
    if (!fs.existsSync(destPath)) {
        return true;
    }
    let srcStat = fs.statSync(srcPath);
    let destStat = fs.statSync(destPath);
    return srcStat.ctime > destStat.ctime;
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
}

function processIndex(srcPath, destPath) {
    if (isNewer(srcPath, destPath)) {
        let contents = fs.readFileSync(srcPath, "utf-8");
        let mergeIndex = handlebars.compile(contents);
        let merged = mergeIndex({sharedCSS: sharedCSS});
        let minified = htmlMinify(merged, htmlMinifyOpts);
        fs.writeFileSync(destPath, minified, "utf-8");
    }
}

function copyTree(srcPath, destPath) {
    ensureDir(destPath);
    fs.readdirSync(srcPath).forEach(f => {
        let srcFilePath = path.join(srcPath, f);
        let destFilePath = path.join(destPath, f);
        if (fs.statSync(srcFilePath).isDirectory()) {
            copyTree(srcFilePath, destFilePath);
        } else {
            if (isNewer(srcFilePath, destFilePath)) {
                fs.createReadStream(srcFilePath).pipe(fs.createWriteStream(destFilePath));
            }            
        }
    });
}

function highlightCode(html) {
    return html.replace(codeRegExp, (match, className, code) => {
            //showdown sets the class attr to be "go language-go"
            //so split on space and use the first element
            let languageName = className.trim().split(" ")[0];
            
            //if language is empty or "nohighlight" just return the match
            if (languageName.length === 0 || languageName === "nohighlight") {
                return match;
            }

            //lookup the grammar and warn if it's missing
            let grammar = Prism.languages[languageName]
            if (!grammar) {
                console.error("WARNING: Prism language '%s' not found. Make sure you require all languages you use", languageName)
                //default to generic markup
                grammar = Prism.languages.markup;
            }

            //de-entitize the code so that prism highlights it correctly
            code = code.replace(/&amp;/g, "&");
            code = code.replace(/&lt;/g, "<");
            code = code.replace(/&gt;/g, ">");
            
            return `<pre class="language-${languageName}"><code class="language-${languageName}">${Prism.highlight(code, grammar)}</code></pre>`;
    });    
}

function processTutorial(srcPath, destPath) {
    ensureDir(destPath);

    //if the tutorial has an img directory, process that
    let srcImgDir = path.join(srcPath, "img");
    if (fs.existsSync(srcImgDir)) {
        copyTree(srcImgDir, path.join(destPath, "img"))
    }

    let srcTutorial = path.join(srcPath, "index.md");
    let srcMeta = path.join(srcPath, "meta.json");
    let destTutorial = path.join(destPath, "index.html");

    if (!fs.existsSync(srcTutorial)) {
        return;
    }

    if (isNewer(srcTutorial, destTutorial) || isNewer(templatePath, destTutorial) || isNewer(srcMeta, destTutorial)) {        
        //load the tutorial meta-data
        let meta = {title: "Untitled", subtitle: "add a meta.json file to your directory"};
        try {
            meta = require(srcMeta);
        } catch(err) {
            console.error("error loading %s: %s", srcMeta, err)
        }

        //default author
        meta.author = meta.author || {name: "Dave Stearns", url: "https://ischool.uw.edu/people/faculty/dlsinfo"};

        //set last edited time
        meta.lastEdited = moment(fs.statSync(srcTutorial).mtimeMs).format("ll");

        //set the content
        let md = fs.readFileSync(srcTutorial, "utf-8");
        let html = mdConverter.makeHtml(md);
        meta.content = highlightCode(html);

        //set shared CSS
        meta.sharedCSS = sharedCSS;

        //merge and minify
        let merged = mergeWithTemplate(meta);
        let minified = htmlMinify(merged, htmlMinifyOpts);
        
        //write to destination
        fs.writeFileSync(destTutorial, minified, "utf-8");
    }
}

//ensure docs directory exists
ensureDir(docsDir);

//process the table of contents page
processIndex(path.join(srcDir, "index.html"), path.join(docsDir, "index.html"));

//process the global _img and _lib dirs
copyTree(path.join(srcDir, "_img"), path.join(docsDir, "_img"));
copyTree(path.join(srcDir, "_lib"), path.join(docsDir, "_lib"));

//process each tutorial directory
fs.readdirSync(srcDir)
    .filter(f => fs.statSync(path.join(srcDir, f)).isDirectory() && f !== "img" && f !== "lib")
    .forEach(dir => processTutorial(path.join(srcDir, dir), path.join(docsDir, dir)));
