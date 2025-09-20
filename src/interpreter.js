/**
 * 魔法陣のコードを解釈し、実行するインタープリタ群。
 * 異なる言語仕様（PostScript, Lispなど）を試せるように、クラスとして定義されています。
 */

// =============================================
// PostScript風インタープリタ
// =============================================
class PostscriptInterpreter {
    constructor() {
        this.stack = [];
        this.dictStack = [{}]; 
        this.commandLoopLevel = 0;
        this.output = [];

        this.commands = {
            pop: () => { this.stack.pop(); },
            exch: () => { const [a, b] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a, b); },
            dup: () => { const a = this.stack[this.stack.length - 1]; this.stack.push(a); },
            copy: () => {
                const n = this.stack.pop();
                const items = this.stack.slice(-n);
                this.stack.push(...items);
            },
            index: () => {
                const n = this.stack.pop();
                this.stack.push(this.stack[this.stack.length - 1 - n]);
            },
            roll: () => {
                let [count, n] = [this.stack.pop(), this.stack.pop()];
                if (n < 0) return;
                const items = this.stack.splice(this.stack.length - n);
                count = count % n;
                if (count < 0) count += n;
                const rotated = items.slice(-count).concat(items.slice(0, -count));
                this.stack.push(...rotated);
            },
            add: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a + b); },
            sub: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a - b); },
            mul: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a * b); },
            div: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a / b); },
            idiv: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(Math.trunc(a / b)); },
            mod: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a % b); },
            abs: () => { this.stack.push(Math.abs(this.stack.pop())); },
            neg: () => { this.stack.push(-this.stack.pop()); },
            sqrt: () => { this.stack.push(Math.sqrt(this.stack.pop())); },
            atan: () => { const [x, y] = [this.stack.pop(), this.stack.pop()]; this.stack.push(Math.atan2(y, x) * 180 / Math.PI); },
            cos: () => { this.stack.push(Math.cos(this.stack.pop() * Math.PI / 180)); },
            sin: () => { this.stack.push(Math.sin(this.stack.pop() * Math.PI / 180)); },
            rand: () => { this.stack.push(Math.floor(Math.random() * 2147483647)); },
            srand: () => { /* Not implemented */ },
            rrand: () => { /* Not implemented */ },
            length: () => { this.stack.push(this.stack.pop().length); },
            get: () => { const [index, arr] = [this.stack.pop(), this.stack.pop()]; this.stack.push(arr[index]); },
            put: () => { const [value, index, arr] = [this.stack.pop(), this.stack.pop(), this.stack.pop()]; arr[index] = value; },
            getinterval: () => { const [count, index, arr] = [this.stack.pop(), this.stack.pop(), this.stack.pop()]; this.stack.push(arr.slice(index, index + count)); },
            putinterval: () => { const [subArr, index, arr] = [this.stack.pop(), this.stack.pop(), this.stack.pop()]; arr.splice(index, subArr.length, ...subArr); },
            forall: () => {
                const proc = this.stack.pop();
                const arr = this.stack.pop();
                for (const item of arr) {
                    this.stack.push(item);
                    this.run(proc);
                }
            },
            dict: () => { this.stack.push({}); },
            def: () => {
                const value = this.stack.pop();
                let key = this.stack.pop();
                if (key.startsWith('~')) key = key.substring(1);
                this.dictStack[this.dictStack.length - 1][key] = value;
            },
            eq: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a === b); },
            ne: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a !== b); },
            ge: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a >= b); },
            gt: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a > b); },
            le: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a <= b); },
            lt: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a < b); },
            and: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a && b); },
            or: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a || b); },
            xor: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push(Boolean(a) !== Boolean(b)); },
            not: () => { this.stack.push(!this.stack.pop()); },
            true: () => { this.stack.push(true); },
            false: () => { this.stack.push(false); },
            exec: () => {
                const proc = this.stack.pop();
                if (Array.isArray(proc)) this.run(proc);
            },
            if: () => {
                const proc = this.stack.pop();
                const bool = this.stack.pop();
                if (bool) this.run(proc);
            },
            ifelse: () => {
                const proc2 = this.stack.pop();
                const proc1 = this.stack.pop();
                const bool = this.stack.pop();
                if (bool) this.run(proc1);
                else this.run(proc2);
            },
            repeat: () => {
                const proc = this.stack.pop();
                const n = this.stack.pop();
                for (let i = 0; i < n; i++) this.run(proc);
            },
            for: () => {
                const proc = this.stack.pop();
                const limit = this.stack.pop();
                const inc = this.stack.pop();
                let i = this.stack.pop();
                if (inc > 0) {
                    for (; i <= limit; i += inc) { this.stack.push(i); this.run(proc); }
                } else {
                    for (; i >= limit; i += inc) { this.stack.push(i); this.run(proc); }
                }
            },
            loop: () => {
                const proc = this.stack.pop();
                this.commandLoopLevel++;
                try {
                    while (true) { this.run(proc); }
                } catch (e) {
                    if (e.message === 'EXIT_LOOP' && e.level === this.commandLoopLevel) {} 
                    else { throw e; }
                } finally {
                    this.commandLoopLevel--;
                }
            },
            exit: () => { throw { message: 'EXIT_LOOP', level: this.commandLoopLevel }; },
            print: () => {
                const val = this.stack.pop();
                this.output.push(Array.isArray(val) ? `[${val.join(' ')}]` : String(val));
            },
            stack: () => {
                [...this.stack].reverse().forEach(val => {
                    this.output.push(Array.isArray(val) ? `[${val.join(' ')}]` : String(val));
                });
            },
            color: () => { 
                const [b, g, r] = [this.stack.pop(), this.stack.pop(), this.stack.pop()];
                this.stack.push(['color', r, g, b]);
            }
        };
    }

    parse(code) {
        const tokens = [];
        let currentToken = '';
        let inString = false;
        let braceLevel = 0;
        let parenLevel = 0;
        for (let i = 0; i < code.length; i++) {
            const char = code[i];
            if (braceLevel > 0) {
                if (char === '{') braceLevel++;
                if (char === '}') braceLevel--;
                currentToken += char;
                if (braceLevel === 0) {
                    tokens.push(this.parse(currentToken.slice(1, -1)));
                    currentToken = '';
                }
            } else if (inString) {
                currentToken += char;
                if (char === '(') parenLevel++;
                if (char === ')') parenLevel--;
                if (parenLevel === 0) {
                    tokens.push(currentToken); // かっこを付けたままトークン化
                    currentToken = '';
                    inString = false;
                }
            } else if (char === '{') {
                braceLevel++;
                currentToken += char;
            } else if (char === '(') {
                inString = true;
                parenLevel++;
                currentToken += char;
            } else if (/\s/.test(char)) {
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
            } else {
                currentToken += char;
            }
        }
        if (currentToken) tokens.push(currentToken);
        return tokens;
    }

    lookupVariable(key) {
        for (let i = this.dictStack.length - 1; i >= 0; i--) {
            if (key in this.dictStack[i]) {
                return this.dictStack[i][key];
            }
        }
        return undefined;
    }

    run(tokens) {
        for (const token of tokens) {
            if (typeof token === 'string' && token.startsWith('(') && token.endsWith(')')) {
                this.stack.push(token.slice(1, -1)); // 文字列リテラルとしてスタックに積む
            } else if (typeof token === 'string' && this.commands[token]) {
                this.commands[token]();
            } else if (typeof token === 'string' && token.startsWith('~')) {
                this.stack.push(token);
            } else if (!isNaN(parseFloat(token)) && isFinite(token)) {
                this.stack.push(parseFloat(token));
            } else if (Array.isArray(token)) {
                this.stack.push(token);
            } else if (typeof token === 'string') {
                const value = this.lookupVariable(token);
                if (value !== undefined) {
                    if (Array.isArray(value)) {
                        this.run(value);
                    } else {
                        this.stack.push(value);
                    }
                } else {
                    throw new Error(`Undefined command or variable: ${token}`);
                }
            } else {
                 this.stack.push(token);
            }
        }
    }

    execute(code) {
        this.stack = [];
        this.dictStack = [{}];
        this.commandLoopLevel = 0;
        this.output = [];

        try {
            const tokens = this.parse(code);
            this.run(tokens);
        } catch (e) {
            if(e.message === 'EXIT_LOOP') {
                throw new Error("`exit` was called outside of a `loop`.");
            }
            throw e;
        }
        
        return {
            stack: this.stack,
            output: this.output.join('\n')
        };
    }
}


// =============================================
// Lisp風インタープリタ (プレースホルダー)
// =============================================
class LispInterpreter {
    constructor() { this.stack = []; }
    execute(code) {
        this.stack = [];
        return {
            stack: ["Lisp interpreter is not yet implemented."],
            output: ""
        };
    }
}

