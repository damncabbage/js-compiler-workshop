require('pretty-error').start().skipNodeFiles();
const { inspect } = require("util");


////////////////////////
//                    //
//     Tokenizer      //
//                    //
////////////////////////

function stringToTokens(input) {
  // Define the shape of tokens to look for.
  // We're using regexps for this because they're good/quick for simple
  // tokenizers; this isn't how all compilers are written. :'D
  const tokenizerRules = [
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
      regex: /([0-9])+/,
      token: "literalNumber"
    },
    {
      // This (...) business is to "capture" a chunk of text.
      // We didn't care about this for parenOpen, but we want
      // to keep what the identifier text is.
      regex: /([a-z][a-zA-Z0-9]*)/,
      token: "identifier"
    },
  ];

  // A function that attempts to figure out what the next chunk
  // of the code is. It looks through the above rules, and tries
  // each in sequence; if no rules match, it has a whinge.
  function getNextToken(input) {
    for (let i = 0; i < tokenizerRules.length; i++) {
      const rule = tokenizerRules[i];
      const matches = input.match(
        new RegExp(`^${rule.regex.source}`)
      );
      if (matches !== null) {
        return {
          remaining: input.slice(matches[0].length),
          newToken: {
            // Which rule did we match? eg. parenOpen
            type: rule.token,
            // If we captured something, store it:
            capture: matches[1]
          }
        };
      }
    }
    throw new Error(`Unrecognised input: ${input}`);
  }

  // Go!
  // We're cheating here by just flat-out ignoring whitespace: both
  // at the beginning (trimLeft), and on every loop.
  // A lot of languages can mostly ignore it, but you can't do this
  // for, say, Python or Ruby.
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

  // ...

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

  function consume(tokenType) {
    const token = tokens.shift();
    if (token && token.type === tokenType) {
      return token;
    } else {
      throw new Error(`Expected token ${tokenType}, got: ${inspect(token)}`);
    }
  }

  function peek(lookaheadAmount) {
    if (!lookaheadAmount) {
      throw new Error(`Cannot peek ${lookaheadAmount}`);
    }
    const token = tokens[lookaheadAmount - 1];
    return token;
  }

  function peekIs(tokenType, lookaheadAmount) {
    const token = peek(lookaheadAmount)
    if (token && token.type === tokenType) {
      return token;
    } else {
      return false;
    }
  }

  function parseExpression() {
    // Is the very next token a number? If so, go and process it.
    if (peekIs("literalNumber", 1)) {
      return parseNumber();
    } else {
      // Is the very next token an identifier (eg. function name)?
      if (peekIs("identifier", 1)) {
        // And is the token after that an opening parenthesis?
        if (peekIs("parenOpen", 2)) {
          // Can only be a function call; let's have a go.
          return parseFunctionCall();
        }
      }
    }
    // ... or explode.
    throw new Error(`Could not process expression; next token is: ${inspect(peek(1))}`);
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

    // Do we have any args? First thing to check is if our "("
    // is immediately followed by ")" in the token stream.
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

  function parseReturningExpression() {
    const expr = parseExpression();
    consume("semicolon");
    return expr;
  }

  function parseProgram() {
    const declarations = [];
    const returningExpression = parseReturningExpression();
    if (tokens.length != 0) {
      throw new Error(`There are still unprocessed tokens left! ${inspect(tokens)}`);
    }
    return programNode(declarations, returningExpression);
  }

  return parseProgram();
};


////////////////////////
//                    //
//   Code Generator   //
//                    //
////////////////////////

function astToJs(ast) {
  // EXERCISE:
  // Fill out the "numberNode" and "functionCallNode" cases here.
  // (A hint: for the "functionCallNode" case, you need to call
  // astToJs() with some part of the node you've received.)
  switch (ast.type) {
    case "programNode":
      return `
        var result = (function(){
          return (${astToJs(ast.returningExpression)});
        })();
        console.log(result);
      `;
    case "numberNode":
      // EXERCISE:
      // Spit out a number as a string.
      console.log("NODE numberNode:\n", inspect(ast), "\n");
      return "(TODO: number)";
    case "functionCallNode":
      // EXERCISE:
      // Spit out a chunk of JS that looks like:
      //   `${identifier}(${args})`
      console.log("NODE functionCallNode:\n", inspect(ast), "\n");
      return "(TODO: functionCallNode)";
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
    add(1, add(2, 3));
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
