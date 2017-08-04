Anyone can learn to hack together an information system that works for one version, but building a system that continues to run reliably over many releases and years requires learning not only a good architecture, but also the discipline of automated testing. In fact, the thing that separates professional from amateur developers the most is a commitment to writing automated tests for their features.

As your project grows in size and complexity, a suite of automated tests will help you ensure that small bug fixes or changes made for new features don't break your existing functionality. If your tests are complete (i.e., they exercise all of your code paths by test both success and failure cases), you can make changes and release new versions with confidence.

If you do it right, your test code will actually be longer than your feature code. For example, [the SQLite library has 730 times more automated test code than feature code](https://www.sqlite.org/testing.html). They can fix bugs or make changes to their most core code yet know within a few minutes that the features their users depend upon are still functioning as expected. Before releasing a new version, they run all of their tests on multiple platforms, with multiple build configurations. Doing all that testing manually would be unthinkable.

## What are Automated Tests?

An automated test is just another program that calls your feature code, passing various kinds of inputs, and testing the outputs to ensure they are what you expect them to be. These programs should test both valid and invalid inputs, and if possible, trigger unusual error conditions to ensure that the feature code handles them properly. 

Ideally, your tests should invoke every line of your feature code at some point. The percentage of lines invoked is known as your **code coverage**, and it should be as high as possible. In some cases you can achieve 100%, but in others there will be code paths that are run only when very unexpected errors occur that your tests can't fabricate.

You can write automated tests in any language, but some languages offer specialized tools or environments for writing and running these tests. For example, Go defines a way to write automated tests that are automatically excluded from your compiled executable, but can be run at development time using their `go test` tool. This tool also provides [code coverage analysis](https://blog.golang.org/cover), showing you exactly which lines were exercised by your tests, and which were not. In the Node.js ecosystem, the tool [mocha.js](https://mochajs.org/) is often used to run tests.

## Levels of Testing

We can write automated tests at several levels: individual functions or classes in isolation; groups of integrated components; or entire systems running like they will in production.

### Unit Tests

The most common automated tests are those that test functions or classes in isolation. These are known as **unit tests**, as they are testing just one unit of the system at a time. These tests should be as exhaustive as possible, and cover all code paths. 

These tests are often written in a data-driven style: you define multiple sets of input parameters and expected outputs, and then iteratively test each input/output pair. As you discover new possible input combinations, you just add those to the list, and the testing code automatically tests them. See [below](#secwritingtestsingo) for an example of this in Go.

### Integration Tests

Once you know that your system units are working in isolation, you then can test how they behave when they are integrated with other units into a sub-system. This is also where you test how your own units interact with code written by other people: for example, reusable libraries, database management systems, or the operating system. These are known as **integration tests**, as you are testing how your code units integrate with other code. 

Integration tests are less about exhaustively testing input and outputs, and more about testing how units interact through a transaction flow. For example, a code module you write to manage user accounts in a DMBS (a user store) will expose several functions, and you will test those functions in isolation in your unit tests, but in your integration tests you will ensure that the functions work correctly together in a typical Create/Read/Update/Delete (CRUD) cycle. Your integration test would do the following:

- create a new record
- read the record and ensure it was saved correctly
- update the record
- read it again to make sure it was actually updated
- delete it
- ensure that you can no longer read it

Integration tests verify the dependencies _between_ units, and thus can reveal errors that the unit tests miss. For example, if you added local caching to your user store to increase performance, but forgot to invalidate or patch the cache entry when the user record is updated, your integration test will catch it while your unit tests probably won't.

To run a test like this, your will naturally have to talk to the DBMS, but in many languages you can create a *mock implementation* of the DBMS so that your tests are easier to run. A mock implements the same interface as the DBMS client library, but uses a simple in-memory data store instead of talking to the actual database server. When using a mock, developers don't need to have the DBMS running locally in order to run the tests, and your tests aren't affected by data that might already be in the DBMS. Mocks also make it easier to trigger unusual runtime errors that might be impossible to trigger when using the actual DBMS, so they can help you achieve a higher code coverage ratio.

### System Tests

Both unit and integration tests focus on one piece of your system at a time, but **system tests** are meant to test your entire system in a context similar to production. For example, a unit test for a web server handler function would just invoke the function directly, but a system test for a web server would actually start the server and it's dependencies (ephemeral and persistent DBMSs, message queues, etc.), and then send real HTTP requests to the server, evaluating the HTTP responses.

System tests can uncover problems that would occur only in a production environment. For example, a system test could uncover issues that occur if the network socket is closed before the entire request body is received, or while the response is being written.

System tests can also verify system-level features, such as automatically restarting a microservice instance when it fails, automatically failing-over to a backup system when the primary system goes down.

### Stress Tests

The final type of automated tests to mention are **stress tests**. These are a bit different than the previous types of tests as they are not really about testing features, _per se_. Instead they are about testing how your system behaves under stressful conditions, such as a very high transaction load. Stress tests will determine how much your system can handle, and at what point it will fail without more resources.

Stress tests require a bit more in terms of test infrastructure. In order to mimic a high transaction load on a web server, you really need to have dozens of clients all making multiple requests to the server at the same time. Each client measures how long each request took to process, and the server monitors things like request queue size, CPU/memory usage, and DBMS query duration.

One you build a stress test infrastructure, you can run several tests with different system configurations and actually measure the results to see which configuration gives you the scalability you need for the least cost. Without this, you can only guess and hope.

## Writing Tests in Go

Now that you know the distinctions between automated tests, let's see how we can write unit tests in Go.



## Test-Driven Development

TDD and BDD

## Continuous Integration Testing
