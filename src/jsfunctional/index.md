Despite it's name, the JavaScript language was based more on [Scheme](https://en.wikipedia.org/wiki/Scheme_(programming_language)) than it was on Java. Scheme is functional programming language, which is a very different programming paradigm than object-oriented programming. This tutorial will introduce you to what functional programming is all about, and how you can unlock JavaScript's functional programming features.

> **WARNING:** this tutorial assumes you already read the [Introduction to JavaScript](../javascript/) tutorial. If you didn't, you should read it before continuing.

## Functional Programming

Many students are introduced to programming using either a procedural or object-oriented programming style. Both are imperative styles that involve encoding algorithms into a series of statements that tell the computer exactly what you want it to do, step-by-step. Data and the statements that manipulate it are often mixed together, so much so that it becomes difficult to reuse code across multiple projects.

Functional programming, in contrast, is closer to an declarative programming style. It involves defining a set of "pure functions" that can be combined together in various ways to process data. These pure functions operate only on their inputs and make no reference to other data (e.g., global variables). They also don't modify their inputs—instead, they always return new data based on some calculation done on the inputs, and they produce no side effects (e.g., they don't alter any state at higher scopes). Pure functions are like mathematical formulas: they always return the same output given the same inputs.

A program comprised of pure functions is much easier to unit test. Since each function operates only on its inputs, you can test each function with various kinds of inputs and be assure that it is working correctly.

The pure functions can also be combined together to accomplish any sort of data processing you might need, and the resulting code looks more like a declarative set of transformations than an imperative set of statements. Many people argue that functional programs are easier to read and reason about, resulting in fewer bugs.

## Functional Programming in JavaScript

This is all a bit abstract, so let's see what this really looks like in practice.
