#!/usr/bin/env node

"use strict";

const path = require("path");
const {spawn, spawnSync} = require("child_process");
const chokidar = require("chokidar");
const liveServer = require("live-server");

const srcDir = path.join(__dirname, "../src");
const docsDir = path.join(__dirname, "../docs");
const buildScript = path.join(__dirname, "build.js");

const spawnOpts = {stdio: "inherit"};

console.log("building tutorials...");
spawnSync(buildScript, [], spawnOpts);

let watcher = chokidar.watch(srcDir, {
	ignored: /(^|[\/\\])\../
});

watcher.on("ready", () => {
	console.log("watching sources...")
	watcher.on("all", (eventName, filePath) => {
		spawnSync(buildScript, [], spawnOpts);
	});
})

liveServer.start({
	root: docsDir
});
