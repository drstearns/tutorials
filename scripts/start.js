#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const {spawn} = require("child_process");
const browserSync = require("browser-sync").create();

const srcDir = path.join(__dirname, "../src");
const docsDir = path.join(__dirname, "../docs");
const buildScript = path.join(__dirname, "build.js");

console.log("building tutorials...");
let buildProc = spawn(buildScript);

buildProc.on("close", (code) => {
    if (code !== 0) {
        console.error("build failed");
        return
    }

    console.log("watching %s...", srcDir);
    fs.watch(srcDir, {recursive: true}, () => {
        console.log("rebuilding...");
        spawn(buildScript);
    });

    browserSync.init({
        server: docsDir,
        files: docsDir
    });
});
