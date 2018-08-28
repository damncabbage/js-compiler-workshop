require('pretty-error').start().skipNodeFiles();
const { inspect } = require("util");
const stopHere = () => { console.log("\n\n... Stopping here."); process.exit(0); }


// We're going to use a Parser Combinator library called Eulalie.
const p = require("eulalie");


// This is a parser. It's a value that represents the idea of
// "parsing a string that starts with 'traffic light'":
const trafficLight =
  p.string("traffic light");

// This, too, is a parser. It represents "parsing a string that
// starts with 'The', a space, and then 'traffic light'".
// It is a parser itself: it's made up of other parsers, built
// up using some helper functions ("combinators").
const theTrafficLight =
  p.seq(p.string("The"), () =>
    p.seq(p.space, () =>
      p.seq(trafficLight, () =>
        // This "unit" function is a way of making a parser. Think of it like
        // a parser that represents 'returning' a value. Don't get stuck on this;
        // we're not going to use this much.
        // In this case, we're literally returning a null, because we're not keeping
        // any of the input string; we're just checking that the input matches
        // the shape we're expecting ("The", space, then "traffic light").
        p.unit(null)
      )
    )
  );

// This is a parser representing a choice; in this case, it's "red" or "green":
const redOrGreen =
  p.either([
    p.string("red"),
    p.string("green"),
  ]);

// NOTE: This style of parser is a bit awkward to write like this, and can look overwhelming!
//       They're useful to see like this, but we'll switch to something friendlier a little
//       later on in the exercise.

// Pressing on!
// Let's put some of these together, and parse "The traffic light is red"
// or "The traffic light is green", and returning the light colour as the result.
// We're going to make use of our reusable parsers (both tiny and our more complex
// ones from above).
const theTrafficLightIsRedOrGreen =
  p.seq(theTrafficLight, () =>
    p.seq(p.space, () =>
      p.seq(p.string("is"), () =>
        p.seq(p.space, () =>
          p.seq(redOrGreen, (colour) =>
            // eof means "end of the string" (or "End Of File", more literally).
            // Here, we're checking we're at the end of the string, and then
            // returning the colour we captured earlier.
            p.seq(p.eof, () =>
              p.unit(colour)
            )
          )
        )
      )
    )
  );

// A quick helper to get nicer errors...
function parseAndLog(parser, input, shouldSucceed) {
  const resultOrError = p.parse(parser, p.stream(input));
  if (p.isError(resultOrError)) {
    const input = resultOrError.input;
    console.log(`
      *** Failed: ${resultOrError.message}, on character ${input.cursor} of ${inspect(input.buffer)}`);
    if (shouldSucceed) console.log("     This should not have failed! 😰");
  } else {
    console.log(`
      --- Success: Result: ${inspect(resultOrError.value)}`);
    if (!shouldSucceed) console.log("    This should not have succeeded! 😰");
  }
}

// Let's see how this goes:
console.log("### Traffic Lights all-functions example: ###");

// Good:
parseAndLog(theTrafficLightIsRedOrGreen, "The traffic light is red", true);

// Not so good:
parseAndLog(theTrafficLightIsRedOrGreen, "The traffic light is blue", false);

//
// Run this file, and check out the messages you get for each of the above.
//


// *************************************************************
// ... When you're ready to continue, remove the following line:
stopHere();


//
// EXERCISE:
// Change the below to match either "traffic light" or "apple":
//
const trafficLightOrApple =
  p.string("traffic light");

const theThingIsRedOrGreen =
  p.seq(p.string("The"), () =>
    p.seq(p.space, () =>
      p.seq(trafficLightOrApple, (thing) => // <-- Your parser is used here
        p.seq(p.space, () =>
          p.seq(p.string("is"), () =>
            p.seq(p.space, () =>
              p.seq(redOrGreen, (colour) =>
                p.seq(p.eof, () =>
                  // return, for example, { thing: "apple", colour: "red" }
                  p.unit({ thing, colour })
                )
              )
            )
          )
        )
      )
    )
  );


// Let's see how this goes:
console.log("\n");
console.log("### Traffic Lights all-functions exercise: ###");

// Good:
parseAndLog(theThingIsRedOrGreen, "The traffic light is green", true);
parseAndLog(theThingIsRedOrGreen, "The apple is red", true);

// Not so good:
parseAndLog(theThingIsRedOrGreen, "The apple is blue", false);

//
// Run this file, and check out the messages you get for each of the above.
//
// *************************************************************
// ... When you're ready to continue, remove the following line:
stopHere();



// We said earlier that there's a nicer-to-use form of the above.
// Eulalie nicely provides us an interface that uses JavaScript's
// 'Generators' language feature.

// Here's our earlier "the traffic light is <red | green>" parser:
const theTrafficLightIsRedOrGreen2 =
  p.seq(theTrafficLight, () =>
    p.seq(p.space, () =>
      p.seq(p.string("is"), () =>
        p.seq(p.space, () =>
          p.seq(redOrGreen, (colour) =>
            p.seq(p.eof, () =>
              p.unit(colour)
            )
          )
        )
      )
    )
  );

// ... And here's the same using Eulalie's Generator interface:
const theTrafficLightIsRedOrGreen3 = p.seq(function*() {
  yield p.string("The");
  yield p.space
  yield p.string("traffic light");
  yield p.space
  yield p.string("is");
  yield p.space
  const { value: colour } = yield redOrGreen; // We can still reuse our existing parsers.
  yield p.eof;
  return colour;
});

console.log("\n");
console.log("### Traffic Lights all-functions generator conversion: ###");
parseAndLog(theTrafficLightIsRedOrGreen2, "The traffic light is green", true);
parseAndLog(theTrafficLightIsRedOrGreen3, "The traffic light is red", true);

// Run this file, and check out the messages you get for each of the above.


// EXERCISE:
// Implement theThingIsRedOrGreen again, except use the Generator-style method.
// (If you want to, try defining the 'apple' / 'traffic light' inside the generator function,
// instead of reusing trafficLightOrApple.)
const theThingIsRedOrGreen2 = p.seq(function*(){
  yield p.string("the");
  // ...
  return { thing: "...", colour: "..." };
});



// Let's parse "The <traffic light | apple> is <red | green>".
const inputs = [
  "The traffic light is red",
  "The apple is green",
  "The traffic light is green",
  "The apple is red",
];
const badInputs = [
  "The traffic light is yellow",
  "The traffic light is red or green",
  "The apple light is red",
];

console.log("\n");
console.log("### Traffic Lights all-functions generator conversion exercise: ###");
inputs.forEach(input => parseAndLog(theThingIsRedOrGreen2, input, true));
badInputs.forEach(input => parseAndLog(theThingIsRedOrGreen2, input, false));
