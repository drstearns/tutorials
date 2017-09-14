Despite it's name, the JavaScript language was based more on [Scheme](https://en.wikipedia.org/wiki/Scheme_(programming_language)) than it was on Java. Scheme is functional programming language, which is a very different programming paradigm than object-oriented programming. This tutorial will introduce you to what functional programming is all about, and how you can unlock JavaScript's functional programming features.

> **WARNING:** this tutorial assumes you already read the [Introduction to JavaScript](../javascript/) tutorial. If you didn't, you should read it before continuing.

## What Is Functional Programming?

Functional programming is a style of programming that differs from the object-oriented style you might have learned in your introductory computer science courses. In object-oriented programming, we construct programs by modeling the data we will manipulate as a series of interconnected objects, each of which manages some piece of the overall program state. These objects then send messages to each other (i.e., invoke methods) to mutate the state held by each object. The inputs to the program define the initial state (e.g., a file to edit), and the final outputs are the mutated state that is often persisted somewhere (e.g., written back to a file).

In functional programming, we construct programs by combining small, reusable, "pure" functions that transform data. These pure functions have the following qualities:

- they operate only on their inputs, and make no reference to other data (e.g., variables at a higher scope)
- they never modify their inputs—instead, they always return new data or a reference to unmodified inputs
- they have no side effects outside of their outputs (e.g., they never modify variables at a higher scope)
- because of these previous rules, they always return the same outputs for the same inputs

A functional program sends its initial input state through a series of these pure functions, much like a plumbing system sends water through a series of pipes, filters, valves, splitters, heaters, coolers, and pumps. The outputs of the final function become the program's outputs, which are often passed on to another program or persisted.

Advocates of functional programming note that pure functions are easier to test and reason about. Since they have no side-effects, you can simply test all possible classes of inputs and verify that you get the correct outputs. If all of your pure functions are well-tested, you can then combine them together to create highly-predictable and reliable programs.

These advocates also argue that functional programs are easier to read and reason about because they end up looking more [declarative than imperative](../javascript/#secimperativevsdeclarative). A functional program reads like a series of data transformations, the output of each flowing into the next as input. This will become easier to see as I show examples in the next section.

Although some functional programming zealots would argue that all programs should be written in a functional style, it's better to think of functional programming as another tool in your toolbox that is appropriate for some jobs, and not so much for others. Object-oriented programming is often the better choice for long-running, highly-interactive client programs, while functional is a better choice for short-lived programs or servers that handle discrete transactions. It's also possible to combine the two styles: React components can be either object-oriented or functional, and you can use some functional techniques within an object-oriented component.

## Functional Programming in JavaScript

This is all a bit abstract so far, so let's see what this really looks like in practice. Functional programs operate on data, so we will use the following data file as input to our program. 

<https://faculty.washington.edu/dlsinfo/data/babynames_2016.js>

The data in counts for all distinct [baby names registered with the Social Security Administration (SSA) during 2016](https://www.ssa.gov/oact/babynames/limits.html). The file defines one constant named `BABYNAMES`, which is set to an array of 32,868 objects. Each object in the array has the following properties:

- `name`: a first name
- `sex`: a reported sex (the SSA allows only `M` or `F` for this field)
- `count`: the number of baby's registered in 2016 with that name and reported sex

For privacy reasons, baby names with fewer than 5 registrations are omitted from this set. Also note that `sex` refers to biological sex, not gender, and the SSA limits responses to only male or female.

If you include this file in your web page, it will define this constant in the global scope, and your code can then reference it using the name `BABYNAMES`. For example the code `BABYNAMES.length;` will return the length of the array (32,868).

### Filtering

The first thing we might want to do with this array is extract just the objects that meet a particular criteria. For example, we might want to extract the objects where `sex === "M"` or `sex === "F"` into separate arrays so that we can process the male names separately from the female names. To do this, we first need a few functions that test whether the `sex` property of a given record is set to `"M"` or `"F"`.

```javascript
function isMale(record) {
	return record.sex === "M";
}

function isFemale(record) {
	return record.sex === "F";
}
```

Both of these are "pure" functions. They operate only on their inputs, they don't modify those inputs, and they don't have any side-effects. If you hand these functions the same object, they will always return the same results.

We can then use these functions with the built-in `.filter()` method that is available on all JavaScript arrays:

```javascript
let females = BABYNAMES.filter(isFemale);
females.length; // => 18757
let males = BABYNAMES.filter(isMale);
males.length; // => 14111
```

The `.filter()` method takes a function (known as a **predicate function**) as a parameter. It calls that function once for each element in the array, passing that element as the first parameter to the predicate function. If your predicate function returns a [truthy value](../javascript/#secbooleanexpressionsandtruthiness), the element will be included in the output array. If your predicate function returns a falsy value, the element won't be included.

To make this more clear, here is what the body of `.filter()` looks like:

```javascript
//assume `this` is the array upon which .filter() was called
//and `test` is the function passed to .filter() as the first parameter
let output = []; //the array that will be returned
//loop over all elements in the source array
for (let i = 0; i < this.length; i++) {
	let elem = this[i];
	//if the test functions returns something truthy...
	if (test(elem)) {
		//...add the element to the output array
		output.push(elem);
	}
}
//return the output array
return output;
```

As you can see, the `.filter()` method separates the task of iterating over the array from the task of testing whether each element should be included in the output array. The `.filter()` method supplies the first, but delegates the second to the predicate function you pass to it. That predicate function can be as complex as it needs to be, and the `.filter()` method doesn't have to care about its details.

Note that the `.filter()` method is also a pure function: it doesn't modify the array upon which it was called. Instead, it returns a new array containing only the objects that passed the test function.

You may have noticed that the two filter predicate functions above (`isMale()` and `isFemale()`) are very similar: the only real difference is what value they compare the `.sex` property to. Whenever you see something like this, you should ask yourself, "is there a way I can do this with just one function?" Indeed there is. Remember that if you declare a function inside another function, it creates a [closure](../javascript/#secclosures), which allows the inner function to reference parameters and local variables defined in the outer function. So we could write one function that takes the value to compare against as a parameter, and returns a new comparison function one could use with the `.filter()` method.

```javascript
//returns a filter predicate function that 
//compares the .sex property to the value 
//passed as the `sex` parameter
function isSex(sex) {
	//return a new filter test function that...
	return function(record) {
		//...compares the .sex property to the 
		//sex parameter value
		return record.sex === sex;
	};
}

//use isSex() to create separate 
//male/female filter predicate functions
let isMale = isSex("M");
let isFemale = isSex("F");

//use those filter functions
let females = BABYNAMES.filter(isFemale);
```

This code looks a bit more complicated than before, but now we've isolated the way we test the `.sex` property to just one function, and we don't have to duplicate that for each distinct sex. If we discover later on that the data contains both upper and lower-case letters for that field, we can make the adjustment to just one line of code and handle all of the cases. For example:

```javascript
//returns a filter predicate function that 
//compares the .sex property to the value 
//passed as the `sex` parameter
function isSex(sex) {
	//convert parameter to lower case for a 
	//case-insensitive comparison
	let sexLower = sex.toLowerCase();
	//return a new filter test function that...
	return function(record) {
		//...compares the lower-cased .sex property
		//to the lower-cased sex parameter value
		return record.sex.toLowerCase() === sexLower
	};
}
```

### Combining Functions

So far we are filtering on only one property, but what if wanted to filter for male baby names that have a count under 100? We could write a filter predicate function specifically for that, but if we then want to the same thing for female baby names, we'd have to duplicate that with only a small change. Or we could embrace functional programming and realize that this predicate is a combination of two simpler predicates that are useful on their own: `isMale()` and `countUnder100()`. We could write one function that combines two existing predicate functions, regardless of what those predicate functions happen to test, using AND logic.

```javascript
//returns true if count is less than 100
function countUnder100(record) {
	return record.count < 100;
}

//returns a new filter predicate that combines
//the two predicate function parameter using &&
function and(predicate1, predicate2) {
	return function(record) {
		return predicate1(record) && predicate2(record);
	}
}

//create new predicate functions combining
//existing predicate functions with AND logic
let isMaleUnder100 = and(isMale, countUnder100);
let isFemaleUnder100 = and(isFemale, countUnder100);

//use them
let malesWithLowCounts = BABYNAMES.filter(isMaleUnder100);
```

Now you can create filter predicates that are combinations of _any_ two existing predicate functions, including predicates returned from the `and()` function. You could of course implement an `or()` function as well that used `||` instead of `&&`. You could also extend these to handle more than just two predicates at a time, but we need to learn a few other techniques before we can do that.

Lastly, you might already be thinking that the `countUnder100()` function is too specific, and could easily be converted to a more generic `countUnder()` function that takes the upper threshold number as a parameter, and returns a new predicate function. You'd be right:

```javascript
function countUnder(amount) {
	return function(record) {
		return record.count < amount;
	}
}

let countUnder100 = countUnder(100);
let isMaleUnder100 = and(isMale, countUnder100);
```

This approach to combining functions is central to functional programming. It's like building with Legos: the smallest pieces do just one simple and general thing, and you then combine those together to create more specific and sophisticated structures.

### Sorting

Now that we have the ability to filter arrays, we next might want to sort those filtered sets. We already saw a bit of sorting in the [JavaScript Tutorial](../javascript/#secpassingfunctionstofunctions), but let's quickly review how that works. Every JavaScript array has a `.sort()` method, which takes a function (known as a **comparator**) that compares two of the array elements. The comparator function should return a negative number if the first element is less than the second, a zero if they are equal, and a positive number if the first is greater than the second. For example, if we wanted to sort an array of these baby name objects by their `count` property ascending, the comparator function would look like this:

```javascript
function byCount(record1, record2) {
	return record1.count - record2.count;
}
```

And a comparator that sorts by the `name` property would use the [`.localeCompare()` method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare), which is on every string:

```javascript
function byName(record1, record2) {
	return record1.name.localeCompare(record2.name);
}
```

Now that we have these two functions, we can sort any array of these baby names (filtered or not) by these properties. Remember that `.filter()` returns a new array, and since every array has a `.sort()` method, we can simply chain the call to `.sort()` on the end of the call to `.filter()`:

```javascript
//extract all the male names and sort by count ascending
let sortedMales = BABYNAMES.filter(isMale).sort(byCount);
//same thing for female names
let sortedFemales = BABYNAMES.filter(isFemale).sort(byCount);
```

> **WARNING:** the `.sort()` method isn't pure—it actually sorts the array in place and returns a reference to the original array. This is why you'll often see developers filter or map the array first to create a copy of the original array before sorting it. See the [Mapping section](#secmapping) below for an explanation of mapping.

But what if want these sorted descending by count instead of ascending? You might be tempted to write more comparator functions, but the combinations would start to explode. Instead, let's embrace functional programming and realize that a descending sort requires a comparator that simply negates the return value of the ascending comparator: if the ascending comparator returns a negative number, our descending comparator needs to flip that to a positive number, and vice-versa. Thankfully `-0 === 0` in JavaScript, so negating a zero won't hurt anything. We can write this descending comparator as a function that takes another comparator as a parameter and returns a new comparator that negates the result:

```javascript
//`comparator` is a sort comparator function
function descending(comparator) {
	//return a new comparator that...
	return function(record1, record2) {
		//...negates the result of `comparator()`
		return -comparator(record1, record2);
	}
}
```

Now we can wrap any existing comparator with `descending()` to get a descending rather than ascending sort:

```javascript
//extract all the male names and sort by count ascending
let sortedMales = BABYNAMES.filter(isMale).sort(descending(byCount));
```

Notice how our program is starting to look more like a declarative series of high-level operations rather than an imperative series of low-level commands. The data flow through these high-level operations and the output of the last one becomes the output of our program.

Now what if we want to sort by name _within_ count? That is, we want the overall array ordered by `count`, but when there are a bunch of records that all have the same value for `count`, we want those ordered by `name`. This is known as a multi-key sort, and we can enable this with just one additional function:

```javascript
//`comparator1` and `comparator2` are both sort comparator functions
function multiKey(comparator1, comparator2) {
	//return a new comparator that...
	return function(record1, record2) {
		//...runs comparator1 and if the result is 0...
		let result = comparator1(record1, record2);
		if (result === 0) {
			//...returns the result of comparator2 instead
			return comparator2(record1, record2);
		} else {
			return result;
		}
	}
}
```

Like the `and()` function earlier, this function returns a new comparator that combines two existing comparators. It runs the first comparator and if the result is `0` (i.e., the two records are considered equal to each other), it returns the results of the second comparator instead. This will cause the array to be sorted by the first comparator overall, but then by the second comparator within common values for the first.

To sort males names by name ascending within count descending, the function chain would look like this:

```javascript
let malesByNameWithinCount = BABYNAMES.filter(isMale)
	.sort(multiKey(descending(byCount), byName));
```

Note that JavaScript doesn't care if you break that long expression on to multiple lines, and it's typical to do so in functional programing, as the function chains will often get quite long.

### Slicing


### Mapping


### Reducing

























