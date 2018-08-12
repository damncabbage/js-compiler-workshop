02 Basic Parsing
================

* Parser, `tokensToAst()`:  
  Take the tokens, and turn it into a tree (an Abstract Syntax Tree), a abstract representation of the program. We only have a top-level node implemented so far (`ProgramNode`). This representation is an "intermediate representation", something that the middle and later parts of a compiler can understand.

We have a tokeniser! Let's build a simple token parser.

This statement:

```
add(1, 2);
```

... produces this set of tokens:

```
 [ { type: 'identifier', capture: 'add' },
  { type: 'parenOpen', capture: undefined },
  { type: 'literalNumber', capture: '1' },
  { type: 'comma', capture: undefined },
  { type: 'literalNumber', capture: '2' },
  { type: 'parenClosed', capture: undefined },
  { type: 'semicolon', capture: undefined } ]
```


Our parser function, `tokensToAst()`, takes this list of tokens and steps through them ('consuming' them), returning the new AST tree as it goes.

The parser now has a new function to help with this:

* `consume(identifier)`:  
  Looks for the token type <identifier> as the very next token in the
  stream, and returns it to the caller. If it can't find it, it raises
  an error and stops compilation.

The exercise is to implement the rest of the tokens needed to parse
the exact statement "add(1, 2);", and nothing else. Don't worry about
looping or conditions or anything; we'll get onto that next.

As before, to this code as you go, open a terminal and run:

```
cd "02 Basic Parsing"
npm start
```

If you're stuck, the solution is in `solution.js`; you can run it by running:

```
npm run peek
```

The resulting AST should look like:

```
 { type: 'programNode',
  declarations: [],
  returningExpression:
   { type: 'functionCallNode',
     functionIdentifier: 'add',
     args: [ [Object], [Object] ] } }
```

... with that nested `args` being made up of:

```
args:
  [ { type: 'numberNode', number: 1 },
    { type: 'numberNode', number: 2 } ]
```
