#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const {spawn, spawnSync} = require("child_process");
const browserSync = require("browser-sync").create();

const srcDir = path.join(__dirname, "../src");
const docsDir = path.join(__dirname, "../docs");
const buildScript = path.join(__dirname, "build.js");

const spawnOpts = {stdio: "inherit"};

console.log("building tutorials...");
let buildProc = spawnSync(buildScript, [], spawnOpts);

console.log("watching %s...", srcDir);
fs.watch(srcDir, {recursive: true}, () => spawn(buildScript, [], spawnOpts));

browserSync.init({
    server: docsDir,
    files: docsDir
});
