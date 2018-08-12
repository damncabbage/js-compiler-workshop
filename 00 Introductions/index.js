const { inspect } = require("util");


////////////////////////
//                    //
//     Tokenizer      //
//                    //
////////////////////////

function stringToTokens(input) {
  // ...

  let tokens = [];
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

  const programNode = (declarations, returningExpression) => ({
    type: "programNode",
    declarations,
    returningExpression
  });

  function parseProgram() {
    const declarations = [];
    const returningExpression = null;
    // ...
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
  switch (ast.type) {
    case "programNode":
      return `
        var result = (function(){
          return null;
        })();
        console.log(result);
      `;
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
  add(1, 2);
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
