The bash shell is really a programming language in disguise. Whenever you execute something at the command line, you are really running a small program. These programs typically launch other programs, but there's quite a bit of interpretation that can occur before those programs are executed.

One of the things that gets interpreted by the bash shell are environment variables. Environment variables are just like variables in other languages: they have a name; they have a scope that determines where they are visible and where they are not; they can be assigned a value and that value can change over time; and they can be used in expressions where you want the current value of the variable to be used.

## Declaring and Using Environment Variables

Open a new command-line (terminal) window, so you can follow along as I explain the various commands. To declare a new environment variable that is visible to your current command-line shell and any programs launched from it, use this simple syntax:

```bash
export MY_VARIABLE="some value"
```

This creates a new environment variable named `MY_VARIABLE` set to the string `"some value"`. The double-quotes around `"some value"` allow us to embed a space in the string while still treating it as a singular value. 

To see the value of an environment variable, use the `echo` command and refer to the variable like so:

```bash
echo $MY_VARIABLE
```

This will print the current value of the variable named `MY_VARIABLE`, which at this point is `some value`. Note that you use a `$` on the front when you refer to the variable in a command; that way the shell knows you are referring to an environment variable, as opposed to a file or some other program. 

When the shell sees the `$` prefix, it "expands" the variable into its current value, and then continues processing the overall command. In this case, the shell expand this into `echo "some value"` and then runs the `echo` command passing that string as the first and only parameter. The `echo` command simply prints whatever you pass to it, so it prints `some value` and exits.

You can name your variables whatever you want, and you can actually use any casing you want, but we traditionally use all caps for environment variables. This keeps them visibly separate from the myriad of commands, programs, and files you can refer to at the command line, which are typically in lower-case.

## Predefined Environment Variables

You can use environment variables in any command, and there are several that are already defined for you on most systems. For example, the environment variable `$USER` is typically set to the name of the currently signed-in user. You can check the value of this using that same `echo` command, but this time we can also add a little greeting:

```bash
echo "Hello, $USER"
```

Notice the use of double quotation marks. These are used to wrap a string that might contains spaces or other characters that have special meaning to the shell. But note that you can still use environment variables within these strings. The variables will be expanded into their current value before the string is passed to the `echo` command. This expansion happens only when you use double-quotes; if you use single quotes, the `$USER` will be treated as literal text and not a variable to be expanded.

Another one that is typically set for you is `$HOME`, which is the file path to your home directory. You can use this with the `ls` command, just like you'd use any other file path:

```bash
ls $HOME
```

That will list all the files in your home directory. If you want to change to your home directory, use that same variable with the `cd` command:

```bash
cd $HOME
```

Since this is such a common operation, most shells provide the shorter `~` symbol as a synonym for the `$HOME` variable:

```bash
# this changes to your home directory
cd ~
# and this lists the files in the Documents folder in your home directory
ls ~/Documents
# and this changes back to whatever directory you were in last
cd -
```

The lines above that are prefixed with `#` are comments, just like comments you add to your Java or JavaScript source files. Anything following a `#` character on the same line will be ignored by the command-line shell.

## The PATH Variable

The other critical environment variable that is already set for you is the `$PATH` variable, which determines which directories the shell looks in for programs that you try to execute at the command-line. You can see your current path using that same `echo` command:

```bash
echo $PATH
```

You can adjust the `PATH` variable by resetting it, and you can refer to the existing value while you do that. For example, to add a new directory to the end of your path, you can use a command like this:

```bash
export PATH=$PATH:$HOME/bin
```

The shell will first expand `$PATH` to be the current value of the `PATH` environment variable, and then expand `$HOME` to be the current value of the `HOME` environment variable (your home directory). So in total, this command will add the `bin` directory within your home directory to the path.

But that change will only affect the current command-line shell window. To make that change persistent across all shell windows you might open, we first need to understand the scoping rules for environment variables.

## Scoping Rules for Environment Variables

When you declare a variable inside a function in languages like Java or JavaScript, that variable is visible only inside that function. We call that the variable's "scope." Environment variables have a scope as well, and understanding their scoping rules will help you realize why some environment variables are visible in every command line shell, while others are not.

When we declared a variable above, we used the keyword `export` in front of the variable name. This sets the variable's scope so that it is visible in the current command-line shell, and any other program launched from that shell. If you omit the `export` keyword, the shell will create the variable, but it will be visible only in the current shell, and _not in any other program launched from that shell_. Unexported private variables can be useful at times, but we typically create environment variables so that other programs can read them, so you will most often use `export` when declaring a new environment variable.

But even if you use the `export` keyword, the variable you declare won't be visible to _another_ command-line shell that you start from your desktop. To see this in action, start another command-line (terminal) window and type that echo command again:

```bash
echo $MY_VARIABLE
```

Since this is a new and different shell from the one in which you declared the variable, you won't be able to see this `MY_VARIABLE` variable, so the `echo` command should return only a blank line.

To declare a variable that is visible in every command-line shell you open, we need to declare it at a higher scope. How you do this depends on which operating system you are using.

## Declaring Persistent User-Global Variables

Now that we understand the scoping rules for environment variables, I can now explain how to set persistent variables that are global for the current operating system user. Follow the instructions below for your particular operating system.

### MacOS and Linux

Both MacOS (formerly OS X) and Linxu are based on Unix, and both use [bash](https://en.wikipedia.org/wiki/Bash_(Unix_shell)) as the default command-line shell. Bash has a handy feature where it will execute a script each time you open a new Terminal window, or whenver you sign-in to an account via the command-line (e.g., `ssh` or `su`). These scripts are simply text files containing commands you would have normally typed manually at the command-line, and bash will execute them silently before you even see a prompt.

On MacOS, bash will run the script stored in the `.bash_profile` file in your home directory (`~/.bash_profile`) whenever you open a new Terminal window, or whenever you sign-in to an account via the command line. On Linux, bash will run the script in `~/.bashrc` when you open a new Terminal window, but will run the script in `~/.bash_profile` when you sign-in to an account at the command line.

Since these scripts are run every time you open a new Terminal window, we can use them to declare persistent environment variables that will be available in all new Terminal windows we open.
 
If you're on a Mac, open `~/.bash_profile` in your favorite text editor. On Linux, open `~./bashrc`. If you installed [Visual Studio Code](https://code.visualstudio.com/) and [enabled the `code` shell command](https://code.visualstudio.com/docs/setup/mac#_command-line), you can open the file in VS Code using this command:

```bash
# on Mac
code ~/.bash_profile

# on Linux
code ~/.bashrc
```

Bash scripts are just simple text files containing commands you would have normally typed manually at the command-line. These commands are run sequentially when you start a new Terminal, as if you typed them yourself. So to create an environment variable that gets declared every time you open a new Terminal window, just add the variable declaration to the file using the same syntax you used at the command-line:

```bash
# new line inside ~/.bash_profile (Mac) or ~/.bashrc (Linux)
export MY_VARIABLE="some value"
```

Save the file, open a new Terminal window, and then `echo $MY_VARIABLE`. You should now see the value in the new Terminal window, and any other Terminal window you start from now on.

To undo this, just re-edit `~/.bash_profile` (Mac) or `~/.bashrc` (Linux) and remove that variable declaration. After you save, all new Terminal windows will no longer have that variable set.

Editing these files has no effect on existing Terminal windows because that script is run just once when you first open the Terminal, but you can re-run the script at any time using the `source` command:

```bash
# re-run the start-up script in the current shell
source ~/.bash_profile
```

This is handy whenever you add or change an environment variable, and want that value available in your current Terminal window. It's such a common operation that the shell also provides the `.` symbol as a shorter synonym for the `source` command:

```bash
# same as `source ~/.bash_profile`
. ~/.bash_profile
```

### Windows

If you are using the Git Bash command-line shell on windows, follow the instructions in the [MacOS and Linux section](#secmacosandlinux). Git Bash should run a `.bash_profile` script it finds in your home directory.

If you are running Windows 10 Anniversary Edition or later, you can alternatively use the new [native bash support](https://msdn.microsoft.com/en-us/commandline/wsl/about). Follow their [installation instructions](https://msdn.microsoft.com/en-us/commandline/wsl/install_guide) to enable this feature. Since this enables an Ubuntu Linux subsystem, you should then be able to create/edit a `~/.bashrc` file as described in the [Linux section](#secmacosandlinux) above.

The other alternative on Windows is to run a Linux virutal machine, and share your source files with it so that you can continue to edit the files using your favorite graphical tools. [Vagrant](https://www.vagrantup.com/) and [Docker](https://www.docker.com/) are popular tools for doing this.


## Unsetting Environment Variables

If you ever need to unset an environment variable that has been declared in your current shell, use the `unset` command:

```bash
unset MY_VARIABLE
```

Note that here you don't use the `$` prefix because you don't want the shell to replace the variable with its current value. Instead, you want to pass the variable name itself to the `unset` command.

Just as when you declare variables manually in the current shell, this will unset the variable in the current shell only. All other shells remain unaffected. 


