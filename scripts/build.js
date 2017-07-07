#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const htmlMinify = require("html-minifier").minify;
const showdown = require("showdown");
const handlebars = require("handlebars");

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
        replace: '<table class="table">'
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

function isNewer(srcPath, destPath) {
    if (!fs.existsSync(destPath)) {
        return true;
    }
    let srcStat = fs.lstatSync(srcPath);
    let destStat = fs.lstatSync(destPath);
    return srcStat.ctime > destStat.ctime;
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
}

function processHTML(srcPath, destPath) {
    if (isNewer(srcPath, destPath)) {
        let contents = fs.readFileSync(srcPath, "utf-8");
        let minified = htmlMinify(contents, htmlMinifyOpts);
        fs.writeFileSync(destPath, minified, "utf-8");
    }
}

function processImage(srcPath, destPath) {
    //if srcPath is a directory, recurse
    if (fs.lstatSync(srcPath).isDirectory()) {
        processImages(srcPath, destPath);
        return
    }

    //copy file if necessary
    if (isNewer(srcPath, destPath)) {
        fs.createReadStream(srcPath).pipe(fs.createWriteStream(destPath));
    }
}

function processImages(srcPath, destPath) {
    ensureDir(destPath);
    fs.readdirSync(srcPath).forEach(f => {
        processImage(path.join(srcPath, f), path.join(destPath, f));
    });
}

function processTutorial(srcPath, destPath) {
    ensureDir(destPath);

    //if the tutorial has an img directory, process that
    let srcImgDir = path.join(srcPath, "img");
    if (fs.existsSync(srcImgDir)) {
        processImages(srcImgDir, path.join(destPath, "img"));
    }

    let srcTutorial = path.join(srcPath, "index.md");
    let destTutorial = path.join(destPath, "index.html");

    if (isNewer(srcTutorial, destTutorial) || isNewer(templatePath, destTutorial)) {        
        //load the tutorial meta-data
        let meta = require(path.join(srcPath, "meta.json"));
        
        //set the content
        let md = fs.readFileSync(srcTutorial, "utf-8");
        meta.content = mdConverter.makeHtml(md);

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
processHTML(path.join(srcDir, "index.html"), path.join(docsDir, "index.html"));

//process the global images dir
processImages(path.join(srcDir, "img"), path.join(docsDir, "img"));

//process each tutorial directory
fs.readdirSync(srcDir)
    .filter(f => fs.lstatSync(path.join(srcDir, f)).isDirectory() && f !== "img")
    .forEach(dir => processTutorial(path.join(srcDir, dir), path.join(docsDir, dir)));
