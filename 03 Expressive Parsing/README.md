03 Expressive Parsing
=====================

We have a really, really simple parser. Let's make it handle more than
our `add(1, 2);` case now.

The parser now has a new pair of functions to help with this:

* `peek(lookaheadAmount)`:
  Looks ahead <lookaheadAmount> tokens, so you can see what's coming
  next and make a decision about what you want to `consume()`.

* `peekIs(tokenType, lookaheadAmount)`:
  Looks ahead <lookaheadAmount> tokens, and tells you whether the
  token is of <tokenType>, eg. `peekIs("comma", 1)` is "is the
  next token a 'comma' type token"?  
  (We do a lot of token-type checks, so this is just a convenience for
  that; it's implemented using `peek()`.)


The parser has been fleshed out a lot; we have a `parseExpression()`
function now that uses `peekIs()` to look for numbers or things that
look like function calls.

`parseFunctionCall` is missing some things, though; it currently
handles examples like `add()` and `add(1)`, but not `add(1, 2)`.

The exercise is to fix it so that it can. It's strongly recommended
that you have a look at `parseExpression()` on the way through to
get your bearings. 😅

Bonus: Have a look at the bottom for another quick exercise.


As before, to this code as you go, open a terminal and run:

```
cd "03 Expressive Parsing"
npm start
```

If you're stuck, the solution is in `solution.js`; you can run it by running:

```
npm run peek
```
