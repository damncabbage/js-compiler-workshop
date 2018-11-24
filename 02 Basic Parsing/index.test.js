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
