The bash shell is really a programming language in disguise. Whenever you execute something at the command line, you are really running a small program. These programs typically launch other programs, but there's quite a bit of interpretation that can occur before those programs are executed.

One of the things that gets interpreted by the bash shell are environment variables. Environment variables are just like variables in other languages: they have a name; they have a scope that determines where they are visible and where they are not; they can be assigned a value and that value can change over time; and they can be used in expressions where you want the current value of the variable to be used.

## Declaring and Using Environment Variables

To declare a new environment variable that is visible to your current shell and any shells created from it, use this simple syntax:

```bash
export MY_VARIABLE="some value"
```

This creates a new environment variable named `MY_VARIABLE` set to the string `"some value"`. To see the value of an environment variable, use the `echo` command and refer to the variable like so:

```bash
echo $MY_VARIABLE
```

This will print the current value of the variable named `MY_VARIABLE`, which at this point is `some value`. Note that you use a `$` on the front when you refer to the variable in a command; that way the shell knows you are referring to an environment variable, as opposed to a file or some other program.

You can use environment variables in any command, and there are several that are already defined for you on most systems. For example, the environment variable `$USER` is typically set to the name of the currently signed-in user. You can check the value of this using that same `echo` command, but this time we can also add a little greeting:

```bash
echo "Hello, $USER"
```

Notice the use of double quotation marks. These are used to wrap a string that might contains spaces or other characters that have special meaning to the shell. But note that you can still use environment variables within these strings. The variables will be "expanded" into their current value before the string is passed to the `echo` command. This expansion happens only when you use double-quotes; if you use single quotes, the `$USER` will be treated as literal text and not a variable to be expanded.

Another one that is typically set for you is `$HOME`, which is the file path to your home directory. You can use this with the `cd` command, just like you'd use any other file path:

```bash
cd $HOME
```

That will switch you back to your home directory. Or you can use it with any other command that accepts a file path, such as `ls`:

```bash
ls $HOME
```

## Declaring Persistent Environment Variables

