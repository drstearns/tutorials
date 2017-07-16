As I discussed in the [HTTP tutorial](../http/), browser have long enforced a [same-origin policy](../http/#secorigin) when it comes to HTTP requests made from JavaScript. In other words, JavaScript in a page loaded from `example.com` is not allowed to make an HTTP request to `api.example.com` because those two hosts are different. This is a security measure designed to protect you from malicious web sites that try to make requests to other web servers on your behalf, but it made it very difficult to build a generic web-based service that could be called from any site served from any origin (e.g., [Firebase](https://firebase.google.com/)). Thankfully the great minds of the web got together and figured out how to enable such services without compromising security. The result was the [Cross-Origin Resource Sharing](https://www.w3.org/TR/cors/) standard, more commonly referred to as CORS.

## What is CORS?


## Handling Simple Requests


## Handling Preflight Requests


## CORS Middleware in Go
