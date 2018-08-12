04 Generate You a JavaScript
============================

Code Generator, `astToJs()`:  
Takes the AST and traverses it, generating strings of JavaScript that are built up into a program to run later. We could potentially have multiple different code generators (eg. one producing Ruby, or something more low-level), but we're sticking with JS for now.

We have a tokeniser and a parser! Let's have it spit out (and run) some JavaScript.

So far we've been generating a (smallish) nested syntax tree:

```
{
  type: 'programNode',
  declarations: [],
  returningExpression: {
    type: 'functionCallNode',
    functionIdentifier: 'add',
    args: [
      { type: 'numberNode', number: 1 },
      { type: 'numberNode', number: 2 }
    ]
  }
}
```

Our `astToJs()` function takes an AST node (eg. the root `programNode`
node), and returns a string (a chunk of JS). In order to do that, it
may need to take some nested part of the AST (eg. the
`functionCallNode`), and pass it to `astToJs()` again.

To write `functionCallNode`, for example, you take your arguments (AST
nodes in their own right) and give them in succession to `astToJs()` to
get back JS strings (eg. numbers, further function calls, etc).


The exercise is to implement the rest of the `switch()`, handling
different AST node types, returning strings of JS that can be glued
together to make a valid program.


As before, to this code as you go, open a terminal and run:

```
cd "04 Generate You A JavaScript"
npm start
```

If you're stuck, the solution is in `solution.js`; you can run it by running:

```
npm run peek
```
