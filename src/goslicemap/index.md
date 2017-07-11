In addition to the [simple types](../golang/#secsimpletypes), Go offers two other complex types that are exceedingly useful: slices and maps. In this tutorial I will explain what these types are, how to use them, and clarify the relationship between slices and their underlying storage, which are known as arrays.

## Arrays

To understand slices, you first need to understand arrays. In Go an array is simply a fixed-size contiguous memory buffer divided into equally-sized segments according the array's data type. For example, creating an array of three `uint8` values will allocate a 24-bit memory buffer where each element is 8 bits long. The syntax for creating a fixed-size array looks like this:

```go
//initialize a fixed array of 3 uint8 numbers
//and initialize them all to 255
rgb := [3]uint8{255, 255, 255}
```

If you don't supply values in the initializer, the elements are set to the zero-value for the array's data type:

data type | zero value
----------|------------
any number type | `0`
string | `""` (zero-length string)
bool | `false`
any pointer type | `nil`

After you create an array, you can access the elements by their zero-based index:

```go
r := rgb[0]
g := rgb[1]
b := rgb[2]
```

You can also get the length of the array using the built-in `len()` function:

```go
fmt.Printf("array length is %d\n", len(rgb))
```

Arrays are fixed in size: once you create them, you can't expand them or contract them without allocating a new array and copying the elements to the new array. So arrays are useful only when you need a fixed-size memory buffer or when you know you only need a fixed number of elements. For example, if you are reading 1024 bytes at a time from a file, you can allocate one `[1024]byte{}` array and read chunks into it as you scan the file. Or if you need to store an ordered list of the calendar months, you can safely assume that there are only 12 of them, and thus a fixed-size array would be appropriate:

```go
months := [12]string{"January", "February", "March", "April", 
	"May", "June", "July", "August", 
	"September", "October", "November", "December"}
```

If you need a more flexible ordered list that can expand as you add elements to it, that's what slices are for.

## Slicing Arrays

A slice in Go is like a flexible window into an underlying fixed-size array. A slice is actually a small struct that contains three fields: 

- a pointer to the first element in the underlying array that the slice can see
- the number of elements after the starting element that the slice can see (length)
- the total number of elements available in the array after the starting element (capacity)

For example, we can create a slice from our array of months using this syntax:

```go
//Q1 is a slice of the months array
//viewing just the first three months
Q1 := months[0:3]
```

The slice operator specifies two array element indexes: the first element in the array the slice can see; and the element after the last element the slice can see. In other words, the slice will be able to see the elements from the first index up-to but not including the second index. So the expression `months[0:3]` creates a slice that can see indexes `0`, `1`, and `2`. The expression `months[0:1]` creates a slice that can see only element `0`. The following shows this graphically:

![graphic portrayal of slices](img/slices-1.png)

You can create multiple slices off the same array, and they can also overlap each other:

![graphic portrayal of multiple overlapping slices](img/slices-2.png)

You can also create slices from slices using the same syntax. The expression `Q1[0:1]` returns a slice pointing to the same starting element in the underlying array, but the length of the new slice would be `1` instead of `3`.

If you omit the first and/or last index in the slice operator, the first index defaults to `0` and the last index defaults to the length of the array or slice from which you are slicing. For example the expression `months[9:]` is equivalent to `months[9:len(months)]`.

## Creating and Appending to Slices

Slicing existing arrays is useful, but what if you don't know how many elements you might need? What if you just want an ordered list of elements that automatically grows as you add more elements to it?

Slices combined with the built-in `append()` function provide this kind of functionality. If you don't know how many elements you might need, you can start by just creating a slice, which automatically allocates an underlying array that is hidden from you:

```go
//create a slice of strings with an automatically-allocated
//underlying array that you can't see or reference
names := []string{}
```

The syntax is similar to how you declare a fixed-length array, but you omit the number of elements between the `[]` symbols. The slice will point to an underlying array, but the slice's length will be zero, and its capacity will be the size of that automatically-allocated underlying array.

You can then add new elements to this slice using the built-in `append()` function:

```go
//append takes the slice and the element to add to it;
//it then returns the original slice or a new slice
//if it has to grow the underlying array
names = append(names, "Alice")
names = append(names, "Bob")
names = append(names, "Chang")
```

Note that we re-assign the `names` variable to the return value of `append()`. The underlying array naturally has a fixed length, and it may be full, so the `append()` function might need to allocate a new larger array to hold the new element. If so, the `append()` function will allocate a new larger array, copy the elements from the original array to the new array, and return a new slice pointing to the new underlying array. The old array and slice then fall out of scope and are eventually garbage collected. If the underlying array has a enough capacity to hold the new element, `append()` will simply put the value into the next available element and return the original slice.

## Maps






