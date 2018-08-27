08 FP Parsing
=============

This last one is a sight-seeing tour; there's no exercise, just a completed
program to peruse and extend.

I've gone and converted the existing Tokeniser and Parser to use Eulalie; in
doing so, I've illustrated two things:

- Tokenisers and Parsers can be very similar in structure (if you like); each
  taking a stream of input, and producing an output of symbols. (We've used
  the parser-combinator-style library to unify the construction of both to an
  extent.)

- Parser Combinators are either
  a) nicer to read and more reusable due to everything being a value
     representing a parser instead of a set of imperative mutating instructions,

  ... OR ...

  b) barely-readable complicated noise when all you needed before are
     peek(), consume(), and a big array you gradually eat up as you progress
     with parsing some input.

  ... depending on your opinion. :D


Thanks for working your way through this workshop! I'd very much appreciate
any feedback you may have; either in GitHub issues, in person, or online at
https://twitter.com/damncabbage or similar. Cheers. :)
