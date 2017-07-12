A web server is just a program that listens on a network port for requests in the [HTTP format](../http/), and responds accordingly. You can write a web server in any language that lets you listen on a port for incoming network connectins, and read/write streams of bytes from those connections.

But every web server has to do a series of common tasks that would be annoying to re-write every time:

- managing network connections
- processing requests concurrently
- parsing the HTTP request into methods, paths, and headers
- providing a readable stream over the request body
- providing methods to set the response status code and headers
- providing a wriable stream over the response body
- negotiating HTTP versions and upgrading/downgrading the protocol
- rejecting malformed requests

