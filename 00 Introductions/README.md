00 Introductions
================

Let's get going. First step is understanding the "bones" of the compiler and how they fit together.

We have three big pieces:

* Tokenizer, `stringToTokens()`:  
  Take the input, and turn it into a list of symbols (tokens) that are easier to interpret than raw strings. We've stubbed this out entirely for the moment (returning an empty array).

* Parser, `tokensToAst()`:  
  Take the tokens, and turn it into a tree (an Abstract Syntax Tree), a abstract representation of the program. We only have a top-level node implemented so far (`ProgramNode`). This representation is an "intermediate representation", something that the middle and later parts of a compiler can understand.

* Code Generator, `astToJs()`:  
  Takes the AST and traverses it, generating strings of JavaScript that are built up into a program to run later. We could potentially have multiple different code generators (eg. one producing Ruby, or something more low-level), but we're sticking with JS for now.
  

... and a chunk of code at the end to kick it all off.


To test out this bare-bones code, open a terminal and run:

```
cd "00 Introductions"
npm start
```

(The code will run, and the result will sit there until you hit enter. To exit, hit `Ctrl C`.)

You should see something that looks like:

```
TOKENS:
 []

AST:
 { type: 'programNode',
  declarations: [],
  returningExpression: null }

JS:
 function add(x,y) { return x + y; };
 var result = (function(){
   return null;
 })();
 console.log(result);

EVAL:
 null
```
