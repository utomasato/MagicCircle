/**
 * 魔法陣のコードを解釈し、実行するインタープリタ群。
 * 異なる言語仕様（PostScript, Lispなど）を試せるように、クラスとして定義されています。
 */

// =============================================
// PostScript風インタープリタ
// =============================================
class PostscriptInterpreter {
    constructor() {
        this.type = "PostScript";
        this.stack = [];
        this.dictStack = [{}]; // 0番目はグローバル辞書
        this.commandLoopLevel = 0;
        this.output = [];

        this.commands = {
            pop: () => { this.stack.pop(); },
            exch: () => { const [a, b] = [this.stack.pop(), this.stack.pop()]; this.stack.push(a, b); },
            dup: () => { const a = this.stack[this.stack.length - 1]; this.stack.push(a); },
            copy: () => {
                const n = this.stack.pop().value;
                const items = this.stack.slice(-n);
                this.stack.push(...items);
            },
            index: () => {
                const n = this.stack.pop().value;
                this.stack.push(this.stack[this.stack.length - 1 - n]);
            },
            roll: () => {
                let [count, n] = [this.stack.pop().value, this.stack.pop().value];
                if (n < 0) return;
                const items = this.stack.splice(this.stack.length - n);
                count = count % n;
                if (count < 0) count += n;
                const rotated = items.slice(-count).concat(items.slice(0, -count));
                this.stack.push(...rotated);
            },
            add: () => {
                const [b, a] = [this.stack.pop(), this.stack.pop()];
                if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object')
                    throw new Error("`add`: null または不正な値は足し算できません。");
                if (a.type === "number" && b.type === "number") {
                    this.stack.push({ type: "number", value: a.value + b.value });
                    return;
                }
                const isAValidText = a.type === "string" || a.type === "number";
                const isBValidText = b.type === "string" || b.type === "number";
                if (isAValidText && isBValidText) {
                    this.stack.push({ type: "string", value: String(a.value) + String(b.value) });
                    return;
                }
                throw new TypeError(`\`add\`: 不正な型です。${a.type} と ${b.type} は足し算できません。`);
            },
            sub: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "number", value: a.value - b.value }); },
            mul: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "number", value: a.value * b.value }); },
            div: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "number", value: a.value / b.value }); },
            idiv: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "number", value: Math.trunc(a.value / b.value) }); },
            mod: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "number", value: a.value % b.value }); },
            abs: () => { this.stack.push({ type: "number", value: Math.abs(this.stack.pop().value) }); },
            neg: () => { this.stack.push({ type: "number", value: -this.stack.pop().value }); },
            sqrt: () => { this.stack.push({ type: "number", value: Math.sqrt(this.stack.pop().value) }); },
            atan: () => { const [x, y] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "number", value: Math.atan2(y.value, x.value) * 180 / Math.PI }); },
            cos: () => { this.stack.push({ type: "number", value: Math.cos(this.stack.pop().value * Math.PI / 180) }); },
            sin: () => { this.stack.push({ type: "number", value: Math.sin(this.stack.pop().value * Math.PI / 180) }); },
            rand: () => { this.stack.push({ type: "number", value: Math.floor(Math.random() * 2147483647) }); },
            srand: () => { /* Not implemented */ },
            rrand: () => { /* Not implemented */ },
            length: () => {
                const obj = this.stack.pop();
                let len;
                if (typeof obj === 'object' && obj !== null && (obj.type === 'array' || obj.type === 'string')) {
                    len = obj.value.length;
                } else if (typeof obj === 'object' && obj !== null && obj.type === 'dict') {
                    len = Object.keys(obj.value).length;
                } else {
                    throw new Error("`length` requires an array, dictionary, or string.");
                }
                this.stack.push({ type: "number", value: len });
            },
            get: () => {
                const indexOrKeyItem = this.stack.pop();
                const collection = this.stack.pop();
                if (indexOrKeyItem === undefined || collection === undefined) {
                    throw new Error("`get`: スタックの要素が足りません (Stack underflow)。");
                }
                let val = undefined;
                if (collection !== null && typeof collection === 'object') {
                    if (collection.type === 'array' && Array.isArray(collection.value)) {
                        const index = indexOrKeyItem.value !== undefined ? indexOrKeyItem.value : indexOrKeyItem;
                        val = collection.value[index];
                    } else if (collection.type === 'string') {
                        const index = indexOrKeyItem.value !== undefined ? indexOrKeyItem.value : indexOrKeyItem;
                        const str = String(collection.value);
                        if (typeof index === 'number' && index >= 0 && index < str.length) {
                            val = { type: "string", value: str[index] };
                        }
                    } else if (collection.type === 'dict' && typeof collection.value === 'object') {
                        const keyType = indexOrKeyItem.type || typeof indexOrKeyItem;
                        const keyValue = indexOrKeyItem.value !== undefined ? indexOrKeyItem.value : indexOrKeyItem;
                        const keyStr = keyType + "-" + String(keyValue);
                        val = collection.value[keyStr];
                    } else {
                        throw new TypeError(`\`get\`: 不正な型です。${collection.type} からは値を取得できません。`);
                    }
                } else {
                    throw new TypeError("`get`: コレクションは配列、文字列、または辞書である必要があります。");
                }

                this.stack.push(val !== undefined ? val : null);
            },
            put: () => {
                const valueItem = this.stack.pop();
                const indexOrKeyItem = this.stack.pop();
                const collection = this.stack.pop();
                if (valueItem === undefined || indexOrKeyItem === undefined || collection === undefined) {
                    throw new Error("`put`: スタックの要素が足りません (Stack underflow)。");
                }
                if (collection !== null && typeof collection === 'object') {
                    if (collection.type === 'array' && Array.isArray(collection.value)) {
                        const index = indexOrKeyItem.value !== undefined ? indexOrKeyItem.value : indexOrKeyItem;
                        collection.value[index] = valueItem;
                    } else if (collection.type === 'string') {
                        const index = indexOrKeyItem.value !== undefined ? indexOrKeyItem.value : indexOrKeyItem;
                        const charStr = valueItem.value !== undefined ? String(valueItem.value) : String(valueItem);
                        const str = String(collection.value);
                        if (typeof index === 'number' && index >= 0 && index < str.length) {
                            // 文字列の指定インデックスを上書き
                            collection.value = str.substring(0, index) + charStr.charAt(0) + str.substring(index + 1);
                        }
                    } else if (collection.type === 'dict' && typeof collection.value === 'object') {
                        // DictRing の仕様(type-value)に合わせてキーを生成
                        const keyType = indexOrKeyItem.type || typeof indexOrKeyItem;
                        const keyValue = indexOrKeyItem.value !== undefined ? indexOrKeyItem.value : indexOrKeyItem;
                        const keyStr = keyType + "-" + String(keyValue);
                        collection.value[keyStr] = valueItem;
                    } else {
                        throw new TypeError(`\`put\`: 不正な型です。${collection.type} には値を設定できません。`);
                    }
                } else {
                    throw new TypeError("`put`: コレクションは配列、文字列、または辞書である必要があります。");
                }
            },
            string: () => {
                const nItem = this.stack.pop();
                const n = nItem && nItem.value !== undefined ? nItem.value : nItem;
                if (typeof n !== 'number' || n < 0) {
                    throw new Error("`string`: 文字列の長さには正の整数を指定してください。");
                }
                this.stack.push({ type: 'string', value: " ".repeat(n) });
            },
            cvi: () => {
                const strItem = this.stack.pop();
                const str = strItem.type == "string" ? strItem.value : String(strItem.value);
                let charCode = -1;
                if (str.length > 0) {
                    charCode = str.charCodeAt(0);
                } else {
                    throw new Error("`cvi`: 空の文字列は変換できません。");
                }
                this.stack.push({ type: "number", value: charCode });
            },
            chr: () => {
                const charCodeItem = this.stack.pop();
                const charCode = charCodeItem && charCodeItem.value !== undefined ? charCodeItem.value : charCodeItem;
                if (typeof charCode !== 'number') {
                    throw new Error("`chr`: 整数を指定してください。");
                }
                this.stack.push({ type: 'string', value: String.fromCharCode(charCode) });
            },
            getinterval: () => {
                const countItem = this.stack.pop();
                const indexItem = this.stack.pop();
                const arrItem = this.stack.pop();
                const count = countItem && countItem.value !== undefined ? countItem.value : countItem;
                const index = indexItem && indexItem.value !== undefined ? indexItem.value : indexItem;
                if (arrItem && arrItem.value !== undefined && (arrItem.type === 'array' || arrItem.type === 'string')) {
                    let newVal;
                    if (arrItem.type === 'array' && Array.isArray(arrItem.value)) {
                        newVal = arrItem.value.slice(index, index + count);
                    } else {
                        newVal = String(arrItem.value).substring(index, index + count);
                    }
                    this.stack.push({ type: arrItem.type, value: newVal });
                } else {
                    throw new Error("`getinterval`: コレクションは配列または文字列である必要があります。");
                }
            },
            putinterval: () => {
                const subArrItem = this.stack.pop();
                const indexItem = this.stack.pop();
                const arrItem = this.stack.pop();
                const index = indexItem && indexItem.value !== undefined ? indexItem.value : indexItem;
                if (arrItem && arrItem.value !== undefined && subArrItem && subArrItem.value !== undefined && arrItem.type === subArrItem.type) {
                    if (arrItem.type === 'array' && Array.isArray(arrItem.value) && Array.isArray(subArrItem.value)) {
                        arrItem.value.splice(index, subArrItem.value.length, ...subArrItem.value);
                        this.stack.push(arrItem);
                    } else if (arrItem.type === 'string') {
                        const originalStr = String(arrItem.value);
                        const subStr = String(subArrItem.value);
                        arrItem.value = originalStr.substring(0, index) + subStr + originalStr.substring(index + subStr.length);
                        this.stack.push(arrItem);
                    }
                } else {
                    throw new Error("`putinterval`: 互換性のある配列または文字列を指定してください。");
                }
            },
            array: () => {
                const n = this.stack.pop();
                if (n.type !== 'number' || n.value < 0) {
                    throw new Error("`array` requires a non-negative integer.");
                }
                const newArr = new Array(n.value).fill(null);
                this.stack.push({ type: 'array', value: newArr });
            },
            forall: () => {
                const proc = this.stack.pop().value;
                const collection = this.stack.pop();

                if (collection.type === 'array') {
                    for (const token of collection.value) {
                        this.stack.push(token); // 配列の要素をスタックに積む
                        proc.Execute(this.type);
                    }
                } else if (collection.type === 'dict') {
                    for (const [key, value] of Object.entries(collection.value)) {
                        let kType = "string";
                        let kVal = key;
                        const splitIdx = key.indexOf('-');
                        if (splitIdx > 0) {
                            kType = key.slice(0, splitIdx);
                            kVal = key.slice(splitIdx + 1);
                            if (kType === "number") kVal = Number(kVal);
                        }
                        this.stack.push({ type: kType, value: kVal });
                        this.stack.push(value);
                        proc.Execute(this.type);
                    }
                } else if (collection.type === 'string') {
                    for (const item of collection.value) {
                        this.stack.push({ type: "string", value: item });
                        proc.Execute(this.type);
                    }
                } else {
                    throw new Error("`forall` requires an array or dictionary on the stack.");
                }
            },
            dict: () => { this.stack.push({ type: 'dict', value: {} }); },
            begin: () => {
                const dict = this.stack.pop();
                if (typeof dict !== 'object' || dict === null || dict.type !== 'dict') {
                    throw new Error("`begin` requires a dictionary on the stack.");
                }
                this.dictStack.push(dict.value);
            },
            end: () => {
                if (this.dictStack.length > 1) {
                    this.dictStack.pop();
                } else {
                    throw new Error("Cannot `end` the base dictionary.");
                }
            },
            def: () => {
                const value = this.stack.pop();
                let key = this.stack.pop();
                if (key.type != "name") {
                    throw new Error("`def` requires a literal name (e.g., ~myVar) as a key.");
                }
                // 現在の辞書（dictStackの末尾）に定義
                this.dictStack[this.dictStack.length - 1][key.value] = value;
            },
            eq: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "bool", value: a.value === b.value }); },
            ne: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "bool", value: a.value !== b.value }); },
            ge: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "bool", value: a.value >= b.value }); },
            gt: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "bool", value: a.value > b.value }); },
            le: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "bool", value: a.value <= b.value }); },
            lt: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "bool", value: a.value < b.value }); },
            and: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "bool", value: a.value && b.value }); },
            or: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "bool", value: a.value || b.value }); },
            xor: () => { const [b, a] = [this.stack.pop(), this.stack.pop()]; this.stack.push({ type: "bool", value: Boolean(a.value) !== Boolean(b.value) }); },
            not: () => { this.stack.push({ type: "bool", value: !this.stack.pop().value }); },
            true: () => { this.stack.push({ type: "bool", value: true }); },
            false: () => { this.stack.push({ type: "bool", value: false }); },
            null: () => { this.stack.push(null); },
            exec: () => {
                const proc = this.stack.pop();
                if (proc === undefined) {
                    throw new Error("`exec`: Stack underflow. Requires a procedure on the stack.");
                }
                if (proc.type == "magicring") {
                    proc.value.Execute(this.type);
                    return;
                }
                throw new Error(`\`exec\`: Requires a procedure but received a different type.`);
            },
            if: () => {
                const proc = this.stack.pop().value;
                const bool = this.stack.pop().value;
                if (bool) proc.Execute(this.type);
            },
            ifelse: () => {
                const proc2 = this.stack.pop().value;
                const proc1 = this.stack.pop().value;
                const bool = this.stack.pop().value;
                if (bool) proc1.Execute(this.type);
                else proc2.Execute(this.type);
            },
            repeat: () => {
                const proc = this.stack.pop();
                const n = this.stack.pop();
                if ((proc.type == "magicring" || proc.type == "template") && n.type == "number")
                    for (let i = 0; i < n.value; i++) proc.value.Execute(this.type);
            },
            for: () => {
                const proc = this.stack.pop().value;
                const limit = this.stack.pop().value;
                const inc = this.stack.pop().value;
                let i = this.stack.pop().value;
                if (inc > 0) {
                    for (; i <= limit; i += inc) { this.stack.push({ type: "number", value: i }); proc.Execute(this.type); }
                } else {
                    for (; i >= limit; i += inc) { this.stack.push({ type: "number", value: i }); proc.Execute(this.type); }
                }
            },
            loop: () => {
                const proc = this.stack.pop();
                this.commandLoopLevel++;
                try {
                    while (true) { proc.value.Execute(this.type); }
                } catch (e) {
                    if (e.message === 'EXIT_LOOP' && e.level === this.commandLoopLevel) { }
                    else { throw e; }
                } finally {
                    this.commandLoopLevel--;
                }
            },
            exit: () => { throw { message: 'EXIT_LOOP', level: this.commandLoopLevel }; },
            magicactivate: () => {
                const val = this.stack.pop();
                let key = null;
                if (this.stack.length > 0 && this.stack[this.stack.length - 1].type == "name") {
                    key = this.stack.pop();
                }

                const id = this.generateUUID();
                const resolvedVal = this.formatForMpsParser(val);

                const data = {
                    isActive: true,
                    message: "MagicSpell",
                    value: 0,
                    id: id,
                    text: resolvedVal,
                };

                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                if (key) {
                    const unityObjectRef = { type: "unityObject", value: id };
                    this.dictStack[this.dictStack.length - 1][key.value] = unityObjectRef;
                }
            },
            spawnobj: () => {
                const val = this.stack.pop();
                let key = null;
                if (this.stack.length > 0 && this.stack[this.stack.length - 1].type == "name") {
                    key = this.stack.pop();
                }

                const id = this.generateUUID();
                const resolvedVal = this.formatForMpsParser(val);

                const data = {
                    isActive: true,
                    message: "CreateObject",
                    value: 0,
                    id: id,
                    text: resolvedVal,
                };

                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                if (key) {
                    const unityObjectRef = { type: "unityObject", value: id };
                    this.dictStack[this.dictStack.length - 1][key.value] = unityObjectRef;
                }
            },
            transform: () => {
                const transformDict = this.stack.pop();
                const unityObjectRef = this.stack.pop();
                if (typeof unityObjectRef !== 'object' || unityObjectRef === null || unityObjectRef.type !== 'unityObject' || !unityObjectRef.value) {
                    throw new Error("`transform` requires a Unity object reference on the stack.");
                }

                const resolvedDict = this.formatForMpsParser(transformDict);
                const data = {
                    message: "TransformObject",
                    id: unityObjectRef.value, // Use the ID from the object reference
                    text: resolvedDict,
                };

                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
            },
            attachtoparent: () => {
                const parentObjRef = this.stack.pop();
                const childObjRef = this.stack.pop();
                if ((typeof parentObjRef !== 'object' || parentObjRef === null || parentObjRef.type !== 'unityObject' || !parentObjRef.value)
                    && (typeof childObjRef !== 'object' || childObjRef === null || childObjRef.type !== 'unityObject' || !childObjRef.value)) {
                    throw new Error("`attachtoparent` requires a Unity object reference on the stack.");
                }

                const data = {
                    message: "AttachToParent",
                    id: childObjRef.value, // Use the ID from the object reference
                    text: parentObjRef.value
                };

                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
            },
            animation: () => {
                const animationDict = this.stack.pop();
                const unityObjectRef = this.stack.pop();
                if (typeof unityObjectRef !== 'object' || unityObjectRef === null || unityObjectRef.type !== 'unityObject' || !unityObjectRef.value) {
                    throw new Error("`transform` requires a Unity object reference on the stack.");
                }

                const resolvedDict = this.formatForMpsParser(animationDict);
                const data = {
                    message: "Animation",
                    id: unityObjectRef.value, // Use the ID from the object reference
                    text: resolvedDict,
                };

                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
            },
            print: () => {
                const val = this.stack.pop();
                //this.output.push(this.formatForOutput(val));
                addConsoleMessage(this.formatForOutput(val))
            },
            stack: () => {
                const stackview = [];
                [...this.stack]/*.reverse()*/.forEach(val => {
                    //this.output.push(this.formatForOutput(val));
                    stackview.push(this.formatForOutput(val));
                });
                addConsoleMessage(stackview);
            },
            color: () => {
                const [b, g, r] = [this.stack.pop(), this.stack.pop(), this.stack.pop()];
                this.stack.push(['color', r, g, b]);
            }
        };
    }

    /**
     * UUIDを生成します。
     * crypto.randomUUID が使える場合はそれを使用し（セキュアコンテキスト）、
     * 使えない場合（HTTPなどの非セキュアコンテキスト）は Math.random() ベースの代替機能を使用します。
     */
    generateUUID() {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    formatForOutput(val) {
        if (val) {
            switch (val.type) {
                case "name":
                    let name = val.value;

                    const splitIdx = val.value.indexOf('-');
                    if (splitIdx > 0) {
                        name = val.slice(splitIdx + 1);
                    }
                    return name;
                case "array":
                    let array = [];
                    for (const item of val.value) {
                        array.push(this.formatForOutput(item));
                    }
                    return "[" + array.join(", ") + "]"
                case "dict":
                    const dict = [];
                    for (const [key, value] of Object.entries(val.value)) {
                        const splitIdx = key.indexOf('-');
                        const Key = splitIdx > 0 ? key.slice(splitIdx + 1) : key;
                        dict.push(Key + ": " + this.formatForOutput(value));
                    }
                    return "{" + dict.join(", ") + "}";
                case "magicring":
                    return val.value.Spell()
                //case "number":
                //case "string":
                //case "bool":
                default:
                    return val.value;
            }
        } else { return val == null ? "null" : "undefined" }
    }

    formatForMpsParser(val) {
        switch (val.type) {
            case "dict":
                const dict = [];
                for (const [key, value] of Object.entries(val.value)) {
                    const splitIdx = key.indexOf('-');
                    const Key = splitIdx > 0 ? key.slice(splitIdx + 1) : key;
                    dict.push("~" + Key);
                    dict.push(this.formatForMpsParser(value));
                }
                return "< " + dict.join(" ") + " >";
            case "array":
                const array = [];
                for (const item of val.value) {
                    array.push(this.formatForMpsParser(item));
                }
                return "[ " + array.join(" ") + " ]"
            case "string":
                return "(" + val.value + ")";
            case "name":
                return "~" + val.value;
            //case "bool":
            //case "number":
            default:
                return val.value;
        }
    }

    lookupVariable(key) {
        // dictStackの上から（最後に追加されたものから）順番に探す
        for (let i = this.dictStack.length - 1; i >= 0; i--) {
            if (key in this.dictStack[i]) {
                return this.dictStack[i][key];
            }
        }
        return undefined;
    }

    execute(code) {
        this.stack = [];
        this.dictStack = [{}];
        this.commandLoopLevel = 0;
        this.output = [];

        try {
            if (startRing) {
                startRing.Execute(this.type);
            }
        } catch (e) {
            if (e.message === 'EXIT_LOOP') {
                throw new Error("`exit` was called outside of a `loop`.");
            }
            throw e;
        }


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