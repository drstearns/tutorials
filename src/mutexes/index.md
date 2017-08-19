A Go web server processes each new HTTP request on a new **goroutine**, which is an independent thread of execution. These goroutines are multiplexed on top of operating system threads, and if your CPU has multiple cores, several goroutines may be executing simultaneously, in parallel. Even if you have only on CPU core, the goroutines are still executing independently of each other, so the CPU may suspend one goroutine at any time and switch to executing another.

All of this concurrent execution is great for throughput and resource utilization, but it does pose a problem when we want to share complex data structures across multiple HTTP requests, and thus multiple goroutines. For example, if we want to use a single [trie index](../trie) during concurrent requests, multiple goroutines might be executing the code that manipulates the trie node tree at the same time. If we're not careful, we could easily corrupt the node tree.

For example, consider this scenario:

- the web server starts with an empty [trie](../trie/)
- a new request A is received that starts to add a new key `"go"` to the trie
- a new request B is received that starts to add a new key `"git"` to the trie
- request A determines that the root node has no child node for the letter `"g"` and enters the `if` block where it will create a new child and add it to the root node, but it is suspended before it can add the new child
- request B starts to execute, determines that the root has no child node for the letter `"g"`, and completes the `if` block where it creates a new child and adds it to the root node
- request B is suspended and request A resumes execution
- request A is still inside the `if` block, so it creates a new child for `"g"` and tries to add it to the root node

At this point something bad is about to happen. The link to the child node added by request B will probably be overwritten, causing the entire branch under that node to be lost and garbage collected.

A custom structure like a trie is not the only complex data structure in Go that is subject to this problem. **The built-in slice and map types are also not safe for concurrent use**. You cannot share a slice or map between multiple goroutines without risking a race condition resulting in data corruption and loss.

>**Note:** If you only read from a data structure, and never change its state after it is initialized, it is safe to share it between multiple concurrent goroutines. But if you ever write to that structure or do anything with it that could change its state from multiple concurrent goroutines, you must use one of the synchronization features to protect it from concurrent use.

## Synchronization

Preventing this sort of problem requires some way to **synchronize** multiple concurrent threads of execution. Go provides a few different mechanisms for doing that, but the one that would make the most sense for a shared data structure like a trie is a **mutex**, which is short for a "**mut**ual **ex**clusion lock." As the name implies, a mutex provides an exclusive lock that only one goroutine can obtain at a time.

The Go standard library provides two different kinds of mutexes in the `sync` package: a traditional [Mutex](https://golang.org/pkg/sync/#Mutex) with one exclusive lock; and a [RWMutex](https://golang.org/pkg/sync/#RWMutex) with separate read versus write locks. 

## Using a Mutex

A `sync.Mutex` object represents a single mutually exclusive lock. Only one goroutine at a time will be able to obtain the lock. While a goroutine has the lock, all other goroutines attempting to obtain that same lock will be blocked until the mutex is unlocked by the goroutine that has the lock. This effectively allows you to create sections of code that only one goroutine may execute at a time.

For example, say we wanted to implement a simple stack data structure using a Go slice. As noted above, slices are not safe for concurrent use, but we can make them so by wrapping them with another object that also has a mutex.

```go
//Stack represents a stack data structure
//that is safe for concurrent use.
type Stack struct {
	entries []string   //slice for the entries
	mx      sync.Mutex //mutex to protect the slice
}
```

Note how we used lower-case names for the struct fields. This makes them unexported so that code in other packages cannot access them directly. This forces developers using this data structure to use the exported methods, which will ensure the mutex is used to protect the slice.

Next we add `.Push()` and `.Pop()` methods to that struct. Since both of these will manipulate the slice, they must use the mutex to obtain an exclusive lock before referencing the slice, and release that lock when they are done.

```go
//Push pushes a new entry on to the stack
func (s *Stack) Push(entry string) {
	//obtain the exclusive lock
	s.mx.Lock()
	//append the new entry to the slice
	s.entries = append(s.entries, entry)
	//release the exclusive lock
	s.mx.Unlock()
}

//Pop pops the last entry off of the stack
func (s *Stack) Pop() string {
	//obtain the exclusive lock
	s.mx.Lock()
	//use defer to ensure that we release the lock, 
	//regardless of how we exit this function
	defer s.mx.Unlock()
	//if there are no entries, just return ""
	if len(s.entries) == 0 {
		return ""
	}
	//get the last entry in the slice
	e := s.entries[len(s.entries)-1]
	//remove that entry from the slice
	s.entries = s.entries[:len(s.entries)-1]
	//return the entry
	return e
}
```

In the `Push()` method, we obtain the exclusive lock, append the new entry, and then release the lock. Since the mutex is exclusive, this guarantees that only one goroutine at a time will execute the line `s.entries = append(s.entries, entry)`.

Notice that in the `Pop()` method we used the `defer` keyword to ensure that the mutex lock is released, even if we exit the function early in the case of an empty slice. The statement following the `defer` keyword will be executed as we exit the function, regardless of how we exited it.

This `Stack` data structure can now be used by multiple goroutines at the same time without any concerns about data loss or corruption.

## Using an RWMutex

A traditional Mutex is appropriate when you must synchronize all access to your data structure, such as in our Stack example above. But in other cases you may want to allow multiple concurrent readers while still synchronizing writers. In this case, you should use the `sync.RWMutex` instead. 

An `RWMutex` actually has two locks: an exclusive write lock, and a non-exclusive read lock. Multiple goroutines can obtain the non-exclusive read lock at the same time, but only one goroutine can obtain the exclusive write lock at a time, and only if there are no current readers. When a goroutine attempts to obtain the exclusive write lock, it is blocked until the write lock is available **and** all existing readers have released their locks. When an exclusive write lock is pending, new readers are blocked from obtaining new read locks so that the pending writer has a chance to get what it needs. After the writer obtains and releases the exclusive write lock, the new readers are unblocked and are allowed to obtain their read locks.

An `RWMutex` is the better choice when you expect many more read operations than write operations. Since it allows multiple concurrent readers, those more common read operations will happen concurrently, giving you better throughput and performance. When you do need to change the state of your data structure, your code can still obtain an exclusive write lock that synchronizes access while you modify the state.

For example, say we wanted to use a map to cache frequently accessed data, and we wanted to share that map across multiple goroutines. Since maps are not safe for concurrent access, we need to protect it. But since we expect many more read operations than write operations, we should protect it using an `RWMutex` instead of the traditional mutex.

```go
//Cache represents a cache of strings to ints that is
//safe for concurrent use.
type Cache struct {
	entries map[string]int //map to store the entries
	mx      sync.RWMutex   //RWMutex to protect the map
}

//NewCache constructs a new Cache
func NewCache() *Cache {
	return &Cache{
		entries: map[string]int{},
	}
}
```

We start by defining a new struct type like we did with the Stack example, but this time we use a `sync.RWMutex` instead of a `sync.Mutex`. We also define a constructor function, as the entries map must be initialized before it is used.

Next we add `.Set()` and `.Get()` methods to the struct. The `.Set()` method uses the exclusive write lock while the `.Get()` method uses the non-exclusive read lock.


```go
//Set adds a new key and value to the map
func (c *Cache) Set(key string, value int) {
	//obtain an exclusive lock
	c.mx.Lock()
	//set the key/value in the map
	c.entries[key] = value
	//release the exclusive lock
	c.mx.Unlock()
}

//Get retrieves the value for a given key
func (c *Cache) Get(key string) int {
	//obtain a read lock
	c.mx.RLock()
	//use defer to release the read lock
	//as we exit the function
	defer c.mx.RUnlock()
	//return the value from the map
	return c.entries[key]
}
```

Just as in the Stack example, the exclusive lock guarantees that the line `c.entries[key] = value` will be executed by only one goroutine at a time, which is what we want. But the non-exclusive read lock in the `.Get()` method can be obtained by multiple goroutines at the same time, so multiple readers can lookup the value for a key at the same time while there are no writers. Once a writer obtains the exclusive lock, however, calls to `c.mx.RLock()` will block until the writer releases the exclusive lock. Thus the exclusive lock synchronizes both writers and readers.

## A Look Ahead to Channels

Mutexes provide a simple way to protect a single data structure from concurrent use, but they can get hard to reason about as your structure becomes more complicated, or as you combine them with others to create assemblages like job queues with multiple concurrent workers.

For these more complex cases, Go offers another synchronization mechanism called [channels](https://tour.golang.org/concurrency/2). A channel is like a synchronized message box you can use to pass messages safely from one goroutine to another. One goroutine puts a message into the box, and another goroutine reads that message out of the box. The box can accept only one message at a time, or it can be configured to hold multiple messages in a queue. If the box is full, the goroutine writing messages blocks until another goroutine reads a message out of the box. If the box is empty, the goroutine reading messages blocks until a message is written to the box. Thus channels provide a way to not only pass messages safely between goroutines, but also synchronize those goroutines at various points in their execution.

Implementing something like [MapReduce](https://en.wikipedia.org/wiki/MapReduce) or a job queue with multiple worker goroutines is far easier to do with channels than with mutexes. We will see how to do such things in a future tutorial.


