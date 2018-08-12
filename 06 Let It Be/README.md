06 Let It Be
============

⚔️⚔️  Challenge Round Two! 🎉🎉

Let's add variable declarations.

The language, as per the talk, is a very restricted
"declare, declare, declare, return expression" language, rather
than something (like JavaScript) that lets you intermingle variable
declarations, statements and expressions.

A sample larger program:

```
let one = 1;
let two = 2;
let three = add(one, two);
add(1, add(one, add(1, three)));
```

This exercise is more free-form than the previous 01 - 04 exercises.
I've marked the areas you need to extend with `EXERCISE`, and an
example solution is in `solution.js` as usual.
