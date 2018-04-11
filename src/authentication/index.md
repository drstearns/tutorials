Now that you know how to [track sessions across multiple HTTP requests](../sessions/), it's time to discuss how we authenticate users at the start of authenticated sessions. **Authentication** is the process of establishing and verifying a user's identity; this is related by distinct from **authorization**, which is the process of verifying the user has permission to do what the user is trying to do.

In this tutorial I will explain how to properly authenticate a user against a name and password managed by our own system, which is known as **local authentication**. In a future tutorial I will show you how you can alternatively delegate this task to another web service, such as Google, Facebook, or Twitter, using the OAuth 2.0 protocol.

## Signing Up

Local authentication involves two steps: the process of creating a new account (which we call **sign-up**); and the process of authenticating against an existing account (which we call **sign-in**). 

When a user signs up for a new account on our system, the user provides two critical pieces of information: 

- a **unique name** that identifies the account, which is often an email address, since those are already unique.
- a **secret that only the user knows**, which we commonly refer to as a password, though it can be anything known only to the user.

If the system manages especially sensitive information, or provides access to stored payment methods, we may also encourage (or even require) the user to establish a second authentication factor. This is typically something the user _has_, such as a mobile phone, USB device, or personal token generator. In highly-secure systems, a third factor based on something the user _is_ may also be required, such as a biometric test.

## Storing the Password Properly

In order to authenticate the user during later sign-in attempts, we need to store these credentials in our persistent database. Your first instinct might be to just write the user name and password to the database in plain text, but you should **never store passwords in plain text**. If an attacker compromises your database, plain text passwords would give the attacker instant access to the user accounts not only in your system, but also many other systems, as people often reuse names and passwords across multiple sites. 

Instead, the current best practice is to use an adaptive cryptographic hashing algorithm to hash new passwords with a random "salt" value, and store only the resulting hash in the database. These hashing algorithms have five important qualities:

- **Irreversible**: Hashing algorithms are one-way operations, so it is impossible to directly calculate the input value from an output hash. This is in contrast to encryption, which can be reversed using the matching decryption algorithm and key.
- **Deterministic**: Hashing algorithms always produce the same output hash given the same input value. If you hash the same input value, it will match a previous hash of that same input value. This allows us to verify the user's password during a later sign-in attempt.
- **Unique**: Hashing algorithms are also unique: if you change just one bit of the input value, you will get a very different output hash. This allows us to know if the sign-in password is incorrect.
- **Unguessable**: A stolen output hash reveals no information that would help you guess what sort of input value created it. Although you can't reverse a hashing algorithm, the deterministic quality means that it is possible to hash many possible input values until the output hash matches some stolen hash. The unguessable property means that the list of possible values can't be narrowed down by examining the stolen hash, so the attacker is limited to a brute-force search over all possible values.
- **Adaptive**: Since brute-force attacks on stolen hashes are possible, password hashing algorithms allow us to control the speed at which the algorithm runs so that we can keep it relatively constant as hardware speeds increase. The goal is to keep the hashing algorithm fast enough that users won't notice the delay when signing up/in, but slow enough that a brute-force attack takes longer than the attacker's patience.

If an attacker wants to crack a stolen password hash, the unguessable property forces the attacker to do a brute-force search over all possible values. But over the years, attackers have built up large databases of well-known passwords and their equivalent hashes using several different hashing algorithms. Sadly, these well-known passwords were revealed when [several sites that stored passwords in plain text were hacked](https://arstechnica.com/tech-policy/2011/06/sony-hacked-yet-again-plaintext-passwords-posted/). Even more sadly, developers continue to make sites that store passwords in plain text, even though they are [eventually shamed for it](http://plaintextoffenders.com/).

With these existing tables, an attacker could compare a stolen hash against the pre-calculated hashes, and if the attacker found a match, the attacker would know the plain text password that produced it (the deterministic quality).

To defeat these pre-calculated tables, we also add a unique, cryptographically-random value, known as the **salt value**, to each new password when we hash it. This salt value changes the input to the hashing function, which causes it to produce a very different output hash (the unique quality) than the one in the attacker's pre-computed table. Since the value is cryptographically-random, the attacker can't predict what that would be ahead of time.

Of course, this salt value must also be stored in the user's database record, or we wouldn't be able to verify the user's password later during a sign-in attempt. In order to generate the same hash as the one we stored, we must combine the user's password with the same salt value that was used when generating that stored hash. If one bit is different, the resulting hash will be different (the unique quality).

Since the salt value is stored in the database, attackers who comprise our database will know what it is, but remember that this value is unique per-password, so the attacker would have to hash every known password with this unique salt value in order to find a match. If our adaptive hashing speed is around one second, generating hashes for one million known passwords with just one unique salt value would take around one million seconds, or almost 12 days of non-stop hashing to crack just one stolen hash, and that's only if the original password was in the attacker's well-known password list. A strong password would require a much slower exhaustive brute-force attack, that could easily take many months or years. Unless the data attached to those user accounts was really worth it, most attackers would lose patience and abandon the attack.

For example, when [security researchers tried to crack the 36 million stolen Ashley Madison password hashes](https://arstechnica.com/information-technology/2015/08/cracking-all-hacked-ashley-madison-passwords-could-take-a-lifetime/), they were able to crack only 4,000 of them after 5 days of non-stop hashing. These were also very weak passwords that could have been guessed even without a sophisticated cracking attempt (e.g., "password). The site used the [bcrypt algorithm](#secbcrypt), but used a relatively low adaptive cost factor that allowed the researchers to hash 156 passwords a second. If that cost factor had slowed the algorithm down to 2 hashes a second, users wouldn't have noticed when signing-in, but it would have taken far longer to crack even those very weak passwords.

## Password Hashing Algorithms

The most commonly-used password hashing algorithms are [bcrypt](https://en.wikipedia.org/wiki/Bcrypt), [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2), [scrypt](https://en.wikipedia.org/wiki/Scrypt), and [argon2](https://en.wikipedia.org/wiki/Argon2). The latter two are fairly new, so they have received far less field-testing, but they may become more standard in the future.

### bcrypt

The bcrypt algorithm is oldest, but that also means it's the most field-tested and well-understood. It has some vulnerabilities, but it is still highly-recommended because an easy-to-use but slightly-vulnerable algorithm is better than a less-vulnerable algorithm that doesn't get used due to its complexity. This is how you use bcrypt in Go:

```go
package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	pwd := "my secret password"

	//automatically generates salt while hashing
	//second parameter is the adaptive cost factor; increase to slow it down
	//it wants the password as a byte slice, so convert using []byte()
	hash, err := bcrypt.GenerateFromPassword([]byte(pwd), 13)
	if err != nil {
		fmt.Printf("error generating bcrypt hash: %v\n", err)
		return
	}

	//the resulting hash contains the salt and cost factor, 
	//so you only need to store this one value in your database
	fmt.Println(string(hash))

	//compare a password against this hash
	if err := bcrypt.CompareHashAndPassword(hash, []byte(pwd)); err != nil {
		fmt.Println("password doesn't match stored hash!")
	} else {
		fmt.Println("password is valid")
	}
}
```

The bcrypt package for Go automatically generates a new salt value each time you call `GenerateFromPassword()` and stores that value as the first part of the returned hash, so you only need to store that one return value in your database. When the user supplies a password at sign-in, you use the `CompareHashAndPassword` function to compare it against your stored hash. If it returns an error, the password doesn't match the hash.

Like most cryptographic algorithms, bcrypt accepts byte slices as input, so string-based passwords must be converted to byte slices using `[]byte()`.

The cost factor can be increased to slow down the algorithm as hardware speeds increase. Each increase makes the algorithm exponentially slower, so be careful. You should use the highest value that still results in acceptable performance in your production system. Since the algorithm is run only during sign-up and sign-in, users should be OK waiting a half or even full second, especially if the information you are protecting is valuable.

### PBKDF2

The PBKDF2 algorithm was originally designed to derive a symmetric encryption key from a password, and is commonly used when encrypting a file or entire disk based on a password. But it can also be used for password hashing, as it has all the same qualities listed above. The output encryption key can be stored as the password hash.

Here's what using the PBKDF2 algorithm looks like in Go:

```go
package main

import (
	"crypto/rand"
	"crypto/sha512"
	"crypto/subtle"
	"fmt"
	"os"

	"golang.org/x/crypto/pbkdf2"
)

func main() {
	pwd := "my secret password"
	iterations := 300000

	//generate an 8-byte salt value using the crypto/rand package
	salt := make([]byte, 8)
	_, err := rand.Read(salt)
	if err != nil {
		fmt.Printf("error generating salt: %v\n", err)
		os.Exit(1)
	}

	//derive a PBKDf2 key from the password and salt
	//use SHA-512 as the hashing function, and enough iterations
	hash := pbkdf2.Key([]byte(pwd), salt, iterations, sha512.Size, sha512.New)

	fmt.Println(hash)

	//store the hash, salt, and iterations values in your database...

	//when comparing a password to the stored values,
	//re-generate the key and compare
	hash2 := pbkdf2.Key([]byte(pwd), salt, iterations, sha512.Size, sha512.New)

	//ConstantTimeCompare will compare every byte even if one
	//doesn't match, so that an attacker can't do a timing attack
	//to determine how much of the hash was correct
	if subtle.ConstantTimeCompare(hash, hash2) == 1 {
		fmt.Println("password matches stored hash/salt")
	} else {
		fmt.Println("password doesn't match stored hash/salt")
	}
}
```

The Go PBKDF2 package has only one function: `Key()`, which derives an encryption key from a password, salt value, and number of iterations. That means you must generate your own salt value, and store that with the hash in your database, as you'll need to provide it when you re-hash the supplied password during sign-in. This salt value should be generated using the `crypto/rand` package, which is cryptographically-random, as opposed to the `math/rand` package, which is only pseudo-random.

Increasing the iterations will slow down the algorithm, and you should use the highest value that still results in acceptable performance in your production system.

## Signing In

When an existing user attempts to sign-in, your web server should follow these steps:

- Fetch the user profile with the supplied user name from your persistent data store.
- If you don't find a matching profile, spend the same amount of time doing something as you would have hashing the password, and then respond with an Unauthorized (401) status code, and a vague message like "invalid credentials".
- If you find a matching profile, hash the supplied password using the same algorithm and parameters as you used when generating the password hash during sign-up.
- Compare the two hashes: if they match, the password was correct and you should start a new authenticated session; if not, the password was invalid, and you should respond with an Unauthorized (401) status code, and the same vague message used when you can't find the user profile.

The goal here is to authenticate the user while not giving any clues to an attacker about which part of the credentials were incorrect. If you return more specific errors like "user name not found" and "invalid password," an attacker with a valid user name but invalid password will be able to discover that half of the credentials are correct.

Attackers also watch how long it takes to get an error response: if the server responds right away, the attacker assumes the user name was not found, but if it takes a bit longer, the attacker assumes the user name was correct but the slower adaptive hashing algorithm discovered the password was incorrect. If you don't find the user profile, do something that takes the same amount of time as hashing a password so that the attacker can't see a timing difference.

## Further Reading

Authentication is a complex and controversial subject, but these articles do a nice job explaining all of this in even more detail:

- [Salted Password Hashing—Doing it Right](https://crackstation.net/hashing-security.htm)
- [How to Safely Store Your Users' Passwords in 2016](https://paragonie.com/blog/2016/02/how-safely-store-password-in-2016)
- [OWASP Password Storage Cheat Sheet](https://www.owasp.org/index.php/Password_Storage_Cheat_Sheet)
- [Parameter Choice for PBKDF2](https://cryptosense.com/parameter-choice-for-pbkdf2/)
