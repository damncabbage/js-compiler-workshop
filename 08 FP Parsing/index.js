require('pretty-error').start().skipNodeFiles();
const { inspect } = require("util");

// Let's pull in Eulalie for the tokeniser.
const p = require("../support/eulalie");


////////////////////////
//                    //
//     Tokenizer      //
//                    //
////////////////////////

function stringToTokens(input) {

  const ignoreResult = parser => p.seq(function*(){
    yield parser;
    return null;
  });

  const literal = str => ignoreResult(p.string(str));

  const tokenizerRules = [
    {
      // p.str(...) takes a list of parsers, and combines them together, returning
      // whatever combined string was matched.
      // (We're then throwing the result away with our ignoreResult combinator above. :] )
      match: ignoreResult(p.str([
        p.string("let"),
        p.many1(p.space) // at least one thing that looks like whitespace
      ])),
      token: "letKeyword"
    },
    {
      match: literal("="),
      token: "equals"
    },
    {
      match: literal("("),
      token: "parenOpen"
    },
    {
      match: literal(")"),
      token: "parenClose"
    },
    {
      match: literal(","),
      token: "comma"
    },
    {
      match: literal(";"),
      token: "semicolon"
    },
    {
      match: p.str([
        p.lower, // one: a-z
        p.many(p.alphanum) // zero or more: a-zA-Z0-9
      ]),
      token: "identifier"
    },
    {
      match: p.many1(p.digit),
      token: "literalNumber"
    },
  ];

  const tokeniser = p.seq(function*(){
    const { value: tokens } = yield p.manyA(p.either(
      tokenizerRules.map(({ match, token }) => p.seq(function*(){
        yield p.many(p.space);
        const { value } = yield match;
        yield p.many(p.space);
        return {
          type: token,
          capture: value,
        };
      }))
    ));
    yield p.eof;
    return tokens;
  });

  // Go!
  const resultOrError = p.parse(tokeniser, p.stream(input));
  if (p.isError(resultOrError)) {
    const { message, input } = resultOrError;
    throw new Error(`Tokeniser: ${message}, on character ${input.cursor} of ${inspect(input.buffer)}`);
  } else {
    return resultOrError.value;
  }
}


////////////////////////
//                    //
//    Token Parser    //
//                    //
////////////////////////

function tokensToAst(tokens) {

  // AST node creators
  const programNode = (declarations, returningExpression) => ({
    type: "programNode",
    declarations,
    returningExpression
  });
  const numberNode = num => ({
    type: "numberNode",
    number: num
  });
  const functionCallNode = (functionIdentifier, args) => ({
    type: "functionCallNode",
    functionIdentifier,
    args
  });
  const variableReferenceNode = (identifier) => ({
    type: "variableReferenceNode",
    identifier
  });
  const variableDeclarationNode = (identifier, expression) => ({
    type: "variableDeclarationNode",
    identifier,
    expression
  });

  //// Helpers

  // A helper that lets us choose to expect a
  // particular token type:
  const token = expectedType => p.seq(function*(){
    const { value: token } = yield p.expected(p.sat(
      ({ type }) => expectedType == type
    ), `a ${expectedType} token`);
    return token.capture;
  });
 
  // A (very generic) pair of parser helpers that lets us get a
  // list of things, separated by another kind of thing.
  const sepBy1 = (parser, separatorParser) => p.seq(function*(){
    const { value: head } = yield parser;
    const { value: tail } = yield p.manyA(p.seq(function*(){
      yield separatorParser;
      const { value: x } = yield parser;
      return x;
    }));
    return [head].concat(tail);
  });
  const sepBy = (parser, separatorParser) => p.either([
    sepBy1(parser, separatorParser),
    p.unit([]),
  ]);



  //// Parsers

  const expressionParser = p.seq(function*(){
    const { value } = yield p.either([
      numberParser,
      functionCallParser,
      variableReferenceParser,
    ]);
    return value;
  });

  const returningExpressionParser = p.seq(function*(){
    const { value: expr } = yield expressionParser;
    yield token("semicolon");
    return expr;
  });

  const numberParser = p.seq(function*(){
    const { value: numString } = yield token("literalNumber");
    const number = parseInt(numString, 10);
    if (Number.isNaN(number)) {
      yield p.fail;
    } else {
      return numberNode(number);
    }
  });

  const functionCallParser = p.seq(function*(){
    const { value: ident } = yield token("identifier");
    yield token("parenOpen");
    const { value: args } = yield sepBy(expressionParser, token("comma"));
    console.log({ args });
    yield token("parenClose");
    return functionCallNode(ident, args);
  });

  const variableReferenceParser = p.seq(function*(){
    const { value: ident } = yield token("identifier");
    return variableReferenceNode(ident);
  });

  const declarationParser = p.seq(function*(){
    yield token("letKeyword");
    const { value: ident } = yield token("identifier");
    yield token("equals");
    const { value: expr } = yield expressionParser;
    yield token("semicolon");
    return variableDeclarationNode(ident, expr);
  });

  const programParser = p.seq(function*(){
    const { value: declarations } = yield p.manyA(declarationParser);
    const { value: expr } = yield returningExpressionParser;
    yield p.eof;
    return programNode(declarations, expr);
  });


  //// Go!
 
  const resultOrError = p.parse(programParser, p.stream(tokens));
  if (p.isError(resultOrError)) {
    const { message } = resultOrError;
    throw new Error(`Parser: ${message}`);
  } else {
    return resultOrError.value;
  }
};


////////////////////////
//                    //
//   Code Generator   //
//                    //
////////////////////////

function astToJs(ast) {
  switch (ast.type) {
    case "programNode":
      return `
        var result = (function(){
          ${ast.declarations.map(d => astToJs(d)).join("\n")}
          return (${astToJs(ast.returningExpression)});
        })();
        console.log(result);
      `;
    case "functionCallNode":
      const args = ast.args.map(a => astToJs(a)).join(", ");
      return `${ast.functionIdentifier}(${args})`
    case "variableReferenceNode":
      return ast.identifier;
    case "variableDeclarationNode":
      return `const ${ast.identifier} = ${astToJs(ast.expression)};`;
    case "numberNode":
      return ast.number.toString();
    default:
      throw new Error(`Unknown type ${ast.type} for AST chunk: ${inspect(ast)}`);
  }
}


/////////////////////////////
//                         //
//   Let's Run The Thing   //
//                         //
/////////////////////////////

const input = `
  let one = 1;
  let two = 2;
  let three = add(one, two);
  add(1, add(one, add(1, three)));
`.trim();
const tokens = stringToTokens(input);
const ast = tokensToAst(tokens);

const runtime = `
  function add(x,y) { return x + y; };
`;
const generated = astToJs(ast);
const js = runtime + "\n" + generated;

console.log("TOKENS:\n", tokens, "\n");
console.log("AST:\n", inspect(ast), "\n");
console.log("JS:\n", js, "\n");

console.log("EVAL:");
(function(){ eval(js); })();
