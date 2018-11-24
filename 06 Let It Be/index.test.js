const { stringToTokens, tokensToAst, astToJs, runtime, execute } = require('./index');

describe('01 Tokens', () => {
  test('can tokenise a function call with two number arguments', () => {
    const input = `
      add(1, 2);
    `.trim();
    const tokens = stringToTokens(input);

    expect(tokens).toEqual([
      { capture: "add", type: "identifier" },
      { capture: undefined, type: "parenOpen" },
      { capture: "1", type: "literalNumber" },
      { capture: undefined, type: "comma" },
      { capture: "2", type: "literalNumber" },
      { capture: undefined, type: "parenClose" },
      { capture: undefined, type: "semicolon" }
    ]);
  });
});

describe('02 Basic Parsing', () => {
  test('can parse an exact expression of one function call with two number arguments', () => {
    const input = `
      add(1, 2);
    `.trim();
    const tokens = stringToTokens(input);
    const ast = tokensToAst(tokens);

    expect(ast).toEqual({
      declarations: [],
      returningExpression: {
        args: [
          { number: 1, type: "numberNode" },
          { number: 2, type: "numberNode" }
        ],
        functionIdentifier: "add",
        type: "functionCallNode"
      },
      type: "programNode"
    });
  });
});

describe('03 Expression Parsing', () => {
  test('can parse the same expression as in Exercise 02', () => {
    const input = `
      add(1, 2);
    `.trim();
    const tokens = stringToTokens(input);
    const ast = tokensToAst(tokens);

    expect(ast).toEqual({
      declarations: [],
      returningExpression: {
        args: [
          { number: 1, type: "numberNode" },
          { number: 2, type: "numberNode" }
        ],
        functionIdentifier: "add",
        type: "functionCallNode"
      },
      type: "programNode"
    });
  });

  test('can parse nested expressions', () => {
    const input = `
      add(1, add(2, 3));
    `.trim();
    const tokens = stringToTokens(input);
    const ast = tokensToAst(tokens);

    expect(ast).toEqual({
      declarations: [],
      returningExpression: {
        args: [
          { number: 1, type: "numberNode" },
          {
            args: [
              { number: 2, type: "numberNode" },
              { number: 3, type: "numberNode" }
            ],
            functionIdentifier: "add",
            type: "functionCallNode"
          }
        ],
        functionIdentifier: "add",
        type: "functionCallNode"
      },
      type: "programNode"
    });
  });
});

describe('04 Generating JavaScript', () => {
  test('produces executable JavaScript that returns the correct result', () => {
    const input = `
      add(1, add(2, 3));
    `.trim();
    const tokens = stringToTokens(input);
    const ast = tokensToAst(tokens);
    const generated = astToJs(ast);
    const js = runtime + "\n" + generated;

    execute(js, function(result) {
      expect(result).toEqual(6);
    });
  });
});

// There are no tests for 05; it's a challenge exercise to copy
// the existing index.js, change the generated code (to target a
// different language), and then use `node <yourlanguage>.js` to run it.
//describe('05 Generate Something Else', () => {});

describe('06 Adding "let"', () => {
  // Just a small helper; we're going to be more thorough with our tests.
  const generateJs = code => {
    const tokens = stringToTokens(code.trim());
    const ast = tokensToAst(tokens);
    const generated = astToJs(ast);
    return (runtime + "\n" + generated);
  };

  test('can use a "let" to hold a number', () => {
    const js = generateJs(`
      let one = 1;
      add(one, 2);
    `);
    execute(js, function(result) {
      expect(result).toEqual(3);
    });
  });

  test('can use a "let" to hold the result of an expression', () => {
    const js = generateJs(`
      let two = add(1, 1);
      add(1, two);
    `);
    execute(js, function(result) {
      expect(result).toEqual(3);
    });
  });

  test('can refer to other "let"-bound variables, if they have been declared already', () => {
    const js = generateJs(`
      let one = 1;
      let two = add(one, 1);
      add(1, two);
    `);
    execute(js, function(result) {
      expect(result).toEqual(3);
    });
  });

  test('does not yet handle referring to a variable if it has not been declared', () => {
    const js = generateJs(`
      let two = add(one, 1);
      let one = 1;
      add(1, two);
    `);
    execute(js, function(result) {
      expect(result).toEqual(NaN); // <-- not a desired result
    });
  });
});
