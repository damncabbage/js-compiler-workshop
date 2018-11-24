JS Compiler Workshop
====================

"Compilers" are usually-mysterious things that a lot of us actually use and rely on from day to day, eg. the JavaScript V8 compiler, the TypeScript compiler, or the Clang+LLVM compilers. Digging into how these work can be satisfying (like sleuthing a good puzzle); but some of the ways we implement them can appear in other forms, such as when validating user input, transforming big structures, or when separating side-effects from business logic.

This workshop will comprise of a short talk that introduces the main parts of a compiler, followed by an at-your-own-pace tour through building a little one of your own. We'll start with a simple language that compiles to JavaScript.

We'll be stepping through:

* Tokenising (taking a string and turning it into a bunch of symbols),
* Token Parsing (taking these symbols and turning it into a representation of a program), and
* Code Generating (taking that representation and turning it into, in this case, JavaScript).

This workshop is for people who are already somewhat familiar with JavaScript (just the language itself, not any particular library or framework).

To get going you only need this repository, a Terminal / Console, Node.js 8+, and a text editor of your choice. If you'd like, Visual Studio Code is an editor with good JavaScript support out of the box.


I'd recommend using the command-line (eg. with iTerm) and, for each exercise, `cd` into the exercise directory and run commands from there. Each exercise has instructions in the `README.md` file, eg. detailing what to do, how to run commands, etc.
