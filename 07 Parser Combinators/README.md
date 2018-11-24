07 Parser Combinators
=====================

This exercise, we're taking a break from our compiler and going for a walk on
the functional side!

We're going to use Bodil Stokke's [Eulalie](https://github.com/bodil/eulalie/) to
implement a few small parsers. Eulalie is a "Parser Combinator" library, creating
parsers as values, that can be combined together into bigger parsers with little
functional helpers ("combinators").

(We're also not going to be using Jest; we'll be working through the `index.js` file instead.)

Edit `index.js`; I've marked the areas you need to extend with `EXERCISE`,
and an example solution is in `solution.js`.

As before, to this code as you go, open a terminal and run:

```
cd "07 Parser Combinators"
npm start
```
