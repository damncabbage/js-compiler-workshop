01 Tokenising
================

Tokenizer, `stringToTokens()`:  
Take the input, and turn it into a list of symbols (tokens) that are easier to interpret than raw strings.

We have a bit of our language we want to write a tokeniser for:

```
add(1, 2);
```

There are a couple of token types implemented so far: a literal open parenthesis, and an identifer made up of at least one lowercase letter (and optionally uppercase letters and numbers), eg. `fooBar2`.

The exercise is to implement the rest of the tokens needed.

As before, to this code as you go, open a terminal and run:

```
cd "01 Tokens"
npm start
```

If you're stuck, the solution is in `solution.js`; you can run it by running:

```
npm run peek
```
