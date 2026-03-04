let config;
const colorsDict = {
    black: "0.0 0.0 0.0 1.0", white: "1.0 1.0 1.0 1.0", red: "1.0 0.0 0.0 1.0", green: "0.0 1.0 0.0 1.0",
    blue: "0.0 0.0 1.0 1.0", yellow: "1.0 1.0 0.0 1.0", cyan: "0.0 1.0 1.0 1.0", magenta: "1.0 0.0 1.0 1.0",
    gray: "0.5 0.5 0.5 1.0", orange: "1.0 0.5 0.0 1.0", purple: "0.5 0.0 0.5 1.0", brown: "0.6 0.4 0.2 1.0",
};
let cameraPos;
let zoomSize;
let rings = [];
let fieldItems = [];
let buttons = [];
let staticButtons = []; // 追加: 静的なボタンを保持
let cursormode = "grad";
let debugMode;
let isUIHidden;
let screenshotRequest = false;
let globalIsClockwise = false;
let startRing = null;

let infosigil = "";
const sigilExplanations = {
    "pop": "pop：スタックの最上位から値を1つ取り出して破棄します。",
    "exch": "exch：スタックの最上位にある2つの値の順番を入れ替えます。",
    "dup": "dup：スタックの最上位にある値をコピーして、スタックに積み直します。",
    "copy": "copy：スタックの上からn個の要素をコピーして、スタックに積み増します。",
    "index": "index：スタックの上からn番目の要素をコピーして、スタックの最上位に積みます。",
    "roll": "roll：スタックのn個の要素を、指定した回数だけ循環的に回転させます。",
    "add": "add：スタックから2つ値を取り出し、足し合わせたものをスタックに積みます。",
    "sub": "sub：スタックから2つ値を取り出し、引き算した結果をスタックに積みます。",
    "mul": "mul：スタックから2つ値を取り出し、掛け合わせた結果をスタックに積みます。",
    "div": "div：スタックから2つ値を取り出し、割り算した結果（実数）を積みます。",
    "idiv": "idiv：スタックから2つ値を取り出し、割り算の商（整数）を積みます。",
    "mod": "mod：スタックから2つ値を取り出し、割り算の余りをスタックに積みます。",
    "abs": "abs：スタックの最上位にある値の絶対値を計算して積みます。",
    "neg": "neg：スタックの最上位にある値の符号を反転させます。",
    "sqrt": "sqrt：スタックの最上位にある値の平方根を計算して積みます。",
    "atan": "atan：2つの値から逆正接（アークタンジェント）を度数法で計算して積みます。",
    "cos": "cos：角度（度数法）をスタックから取り出し、余弦（コサイン）を積みます。",
    "sin": "sin：角度（度数法）をスタックから取り出し、正弦（サイン）を積みます。",
    "rand": "rand：0から最大値（2147483647）までの乱数を生成して積みます。",
    "srand": "srand：乱数のシード値を設定します（現在の実装では未処理）。",
    "rrand": "rrand：現在の乱数のシード状態を取得します（現在の実装では未処理）。",
    "length": "length：配列、辞書、または文字列の要素数（長さ）をスタックに積みます。",
    "get": "get：配列や辞書から、指定したインデックスやキーに対応する値を取り出します。",
    "put": "put：配列や辞書、文字列の指定した位置に、新しい値を書き込みます。",
    "string": "string：指定した長さの空の文字列オブジェクトを作成して積みます。",
    "cvi": "cvi：文字列の最初の文字を、その文字コード（整数）に変換して積みます。",
    "chr": "chr：整数（文字コード）を、対応する1文字の文字列に変換して積みます。",
    "getinterval": "getinterval：配列や文字列から、指定範囲の部分配列・文字列を抽出します。",
    "putinterval": "putinterval：配列や文字列の指定位置に、別の配列や文字列の内容を上書きします。",
    "array": "array：指定した要素数を持つ、空の配列オブジェクトを作成して積みます。",
    "forall": "forall：配列や辞書の各要素に対して、指定した手続きを繰り返し実行します。",
    "dict": "dict：新しい空の辞書（連想配列）を作成してスタックに積みます。",
    "begin": "begin：辞書を辞書スタックに積み、以降の変数定義や検索の対象にします。",
    "end": "end：現在アクティブな辞書を辞書スタックから取り除きます。",
    "def": "def：現在の辞書に、名前と値を対応付けて変数を定義します。",
    "eq": "eq：スタックの2つの値が等しければtrue、そうでなければfalseを積みます。",
    "ne": "ne：スタックの2つの値が等しくなければtrue、等しければfalseを積みます。",
    "ge": "ge：1つ目の値が2つ目の値以上であればtrueをスタックに積みます。",
    "gt": "gt：1つ目の値が2つ目の値より大きければtrueをスタックに積みます。",
    "le": "le：1つ目の値が2つ目の値以下であればtrueをスタックに積みます。",
    "lt": "lt：1つ目の値が2つ目の値より小さければtrueをスタックに積みます。",
    "and": "and：2つの論理値の論理積（AND）を計算してスタックに積みます。",
    "or": "or：2つの論理値の論理和（OR）を計算してスタックに積みます。",
    "xor": "xor：2つの論理値の排他的論理和（XOR）を計算して積みます。",
    "not": "not：スタック最上位の論理値を反転（真偽を逆に）させます。",
    "true": "true：論理値の真（true）をスタックに積みます。",
    "false": "false：論理値の偽（false）をスタックに積みます。",
    "null": "null：null値をスタックに積みます。",
    "exec": "exec：スタックにある手続き（プログラムの塊）を実行します。",
    "if": "if：条件が真の場合に、指定した手続きを実行します。",
    "ifelse": "ifelse：条件に応じて、実行する2つの手続きを切り替えます。",
    "repeat": "repeat：指定した回数だけ、手続きを繰り返し実行します。",
    "for": "for：開始、増分、終了値を指定して、数値を変化させながら手続きを繰り返します。",
    "loop": "loop：exitが呼ばれるまで、手続きを無限に繰り返し実行します。",
    "exit": "exit：実行中のloop（繰り返し）から即座に脱出します。",
    "magicactivate": "magicactivate：指定したデータを魔法としてUnity側に送信し実行します。",
    "spawnobj": "spawnobj：指定したパラメータでUnity上に新しいオブジェクトを生成します。",
    "transform": "transform：Unityオブジェクトの位置、回転、スケールを変更します。",
    "attachtoparent": "attachtoparent：Unityオブジェクトを別のオブジェクトの子要素にします。",
    "animation": "animation：Unityオブジェクトに対して、指定したアニメーションを再生します。",
    "print": "print：スタックの値を1つ取り出し、出力ログに表示します。",
    "stack": "stack：現在のスタックの内容をすべて出力ログに表示します。",
    "color": "color：R, G, Bの3つの値からカラー配列を作成してスタックに積みます。"
};

// =============================================
// 入力と状態管理のためのグローバル変数
// (他のファイルから参照されます)
// =============================================
let inputMode;
let panStart = {};
let dragOffset;
let rotateOffset;
let AddObjectMode = "";
let mousePos = {};
let selectRing;
let draggingItem = {};
let lastPressedButton = null;
let currentUiPanel = null;
let currentModalPanel = null; // モーダルパネル(Import/Export)を管理
let currentInputElement = null;
let currentSelectElement = null;
let editingItem = null;

let interpreters = {};    // すべてのインタープリタのインスタンスを保持
let activeInterpreter;    // 現在アクティブなインタープリタ

let consolePanel = null;
let consoleText = null;

let isDraggingConsole = false;
let consoleDragOffset = { x: 0, y: 0 };
let isResizingConsole = false;

let actionStack = [];
let redoStack = [];

let consoleMessages = [];

/**
 * インタープリタのスタック配列をコンソール表示用にフォーマットします。
 * @param {Array} stack フォーマット対象のスタック配列
 * @returns {string} フォーマット後の文字列
 */

function formatStackForDisplay(stack) {
    // 1. スタックが配列でない、または空である場合は、安全なメッセージを返す
    if (!Array.isArray(stack) || stack.length === 0) {
        return '[]';
    }

    // 2. スタックの各要素に対して、activeInterpreterのformatForOutputを呼び出して文字列に変換する
    //    .map()は必ず配列に対して呼び出す
    const formattedItems = stack.map(item => {
        try {
            // activeInterpreterとformatForOutputが存在することを確認してから呼び出す
            if (activeInterpreter && typeof activeInterpreter.formatForOutput === 'function') {
                return activeInterpreter.formatForOutput(item);
            }
            return '[Interpreter Error]';
        } catch (e) {
            // 万が一、formatForOutput内でエラーが発生した場合も安全に処理を続ける
            return `[Formatting Error: ${e.message}]`;
        }
    });

    // 3. 整形後の文字列配列を、改行で連結して返す
    return `[${formattedItems.join(', ')}]`;
}

/**
 * Checks if a ring can be set as the starting point.
 * @param {MagicRing} targetRing The ring to check.
 * @returns {boolean} True if the ring can be a start point, false otherwise.
 */
function isRingStartable(targetRing) {
    // Must be a MagicRing, not ArrayRing or DictRing
    if (!targetRing || (targetRing.constructor.name !== 'MagicRing' && targetRing.constructor.name !== 'TemplateRing')) {
        return false;
    }

    // Must not be connected from another ring
    for (const r of rings) {
        for (const item of r.items) {
            if (item && item.type === 'joint' && item.value === targetRing) {
                return false; // Found a connection to this ring
            }
        }
    }
    return true; // Conditions met
}


function Start() {
    debugMode = false;
    isUIHidden = false;

    interpreters['postscript'] = new PostscriptInterpreter();
    interpreters['lisp'] = new LispInterpreter();
    activeInterpreter = interpreters['postscript'];

    let [width, height] = GetScreenSize();
    SetTitle("MagicEditor");
    SetMouseCursor('grab');

    config = {
        bgColor: color(255, 255, 255),
        gridColor: color(200, 200, 200, 100),
        gridWidth: 100,
        menuHeight: 55,
        menuBgColor: color(55, 55, 55, 200),
        ringWidth: 45,
        arrayWidth: 30,
        minRingCircumference: 50,
        minArrayCircumference: 40,
        itemPadding: 2,
        sigilWidth: 7,
        charSpacing: 0.2,
        charWidth: 1.5,
        jointWidth: 2,
        fontSize: 15,
        fontColor: color(0, 0, 0),
        sigilSize: 40,
        sigilColor: color(0, 0, 0),
        sigilLineWidth: 0.04,
        stringSideWidth: 2,
        nameObjectMinWidth: 8,
        ringRotateHandleWidth: 0,
    };

    staticButtons = [
        new Button(10, 10, 40, 40,
            () => { return AddObjectMode == "ring" ? color(128, 100, 100) : color(255, 200, 200); },
            { x: 0, y: 0 }, { x: 0, y: 0 }, 30, "ring", null,
            () => { AddObjectMode = AddObjectMode == "ring" ? "" : "ring"; }, true),
        new Button(55, 10, 40, 40,
            () => { return AddObjectMode == "sigil" ? color(128, 100, 100) : color(255, 200, 200); },
            { x: 0, y: 0 }, { x: 0, y: 0 }, 30, "sigil", null,
            () => { AddObjectMode = AddObjectMode == "sigil" ? "" : "sigil"; }, true),
        new Button(100, 10, 40, 40,
            () => { return AddObjectMode == "num" ? color(128, 100, 100) : color(255, 200, 200); },
            { x: 0, y: 0 }, { x: 0, y: 0 }, 30, "num", null,
            () => { AddObjectMode = AddObjectMode == "num" ? "" : "num"; }, true),
        new Button(145, 10, 40, 40,
            () => { return AddObjectMode == "str" ? color(128, 100, 100) : color(255, 200, 200); },
            { x: 0, y: 0 }, { x: 0, y: 0 }, 30, "string", null,
            () => { AddObjectMode = AddObjectMode == "str" ? "" : "str"; }, true),
        new Button(190, 10, 40, 40,
            () => { return AddObjectMode == "name" ? color(128, 100, 100) : color(255, 200, 200); },
            { x: 0, y: 0 }, { x: 0, y: 0 }, 30, "name", null,
            () => { AddObjectMode = AddObjectMode == "name" ? "" : "name"; }, true),
        new Button(235, 10, 40, 40,
            () => { return AddObjectMode == "tRing" ? color(128, 100, 100) : color(255, 200, 200); },
            { x: 0, y: 0 }, { x: 0, y: 0 }, 30, "tRing", null,
            () => { AddObjectMode = AddObjectMode == "tRing" ? "" : "tRing"; }, true),

        new Button(-5, 10, 40, 40,
            (instance) => { return instance.isPressed ? color(128, 100, 100) : color(255, 200, 200); },
            { x: 1, y: 0 }, { x: 1, y: 0 }, 17, "Run", color(0, 0, 0),
            () => {
                if (startRing) {
                    const data = { isActive: true, message: "Reset", name: null, value: 0, text: null };
                    sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                    addConsoleMessage(">>")

                    const mpsCode = GenerateSpell(startRing);
                    console.log(mpsCode);
                    try {
                        activeInterpreter.execute();
                    } catch (e) {
                        addConsoleMessage(`Execution Error:\n${e.message}`);
                        console.log(`Execution Error:\n${e.message}`);
                    }
                }
                console.log(activeInterpreter.stack);
            }),
        new Button(-140, 10, 70, 40,
            (instance) => { return instance.isPressed ? color(110, 110, 128) : color(220, 220, 255); },
            { x: 1, y: 0 }, { x: 1, y: 0 }, 17, "Import", color(0, 0, 0),
            () => { showXMLInputPanel(); }),
        new Button(-65, 10, 70, 40,
            (instance) => { return instance.isPressed ? color(100, 128, 110) : color(200, 255, 220); },
            { x: 1, y: 0 }, { x: 1, y: 0 }, 17, "Export", color(0, 0, 0),
            () => { exportToXML(); }),
        new Button(10, -10, 40, 40,
            (instance) => { return instance.isPressed ? color(100, 100, 100) : color(200, 200, 200); },
            { x: 0, y: 1 }, { x: 0, y: 1 }, 25, "-", color(0, 0, 0),
            () => { ZoomOut(); }),
        new Button(10, -55, 40, 40,
            (instance) => { return instance.isPressed ? color(100, 100, 100) : color(200, 200, 200); },
            { x: 0, y: 1 }, { x: 0, y: 1 }, 25, "=", color(0, 0, 0),
            () => { ZoomReset(); }),
        new Button(10, -100, 40, 40,
            (instance) => { return instance.isPressed ? color(100, 100, 100) : color(200, 200, 200); },
            { x: 0, y: 1 }, { x: 0, y: 1 }, 25, "+", color(0, 0, 0),
            () => { ZoomIn(); }),
        /*
        new Button(10, 60, 40, 40,
            () => { return cursormode == "grad" ? color(100, 100, 100) : color(200, 200, 200); },
            { x: 0, y: 0 }, { x: 0, y: 0 }, 17, "🖐️", color(0, 0, 0),
            () => { cursormode = "grad"; SetMouseCursor('grab'); }),
        new Button(55, 60, 40, 40,
            () => { return cursormode == "edit" ? color(100, 100, 100) : color(200, 200, 200); },
            { x: 0, y: 0 }, { x: 0, y: 0 }, 17, "🪶", color(0, 0, 0),
            () => { cursormode = "edit"; SetMouseCursor('default'); }),
        */
        new Button(100 - 90, 60, 60, 40,
            (instance) => { return instance.isPressed ? color(100, 110, 128) : color(200, 220, 255); },
            { x: 0, y: 0 }, { x: 0, y: 0 }, 17, "Align", color(0, 0, 0),
            () => { if (startRing) { alignConnectedRings(startRing); } }),
        new Button(165 - 90, 60, 85, 40,
            (instance) => { return instance.isPressed ? color(100, 110, 128) : color(200, 220, 255); },
            { x: 0, y: 0 }, { x: 0, y: 0 }, 17, "Straight", color(0, 0, 0),
            () => { if (startRing) { StraightenConnectedJoints(startRing); } }),
        new Button(-10, 60, 40, 40,
            () => { return color(200, 200, 200); },
            { x: 1, y: 0 }, { x: 1, y: 0 }, 20, "👁️", color(0, 0, 0),
            () => { isUIHidden = true; }),
        new Button(-55, 60, 40, 40,
            (instance) => { return instance.isPressed ? color(100, 100, 100) : color(200, 200, 200); },
            { x: 1, y: 0 }, { x: 1, y: 0 }, 20, "📷", color(0, 0, 0),
            () => { isUIHidden = true; screenshotRequest = true; }),
        new Button(55, -10, 40, 40,
            (instance) => { return (instance.isPressed || !actionStack.length) ? color(100, 100, 100) : color(200, 200, 200); },
            { x: 0, y: 1 }, { x: 0, y: 1 }, 20, "undo", color(0, 0, 0),
            () => { Undo(); }),
        new Button(55, -55, 40, 40,
            (instance) => { return (instance.isPressed || !redoStack.length) ? color(100, 100, 100) : color(200, 200, 200); },
            { x: 0, y: 1 }, { x: 0, y: 1 }, 20, "redo", color(0, 0, 0),
            () => { Redo(); }),
        new Button(5, 105, 30, 15,
            () => { return color(0, 250, 0) },
            { x: 0, y: 0 }, { x: 0, y: 0 }, 12, "> Start", color(100, 100, 100),
            () => {
                if (startRing) { cameraPos.x = startRing.pos.x; cameraPos.y = startRing.pos.y; }
            }, false, false, LEFT),
    ];

    buttons = [...staticButtons];

    zoomSize = 1;
    cameraPos = { x: 0, y: 0 };

    InputInitialize();

    rings = [new MagicRing({ x: 0, y: 0 }),];
    //rings = [new TemplateRing({ x: 0, y: 0 }), ];
    if (rings.length > 0) {
        startRing = rings[0];
        startRing.isStartPoint = true;
    }

    createConsolePanel(); // ui.jsで定義された関数を呼び出す
}

function UpdateMarkerButtons() {
    buttons = [...staticButtons]; // 静的ボタンでリセット

    // マーカー付きリングを検索
    const markedRings = rings.filter(r => r.marker && r.marker.trim() !== "");

    // 必要であればソート（ここではマーカー名順）
    markedRings.sort((a, b) => a.marker.localeCompare(b.marker));

    let yPos = 125; // Startボタンの下から配置開始

    markedRings.forEach(ring => {
        buttons.push(
            new Button(5, yPos, 30, 15,
                () => { return color(0, 250, 0) },
                { x: 0, y: 0 }, { x: 0, y: 0 }, 12, "> " + ring.marker, color(100, 100, 100),
                () => {
                    cameraPos.x = ring.pos.x;
                    cameraPos.y = ring.pos.y;
                }, false, false, LEFT)
        );
        yPos += 20; // 次のボタンの位置
    });
}

function Update() {
    let [width, height] = GetScreenSize();
    UpdateMarkerButtons();

    mousePos = {
        x: (GetMouseX() - width / 2) / zoomSize + cameraPos.x,
        y: (GetMouseY() - height / 2) / zoomSize + cameraPos.y
    };

    // マウスイベント
    if (CheckMouseDown() || CheckTouchStart()) { MouseDownEvent(); }
    else if (CheckMouse() || CheckTouch()) { MouseHoldEvent(); }
    else if (CheckMouseUp() || CheckTouchEnded()) { MouseUpEvent(); }

    if (!isUIHidden) {
        const cmo = CheckMouseObject();
        //console.log(cmo);
        if (cmo[0] == "item" && fieldItems[cmo[1]].type == "sigil") {
            infosigil = fieldItems[cmo[1]].value;
        }
        else if (cmo[0] == "ring" && cmo[1][1] == "ring" && cmo[1][2].item != null && cmo[1][2].item.type == "sigil" && cmo[1][2].index != 0) {
            infosigil = cmo[1][2].item.value;
        }
        else {
            infosigil = "";
        }
    }

    // デバッグボタン
    if (CheckKeyDown(Key.L)) { debugMode = !debugMode; } // デバッグボタン
    //if (CheckKeyDown(Key.K)) { globalIsClockwise = !globalIsClockwise; }
    // 入力モード ショートカット  右クリック左クリックがあるためショートカットなし
    // if (CheckKeyDown(Key.A)) { cursormode = "grad"; SetMouseCursor('grab'); }
    // if (CheckKeyDown(Key.S)) { cursormode = "edit"; SetMouseCursor('default'); }
    // 追加 ショートカット    
    if (CheckKeyDown(Key.Q)) { staticButtons[0].Down(); }
    if (CheckKeyDown(Key.W)) { staticButtons[1].Down(); }
    if (CheckKeyDown(Key.E)) { staticButtons[2].Down(); }
    if (CheckKeyDown(Key.R)) { staticButtons[3].Down(); }
    if (CheckKeyDown(Key.T)) { staticButtons[4].Down(); }
    if (CheckKeyDown(Key.Y)) { staticButtons[5].Down(); }
    if (CheckKeyDown(Key.A)) { if (startRing) { alignConnectedRings(startRing); } }
    if (CheckKeyDown(Key.S)) { if (startRing) { StraightenConnectedJoints(startRing); } }
}

function Draw() {
    let [width, height] = GetScreenSize();
    Clear(color(255, 255, 255));
    if (!isUIHidden) {
        DrawGrid();
    }

    PushTransform();
    Translate(width / 2, height / 2);
    Scale(zoomSize);
    Translate(-cameraPos.x, -cameraPos.y);
    rings.forEach(ring => { ring.Draw(); });
    fieldItems.forEach(item => { item.DrawByCanvas(); });
    PopTransform();

    if (draggingItem && draggingItem.item) { draggingItem.item.DrawByDrag(); }

    if (!isUIHidden) {
        FillRect(0, 0, width, config.menuHeight, config.menuBgColor);
        DrawButtons();

        if (debugMode) {
            DrawText(12, "FPS: " + GetFPSText(), width - 10, height - 10, color(0, 0, 0), RIGHT);
            DrawText(12, "Size: " + zoomSize, width - 10, height - 30, color(0, 0, 0), RIGHT);
            DrawText(12, "MousePos: (" + mousePos.x.toFixed(2) + ", " + mousePos.y.toFixed(2) + ")", width - 10, height - 50, color(0, 0, 0), RIGHT);
            DrawText(12, "CameraPos: (" + cameraPos.x.toFixed(2) + ", " + cameraPos.y.toFixed(2) + ")", width - 10, height - 70, color(0, 0, 0), RIGHT);
            DrawText(12, "AddObjectMode: (" + AddObjectMode + ")", width - 10, height - 90, color(0, 0, 0), RIGHT);
            DrawText(12, "CursorMode: (" + cursormode + ")", width - 10, height - 110, color(0, 0, 0), RIGHT);
        }

        textSize(20);
        textAlign(LEFT, TOP);
        textWrap(CHAR);
        text(sigilExplanations[infosigil], 100, height - 50, width - 120, 80);
    }
    else if (screenshotRequest) {
        saveCanvas('MagicCircle.png'); // 画像を保存
        screenshotRequest = false;     // リクエストフラグをリセット
        isUIHidden = false;            // UIを再表示
    }
}

function OnResize() { }

function DrawGrid() {
    let [width, height] = GetScreenSize();
    const gw = config.gridWidth / (2 ** floor(Math.log(zoomSize) / Math.log(2)));
    const xnum = width / gw / zoomSize;
    for (let i = Math.floor(-xnum / 2 + cameraPos.x / gw); i < Math.ceil(xnum / 2 + cameraPos.x / gw); i++) {
        const x = width / 2 - (cameraPos.x - gw * i) * zoomSize;
        const w = i % 5 ? 1 : 2;
        DrawLine(x, 0, x, height, config.gridColor, w);
    }
    const ynum = height / gw / zoomSize;
    for (let i = Math.floor(-ynum / 2 + cameraPos.y / gw); i < Math.ceil(ynum / 2 + cameraPos.y / gw); i++) {
        const y = height / 2 - (cameraPos.y - gw * i) * zoomSize;
        const w = i % 5 ? 1 : 2;
        DrawLine(0, y, width, y, config.gridColor, w);
    }
}

function ZoomIn(delta = 1.2) { zoomSize = min(5, zoomSize * delta); }
function ZoomOut(delta = 1.2) { zoomSize = max(0.02, zoomSize / delta); }
function ZoomReset() { zoomSize = 1; }

function updateConsolePanel(message) {
    if (consoleText) {
        // テキスト内の改行文字(\n)をHTMLの<br>タグに変換して表示
        consoleText.html(message.replace(/\n/g, '<br>'));
    }
}

function setInterpreter(name) {
    if (interpreters[name]) {
        activeInterpreter = interpreters[name];
        updateConsolePanel(`Interpreter switched to: ${name}`);
    } else {
        console.error(`Interpreter not found: ${name}`);
    }
}

function addConsoleMessage(message) {
    consoleMessages.push(message);
    updateConsolePanel(consoleMessages.join("\n"));
}

function CommitMagicSpell() {
    const magicSpell = GenerateSpell(startRing);
    const data = {
        isActive: true,
        message: "MagicSpell",
        value: 0,
        text: magicSpell,
    };
    sendJsonToUnity('JsReceiver', 'ReceiveGeneralData', data);
}

function GenerateSpell(ringToStart) {
    if (ringToStart) {
        const spell = ringToStart.Spell();
        // return spell;
        return spell.slice(1, -1) // 一番外側の{}を外す
    }
    return "";
}

function Undo() {
    if (actionStack.length > 0) {
        const action = actionStack.pop();
        action.undo();
        redoStack.push(action);
    }
    console.log("actionStack:");
    console.log(actionStack);
    console.log("redoStack: ");
    console.log(redoStack);
}

function Redo() {
    if (redoStack.length > 0) {
        const action = redoStack.pop()
        action.redo();
        actionStack.push(action);
    }
    console.log("actionStack:");
    console.log(actionStack);
    console.log("redoStack: ");
    console.log(redoStack);
}