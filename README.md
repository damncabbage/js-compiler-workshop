JS Compiler Workshop
====================

"Compilers" are usually-mysterious things that a lot of us actually use and rely on from day to day, eg. the JavaScript V8 compiler, the TypeScript compiler, or the Clang+LLVM compilers. Digging into how these work can be satisfying (like sleuthing a good puzzle); but some of the ways we implement them can appear in other forms, such as when validating user input, or writing a wrapper library.

This workshop will comprise of a quick talk that introduces the main parts of a compiler, followed by an at-your-own-pace tour through building a little one of your own. We'll start with a simple language that compiles to JavaScript.

We'll be stepping through:

* Lexing (taking a string and turning it into a bunch of symbols),
* Token Parsing (taking these symbols and turning it into a representation of a program), and
* Compiling (taking that representation and turning it into, in this case, JavaScript).

This workshop is for people who are already reasonably familiar with JavaScript (as in EcmaScript 5+, and not anything like Node.js APIs).

To get going you only need this repository, a Terminal / Console, Node.js 6+, and a text editor of your choice.
