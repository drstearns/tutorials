The thing that defines the web more than anything else is its underlying communication standard: the **H**yper**T**ext **T**ransfer **P**rotocol (HTTP). If you want to build successful web applications, you need to understand this protocol and how it works. The good news is that it's stupidly simple. One of the reasons the web grew as fast as it did is because the underlying protocol is clear, straightforward, and uncomplicated. Anyone can learn it in a matter of minutes, and once you learn it, you'll understand what's really happening when you browse the web, make HTTP requests from JavaScript, or handle those requests on the server-side.

## Key Terms

Before we look at the protocol itself, we need to review and solidify a few key terms. The best way to do that is to look at the anatomy of a URL. A URL is a string of characters, but it's divided into a few distinct parts, each of which is used during an HTTP request.

![anatomy of a URL](img/url.png)

### Protocol

The first part of the URL names the **protocol** to use, which is sometimes referred to as the **scheme**. The name `http` refers to HTTP, and `https` refers to a combination of HTTP and [Transport Layer Security (TLS)](https://en.wikipedia.org/wiki/Transport_Layer_Security). When using TLS, all requests and responses are encrypted as they are sent across the network so that an attacker in the middle can't read the contents. This results in a bit of overhead, but today's computers and networks are fast-enough that HTTPS is quickly becoming the standard for all web traffic.

### Host

The next part is the **host** which is the name of the computer we want to talk to. The host can be a domain name such as `example.com`, or it can be a sub-domain of that domain like `api.example.com` or `ischool.uw.edu`. Domain names have to be purchased from domain registrars, but once you register a domain name, you can create as many sub-domains as you like and adjust them whenever you need to.

To make a network connection, the client needs to translate the host name into a numeric IP address. It does this using the [Domain Name System (DNS)](https://en.wikipedia.org/wiki/Domain_Name_System). The DNS is a bit like a telephone book that one can use to resolve a host name to an IP address, and you can access it right from the command line. Open a new command-line window (Terminal on Mac or Git Bash/PowerShell on Windows) and type this command:

```bash
nslookup ischool.uw.edu
```

_Sample Output_

```
Server:		192.168.0.1
Address:	192.168.0.1#53

Non-authoritative answer:
Name:	ischool.uw.edu
Address: 128.208.201.29
```

In addition to [nslookup](https://linux.die.net/man/1/nslookup), Mac and Linux users can also use the more concise [host](https://linux.die.net/man/1/host) command:

```bash
host ischool.uw.edu
```

_Sample Output_


```
ischool.uw.edu has address 128.208.201.29
```

These commands talk to the DNS, but they also consult a hosts file on your local computer that contains well-known host names and their associated IP addresses. On Mac and Linux, this file is at `/etc/hosts`, and on Windows it's at `c:\Windows\System32\Drivers\etc\hosts`. To see the contents of this file use this command:

```bash
# on Mac and Linux
cat /etc/hosts

# on Windows
cat c:\Windows\System32\Drivers\etc\hosts 
```

You'll probably have at least one line in that file that defines the host `localhost` to be the IPv4 address `127.0.0.1`, and possibly another line that defines the IPv6 address to be `::1`. These are known as "loopback addresses" because they just loop back to the same machine from which the request is made: your local computer. Thus, the host `localhost` is an alias for your computer.

## Port

The host and associated IP address can get you connected to a server across the Internet, but that server might be listening for network requests on many different ports. You can think of an IP address like the street address of an apartment building, while the **port number** is the number of a specific apartment inside. To connect to a web server, we need both the host/IP and a port number.

As a convention, web servers listen on port `80` for unencrypted HTTP requests, and port `443` for encrypted HTTPS requests. If you don't specify a port number in your URL, the browser will assume these conventional ports. But you can override this by including a port number in your URL, like so: `http://localhost:4000/path/to/resource`. This tells the client to connect to port `4000` instead of the conventional port `80`.

## Resource Path

After the host and optional port number, the segment up until the `?` is known as the **resource path**. Technically, this can take any form that the server knows how to interpret, so it doesn't strictly need to look like a file path, but people have gotten so used to the path form that most developers continue to use it.

Although this looks like a file path, it's critical for server-side development to understand that **it can refer to anything the server can manipulate**: a file, a database table/record, an in-memory game state, a neural network, a connected device, or even a controller for a giant mechanical killer robot. The term "resource" is purposely vague and open-ended so that one can enable the manipulation of just about anything via HTTP requests.

## Query String, Parameters, and Values

The last part of the URL above contains the **query string**, which allows the client to pass additional parameters and values that are relevant for the requested resource. These parameters are typically used only when getting the state of the resource, and they are often used to supply filters, sorts, or other options supported by the resource. For example, when getting the `/users` resource, which represents all user accounts in the system, one might supply a query string like `?q=dave&max=50` to find the first 50 users with the name `dave`.

The query string starts with a `?` and is followed by one or more name/value pairs. The name/value pairs are separated by `&`. The name and value are separated by `=`. For obvious reasons, literal `&` and `=` characters within parameter names or values must be encoded as `%26` and `%3D` respectively, and a literal `%` must be encoded as `%25`. The number after the `%` is the hex representation of the character's Unicode number. The `encodeURIComponent()` function in JavaScript can be used to do this encoding in the browser, and similar functions are available in most other languages.

Technically speaking, `- _ . ! ~ * ' ( )` and space must also be encoded, as well as characters outside the ASCII range, but most client libraries handle this for you, so you rarely need to worry about this. 

## HTTP Requests

Now that we have our terms straight, let's see how these elements of a URL are used in an HTTP request.

![http get request format](img/req-get.png)

HTTP requests are just plain text, so you can easily read and type them. The first line contains the **method**, **resource path** (which we already discussed [earlier](#secresourcepath)), and requested **protocol version**.

### Methods

### Protocol Version

### Headers


## HTTP Responses




