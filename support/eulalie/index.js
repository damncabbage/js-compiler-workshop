"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.quotedString = exports.float = exports.int = exports.notSpaces1 = exports.notSpaces = exports.spaces1 = exports.spaces = exports.notLower = exports.notUpper = exports.notLetter = exports.notAlphanum = exports.notSpace = exports.notDigit = exports.lower = exports.upper = exports.letter = exports.alphanum = exports.space = exports.digit = exports.not = exports.isLower = exports.isUpper = exports.isLetter = exports.isAlphanum = exports.isSpace = exports.isDigit = exports.eof = undefined;
exports.isStream = isStream;
exports.isError = isError;
exports.isResult = isResult;
exports.error = error;
exports.result = result;
exports.stream = stream;
exports.parse = parse;
exports.makeParser = makeParser;
exports.seq = seq;
exports.chain = chain;
exports.either = either;
exports.cut = cut;
exports.unit = unit;
exports.fail = fail;
exports.failAt = failAt;
exports.expected = expected;
exports.item = item;
exports.sat = sat;
exports.maybe = maybe;
exports.manyA = manyA;
exports.many1A = many1A;
exports.many = many;
exports.many1 = many1;
exports.char = char;
exports.notChar = notChar;
exports.string = string;
exports.str = str;

var _isGeneratorFunction = require("is-generator-function");

var _isGeneratorFunction2 = _interopRequireDefault(_isGeneratorFunction);

var _isIterable = require("is-iterable");

var _isIterable2 = _interopRequireDefault(_isIterable);

var _isIteratorLike = require("is-iterator-like");

var _isIteratorLike2 = _interopRequireDefault(_isIteratorLike);

var _string = require("./string");

var stringOps = _interopRequireWildcard(_string);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function isGen(v) {
  try {
    if (regeneratorRuntime) {
      /* global regeneratorRuntime */
      return regeneratorRuntime.isGeneratorFunction(v);
    }
  } catch (e) {
    return (0, _isGeneratorFunction2.default)(v);
  }
}

class Stream {
  /**
   * A {@link Stream} is a structure containing a reference to a string, and a positional
   * index into that string. Three operations are permitted on it: reading the character
   * at the current index, testing whether you are at the end of the string, and
   * creating a new {@link Stream} pointing at the next index.
   *
   * The rationale between using a {@link Stream} structure instead of passing along a
   * string containing the remaining input is, of course, performance. A string slice
   * operation needs linear time to perform, whereas {@link Stream#next} runs in constant
   * time. Because you pass along only a reference to the same input string, memory usage
   * is also close to constant.
   * @arg {string} buffer
   * @arg {number} cursor
   */
  constructor(buffer, cursor) {
    this.name = "Eulalie.Stream";
    this.buffer = buffer;
    this.cursor = typeof cursor === "number" ? cursor : 0;
    Object.freeze(this);
  }

  /**
   * Get the character at the position represented by this {@link Stream}.
   */
  get() {
    if (this.atEnd()) {
      throw new Error("Cannot read past end of buffer.");
    }
    return this.buffer[this.cursor];
  }

  /**
   * Create a {@link Stream} pointing at the next character position.
   */
  next() {
    if (this.atEnd()) {
      throw new Error("Cannot step past end of buffer.");
    }
    return new Stream(this.buffer, this.cursor + 1);
  }

  /**
   * Return `true` if this {@link Stream} is pointing to the end of the input.
   */
  atEnd() {
    return this.cursor >= this.buffer.length;
  }

  /**
   * Return `true` if this {@link Stream} is equal (determined by whether
   * the buffer and cursor are equal) to the provided {@link Stream}.
   * @arg {Stream} other
   */
  equal(other) {
    return this.cursor === other.cursor && this.buffer === other.buffer;
  }
}

class ParseError extends Error {
  /**
   * A {@link ParseError} signals a failed parse operation, and holds the {@link Stream}
   * position at which the parser failed, along with an optional error message.
   * @arg {Stream} input
   * @arg {(string|Set)} expected
   * @arg {boolean} fatal - true if this error should terminate parsing immediately.
   */
  constructor(input, expected, fatal) {
    super();
    this.name = "Eulalie.ParseError";
    this.input = input;
    this.expected = expected instanceof Set ? expected : new Set(expected ? [expected] : []);
    this.fatal = fatal === true;
    Object.freeze(this);
  }

  /**
   * Return a copy of this error, with the provided expected value
   * in place of the current value.
   * @arg {string|Set} expected
   */
  withExpected(expected) {
    return new ParseError(this.input, expected, this.fatal);
  }

  /**
   * Return a copy of this error with the {@link fatal} property set to true.
   */
  escalate() {
    return new ParseError(this.input, this.expected, true);
  }

  /**
   * Create an aggregate error by adding another error to the current one.
   * If the new error occurs before the current in the buffer, it is simply
   * ignored, and the result will be the current error. If it's at the same
   * position, we return a new error containing the union of the two errors'
   * expected messages. If it's ahead of the current error, we discard the
   * current and return the new error unchanged.
   */
  extend(e) {
    if (this.input.cursor < e.input.cursor) {
      return e;
    }
    if (this.input.cursor > e.input.cursor) {
      return this;
    }
    let eP = new Set([...this.expected].concat([...e.expected]));
    return new ParseError(this.input, eP, this.fatal);
  }

  formatError(colours) {
    let c = new _chalk2.default.constructor({ enabled: Boolean(colours) });
    let quote = s => "\"" + s + "\"";
    let exp = e => [...e].join(" or ");
    return c.cyan("Expected ") + c.white.bold(exp(this.expected)) + c.cyan(", saw ") + c.white.bold(this.input.atEnd() ? "EOF" : quote(
        Array.isArray(this.input.buffer)
        ? require("util").inspect(
            this.input.buffer[this.input.cursor]
          )
        : stringOps.nextOnLine(6, this.input.buffer, this.input.cursor)
      ));
  }

  get message() {
    return this.formatError();
  }

  print(colours) {
    let c = new _chalk2.default.constructor({ enabled: Boolean(colours) });

    var _stringOps$findLine = stringOps.findLine(this.input.buffer, this.input.cursor);

    let line = _stringOps$findLine.line;
    let row = _stringOps$findLine.row;
    let column = _stringOps$findLine.column;

    let header = c.yellow("At line " + row + ", column " + column + ":\n\n");
    let arrowhead = c.cyan("\n" + stringOps.repeat(column, " ") + "^\n");
    let arrowstem = c.cyan(stringOps.repeat(column, " ") + "|\n");
    let msg = c.cyan.bold("ERROR: ") + this.formatError(colours);
    if (line.trim().length) {
      return header + line + arrowhead + arrowstem + msg;
    }
    return header + msg;
  }
}

class ParseResult {
  /**
   * A {@link ParseResult} holds the result of a successful parse operation. It contains
   * the value which was parsed, a {@link Stream} pointing to the remaining unconsumed
   * input, and some useful metadata.
   * @arg {any} value - The value which this parse operation produced.
   * @arg {Stream} next - The position if the remainder of the input stream.
   * @arg {Stream} start - The position at which this parser began parsing.
   * @arg {string} matched - The exact string this parser consumed.
   */
  constructor(value, next, start, matched) {
    this.name = "Eulalie.ParseResult";
    this.value = value;
    this.next = next;
    this.start = start;
    this.matched = matched;
    Object.freeze(this);
  }
}

function isStream(o) {
  return o.hasOwnProperty("name") && o.name === "Eulalie.ParseStream";
}

function isError(o) {
  return o.hasOwnProperty("name") && o.name === "Eulalie.ParseError";
}

function isResult(o) {
  return o.hasOwnProperty("name") && o.name === "Eulalie.ParseResult";
}

function error(input, message) {
  return new ParseError(input, message);
}

function result(value, next, start, matched) {
  return new ParseResult(value, next, start, matched);
}

/**
 * Create a {@link Stream} from a string.
 * @arg {string} s
 */
function stream(s) {
  return new Stream(s);
}

/**
 * Perform a parse operation.
 * @arg {Parser} parser - The parser to run.
 * @arg {Stream} input - The input to run the parser on.
 */
function parse(parser, input) {
  if (typeof parser !== "function") {
    throw new Error("eulalie.parse: expected a parser function, got " + parser);
  }
  return parser(input);
}

/**
 * Takes a parser and returns a function which takes a string as its only
 * argument, runs it through the provided parser, and either returns the value
 * of the {@link ParseResult} object it returns, or throws the
 * {@link ParseError} object if it returns an error.
 */
function makeParser(p) {
  return function (s) {
    let r = parse(p, stream(s));
    if (isError(r)) {
      throw r;
    } else if (isResult(r)) {
      return r.value;
    } else {
      throw new Error("parser returned non-ParseResult|Error: " + r);
    }
  };
}

function badValue(v) {
  let o = require("util").inspect(v);
  return new Error("Parser returned unexpected value: " + o);
}

/**
 * The {@link seq} combinator takes a parser, and a function which will receive the
 * result of that parser if it succeeds, and which should return another parser, which
 * will be run immediately after the initial parser. In this way, you can join parsers
 * together in a sequence, producing more complex parsers.
 *
 * Alternatively, you can pass a single generator function, which should yield parsers,
 * and which will receive back the {@link ParseResult}s resulting from running those
 * parsers on the input in sequence. If one of these parsers fails, the sequence stops
 * there. After parsing, you should `return` the value resulting from the parse
 * operation.
 *
 * @arg {(Parser|GeneratorFunction)} parser
 * @arg {?function(any): Parser} callback
 */
function seq(parser, callback) {
  if (isGen(parser)) {
    return start => {
      let iter = parser();
      let runP = (input, res) => {
        let next = iter.next(res !== undefined ? res : null);
        if (next.done) {
          return result(next.value, input, start, res.matched);
        }
        let out = parse(next.value, input);
        if (isResult(out)) {
          let matched = res === undefined ? out.matched : res.matched + out.matched;
          return runP(out.next, result(out.value, out.next, out.start, matched));
        }
        if (isError(out)) {
          return out;
        }
        throw badValue(out);
      };
      return runP(start);
    };
  }

  return input => {
    let out = parse(parser, input);
    if (isResult(out)) {
      let next = parse(callback(out.value, input), out.next);
      if (isResult(next)) {
        return result(next.value, next.next, input, out.matched + next.matched);
      }
      if (isError(next)) {
        return next;
      }
      throw badValue(next);
    }
    if (isError(out)) {
      return out;
    }
    throw badValue(out);
  };
}

/**
 * The {@link either} combinator takes two parsers, runs the first on the input stream,
 * and if that fails, it will proceed to trying the second parser on the same stream.
 * Basically, try parser 1, then try parser 2.
 *
 * Instead of two parsers, you can pass any iterable or iterator containing parsers,
 * which will then be attempted on the input stream in order until one succeeds.
 *
 * @arg {(Parser|Iterator|Iterable)} p1
 * @arg {?Parser} p2
 */
function either(p1, p2) {
  if (isGen(p1)) {
    return either(p1());
  }
  if ((0, _isIteratorLike2.default)(p1)) {
    var _p1$next = p1.next();

    let value = _p1$next.value;
    let done = _p1$next.done;

    return done ? fail : either(value, either(p1));
  }
  if ((0, _isIterable2.default)(p1)) {
    return either(p1[Symbol.iterator]());
  }
  return input => {
    let r1 = parse(p1, input);
    if (isResult(r1)) {
      return r1;
    }
    if (isError(r1)) {
      if (r1.fatal) {
        return r1;
      }
      let r2 = parse(p2, input);
      if (isResult(r2)) {
        return r2;
      }
      if (isError(r2)) {
        return r1.extend(r2);
      }
      throw badValue(r2);
    }
    throw badValue(r1);
  };
}

/**
 * The {@cut} parser combinator takes a parser and produces a new parser
 * for which all errors are fatal, causing {@either} blocks to stop trying
 * further parsers and return immediately with the fatal error.
 *
 * Two shorthands are available: first, you can pass it a generator function
 * instead of a parser, which will be turned into a parser using {@link seq}.
 * You can also give two arguments, which will generate a parser which
 * sequences the two parsers (or generators) together, with the cut applied
 * only to the second parser. If you need to capture the output of the first
 * parser, you'll need to build the sequence manually; this shorthand is only
 * helpful for situations where the first parser checks for a constant.
 * @arg {Parser} parser
 * @arg {?Parser} parser2
 */
function cut(parser, parser2) {
  let p = isGen(parser) ? seq(parser) : parser;
  if (parser2 !== undefined) {
    return seq(p, () => cut(parser2));
  }
  return input => {
    let r = parse(p, input);
    return isError(r) ? r.escalate() : r;
  };
}

/**
 * The {@link unit} parser constructor creates a parser which will simply return the
 * value provided as its argument, without consuming any input.
 *
 * It is particularly useful at the end of a {@link seq} chain.
 *
 * @arg {any} value
 * @arg {?string} matched - You can provide a value for the matched string to go in the
 *                          {@link ParseResult} here. This is usually not necessary.
 */
function unit(value) {
  let matched = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

  return input => result(value, input, input, matched);
}

/**
 * The {@link fail} parser will just fail immediately without consuming any
 * input.
 */
function fail(input) {
  return error(input);
}

/**
 * The {@link failAt} parser will fail immediately without consuming any input,
 * but will report the failure at the provided input position.
 * @arg {Stream} input
 */
function failAt(input) {
  return _ => error(input);
}

/**
 * A parser constructor which returns the provided parser unchanged except that
 * if it fails, the provided error message will be returned in the
 * {@link ParseError}.
 */
function expected(parser, message) {
  return function (input) {
    let result = parse(parser, input);
    return isError(result) ? result.withExpected(message) : result;
  };
}

/**
 * The {@link item} parser consumes a single character, regardless of what it is, and
 * returns it as its result.
 */
function item(input) {
  return input.atEnd() ? error(input) : result(input.get(), input.next(), input, input.get());
}

/**
 * The {@link sat} parser constructor takes a predicate function, and will consume a
 * single character if calling that predicate function with the character as its argument
 * returns `true`. If it returns `false`, the parser will fail.
 * @arg {function(string): boolean} predicate
 */
function sat(predicate) {
  return seq(item, (value, start) => predicate(value) ? unit(value) : () => fail(start));
}

/**
 * The {@link maybe} parser combinator creates a parser which will run the provided
 * parser on the input, and if it fails, it will return the empty string as a result,
 * without consuming input.
 * @arg {Parser} parser
 */
function maybe(parser) {
  return either(parser, unit(""));
}

/**
 * Matches the end of the stream.
 */
let eof = exports.eof = expected(input => input.atEnd() ? result(null, input, input, "") : error(input), "end of file");

/**
 * The {@link manyA} combinator takes a parser, and returns a new parser which will
 * run the parser repeatedly on the input stream until it fails, returning an array
 * of the result values of each parse operation as its result. This array may be
 * empty.
 * @arg {Parser} parser
 */
function manyA(parser) {
  return either(many1A(parser), unit([]));
}

/**
 * The {@link many1A} combinator is just like the {@link manyA} combinator, except it
 * requires its wrapped parser to match at least once. The result array is thus
 * guaranteed to contain at least one value.
 * @arg {Parser} parser
 */
function many1A(parser) {
  return seq(parser, head => seq(manyA(parser), tail => unit([head, ...tail])));
}

/**
 * The {@link many} combinator takes a parser which must return a string value, and
 * returns a new parser which will match the input parser zero or more times, returning
 * the complete matched string. This string may be empty.
 * @arg {Parser} parser
 */
function many(parser) {
  return maybe(many1(parser));
}

/**
 * The {@link many1} combinator is just like the {@link many} combinator, except it
 * requires its wrapped parser to match at least once. The result string is thus
 * guaranteed to be non-empty.
 * @arg {Parser} parser
 */
function many1(parser) {
  return seq(parser, head => seq(many(parser), tail => unit(head + tail)));
}

/**
 * The {@link char} parser constructor returns a parser which matches only the specified
 * single character.
 * @arg {string} c - The character this parser will match.
 */
function char(c) {
  return expected(sat(i => i === c), "\"" + c + "\"");
}

/**
 * The {@link notChar} parser constructor makes a parser which will match any single
 * character which is not the one provided.
 * @arg {string} c - The character this parser won't match.
 */
function notChar(c) {
  return expected(sat(i => i !== c), "anything but \"" + c + "\"");
}

/**
 * The {@link string} parser constructor builds a parser which matches the exact string
 * provided.
 * @arg {string} s - The string to match.
 */
function string(s) {
  function stringP(s) {
    if (s.length > 0) {
      return seq(char(s[0]), () => seq(stringP(s.slice(1)), () => unit(s)));
    }
    return unit("");
  }
  return expected(stringP(s), "\"" + s + "\"");
}

/** Returns true if `c` is a digit. */
let isDigit = exports.isDigit = c => /^\d$/.test(c);
/** Returns true if `c` is whitespace. */
let isSpace = exports.isSpace = c => /^\s$/.test(c);
/** Returns true if `c` is a letter, a digit or the underscore character. */
let isAlphanum = exports.isAlphanum = c => /^\w$/.test(c);
/** Returns true if `c` is an ASCII letter. */
let isLetter = exports.isLetter = c => /^[a-zA-Z]$/.test(c);
/** Returns true if `c` is an upper case ASCII letter. */
let isUpper = exports.isUpper = c => isLetter(c) && c == c.toUpperCase();
/** Returns true if `c` is a lower case ASCII letter. */
let isLower = exports.isLower = c => isLetter(c) && c == c.toLowerCase();
/** Takes a predicate function and returns its inverse. */
let not = exports.not = f => c => !f(c);

/** Parses a single digit using {@link isDigit} as a predicate. */
let digit = exports.digit = expected(sat(isDigit), "a digit");
/** Parses a single whitespace character using {@link isSpace} as a predicate. */
let space = exports.space = expected(sat(isSpace), "whitespace");
/** Parses a single word character using {@link isAlphanum} as a predicate. */
let alphanum = exports.alphanum = expected(sat(isAlphanum), "a word character");
/** Parses a single letter using {@link isLetter} as a predicate. */
let letter = exports.letter = expected(sat(isLetter), "a letter");
/** Parses a single upper case letter using {@link isUpper} as a predicate. */
let upper = exports.upper = expected(sat(isUpper), "an upper case letter");
/** Parses a single lower case letter using {@link isLower} as a predicate. */
let lower = exports.lower = expected(sat(isLower), "a lower case letter");

/** Parses a single character that is not a digit using {@link isDigit} as a predicate. */
let notDigit = exports.notDigit = expected(sat(not(isDigit)), "a non-digit");
/** Parses a single non-whitespace character using {@link isSpace} as a predicate. */
let notSpace = exports.notSpace = expected(sat(not(isSpace)), "a non-whitespace character");
/** Parses a single non-word character using {@link isAlphanum} as a predicate. */
let notAlphanum = exports.notAlphanum = expected(sat(not(isAlphanum)), "a non-word character");
/** Parses a single non-letter using {@link isLetter} as a predicate. */
let notLetter = exports.notLetter = expected(sat(not(isLetter)), "a non-letter");
/** Parses a single character that is not an upper case letter using {@link isUpper} as a predicate. */
let notUpper = exports.notUpper = expected(sat(not(isUpper)), "anything but an upper case letter");
/** Parses a single character that is not a lower case letter using {@link isLower} as a predicate. */
let notLower = exports.notLower = expected(sat(not(isLower)), "anything but a lower case letter");

/** Parses zero or more whitespace characters. */
let spaces = exports.spaces = many(space);
/** Parses one or more whitespace characters. */
let spaces1 = exports.spaces1 = expected(many1(space), "whitespace");

/** Parses zero or more non-whitespace characters. */
let notSpaces = exports.notSpaces = many(sat(not(isSpace)));
/** Parses one or more non-whitespace characters. */
let notSpaces1 = exports.notSpaces1 = expected(many1(sat(not(isSpace))), "one or more non-whitespace characters");

function chain(...parsersThenCallback) {
  return parsersThenCallback.reduce((newParser, parserOrCallback) => {
    if (parserOrCallback.constructor == Function) {
      // Callback
      return seq(newParser, parserOrCallback);
    } else {
      // Parser
      return seq(newParser, () => {
        return parserOrCallback;
      })
    }
  });
}


/**
 * Given a list of parsers which return string values, builds a parser which
 * matches each of them in sequence and returns the entire string matched by
 * the sequence.
 */
function str(_ref) {
  var _ref2 = _toArray(_ref);

  let head = _ref2[0];

  let tail = _ref2.slice(1);

  return tail.length ? seq(head, v => seq(str(tail), vs => unit(v + vs))) : head;
}

/** Parses a positive or negative integer. */
let int = exports.int = expected(seq(function* () {
  let r = yield str([maybe(char("-")), many1(digit)]);
  let n = parseInt(r.value, 10);
  if (isNaN(n)) {
    yield fail;
  }
  return n;
}), "an integer");

/** Parses a positive or negative floating point number. */
let float = exports.float = expected(seq(function* () {
  let r = yield str([maybe(char("-")), many(digit), maybe(str([char("."), many1(digit)]))]);
  let n = parseFloat(r.value);
  if (isNaN(n)) {
    yield fail;
  }
  return n;
}), "a number");

/** Parses a double quoted string, with support for escaping double quotes
 * inside it, and returns the inner string. Does not perform any other form
 * of string escaping.
 */
let quotedString = exports.quotedString = expected(seq(function* () {
  yield char("\"");

  var _ref3 = yield many(either(seq(char("\\"), () => item), notChar("\"")));

  let s = _ref3.value;

  yield char("\"");
  return s;
}), "a quoted string");
