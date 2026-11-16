// Safe browser-native Python subset tokenizer, AST parser, and bounded-step interpreter.
// Supports def, if/elif/else, for/while, break/continue/return, lists, dicts, sets, tuples,
// slicing, list comprehensions, standard operators, and core built-ins without external CDNs or eval.

type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'IDENT'
  | 'OP'
  | 'PUNCT'
  | 'NEWLINE'
  | 'INDENT'
  | 'DEDENT'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string;
  line: number;
}

const KEYWORDS = new Set([
  'def',
  'return',
  'if',
  'elif',
  'else',
  'for',
  'in',
  'while',
  'break',
  'continue',
  'pass',
  'and',
  'or',
  'not',
  'is',
  'True',
  'False',
  'None',
]);

class PySyntaxError extends Error {
  constructor(message: string, line: number) {
    super(`SyntaxError (line ${line}): ${message}`);
  }
}

class PyRuntimeError extends Error {}

function tokenizePython(source: string): Token[] {
  const tokens: Token[] = [];
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const indentStack = [0];
  let parenDepth = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineNum = lineIdx + 1;
    const rawLine = lines[lineIdx];

    // Check leading spaces/tabs only when not inside ()/[]/{}
    let pos = 0;
    let indent = 0;
    while (pos < rawLine.length && (rawLine[pos] === ' ' || rawLine[pos] === '\t')) {
      indent += rawLine[pos] === '\t' ? 4 : 1;
      pos++;
    }

    // Blank line or full-line comment
    if (pos >= rawLine.length || rawLine[pos] === '#') {
      continue;
    }

    if (parenDepth === 0) {
      const currentIndent = indentStack[indentStack.length - 1];
      if (indent > currentIndent) {
        indentStack.push(indent);
        tokens.push({ type: 'INDENT', value: '', line: lineNum });
      } else {
        while (indent < indentStack[indentStack.length - 1]) {
          indentStack.pop();
          tokens.push({ type: 'DEDENT', value: '', line: lineNum });
        }
        if (indent !== indentStack[indentStack.length - 1]) {
          throw new PySyntaxError('Unindent does not match any outer indentation level', lineNum);
        }
      }
    }

    while (pos < rawLine.length) {
      const ch = rawLine[pos];
      if (ch === ' ' || ch === '\t') {
        pos++;
        continue;
      }
      if (ch === '#') {
        break;
      }

      // Strings
      if (ch === '"' || ch === "'") {
        const quote = ch;
        pos++;
        let str = '';
        let closed = false;
        while (pos < rawLine.length) {
          const c = rawLine[pos];
          if (c === '\\' && pos + 1 < rawLine.length) {
            const next = rawLine[pos + 1];
            if (next === 'n') str += '\n';
            else if (next === 't') str += '\t';
            else if (next === '\\') str += '\\';
            else if (next === quote) str += quote;
            else str += next;
            pos += 2;
            continue;
          }
          if (c === quote) {
            closed = true;
            pos++;
            break;
          }
          str += c;
          pos++;
        }
        if (!closed) {
          throw new PySyntaxError('Unterminated string literal', lineNum);
        }
        tokens.push({ type: 'STRING', value: str, line: lineNum });
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch)) {
        let end = pos;
        let seenDot = false;
        while (end < rawLine.length) {
          const c = rawLine[end];
          if (/[0-9]/.test(c)) {
            end++;
          } else if (c === '.' && !seenDot && /[0-9]/.test(rawLine[end + 1] ?? '')) {
            seenDot = true;
            end++;
          } else {
            break;
          }
        }
        tokens.push({ type: 'NUMBER', value: rawLine.slice(pos, end), line: lineNum });
        pos = end;
        continue;
      }

      // Identifiers & Keywords
      if (/[a-zA-Z_]/.test(ch)) {
        let end = pos;
        while (end < rawLine.length && /[a-zA-Z0-9_]/.test(rawLine[end])) {
          end++;
        }
        const ident = rawLine.slice(pos, end);
        tokens.push({ type: 'IDENT', value: ident, line: lineNum });
        pos = end;
        continue;
      }

      // Multi-char operators
      const two = rawLine.slice(pos, pos + 2);
      if (
        ['==', '!=', '<=', '>=', '//', '**', '+=', '-=', '*=', '/=', '%='].includes(two)
      ) {
        tokens.push({ type: 'OP', value: two, line: lineNum });
        pos += 2;
        continue;
      }

      // Punctuation
      if ('()[]{},:'.includes(ch)) {
        if (ch === '(' || ch === '[' || ch === '{') parenDepth++;
        if (ch === ')' || ch === ']' || ch === '}') parenDepth = Math.max(0, parenDepth - 1);
        tokens.push({ type: 'PUNCT', value: ch, line: lineNum });
        pos++;
        continue;
      }

      // Single-char operators
      if ('+-*/%<>=!'.includes(ch)) {
        tokens.push({ type: 'OP', value: ch, line: lineNum });
        pos++;
        continue;
      }

      // Attribute access dot
      if (ch === '.') {
        tokens.push({ type: 'PUNCT', value: '.', line: lineNum });
        pos++;
        continue;
      }

      throw new PySyntaxError(`Unexpected character '${ch}'`, lineNum);
    }

    if (parenDepth === 0) {
      tokens.push({ type: 'NEWLINE', value: '\n', line: lineNum });
    }
  }

  while (indentStack.length > 1) {
    indentStack.pop();
    tokens.push({ type: 'DEDENT', value: '', line: lines.length });
  }

  tokens.push({ type: 'EOF', value: '', line: lines.length });
  return tokens;
}

// AST Nodes
type Stmt =
  | { kind: 'def'; name: string; params: { name: string; defaultVal?: Expr }[]; body: Stmt[] }
  | { kind: 'return'; value?: Expr }
  | { kind: 'if'; branches: { cond?: Expr; body: Stmt[] }[] }
  | { kind: 'for'; targets: string[]; iter: Expr; body: Stmt[] }
  | { kind: 'while'; cond: Expr; body: Stmt[] }
  | { kind: 'break' }
  | { kind: 'continue' }
  | { kind: 'pass' }
  | { kind: 'assign'; target: AssignTarget; op: string; value: Expr }
  | { kind: 'multiAssign'; names: string[]; value: Expr }
  | { kind: 'expr'; expr: Expr };

type AssignTarget =
  | { kind: 'var'; name: string }
  | { kind: 'index'; obj: Expr; index: Expr };

type Expr =
  | { kind: 'literal'; value: PyValue }
  | { kind: 'var'; name: string }
  | { kind: 'list'; items: Expr[] }
  | { kind: 'listComp'; expr: Expr; targets: string[]; iter: Expr; cond?: Expr }
  | { kind: 'tuple'; items: Expr[] }
  | { kind: 'dict'; entries: { key: Expr; val: Expr }[] }
  | { kind: 'unary'; op: string; arg: Expr }
  | { kind: 'binary'; op: string; left: Expr; right: Expr }
  | { kind: 'ternary'; cond: Expr; thenExpr: Expr; elseExpr: Expr }
  | { kind: 'call'; callee: Expr; args: { name?: string; value: Expr }[] }
  | { kind: 'attr'; obj: Expr; prop: string }
  | { kind: 'index'; obj: Expr; index: Expr }
  | { kind: 'slice'; obj: Expr; start?: Expr; stop?: Expr; step?: Expr };

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(offset = 0): Token {
    return this.tokens[this.pos + offset] ?? this.tokens[this.tokens.length - 1];
  }

  private match(type: TokenType, value?: string): boolean {
    const t = this.peek();
    if (t.type !== type) return false;
    if (value !== undefined && t.value !== value) return false;
    return true;
  }

  private consume(type?: TokenType, value?: string): Token {
    const t = this.peek();
    if (type && t.type !== type) {
      throw new PySyntaxError(`Expected ${type}, got ${t.type} ('${t.value}')`, t.line);
    }
    if (value !== undefined && t.value !== value) {
      throw new PySyntaxError(`Expected '${value}', got '${t.value}'`, t.line);
    }
    this.pos++;
    return t;
  }

  private skipNewlines() {
    while (this.match('NEWLINE')) this.consume();
  }

  parseProgram(): Stmt[] {
    const stmts: Stmt[] = [];
    this.skipNewlines();
    while (!this.match('EOF')) {
      stmts.push(this.parseStmt());
      this.skipNewlines();
    }
    return stmts;
  }

  private parseBlock(): Stmt[] {
    this.consume('PUNCT', ':');
    this.consume('NEWLINE');
    this.consume('INDENT');
    const body: Stmt[] = [];
    this.skipNewlines();
    while (!this.match('DEDENT') && !this.match('EOF')) {
      body.push(this.parseStmt());
      this.skipNewlines();
    }
    if (this.match('DEDENT')) this.consume();
    return body;
  }

  private parseStmt(): Stmt {
    const t = this.peek();
    if (t.type === 'IDENT') {
      if (t.value === 'def') return this.parseDef();
      if (t.value === 'return') {
        this.consume();
        if (this.match('NEWLINE') || this.match('EOF')) {
          if (this.match('NEWLINE')) this.consume();
          return { kind: 'return' };
        }
        const value = this.parseTupleOrExpr();
        if (this.match('NEWLINE')) this.consume();
        return { kind: 'return', value };
      }
      if (t.value === 'if') return this.parseIf();
      if (t.value === 'for') return this.parseFor();
      if (t.value === 'while') return this.parseWhile();
      if (t.value === 'break') {
        this.consume();
        if (this.match('NEWLINE')) this.consume();
        return { kind: 'break' };
      }
      if (t.value === 'continue') {
        this.consume();
        if (this.match('NEWLINE')) this.consume();
        return { kind: 'continue' };
      }
      if (t.value === 'pass') {
        this.consume();
        if (this.match('NEWLINE')) this.consume();
        return { kind: 'pass' };
      }
    }

    // Tuple unpacking assignment: a, b = expr
    if (
      this.peek().type === 'IDENT' &&
      !KEYWORDS.has(this.peek().value) &&
      this.peek(1).type === 'PUNCT' &&
      this.peek(1).value === ','
    ) {
      const savePos = this.pos;
      const names: string[] = [this.consume('IDENT').value];
      let validTupleTarget = true;
      while (this.match('PUNCT', ',')) {
        this.consume();
        if (this.peek().type === 'IDENT' && !KEYWORDS.has(this.peek().value)) {
          names.push(this.consume('IDENT').value);
        } else {
          validTupleTarget = false;
          break;
        }
      }
      if (validTupleTarget && this.match('OP', '=')) {
        this.consume();
        const value = this.parseTupleOrExpr();
        if (this.match('NEWLINE')) this.consume();
        return { kind: 'multiAssign', names, value };
      }
      this.pos = savePos;
    }

    const expr = this.parseExpr();
    if (
      this.match('OP', '=') ||
      this.match('OP', '+=') ||
      this.match('OP', '-=') ||
      this.match('OP', '*=') ||
      this.match('OP', '/=') ||
      this.match('OP', '%=')
    ) {
      const op = this.consume('OP').value;
      const value = this.parseTupleOrExpr();
      if (this.match('NEWLINE')) this.consume();
      if (expr.kind === 'var') {
        return { kind: 'assign', target: { kind: 'var', name: expr.name }, op, value };
      }
      if (expr.kind === 'index') {
        return {
          kind: 'assign',
          target: { kind: 'index', obj: expr.obj, index: expr.index },
          op,
          value,
        };
      }
      throw new PySyntaxError('Invalid assignment target', t.line);
    }

    if (this.match('NEWLINE')) this.consume();
    return { kind: 'expr', expr };
  }

  private parseDef(): Stmt {
    this.consume('IDENT', 'def');
    const name = this.consume('IDENT').value;
    this.consume('PUNCT', '(');
    const params: { name: string; defaultVal?: Expr }[] = [];
    while (!this.match('PUNCT', ')')) {
      const pName = this.consume('IDENT').value;
      let defaultVal: Expr | undefined;
      if (this.match('OP', '=')) {
        this.consume();
        defaultVal = this.parseExpr();
      }
      params.push({ name: pName, defaultVal });
      if (this.match('PUNCT', ',')) this.consume();
      else break;
    }
    this.consume('PUNCT', ')');
    const body = this.parseBlock();
    return { kind: 'def', name, params, body };
  }

  private parseIf(): Stmt {
    const branches: { cond?: Expr; body: Stmt[] }[] = [];
    this.consume('IDENT', 'if');
    const firstCond = this.parseExpr();
    branches.push({ cond: firstCond, body: this.parseBlock() });
    this.skipNewlines();
    while (this.match('IDENT', 'elif')) {
      this.consume();
      const cond = this.parseExpr();
      branches.push({ cond, body: this.parseBlock() });
      this.skipNewlines();
    }
    if (this.match('IDENT', 'else')) {
      this.consume();
      branches.push({ body: this.parseBlock() });
    }
    return { kind: 'if', branches };
  }

  private parseFor(): Stmt {
    this.consume('IDENT', 'for');
    const targets: string[] = [this.consume('IDENT').value];
    while (this.match('PUNCT', ',')) {
      this.consume();
      targets.push(this.consume('IDENT').value);
    }
    this.consume('IDENT', 'in');
    const iter = this.parseTupleOrExpr();
    const body = this.parseBlock();
    return { kind: 'for', targets, iter, body };
  }

  private parseWhile(): Stmt {
    this.consume('IDENT', 'while');
    const cond = this.parseExpr();
    const body = this.parseBlock();
    return { kind: 'while', cond, body };
  }

  private parseTupleOrExpr(): Expr {
    const first = this.parseExpr();
    if (!this.match('PUNCT', ',')) return first;
    const items: Expr[] = [first];
    while (this.match('PUNCT', ',')) {
      this.consume();
      if (this.match('NEWLINE') || this.match('EOF') || this.match('PUNCT', ')')) break;
      items.push(this.parseExpr());
    }
    return { kind: 'tuple', items };
  }

  private parseExpr(): Expr {
    const expr = this.parseOr();
    if (this.match('IDENT', 'if')) {
      this.consume();
      const cond = this.parseOr();
      this.consume('IDENT', 'else');
      const elseExpr = this.parseExpr();
      return { kind: 'ternary', cond, thenExpr: expr, elseExpr };
    }
    return expr;
  }

  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.match('IDENT', 'or')) {
      this.consume();
      const right = this.parseAnd();
      left = { kind: 'binary', op: 'or', left, right };
    }
    return left;
  }

  private parseAnd(): Expr {
    let left = this.parseNot();
    while (this.match('IDENT', 'and')) {
      this.consume();
      const right = this.parseNot();
      left = { kind: 'binary', op: 'and', left, right };
    }
    return left;
  }

  private parseNot(): Expr {
    if (this.match('IDENT', 'not')) {
      this.consume();
      return { kind: 'unary', op: 'not', arg: this.parseNot() };
    }
    return this.parseComparison();
  }

  private parseComparison(): Expr {
    const left = this.parseAddSub();
    const cmpOps: Expr[] = [];
    const operators: string[] = [];

    while (true) {
      if (
        this.match('OP', '==') ||
        this.match('OP', '!=') ||
        this.match('OP', '<') ||
        this.match('OP', '<=') ||
        this.match('OP', '>') ||
        this.match('OP', '>=')
      ) {
        operators.push(this.consume('OP').value);
        cmpOps.push(this.parseAddSub());
      } else if (this.match('IDENT', 'in')) {
        this.consume();
        operators.push('in');
        cmpOps.push(this.parseAddSub());
      } else if (this.match('IDENT', 'not') && this.peek(1).type === 'IDENT' && this.peek(1).value === 'in') {
        this.consume();
        this.consume();
        operators.push('not in');
        cmpOps.push(this.parseAddSub());
      } else if (this.match('IDENT', 'is')) {
        this.consume();
        if (this.match('IDENT', 'not')) {
          this.consume();
          operators.push('is not');
        } else {
          operators.push('is');
        }
        cmpOps.push(this.parseAddSub());
      } else {
        break;
      }
    }

    if (operators.length === 0) return left;
    // Build chained comparison a < b < c -> (a < b) and (b < c)
    let result: Expr = { kind: 'binary', op: operators[0], left, right: cmpOps[0] };
    for (let i = 1; i < operators.length; i++) {
      const nextCmp: Expr = {
        kind: 'binary',
        op: operators[i],
        left: cmpOps[i - 1],
        right: cmpOps[i],
      };
      result = { kind: 'binary', op: 'and', left: result, right: nextCmp };
    }
    return result;
  }

  private parseAddSub(): Expr {
    let left = this.parseMulDiv();
    while (this.match('OP', '+') || this.match('OP', '-')) {
      const op = this.consume('OP').value;
      left = { kind: 'binary', op, left, right: this.parseMulDiv() };
    }
    return left;
  }

  private parseMulDiv(): Expr {
    let left = this.parseUnary();
    while (
      this.match('OP', '*') ||
      this.match('OP', '/') ||
      this.match('OP', '//') ||
      this.match('OP', '%')
    ) {
      const op = this.consume('OP').value;
      left = { kind: 'binary', op, left, right: this.parseUnary() };
    }
    return left;
  }

  private parseUnary(): Expr {
    if (this.match('OP', '-') || this.match('OP', '+')) {
      const op = this.consume('OP').value;
      return { kind: 'unary', op, arg: this.parseUnary() };
    }
    return this.parsePower();
  }

  private parsePower(): Expr {
    const base = this.parsePostfix();
    if (this.match('OP', '**')) {
      this.consume();
      return { kind: 'binary', op: '**', left: base, right: this.parseUnary() };
    }
    return base;
  }

  private parsePostfix(): Expr {
    let expr = this.parsePrimary();
    while (true) {
      if (this.match('PUNCT', '(')) {
        this.consume();
        const args: { name?: string; value: Expr }[] = [];
        while (!this.match('PUNCT', ')')) {
          if (
            this.peek().type === 'IDENT' &&
            this.peek(1).type === 'OP' &&
            this.peek(1).value === '='
          ) {
            const name = this.consume('IDENT').value;
            this.consume('OP', '=');
            args.push({ name, value: this.parseExpr() });
          } else {
            args.push({ value: this.parseExpr() });
          }
          if (this.match('PUNCT', ',')) this.consume();
          else break;
        }
        this.consume('PUNCT', ')');
        expr = { kind: 'call', callee: expr, args };
      } else if (this.match('PUNCT', '.')) {
        this.consume();
        const prop = this.consume('IDENT').value;
        expr = { kind: 'attr', obj: expr, prop };
      } else if (this.match('PUNCT', '[')) {
        this.consume();
        if (this.match('PUNCT', ':')) {
          this.consume();
          const stop =
            this.match('PUNCT', ':') || this.match('PUNCT', ']')
              ? undefined
              : this.parseExpr();
          let step: Expr | undefined;
          if (this.match('PUNCT', ':')) {
            this.consume();
            if (!this.match('PUNCT', ']')) step = this.parseExpr();
          }
          this.consume('PUNCT', ']');
          expr = { kind: 'slice', obj: expr, stop, step };
        } else {
          const first = this.parseExpr();
          if (this.match('PUNCT', ':')) {
            this.consume();
            const stop =
              this.match('PUNCT', ':') || this.match('PUNCT', ']')
                ? undefined
                : this.parseExpr();
            let step: Expr | undefined;
            if (this.match('PUNCT', ':')) {
              this.consume();
              if (!this.match('PUNCT', ']')) step = this.parseExpr();
            }
            this.consume('PUNCT', ']');
            expr = { kind: 'slice', obj: expr, start: first, stop, step };
          } else {
            this.consume('PUNCT', ']');
            expr = { kind: 'index', obj: expr, index: first };
          }
        }
      } else {
        break;
      }
    }
    return expr;
  }

  private parsePrimary(): Expr {
    const t = this.peek();
    if (t.type === 'NUMBER') {
      this.consume();
      return { kind: 'literal', value: Number(t.value) };
    }
    if (t.type === 'STRING') {
      this.consume();
      return { kind: 'literal', value: t.value };
    }
    if (t.type === 'IDENT') {
      if (t.value === 'True') {
        this.consume();
        return { kind: 'literal', value: true };
      }
      if (t.value === 'False') {
        this.consume();
        return { kind: 'literal', value: false };
      }
      if (t.value === 'None') {
        this.consume();
        return { kind: 'literal', value: null };
      }
      if (KEYWORDS.has(t.value)) {
        throw new PySyntaxError(`Unexpected keyword '${t.value}'`, t.line);
      }
      this.consume();
      return { kind: 'var', name: t.value };
    }
    if (t.type === 'PUNCT' && t.value === '(') {
      this.consume();
      if (this.match('PUNCT', ')')) {
        this.consume();
        return { kind: 'tuple', items: [] };
      }
      const first = this.parseExpr();
      if (this.match('PUNCT', ',')) {
        const items: Expr[] = [first];
        while (this.match('PUNCT', ',')) {
          this.consume();
          if (this.match('PUNCT', ')')) break;
          items.push(this.parseExpr());
        }
        this.consume('PUNCT', ')');
        return { kind: 'tuple', items };
      }
      this.consume('PUNCT', ')');
      return first;
    }
    if (t.type === 'PUNCT' && t.value === '[') {
      this.consume();
      if (this.match('PUNCT', ']')) {
        this.consume();
        return { kind: 'list', items: [] };
      }
      const first = this.parseExpr();
      if (this.match('IDENT', 'for')) {
        this.consume();
        const targets: string[] = [this.consume('IDENT').value];
        while (this.match('PUNCT', ',')) {
          this.consume();
          targets.push(this.consume('IDENT').value);
        }
        this.consume('IDENT', 'in');
        const iter = this.parseOr();
        let cond: Expr | undefined;
        if (this.match('IDENT', 'if')) {
          this.consume();
          cond = this.parseExpr();
        }
        this.consume('PUNCT', ']');
        return { kind: 'listComp', expr: first, targets, iter, cond };
      }
      const items: Expr[] = [first];
      while (this.match('PUNCT', ',')) {
        this.consume();
        if (this.match('PUNCT', ']')) break;
        items.push(this.parseExpr());
      }
      this.consume('PUNCT', ']');
      return { kind: 'list', items };
    }
    if (t.type === 'PUNCT' && t.value === '{') {
      this.consume();
      if (this.match('PUNCT', '}')) {
        this.consume();
        return { kind: 'dict', entries: [] };
      }
      const entries: { key: Expr; val: Expr }[] = [];
      while (!this.match('PUNCT', '}')) {
        const key = this.parseExpr();
        this.consume('PUNCT', ':');
        const val = this.parseExpr();
        entries.push({ key, val });
        if (this.match('PUNCT', ',')) this.consume();
        else break;
      }
      this.consume('PUNCT', '}');
      return { kind: 'dict', entries };
    }

    throw new PySyntaxError(`Unexpected token '${t.value || t.type}'`, t.line);
  }
}

export type PyValue =
  | number
  | string
  | boolean
  | null
  | PyValue[]
  | PyDict
  | PySet
  | PyTuple
  | PyFunction;

interface PyDict {
  __pyType: 'dict';
  map: Map<string, { key: PyValue; value: PyValue }>;
}

interface PySet {
  __pyType: 'set';
  items: Map<string, PyValue>;
}

interface PyTuple {
  __pyType: 'tuple';
  items: PyValue[];
}

interface PyFunction {
  __pyType: 'fn';
  name: string;
  call: (args: PyValue[], kwargs: Record<string, PyValue>) => PyValue;
}

function isPyDict(v: PyValue): v is PyDict {
  return typeof v === 'object' && v !== null && '__pyType' in v && v.__pyType === 'dict';
}

function isPySet(v: PyValue): v is PySet {
  return typeof v === 'object' && v !== null && '__pyType' in v && v.__pyType === 'set';
}

function isPyTuple(v: PyValue): v is PyTuple {
  return typeof v === 'object' && v !== null && '__pyType' in v && v.__pyType === 'tuple';
}

function isPyFn(v: PyValue): v is PyFunction {
  return typeof v === 'object' && v !== null && '__pyType' in v && v.__pyType === 'fn';
}

function makeDict(entries: [PyValue, PyValue][] = []): PyDict {
  const map = new Map<string, { key: PyValue; value: PyValue }>();
  for (const [k, val] of entries) {
    map.set(keySig(k), { key: k, value: val });
  }
  return { __pyType: 'dict', map };
}

function keySig(v: PyValue): string {
  if (typeof v === 'string') return `s:${v}`;
  if (typeof v === 'number') return `n:${v}`;
  if (typeof v === 'boolean') return `b:${v ? 1 : 0}`;
  if (v === null) return 'null';
  if (isPyTuple(v)) return `t:(${v.items.map(keySig).join(',')})`;
  throw new PyRuntimeError('Unhashable type used as dict key or set element');
}

function isTruthy(v: PyValue): boolean {
  if (v === null || v === false) return false;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (isPyDict(v)) return v.map.size > 0;
  if (isPySet(v)) return v.items.size > 0;
  if (isPyTuple(v)) return v.items.length > 0;
  return true;
}

export function pyValuesEqual(a: PyValue, b: PyValue): boolean {
  if (typeof a === 'boolean' && typeof b === 'number') return (a ? 1 : 0) === b;
  if (typeof a === 'number' && typeof b === 'boolean') return a === (b ? 1 : 0);
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, idx) => pyValuesEqual(v, b[idx]));
  }
  if (isPyTuple(a) && isPyTuple(b)) {
    return a.items.length === b.items.length && a.items.every((v, idx) => pyValuesEqual(v, b.items[idx]));
  }
  if (isPyDict(a) && isPyDict(b)) {
    if (a.map.size !== b.map.size) return false;
    for (const [k, entry] of a.map.entries()) {
      const other = b.map.get(k);
      if (!other || !pyValuesEqual(entry.value, other.value)) return false;
    }
    return true;
  }
  if (isPySet(a) && isPySet(b)) {
    if (a.items.size !== b.items.size) return false;
    for (const k of a.items.keys()) {
      if (!b.items.has(k)) return false;
    }
    return true;
  }
  return false;
}

export function jsToPyValue(val: unknown): PyValue {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean') return val;
  if (Array.isArray(val)) return val.map(jsToPyValue);
  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>).map(
      ([k, v]): [PyValue, PyValue] => [k, jsToPyValue(v)]
    );
    return makeDict(entries);
  }
  return null;
}

export function pyToJsValue(val: PyValue): unknown {
  if (val === null || typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean') {
    return val;
  }
  if (Array.isArray(val)) return val.map(pyToJsValue);
  if (isPyTuple(val)) return val.items.map(pyToJsValue);
  if (isPySet(val)) return Array.from(val.items.values()).map(pyToJsValue);
  if (isPyDict(val)) {
    const out: Record<string, unknown> = {};
    for (const { key, value } of val.map.values()) {
      out[String(key)] = pyToJsValue(value);
    }
    return out;
  }
  return `[function ${val.name}]`;
}

class ReturnSignal {
  constructor(public value: PyValue) {}
}
class BreakSignal {}
class ContinueSignal {}

type Env = Map<string, PyValue>;

function toIterable(val: PyValue): PyValue[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return Array.from(val);
  if (isPyTuple(val)) return val.items;
  if (isPySet(val)) return Array.from(val.items.values());
  if (isPyDict(val)) return Array.from(val.map.values()).map((e) => e.key);
  throw new PyRuntimeError('Value is not iterable');
}

function makeSlice<T>(items: T[], start?: number, stop?: number, step = 1): T[] {
  if (step === 0) throw new PyRuntimeError('Slice step cannot be zero');
  const len = items.length;
  const norm = (idx: number, defaultVal: number) => {
    if (idx === undefined) return defaultVal;
    const adjusted = idx < 0 ? len + idx : idx;
    return step > 0 ? Math.max(0, Math.min(len, adjusted)) : Math.max(-1, Math.min(len - 1, adjusted));
  };
  const s = start === undefined ? (step > 0 ? 0 : len - 1) : norm(start, 0);
  const e = stop === undefined ? (step > 0 ? len : -1) : norm(stop, len);
  const out: T[] = [];
  if (step > 0) {
    for (let i = s; i < e; i += step) out.push(items[i]);
  } else {
    for (let i = s; i > e; i += step) out.push(items[i]);
  }
  return out;
}

class Interpreter {
  private steps = 0;
  private maxSteps = 50000;
  public globalEnv: Env = new Map();

  constructor() {
    this.installBuiltins();
  }

  private tick() {
    this.steps++;
    if (this.steps > this.maxSteps) {
      throw new PyRuntimeError('Execution step limit exceeded (possible infinite loop)');
    }
  }

  private installBuiltins() {
    const fn = (
      name: string,
      impl: (args: PyValue[], kwargs: Record<string, PyValue>) => PyValue
    ): PyFunction => ({
      __pyType: 'fn',
      name,
      call: impl,
    });

    this.globalEnv.set(
      'len',
      fn('len', ([v]) => {
        if (typeof v === 'string' || Array.isArray(v)) return v.length;
        if (isPyTuple(v)) return v.items.length;
        if (isPyDict(v)) return v.map.size;
        if (isPySet(v)) return v.items.size;
        throw new PyRuntimeError('Object has no len()');
      })
    );

    this.globalEnv.set(
      'range',
      fn('range', (args) => {
        let start = 0;
        let stop = 0;
        let step = 1;
        if (args.length === 1) stop = Number(args[0]);
        else if (args.length === 2) {
          start = Number(args[0]);
          stop = Number(args[1]);
        } else if (args.length === 3) {
          start = Number(args[0]);
          stop = Number(args[1]);
          step = Number(args[2]);
        } else {
          throw new PyRuntimeError('range() expects 1 to 3 arguments');
        }
        if (step === 0) throw new PyRuntimeError('range() step cannot be zero');
        const out: number[] = [];
        if (step > 0) {
          for (let i = start; i < stop; i += step) {
            this.tick();
            out.push(i);
          }
        } else {
          for (let i = start; i > stop; i += step) {
            this.tick();
            out.push(i);
          }
        }
        return out;
      })
    );

    this.globalEnv.set(
      'sum',
      fn('sum', ([iter, startVal]) => {
        let total = typeof startVal === 'number' ? startVal : 0;
        for (const item of toIterable(iter)) total += Number(item);
        return total;
      })
    );

    this.globalEnv.set(
      'min',
      fn('min', (args) => {
        const items = args.length === 1 ? toIterable(args[0]) : args;
        if (items.length === 0) throw new PyRuntimeError('min() arg is empty');
        return items.reduce((a, b) => ((a as number) < (b as number) ? a : b));
      })
    );

    this.globalEnv.set(
      'max',
      fn('max', (args) => {
        const items = args.length === 1 ? toIterable(args[0]) : args;
        if (items.length === 0) throw new PyRuntimeError('max() arg is empty');
        return items.reduce((a, b) => ((a as number) > (b as number) ? a : b));
      })
    );

    this.globalEnv.set('abs', fn('abs', ([v]) => Math.abs(Number(v))));
    this.globalEnv.set('round', fn('round', ([v]) => Math.round(Number(v))));
    this.globalEnv.set('int', fn('int', ([v]) => Math.trunc(Number(v))));
    this.globalEnv.set('float', fn('float', ([v]) => Number(v)));
    this.globalEnv.set('bool', fn('bool', ([v]) => isTruthy(v)));
    this.globalEnv.set('str', fn('str', ([v]) => (v === null ? 'None' : String(v))));
    this.globalEnv.set('list', fn('list', (args) => (args.length ? [...toIterable(args[0])] : [])));
    this.globalEnv.set(
      'set',
      fn('set', (args) => {
        const items = new Map<string, PyValue>();
        if (args.length) {
          for (const item of toIterable(args[0])) items.set(keySig(item), item);
        }
        return { __pyType: 'set', items };
      })
    );
    this.globalEnv.set(
      'dict',
      fn('dict', () => makeDict())
    );
    this.globalEnv.set(
      'sorted',
      fn('sorted', ([iter], kwargs) => {
        const copy = [...toIterable(iter)];
        const rev = isTruthy(kwargs.reverse ?? false);
        copy.sort((a, b) => {
          if (typeof a === 'number' && typeof b === 'number') return a - b;
          return String(a).localeCompare(String(b));
        });
        return rev ? copy.reverse() : copy;
      })
    );
    this.globalEnv.set(
      'reversed',
      fn('reversed', ([iter]) => [...toIterable(iter)].reverse())
    );
    this.globalEnv.set(
      'enumerate',
      fn('enumerate', ([iter, startVal]) => {
        const start = typeof startVal === 'number' ? startVal : 0;
        return toIterable(iter).map(
          (val, idx): PyTuple => ({ __pyType: 'tuple', items: [start + idx, val] })
        );
      })
    );
    this.globalEnv.set(
      'zip',
      fn('zip', (args) => {
        const iters = args.map(toIterable);
        const minLen = iters.length ? Math.min(...iters.map((a) => a.length)) : 0;
        const out: PyTuple[] = [];
        for (let i = 0; i < minLen; i++) {
          out.push({ __pyType: 'tuple', items: iters.map((it) => it[i]) });
        }
        return out;
      })
    );
    this.globalEnv.set('all', fn('all', ([iter]) => toIterable(iter).every(isTruthy)));
    this.globalEnv.set('any', fn('any', ([iter]) => toIterable(iter).some(isTruthy)));
    this.globalEnv.set('print', fn('print', () => null));
  }

  runProgram(stmts: Stmt[]) {
    this.execBlock(stmts, this.globalEnv);
  }

  callFunction(name: string, jsArgs: unknown[]): unknown {
    this.steps = 0;
    const fn = this.globalEnv.get(name);
    if (!fn || !isPyFn(fn)) {
      throw new PyRuntimeError(`Function '${name}' is not defined`);
    }
    const pyArgs = jsArgs.map(jsToPyValue);
    const result = fn.call(pyArgs, {});
    return pyToJsValue(result);
  }

  private lookup(name: string, env: Env): PyValue {
    if (env.has(name)) return env.get(name)!;
    if (this.globalEnv.has(name)) return this.globalEnv.get(name)!;
    throw new PyRuntimeError(`NameError: name '${name}' is not defined`);
  }

  private execBlock(stmts: Stmt[], env: Env) {
    for (const stmt of stmts) {
      this.tick();
      this.execStmt(stmt, env);
    }
  }

  private execStmt(stmt: Stmt, env: Env) {
    switch (stmt.kind) {
      case 'pass':
        return;
      case 'break':
        throw new BreakSignal();
      case 'continue':
        throw new ContinueSignal();
      case 'return':
        throw new ReturnSignal(stmt.value ? this.evalExpr(stmt.value, env) : null);
      case 'expr':
        this.evalExpr(stmt.expr, env);
        return;
      case 'def': {
        const closure = env;
        const pyFn: PyFunction = {
          __pyType: 'fn',
          name: stmt.name,
          call: (args, kwargs) => {
            const localEnv: Env = new Map(closure);
            stmt.params.forEach((p, idx) => {
              if (idx < args.length) {
                localEnv.set(p.name, args[idx]);
              } else if (p.name in kwargs) {
                localEnv.set(p.name, kwargs[p.name]);
              } else if (p.defaultVal) {
                localEnv.set(p.name, this.evalExpr(p.defaultVal, closure));
              } else {
                throw new PyRuntimeError(`${stmt.name}() missing argument '${p.name}'`);
              }
            });
            try {
              this.execBlock(stmt.body, localEnv);
              return null;
            } catch (sig) {
              if (sig instanceof ReturnSignal) return sig.value;
              throw sig;
            }
          },
        };
        env.set(stmt.name, pyFn);
        return;
      }
      case 'assign': {
        const rhs = this.evalExpr(stmt.value, env);
        if (stmt.target.kind === 'var') {
          if (stmt.op === '=') {
            env.set(stmt.target.name, rhs);
          } else {
            const cur = this.lookup(stmt.target.name, env);
            env.set(stmt.target.name, this.applyBinary(stmt.op.slice(0, -1), cur, rhs));
          }
          return;
        }
        const obj = this.evalExpr(stmt.target.obj, env);
        const idx = this.evalExpr(stmt.target.index, env);
        if (Array.isArray(obj)) {
          let i = Number(idx);
          if (i < 0) i += obj.length;
          if (i < 0 || i >= obj.length) throw new PyRuntimeError('IndexError: list index out of range');
          obj[i] = stmt.op === '=' ? rhs : this.applyBinary(stmt.op.slice(0, -1), obj[i], rhs);
          return;
        }
        if (isPyDict(obj)) {
          const sig = keySig(idx);
          const nextVal =
            stmt.op === '='
              ? rhs
              : this.applyBinary(stmt.op.slice(0, -1), obj.map.get(sig)?.value ?? 0, rhs);
          obj.map.set(sig, { key: idx, value: nextVal });
          return;
        }
        throw new PyRuntimeError('Object does not support item assignment');
      }
      case 'multiAssign': {
        const val = this.evalExpr(stmt.value, env);
        const items = toIterable(val);
        if (items.length !== stmt.names.length) {
          throw new PyRuntimeError('ValueError: mismatch in unpacking length');
        }
        stmt.names.forEach((n, idx) => env.set(n, items[idx]));
        return;
      }
      case 'if': {
        for (const branch of stmt.branches) {
          if (!branch.cond || isTruthy(this.evalExpr(branch.cond, env))) {
            this.execBlock(branch.body, env);
            return;
          }
        }
        return;
      }
      case 'for': {
        const items = toIterable(this.evalExpr(stmt.iter, env));
        for (const item of items) {
          this.tick();
          if (stmt.targets.length === 1) {
            env.set(stmt.targets[0], item);
          } else {
            const tupleItems = toIterable(item);
            if (tupleItems.length !== stmt.targets.length) {
              throw new PyRuntimeError('ValueError: cannot unpack loop item');
            }
            stmt.targets.forEach((n, i) => env.set(n, tupleItems[i]));
          }
          try {
            this.execBlock(stmt.body, env);
          } catch (sig) {
            if (sig instanceof BreakSignal) break;
            if (sig instanceof ContinueSignal) continue;
            throw sig;
          }
        }
        return;
      }
      case 'while': {
        while (isTruthy(this.evalExpr(stmt.cond, env))) {
          this.tick();
          try {
            this.execBlock(stmt.body, env);
          } catch (sig) {
            if (sig instanceof BreakSignal) break;
            if (sig instanceof ContinueSignal) continue;
            throw sig;
          }
        }
      }
    }
  }

  private evalExpr(expr: Expr, env: Env): PyValue {
    this.tick();
    switch (expr.kind) {
      case 'literal':
        return expr.value;
      case 'var':
        return this.lookup(expr.name, env);
      case 'list':
        return expr.items.map((i) => this.evalExpr(i, env));
      case 'tuple':
        return { __pyType: 'tuple', items: expr.items.map((i) => this.evalExpr(i, env)) };
      case 'dict': {
        const entries: [PyValue, PyValue][] = expr.entries.map((e) => [
          this.evalExpr(e.key, env),
          this.evalExpr(e.val, env),
        ]);
        return makeDict(entries);
      }
      case 'listComp': {
        const items = toIterable(this.evalExpr(expr.iter, env));
        const out: PyValue[] = [];
        const compEnv: Env = new Map(env);
        for (const item of items) {
          this.tick();
          if (expr.targets.length === 1) {
            compEnv.set(expr.targets[0], item);
          } else {
            const parts = toIterable(item);
            expr.targets.forEach((t, i) => compEnv.set(t, parts[i]));
          }
          if (!expr.cond || isTruthy(this.evalExpr(expr.cond, compEnv))) {
            out.push(this.evalExpr(expr.expr, compEnv));
          }
        }
        return out;
      }
      case 'ternary':
        return isTruthy(this.evalExpr(expr.cond, env))
          ? this.evalExpr(expr.thenExpr, env)
          : this.evalExpr(expr.elseExpr, env);
      case 'unary': {
        const arg = this.evalExpr(expr.arg, env);
        if (expr.op === 'not') return !isTruthy(arg);
        if (expr.op === '-') return -Number(arg);
        return +Number(arg);
      }
      case 'binary': {
        if (expr.op === 'and') {
          const l = this.evalExpr(expr.left, env);
          return isTruthy(l) ? this.evalExpr(expr.right, env) : l;
        }
        if (expr.op === 'or') {
          const l = this.evalExpr(expr.left, env);
          return isTruthy(l) ? l : this.evalExpr(expr.right, env);
        }
        const l = this.evalExpr(expr.left, env);
        const r = this.evalExpr(expr.right, env);
        return this.applyBinary(expr.op, l, r);
      }
      case 'index': {
        const obj = this.evalExpr(expr.obj, env);
        const idx = this.evalExpr(expr.index, env);
        if (typeof obj === 'string' || Array.isArray(obj) || isPyTuple(obj)) {
          const seq = isPyTuple(obj) ? obj.items : obj;
          let i = Number(idx);
          if (i < 0) i += seq.length;
          if (i < 0 || i >= seq.length) throw new PyRuntimeError('IndexError: index out of range');
          return typeof seq === 'string' ? seq[i] : seq[i];
        }
        if (isPyDict(obj)) {
          const found = obj.map.get(keySig(idx));
          if (!found) throw new PyRuntimeError(`KeyError: ${String(idx)}`);
          return found.value;
        }
        throw new PyRuntimeError('Object is not subscriptable');
      }
      case 'slice': {
        const obj = this.evalExpr(expr.obj, env);
        const start = expr.start ? Number(this.evalExpr(expr.start, env)) : undefined;
        const stop = expr.stop ? Number(this.evalExpr(expr.stop, env)) : undefined;
        const step = expr.step ? Number(this.evalExpr(expr.step, env)) : 1;
        if (typeof obj === 'string') return makeSlice(Array.from(obj), start, stop, step).join('');
        if (Array.isArray(obj)) return makeSlice(obj, start, stop, step);
        if (isPyTuple(obj)) return { __pyType: 'tuple', items: makeSlice(obj.items, start, stop, step) };
        throw new PyRuntimeError('Object does not support slicing');
      }
      case 'attr': {
        const obj = this.evalExpr(expr.obj, env);
        return this.resolveMethod(obj, expr.prop);
      }
      case 'call': {
        const callee = this.evalExpr(expr.callee, env);
        if (!isPyFn(callee)) throw new PyRuntimeError('Object is not callable');
        const posArgs: PyValue[] = [];
        const kwArgs: Record<string, PyValue> = {};
        for (const a of expr.args) {
          const v = this.evalExpr(a.value, env);
          if (a.name) kwArgs[a.name] = v;
          else posArgs.push(v);
        }
        return callee.call(posArgs, kwArgs);
      }
    }
  }

  private applyBinary(op: string, l: PyValue, r: PyValue): PyValue {
    switch (op) {
      case '+':
        if (typeof l === 'string' && typeof r === 'string') return l + r;
        if (Array.isArray(l) && Array.isArray(r)) return [...l, ...r];
        return Number(l) + Number(r);
      case '-':
        return Number(l) - Number(r);
      case '*':
        if (typeof l === 'string' && typeof r === 'number') return l.repeat(Math.max(0, r));
        if (Array.isArray(l) && typeof r === 'number') {
          const out: PyValue[] = [];
          for (let i = 0; i < r; i++) out.push(...l);
          return out;
        }
        return Number(l) * Number(r);
      case '/':
        if (Number(r) === 0) throw new PyRuntimeError('ZeroDivisionError: division by zero');
        return Number(l) / Number(r);
      case '//':
        if (Number(r) === 0) throw new PyRuntimeError('ZeroDivisionError: integer division by zero');
        return Math.floor(Number(l) / Number(r));
      case '%':
        if (Number(r) === 0) throw new PyRuntimeError('ZeroDivisionError: modulo by zero');
        return ((Number(l) % Number(r)) + Number(r)) % Number(r);
      case '**':
        return Number(l) ** Number(r);
      case '==':
        return pyValuesEqual(l, r);
      case '!=':
        return !pyValuesEqual(l, r);
      case '<':
        return typeof l === 'string' && typeof r === 'string' ? l < r : Number(l) < Number(r);
      case '<=':
        return typeof l === 'string' && typeof r === 'string' ? l <= r : Number(l) <= Number(r);
      case '>':
        return typeof l === 'string' && typeof r === 'string' ? l > r : Number(l) > Number(r);
      case '>=':
        return typeof l === 'string' && typeof r === 'string' ? l >= r : Number(l) >= Number(r);
      case 'is':
        return l === r;
      case 'is not':
        return l !== r;
      case 'in':
      case 'not in': {
        let found = false;
        if (typeof r === 'string' && typeof l === 'string') {
          found = r.includes(l);
        } else if (isPyDict(r)) {
          found = r.map.has(keySig(l));
        } else if (isPySet(r)) {
          found = r.items.has(keySig(l));
        } else {
          found = toIterable(r).some((item) => pyValuesEqual(item, l));
        }
        return op === 'in' ? found : !found;
      }
      default:
        throw new PyRuntimeError(`Unsupported operator '${op}'`);
    }
  }

  private resolveMethod(obj: PyValue, prop: string): PyFunction {
    const method = (impl: (args: PyValue[]) => PyValue): PyFunction => ({
      __pyType: 'fn',
      name: prop,
      call: (args) => impl(args),
    });

    if (typeof obj === 'string') {
      switch (prop) {
        case 'lower':
          return method(() => obj.toLowerCase());
        case 'upper':
          return method(() => obj.toUpperCase());
        case 'strip':
          return method(() => obj.trim());
        case 'split':
          return method(([sep]) =>
            sep === undefined
              ? obj.trim()
                ? obj.trim().split(/\s+/)
                : []
              : obj.split(String(sep))
          );
        case 'join':
          return method(([iter]) => toIterable(iter).map(String).join(obj));
        case 'replace':
          return method(([a, b]) => obj.split(String(a)).join(String(b)));
        case 'startswith':
          return method(([p]) => obj.startsWith(String(p)));
        case 'endswith':
          return method(([s]) => obj.endsWith(String(s)));
        case 'isalnum':
          return method(() => /^[a-zA-Z0-9]+$/.test(obj));
        case 'isalpha':
          return method(() => /^[a-zA-Z]+$/.test(obj));
        case 'isdigit':
          return method(() => /^[0-9]+$/.test(obj));
        case 'count':
          return method(([sub]) => obj.split(String(sub)).length - 1);
      }
    }

    if (Array.isArray(obj)) {
      switch (prop) {
        case 'append':
          return method(([item]) => {
            obj.push(item);
            return null;
          });
        case 'pop':
          return method(([idx]) => {
            if (obj.length === 0) throw new PyRuntimeError('IndexError: pop from empty list');
            if (idx === undefined) return obj.pop() ?? null;
            let i = Number(idx);
            if (i < 0) i += obj.length;
            if (i < 0 || i >= obj.length) throw new PyRuntimeError('IndexError: pop index out of range');
            return obj.splice(i, 1)[0];
          });
        case 'extend':
          return method(([iter]) => {
            obj.push(...toIterable(iter));
            return null;
          });
        case 'sort':
          return method(() => {
            obj.sort((a, b) =>
              typeof a === 'number' && typeof b === 'number'
                ? a - b
                : String(a).localeCompare(String(b))
            );
            return null;
          });
        case 'count':
          return method(([target]) => obj.filter((x) => pyValuesEqual(x, target)).length);
        case 'index':
          return method(([target]) => {
            const idx = obj.findIndex((x) => pyValuesEqual(x, target));
            if (idx === -1) throw new PyRuntimeError('ValueError: item not in list');
            return idx;
          });
      }
    }

    if (isPyDict(obj)) {
      switch (prop) {
        case 'get':
          return method(([k, def]) => obj.map.get(keySig(k))?.value ?? def ?? null);
        case 'keys':
          return method(() => Array.from(obj.map.values()).map((e) => e.key));
        case 'values':
          return method(() => Array.from(obj.map.values()).map((e) => e.value));
        case 'items':
          return method(() =>
            Array.from(obj.map.values()).map(
              (e): PyTuple => ({ __pyType: 'tuple', items: [e.key, e.value] })
            )
          );
      }
    }

    if (isPySet(obj)) {
      switch (prop) {
        case 'add':
          return method(([item]) => {
            obj.items.set(keySig(item), item);
            return null;
          });
        case 'remove':
          return method(([item]) => {
            const sig = keySig(item);
            if (!obj.items.has(sig)) throw new PyRuntimeError('KeyError: element not in set');
            obj.items.delete(sig);
            return null;
          });
      }
    }

    throw new PyRuntimeError(`AttributeError: unsupported method '.${prop}'`);
  }
}

export interface PythonTestCase {
  id: string;
  label: string;
  args: unknown[];
  expected: unknown;
}

export function evaluatePythonChallenge(
  sourceCode: string,
  functionName: string,
  testCases: PythonTestCase[]
): {
  runtimeError?: string;
  results: {
    id: string;
    label: string;
    passed: boolean;
    inputDisplay: string;
    expectedDisplay: string;
    actualDisplay: string;
    error?: string;
  }[];
} {
  if (!sourceCode.trim()) {
    const msg = 'Solution code cannot be empty.';
    return {
      runtimeError: msg,
      results: testCases.map((tc) => ({
        id: tc.id,
        label: tc.label,
        passed: false,
        inputDisplay: tc.args.map((a) => JSON.stringify(a)).join(', '),
        expectedDisplay: JSON.stringify(tc.expected),
        actualDisplay: 'Not executed',
        error: msg,
      })),
    };
  }
  try {
    const tokens = tokenizePython(sourceCode);
    const parser = new Parser(tokens);
    const ast = parser.parseProgram();
    const interp = new Interpreter();
    interp.runProgram(ast);

    const results = testCases.map((tc) => {
      const inputDisplay = tc.args.map((a) => JSON.stringify(a)).join(', ');
      const expectedDisplay = JSON.stringify(tc.expected);
      try {
        const actual = interp.callFunction(functionName, tc.args);
        const actualDisplay = JSON.stringify(actual);
        const passed = pyValuesEqual(jsToPyValue(actual), jsToPyValue(tc.expected));
        return {
          id: tc.id,
          label: tc.label,
          passed,
          inputDisplay,
          expectedDisplay,
          actualDisplay,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          id: tc.id,
          label: tc.label,
          passed: false,
          inputDisplay,
          expectedDisplay,
          actualDisplay: 'Error',
          error: msg,
        };
      }
    });

    return { results };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      runtimeError: msg,
      results: testCases.map((tc) => ({
        id: tc.id,
        label: tc.label,
        passed: false,
        inputDisplay: tc.args.map((a) => JSON.stringify(a)).join(', '),
        expectedDisplay: JSON.stringify(tc.expected),
        actualDisplay: 'Not executed',
        error: msg,
      })),
    };
  }
}
