Most web servers we build these days expose a set of URLs that are meant to be requested by code rather than a human with a web browser. These URLs accept and return raw data, encoded in a text format like JSON, so they essentially act like an application programming interface (API) for our server-side system.

As the name suggests, an API is an interface to a system used by programmers writing code, just as a graphical user interface (GUI) is an interface used by humans operating a mouse and keyboard. When we design a GUI, we apply various [design principles](http://a.co/a8siRrh) and follow [platform-specific conventions](https://material.io/) to create an interface that is _intuitive_ for our end users. An API must also be designed, and just like a GUI, we should apply those same design principles and follow the conventions our client programmers are already familiar with in order to create a programming interface that is intuitive and a joy to use.

But this begs the question: what are the established conventions for web APIs? What should the resource paths in the URLs look like? How should we interpret the various HTTP methods? How should we allow clients to specify options in their requests? And how should we ensure that older clients continue to work if we need to make changes to the API in the future?

There have been several attempts to establish conventions for web-based APIs, but there is one pattern that is currently dominant: REST. In this tutorial I will explain the REST design pattern and show you how to use it when designing your own web APIs.

## What is REST?

REST is technically an acronym that stands for **RE**presentative **S**tate **T**ransfer, though you'll rarely see it spelled out. The name comes from [Chapter 5 of Roy Fielding's dissertation](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm), in which he articulated an architectural design pattern for highly-scalable hypermedia systems. He derived this pattern from an examination of several network protocols, HTTP being chief among them.

He concluded that HTTP scaled extremely well because it uses a design pattern that transmits representations of resource states in a stateless way. That's very abstract and slightly confusing, so let's break that down and explain what he means.

A **resource** is anything the system can manage: files on disk, models in a database, the shared data of a multi-player game, or even controllers for physical systems. A web server may be able to manage many different kinds of resources, and our API needs to allow programmers to refer to specific resources in a coherent manner.

Each of these resources has a **state** of some sort, which is the current value of the resource. The state for a file on disk is the file's contents. The state of a model in a database includes the values of the various properties of that model. The state for shared data in a multi-player game would be the positions, status, and actions of all the various players and bots. The state for a controller of a physical system would be the various settings and sensor readings captured by the controller. The state of a resource can be structured and complex, but ultimately it's a series of bytes that capture the current value of the entire resource.

If we want to transmit the current state of a resource across the network, we must encode that state into some sort of portable **representation**, and for many resources, we can encode them into more than one kind of representation. For example, an image can be encoded into any sort of common raster-based binary representation: PNG, GIF, JPEG, etc. A database row (or any set of properties and values) can be encoded into JSON, XML, or several other text-based representations.

Once a system can encode and transmit a representation of a resource's current state, it can also allow clients to post new or updated state representations to insert or update resources managed by the server. This allows coordinated transitions to resource states: multiple clients can attempt to update the same resource at the same time by posting updated state representations, and the server can decide how to handle that (last one in wins, first one in wins, or some sort of merge operation).

Although resource states are transmitted between clients and servers, the _requests themselves_ are entirely stateless, meaning that they don't rely upon any state maintained on the network connection between requests. Each request is entirely _self-describing_: it names a resource, specifies an action to perform on that resource, and provides any resource representation necessary to complete that action. This allows us to use caches and load balancers to handle very large amounts of requests. If each request is stateless and self-describing, we can distribute those requests among many instances of our web server, regardless of which server handled previous requests from the same client. Requests for the current state of a resource that changes infrequently can also be handled by a caching server that is relatively close to the client (e.g., a proxy server).

## RESTful Web APIs

When we apply this REST pattern to the design of web-based APIs that manage data models in persistent DBMSs, the result is known as a **RESTful Web API**.

### Resources

The resources managed by such an API are primarily models in persistent DBMS collections, not files on disk. In simple cases, the models exposed by the API can be the same as those stored in the database, but it's often a good idea to keep those logically separated so you can change the way you store your models over time, while still maintaining the same shapes in your public API for backwards compatibility. For example, if you choose to change your internal storage format to something like [event sourcing](https://martinfowler.com/eaaDev/EventSourcing.html), you can still project the current state of your model from the API as if you were only storing that most current state.

If the resources we are projecting are models in collections, we first need to decide how our HTTP resource paths map to those collections and models. The convention used by many APIs follows this pattern:

```
/version/collection/unique-identifier/related-collection
```

The `/version` segment identifies a version of the API, such as `/v1`. This provides a name-space for the rest of the path, allowing us to change the structure of those paths in the future while still supporting older clients. If we decide that we need to change the set of root collections in a way that would break older clients, our server can start supporting another set of URLs prefixed by `/v2` in addition to the existing set prefixed by `/v1`. Older clients will continue to work while new clients can take advantage of the newly-improved API.

Although a version prefix is very common in API design, some systems are moving to a custom HTTP header for indicating a specific API version. With this approach the URLs themselves are shorter and cleaner, but the API designer has to decide how to handle requests that omit the version header (e.g., respond with an error or assume the current version).

The `/collection` segment names a collection of models within your DBMS. For example `/v1/users` would refer to all user profiles managed by your system. What this API returns depends on the security model of your system: it may return only the profiles the current user is allowed to see, or it might return only the public properties of each profile (common on social media sites).

The `/unique-identifier` segment names a specific model within the collection. This identifier is typically the model's primary key value, but it could be some other value that is unique within the collection, or a special moniker that can be resolved from context. For example `/v1/users/1234` would refer to the user profile with the ID `1234`, while `/v1/users/me` would refer to the currently authenticated user. Again, the ability to reference a particular model doesn't guarantee the current user would be allowed to view or modify it--security must still be enforced on the server-side.

The identifier you use in your API should be not only unique, but also random and hard to guess given another ID. Many RDBMSs will let you assign monotonically-increasing integer IDs to your rows, but if you use those in your API, your attackers can easily guess a wide range of valid IDs. Instead, generate a new [sufficiently-long random ID](https://eager.io/blog/how-long-does-an-id-need-to-be/) for use in the API, and either use that as the database primary key, or store it in a column with a unique index so you can find model(s) related to that ID quickly.

The `/related-collection` segment can be used to identify a subset of data related to a specific model. For example, `/v1/photos` would refer to all photos managed by the system, but `/v1/users/me/photos` would refer to all photos uploaded by me. And `/users/` would refer to all users profiles, but `/v1/users/me/friends` would refer to only those users in my friends list.


### Methods

As you probably remember from the [HTTP Tutorial](../http/), a request contains not only a resource path, but also a method. These method are used in RESTful Web APIs to specify the action the client wants to perform on the resource. The most commonly-used methods and their respective meanings are as follows:

method | meaning | safe | idempotent
-------|---------|------|-----------
GET | return the current state of the resource | Y | Y
PUT | completely replace the current state of the resource | N | Y
PATCH | partially update the current state of the resource | N | Y
POST | add a new child resource | N | N
DELETE | delete the resource | N | Y
LINK | link the resource to some other resource | N | Y
UNLINK | unlink the resource from some other resource | N | Y
OPTIONS | list the methods the current user is allowed to use on this resource | Y | Y


**Safe** means that the method does not change the resource's state on the server, while **idempotent** means that multiple identical requests using that method will have the same effect on the resource state as just one request.

Although `POST` requests are not considered idempotent by default, particular REST APIs can make them idempotent by allowing clients to supply some sort of ID that is unique to the `POST` operation. If the caller gets a timeout or an unexpected (500-level) error, the caller can safely retry the request as long as it passes the same ID it used on the first request. The server can use this ID to de-duplicate requests and ensure they are processed only once (e.g., store the ID in a database column with a unique index and treat duplicate key exceptions as an indication the ID was already processed).

The `PUT`, `PATCH`, and `POST` methods are often confused by API designers. The `PUT` method should replace the current state of the resource entirely using the representation in the request body, while `PATCH` should update only the properties included in the request body. For example, if I do a `PUT` to `/v1/users/me`, I need to include an updated copy of my entire user profile in the request body, but if I do a `PATCH` instead, I can include just the properties I want to change (`{"firstName": "New Value"}`) and the other properties will remain as they were. The `POST` method is used to create new child resources, which in an information system means inserting new data. So a `POST` to `/v1/users/` would create a new user profile.

Of course, not all resources in your system will support all of these methods. For example, `POST` only makes sense on collections, and `DELETE` would rarely be supported on collections. Additionally, some users may be allowed to use certain methods while others may not, according to your system's authorization rules. For example, users may be allowed to modify or delete their own resources, but not resources created by others. Or administrators might be the only ones allowed to create new types of resources.

### Querying and Sorting Collections

The `/v1/users` resource refers to all user profiles, but often times clients want to query that collection to get a subset that matches a particular filter. Clients may also want to control the sorting order of those results. In RESTful APIs, these options are specified as query string arguments.

For example, the resource path `/v1/users?q=test` would refer to the set of users that match the query `test`. The server might match this query against several fields in the user profile, and even rank the results depending on which or how many fields matched the query string.

If the client wanted to change that sorting, the client could add another query string argument containing the set of properties to sort by. For example `/v1/users?q=test&sort=lastName,firstName` would sort the results first by last name, and then by first name within the same last name. To specify a descending instead of ascending sort, the client can prefix the property name with `-`. For example, this would sort by last name descending: `/v1/users?q=test&sort=-lastName,firstName`

### Requesting Alternative Representations

As noted earlier, many types of resources can be encoded in multiple representations, and this is especially true of data stored in a DBMS. API designers will typically specify a default representation for their resources (e.g., JSON), but may allow clients to request alternative formats.

The conventional way to support this is to allow clients to include an `Accept` header in their HTTP request listing the representation formats they support, in order of preference. These formats are expressed as a comma-delimited list of [MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types). For example, a client requiring XML instead of JSON would set the `Accept` header to `application/xml`, but if the client only prefers XML and can still handle JSON, it would use `application/xml, application/json` instead. The server then includes a `Content-Type` header in the response, indicating which representation was used in the response body.

Supporting alternative representation is not terribly common these days, but it was common when XML and JSON were still competing for dominance, and it may become common again as new encodings become popular. It's also helpful for media resources that have fragmented support for various encodings on different types of clients (e.g., the WebM vs Ogg vs MP4 video encodings).

## Alternatives To REST

The REST pattern has become very common in web API design, and when followed correctly, it reduces the cognitive load necessary to learn and become productive with a new API. But REST does have a few important drawbacks:

- Clients have little to no control over how much data is returned about a resource. Most APIs return the entire resource state, which could be quite large, even if a client only needs one or two of those properties.
- Complex filtering can be quite difficult to express using query string parameters. For example, filtering a collection based on values in a related collection is easy in SQL, but difficult to model with a flat list of name/value pairs. Some API designers allow full predicate expressions, but simply concatenating these into your SQL queries creates a [SQL injection vulnerability](../godb/#secguardingagainstsqlinjectionattacks) so never do that.
- Computational resources, such as a predictive neural network, don't really fit well into a model that is focused on returning and accepting the state of that resource. A neural network has a state, but you'd rarely want to expose that to clients. Instead, you'd only want to accept inputs and respond with outputs, similar to a remote procedure call.

These drawbacks have led some developers to define alternatives to the REST design pattern. For example, Facebook has been promoting [GraphQL](http://graphql.org/), which allows clients to make structured queries against resources. These queries are similar to what you can do in SQL, only they are expressed as a JSON document rather than a complete English-like syntax. GraphQL gives clients much more flexibility over how much data is returned, and makes complex filtering a bit easier.

Google is pushing another alternative called [gRPC](https://grpc.io/), which is based on remote procedure calls instead of HTTP resources and methods. A remote procedure call is like calling a function in a library, except that the library is running on a different machine across the network. RPC frameworks like gRPC generate **stub functions** for remotely-callable procedures, which have the same signature as the target function, but send a request across the network to call the actual implementation on the server. Client code can then import and call these stub functions without having to worry about the details of parameter marshaling and network requests. RPCs are typically faster than HTTP requests, as they use binary formats on the wire and thus involve less parsing and data conversion. They are also more strongly-typed than the JSON requests used in REST.

