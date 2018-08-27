"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findLine = findLine;
exports.repeat = repeat;
exports.nextOnLine = nextOnLine;
function findLineStart(s, i) {
  let pos = i;
  while (pos >= 0 && s[pos] !== "\n") {
    pos--;
  }
  pos++;
  return { index: pos, column: i - pos };
}

function findLineEnd(s, i) {
  let pos = i;
  while (pos < s.length && s[pos] !== "\n") {
    pos++;
  }
  return pos;
}

function findLineNumber(s, i) {
  let pos = i,
      l = 1;
  while (pos >= 0) {
    pos--;
    if (s[pos] === "\n") {
      l++;
    }
  }
  return l;
}

/**
 * Given a string and an index, return the line number, column position, and
 * the whole line at that index.
 * @arg s - The string to look into.
 * @arg i - The index into the string.
 * @returns {object} - An object containing the line, row and column.
 */
function findLine(s, i) {
  let pos = i > s.length ? s.length - 1 : i;

  var _findLineStart = findLineStart(s, pos);

  let start = _findLineStart.index;
  let column = _findLineStart.column;

  let end = findLineEnd(s, pos);
  let row = findLineNumber(s, pos);
  return { row: row, column: column, line: s.slice(start, end) };
}

/**
 * Repeat a string `n` times.
 */
function repeat(n, s) {
  return n > 0 ? s + repeat(n - 1, s) : "";
}

/**
 * Returns the next `n` characters from the string, starting at index `i`,
 * or until a newline. Include a concatenation marker if we didn't hit a
 * newline.
 */
function nextOnLine(n, s, i) {
  let ct = 0,
      pos = i,
      out = "";
  while (ct < n && s[pos] !== "\n" && pos < s.length) {
    out += s[pos];
    pos++;
    ct++;
  }
  if (s[pos] !== "\n" && pos < s.length) {
    out += "...";
  }
  return out;
}