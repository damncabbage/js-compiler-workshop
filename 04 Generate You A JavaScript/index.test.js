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
