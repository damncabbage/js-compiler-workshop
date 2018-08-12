const { inspect } = require("util");


////////////////////////
//                    //
//     Tokenizer      //
//                    //
////////////////////////

function stringToTokens(input) {
  const tokenizerRules = [
    //
    // EXERCISE: New tokens needed here for `let`-ing.
    //
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
  //
  // EXERCISE REFERENCE: Adding two new node types for use below.
  //
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
    if (peekIs("literalNumber", 1)) {
      return parseNumber();
    } else {
      // is the next thing a variable...?
      if (peekIs("identifier", 1)) {
        // Okay, is the thing after it a parenthesis...?
        if (peekIs("parenOpen", 2)) {
          // Then it's a function call.
          return parseFunctionCall();
        } else {
          // Otherwise...

          //
          // EXERCISE: Parse a variable reference.
          //
        }
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
    //
    // EXERCISE: Get the variable identifier and create a new
    // var-reference node.
    //
  }

  function parseDeclaration() {
    consume("letKeyword");
    //
    // EXERCISE: After getting the 'let' keyword, look for the other
    // parts like the identifier and expression.
    // Return a new var-declaration node.
    //
  }

  function parseProgram() {
    const declarations = [];

    //
    // EXERCISE: Look for letKeyword tokens, and choose to parse
    // variable declarations if you find them, pushing them onto
    // the declarations variable above.
    //

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
        console.log(result);
      `;
    case "functionCallNode":
      const args = ast.args.map(a => astToJs(a)).join(", ");
      return `${ast.functionIdentifier}(${args})`
    case "variableReferenceNode":
      //
      // EXERCISE: Return a string that is a variable reference.
      //
      return "(TODO: Variable Reference Node)";
    case "variableDeclarationNode":
      //
      // EXERCISE: Return a string that is declaring a new JS variable.
      //
      return "(TODO: Variable Declaration Node)";
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
