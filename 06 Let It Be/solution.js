require('pretty-error').start().skipNodeFiles();
const { inspect } = require("util");


////////////////////////
//                    //
//     Tokenizer      //
//                    //
////////////////////////

function stringToTokens(input) {
  const tokenizerRules = [
    {
      regex: /let\b/,
      token: "letKeyword"
    },
    {
      regex: /=/,
      token: "equals"
    },
    {
      regex: /\(/,
      token: "parenOpen"
    },
    {
      regex: /\)/,
      token: "parenClose"
    },
    {
      regex: /,/,
      token: "comma"
    },
    {
      regex: /;/,
      token: "semicolon"
    },
    {
      regex: /([a-z][a-zA-Z0-9]*)/,
      token: "identifier"
    },
    {
      regex: /([0-9])+/,
      token: "literalNumber"
    },
  ];

  function getNextToken(input) {
    for (let i = 0; i < tokenizerRules.length; i++) {
      const rule = tokenizerRules[i];
      const matches = input.match(
        new RegExp(`^${rule.regex.source}`)
      );
      if (matches !== null) {
        const capture = matches[1];
        return {
          remaining: input.slice(matches[0].length),
          newToken: { type: rule.token, capture: matches[1] }
        };
      }
    }
    throw new Error(`Unrecognised input: ${input}`);
  }

  // Go!
  let tokens = [];
  let remaining = input.trimLeft();
  while (remaining.length > 0) {
    const result = getNextToken(remaining);
    remaining = result.remaining.trim();
    tokens.push(result.newToken);
  }
  return tokens;
}


////////////////////////
//                    //
//    Token Parser    //
//                    //
////////////////////////

function tokensToAst(inputTokens) {
  // Create a copy of the input; we're going to muck around with it
  // in here, and we don't want to surprise whoever called us.
  const tokens = inputTokens.slice(0);


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

  function consume(tokenType) {
    const token = tokens.shift();
    if (token && token.type === tokenType) {
      return token;
    } else {
      throw new Error(`Expected token ${tokenType}, got: ${inspect(token)}`);
    }
  }

  function peekIs(tokenType, lookaheadAmount) {
    const token = peek(lookaheadAmount)
    if (token && token.type === tokenType) {
      return token;
    } else {
      return false;
    }
  }

  function peek(lookaheadAmount) {
    if (!lookaheadAmount) {
      throw new Error(`Cannot peek ${lookaheadAmount}`);
    }
    const token = tokens[lookaheadAmount - 1];
    return token;
  }

  function parseExpression() {
    // Lots of guessing.
    if (peekIs("literalNumber", 1)) {
      return parseNumber();
    } else if (peekIs("identifier", 1)) {
      if (peekIs("parenOpen", 2)) {
        return parseFunctionCall();
      } else {
        return parseVariableReference();
      }
    }
    throw new Error(`Could not process expression; next token is: ${inspect(peek(1))}`);
  }

  function parseReturningExpression() {
    const expr = parseExpression();
    consume("semicolon");
    return expr;
  }

  function parseNumber() {
    const numberString = consume("literalNumber").capture;
    const number = parseInt(numberString, 10);
    if (Number.isNaN(number)) {
      throw new Error(`Invalid number: ${numberString}`);
    }
    return numberNode(number);
  }

  function parseFunctionCall() {
    const funcIdent = consume("identifier").capture;
    consume("parenOpen");
    const args = [];
    if (!peekIs("parenClose", 1)) {
      args.push(parseExpression());
      while (peekIs("comma", 1)) {
        consume("comma");
        args.push(parseExpression());
      }
    }
    consume("parenClose");
    return functionCallNode(funcIdent, args);
  }

  function parseVariableReference() {
    return variableReferenceNode(consume("identifier").capture);
  }

  function parseDeclaration() {
    consume("letKeyword");
    const ident = consume("identifier");
    consume("equals");
    const expr = parseExpression();
    consume("semicolon");
    return variableDeclarationNode(ident.capture, expr);
  }

  function parseProgram() {
    const declarations = [];

    while (peekIs("letKeyword", 1)) {
      declarations.push(parseDeclaration());
    }

    const expr = parseReturningExpression();
    if (tokens.length != 0) {
      throw new Error(`There are still unprocessed tokens left! ${inspect(tokens)}`);
    }
    return programNode(declarations, expr);
  }

  return parseProgram();
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
        resultHandler(result);
      `;
    case "functionCallNode":
      const args = ast.args.map(a => astToJs(a)).join(", ");
      return `${ast.functionIdentifier}(${args})`
    case "variableReferenceNode":
      return ast.identifier;
    case "variableDeclarationNode":
      return `var ${ast.identifier} = ${astToJs(ast.expression)};`;
    case "numberNode":
      return ast.number.toString();
    default:
      throw new Error(`Unknown type ${ast.type} for AST chunk: ${inspect(ast)}`);
  }
}

const runtime = `
  function add(x,y) {
    return x + y;
  };
`;

function execute(jsString, resultHandler) {
  eval(jsString);
}


/////////////////////////////
//                         //
//   Let's Run The Thing   //
//                         //
/////////////////////////////

function example() {
  const input = `
    let one = 1;
    let two = 2;
    let three = add(one, two);
    add(1, add(one, add(1, three)));
  `.trim();

  const tokens = stringToTokens(input);
  const ast = tokensToAst(tokens);
  const generated = astToJs(ast);
  const js = runtime + "\n" + generated;

  console.log("TOKENS:\n", tokens, "\n");
  console.log("AST:\n", inspect(ast), "\n");
  console.log("JS:\n", js, "\n");

  console.log("EVAL:");
  execute(js, function(x) { console.log(x) });
}

module.exports = { stringToTokens, tokensToAst, astToJs, runtime, execute };
if (require.main === module) example();
