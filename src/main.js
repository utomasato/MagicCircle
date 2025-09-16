let config = {};
let cameraPos;
let zoomSize;
let rings = [];
let fieldItems = [];
let buttons = [];
let cursormode = "grad";

let debugMode;

function Start()
{
    debugMode = false;

    let [width, height] = GetScreenSize();
    // タイトルの設定
    SetTitle("MagicEditor");
    SetMouseCursor('grab');       // つかめる
    
    config = {
        bgColor: color(255, 255, 255),
        gridColor: color(200, 200, 200, 100),
        gridWidth: 100,
        menuHeight: 70,
        menuBgColor: color(55, 55, 55, 200),
        ringWidth: 45,
        arrayWidth: 30,
        minRingCircumference: 50,
        minArrayCircumference: 40,
        itemPadding: 2, //アイテム同士の幅
        sigilWidth: 7,
        charSpacing: 0.2, // 文字同士の幅
        charWidth: 1.5,
        fontSize: 15,
        fontColor: color(0, 0, 0),
        sigilSize: 40,
        sigilColor: color(0, 0, 0),
        sigilLineWidth: 0.04,
        stringSideWidth: 2,
        nameObjectMinWidth: 8,
        ringRotateHandleWidth: 20,
    };
    
    // Button(x, y, w, h, color, anchor, pivot, text, pressed)
    buttons = [
        new Button(10, 10, 50, 50, color(255, 200, 200), {x: 0, y: 0}, {x: 0, y: 0}, "ring", function(){isAddRing = true;}),
        new Button(70, 10, 50, 50, color(255, 200, 200), {x: 0, y: 0}, {x: 0, y: 0}, "sigil", function(){isAddSigil = true;}),
        new Button(130, 10, 50, 50, color(255, 200, 200), {x: 0, y: 0}, {x: 0, y: 0}, "num", function(){isAddNum = true;}),
        new Button(190, 10, 50, 50, color(255, 200, 200), {x: 0, y: 0}, {x: 0, y: 0}, "str", function(){isAddStr = true;}),
        new Button(250, 10, 50, 50, color(255, 200, 200), {x: 0, y: 0}, {x: 0, y: 0}, "name", function(){isAddName = true;}),
        new Button(-10, 10, 50, 50, color(255, 200, 200), {x: 1, y: 0}, {x: 1, y: 0}, "▶️", function(){CommitMagicSpell();}),
        new Button(10, -10, 40, 40, color(200, 200, 200), {x: 0, y: 1}, {x: 0, y: 1}, "-", function(){ZoomOut();}),
        new Button(10, -60, 40, 40, color(200, 200, 200), {x: 0, y: 1}, {x: 0, y: 1}, "=", function(){ZoomReset();}),
        new Button(10, -110, 40, 40, color(200, 200, 200), {x: 0, y: 1}, {x: 0, y: 1}, "+", function(){ZoomIn();}),
        new Button(10, 80, 40, 40, color(200, 200, 200), {x: 0, y: 0}, {x: 0, y: 0}, "a", function(){cursormode = "grad"; SetMouseCursor('grab');}),
        new Button(10, 125, 40, 40, color(200, 200, 200), {x: 0, y: 0}, {x: 0, y: 0}, "b", function(){cursormode = "default"; SetMouseCursor('default');}),
        new Button(10, 180, 160, 40, color(200, 220, 255), {x:0, y:0}, {x:0, y:0}, "Align Rings", () => {
            if (rings.length > 0) {
                alignConnectedRings(rings[0]);
            }
        }),
    ];
    
    zoomSize = 1;
    cameraPos = {x: 0, y: 0};
    
    InputInitialize();
    
    // ==================================================================
    // MPSコードに対応する魔法陣の構造を生成
    // ==================================================================
    
    // 全てのリングを事前に生成
    rings = [
        new DictRing({x: 0, y: 0}),      // 0: root < ... >
        new DictRing({x: 0, y: 0}),      // 1: main < ... >
        new DictRing({x: 0, y: 0}),      // 2: emission < ... >
        new DictRing({x: 0, y: 0}),      // 3: shape < ... >
        new DictRing({x: 0, y: 0}),      // 4: colorOverLifetime < ... >
        new DictRing({x: 0, y: 0}),      // 5: rotationOverLifetime < ... >
        new DictRing({x: 0, y: 0}),      // 6: renderer < ... >
        new ArrayRing({x: 0, y: 0}),     // 7: startLifetime [ ... ]
        new ArrayRing({x: 0, y: 0}),     // 8: startSize [ ... ]
        new ArrayRing({x: 0, y: 0}),     // 9: startRotation [ ... ]
        new ArrayRing({x: 0, y: 0}),     // 10: gradient [ [..] [..] ]
        new ArrayRing({x: 0, y: 0}),     // 11: rotation (z) [ ... ]
        new ArrayRing({x: 0, y: 0}),     // 12: gradient inner array 1
        new ArrayRing({x: 0, y: 0}),     // 13: gradient inner array 2
    ];

    // --- Root Ring (rings[0]) の設定 ---
    rings[0].items.push(new Name(0, 0, "main", rings[0]));
    rings[0].items.push(new Joint(0, 0, rings[1], rings[0])); // -> main
    rings[0].items.push(new Name(0, 0, "emission", rings[0]));
    rings[0].items.push(new Joint(0, 0, rings[2], rings[0])); // -> emission
    rings[0].items.push(new Name(0, 0, "shape", rings[0]));
    rings[0].items.push(new Joint(0, 0, rings[3], rings[0])); // -> shape
    rings[0].items.push(new Name(0, 0, "colorOverLifetime", rings[0]));
    rings[0].items.push(new Joint(0, 0, rings[4], rings[0])); // -> colorOverLifetime
    rings[0].items.push(new Name(0, 0, "rotationOverLifetime", rings[0]));
    rings[0].items.push(new Joint(0, 0, rings[5], rings[0])); // -> rotationOverLifetime
    rings[0].items.push(new Name(0, 0, "renderer", rings[0]));
    rings[0].items.push(new Joint(0, 0, rings[6], rings[0])); // -> renderer

    // --- main (rings[1]) の設定 ---
    rings[1].items.push(new Name(0, 0, "startLifetime", rings[1]));
    rings[1].items.push(new Joint(0, 0, rings[7], rings[1])); // -> [ 0.5 1.0 ]
    rings[1].items.push(new Name(0, 0, "startSpeed", rings[1]));
    rings[1].items.push(new Chars(0, 0, "0.5", rings[1]));
    rings[1].items.push(new Name(0, 0, "startSize", rings[1]));
    rings[1].items.push(new Joint(0, 0, rings[8], rings[1])); // -> [ 0.2 0.4 ]
    rings[1].items.push(new Name(0, 0, "startRotation", rings[1]));
    rings[1].items.push(new Joint(0, 0, rings[9], rings[1])); // -> [ 0 360 ]

    // --- emission (rings[2]) の設定 ---
    rings[2].items.push(new Name(0, 0, "rateOverTime", rings[2]));
    rings[2].items.push(new Chars(0, 0, "50", rings[2]));

    // --- shape (rings[3]) の設定 ---
    rings[3].items.push(new Name(0, 0, "angle", rings[3]));
    rings[3].items.push(new Chars(0, 0, "5", rings[3]));
    rings[3].items.push(new Name(0, 0, "radius", rings[3]));
    rings[3].items.push(new Chars(0, 0, "0.0001", rings[3]));
    
    // --- colorOverLifetime (rings[4]) の設定 ---
    rings[4].items.push(new Name(0, 0, "gradient", rings[4]));
    rings[4].items.push(new Joint(0, 0, rings[10], rings[4])); // -> [ [...] [...] ]
    
    // --- rotationOverLifetime (rings[5]) の設定 ---
    rings[5].items.push(new StringToken(0, 0, "z", rings[5]));
    rings[5].items.push(new Joint(0, 0, rings[11], rings[5])); // -> [ -45 45 ]

    // --- renderer (rings[6]) の設定 ---
    rings[6].items.push(new Name(0, 0, "materialName", rings[6]));
    rings[6].items.push(new StringToken(0, 0, "Fire1", rings[6]));

    // --- main の子要素 (ArrayRings) ---
    rings[7].items.push(new Chars(0, 0, "0.5", rings[7]));
    rings[7].items.push(new Chars(0, 0, "1.0", rings[7]));
    rings[8].items.push(new Chars(0, 0, "0.2", rings[8]));
    rings[8].items.push(new Chars(0, 0, "0.4", rings[8]));
    rings[9].items.push(new Chars(0, 0, "0", rings[9]));
    rings[9].items.push(new Chars(0, 0, "360", rings[9]));

    // --- colorOverLifetime の子要素 (ネストしたArrayRings) ---
    rings[10].items.push(new Joint(0, 0, rings[12], rings[10])); // -> gradient inner array 1
    rings[10].items.push(new Joint(0, 0, rings[13], rings[10])); // -> gradient inner array 2

    // --- rotationOverLifetime の子要素 ---
    rings[11].items.push(new Chars(0, 0, "-45", rings[11]));
    rings[11].items.push(new Chars(0, 0, "45", rings[11]));

    // --- gradient の内部配列 (rings[12], rings[13]) ---
    rings[12].items.push(new Chars(0, 0, "1.0", rings[12]));
    rings[12].items.push(new Chars(0, 0, "0.6", rings[12]));
    rings[12].items.push(new Chars(0, 0, "0.0", rings[12]));
    rings[12].items.push(new Chars(0, 0, "1.0", rings[12]));
    rings[12].items.push(new Chars(0, 0, "0.0", rings[12]));
    
    rings[13].items.push(new Chars(0, 0, "1.0", rings[13]));
    rings[13].items.push(new Chars(0, 0, "0.0", rings[13]));
    rings[13].items.push(new Chars(0, 0, "0.0", rings[13]));
    rings[13].items.push(new Chars(0, 0, "1.0", rings[13]));
    rings[13].items.push(new Chars(0, 0, "1.0", rings[13]));

    // 全てのリングのレイアウトを計算
    rings.forEach(ring => ring.CalculateLayout());
}

function Update()
{
    let [width, height] = GetScreenSize();
    mousePos = {
        x: (GetMouseX() - width/2)/zoomSize + cameraPos.x,
        y: (GetMouseY() - height/2)/zoomSize + cameraPos.y
    };
    
    // クリック・タッチ 開始
    if (CheckMouseDown() || CheckTouchStart())
    {
        MouseDownEvent();
    }
    // クリック・タッチ 中
    else if (CheckMouse() || CheckTouch())
    {
        MouseHoldEvent();
    }
    // クリック・タッチ 終わり
    else if (CheckMouseUp() || CheckTouchEnded())
    {
        MouseUpEvent();
    }
    
    if (CheckKeyDown(Key.D))
    {
        debugMode = !debugMode;
    }
}

function Draw()
{
    let [width, height] = GetScreenSize();

    Clear(color(255, 255, 255));
    DrawGrid();
    
    PushTransform();
    Translate(width/2, height/2);
    Scale(zoomSize);
    Translate(-cameraPos.x, -cameraPos.y);
    rings.forEach(ring => 
    {
       ring.Draw(); 
    });
    fieldItems.forEach(item =>
    {
        item.DrawByCanvas();
    });
    PopTransform();
    
    if(draggingItem)
    {
        draggingItem.item.DrawByDrag();
    }
    
    
    // メニュー表示
    FillRect(0, 0, width, config.menuHeight, config.menuBgColor);
    DrawButtons();

    // FPS表示
    DrawText(12, "FPS: " + GetFPSText(), width - 10, height - 10, color(0, 0, 0), RIGHT);
    DrawText(12, "Size: " + zoomSize, width - 10, height - 30, color(0,0,0),RIGHT);
    if(debugMode)
    {
        DrawText(12, "MausePos: (" + mousePos.x + ", " + mousePos.y + ")", width - 10, height - 50, color(0, 0, 0), RIGHT);
        DrawText(12, "Pos: (" + cameraPos.x + ", " + cameraPos.y + ")", width - 10, height - 70, color(0,0,0), RIGHT);
    }
}


function OnResize()
{
    //let [width, height] = GetScreenSize();
}


// グリッド描画
function DrawGrid()
{
    let [width, height] = GetScreenSize();
    const gw = config.gridWidth /　(2 ** floor(Math.log(zoomSize)/Math.log(2)));
    const xnum = width / gw / zoomSize;
    for (let i = Math.floor(-xnum / 2 + cameraPos.x / gw); i < Math.ceil(xnum / 2 + cameraPos.x / gw); i++)
    {
        const x = width/2 - (cameraPos.x - gw * i) * zoomSize;
        const w = i%5 ? 1 : 2;
        DrawLine(x, 0, x, height, config.gridColor, w);
    }
    const ynum = height / gw / zoomSize;
    for (let i = Math.floor(-ynum / 2 + cameraPos.y / gw); i < Math.ceil(ynum / 2 + cameraPos.y / gw); i++)
    {
        const y = height/2 - (cameraPos.y - gw * i) * zoomSize;
        const w = i%5 ? 1 : 2;
        DrawLine(0, y, width, y, config.gridColor, w);    
    }
}

function alignConnectedRings(startRing) {
    if (!startRing) return;
    // 始点リングをルートとして、再帰的なレイアウト処理を開始
    layoutSubtreeAndGetEffectiveRadius(startRing, new Set());
}

function layoutSubtreeAndGetEffectiveRadius(parentRing, visited) {
    if (!parentRing || visited.has(parentRing)) {
        return parentRing ? parentRing.outerradius : 0;
    }
    visited.add(parentRing);
    
    parentRing.CalculateLayout();

    // 1. 子リングの情報を収集
    const children = [];
    parentRing.items.forEach((item, index) => {
        if (item && item.type === 'joint' && item.value instanceof MagicRing) {
            const targetRing = item.value;
            if (!children.some(c => c.ring === targetRing)) {
                children.push({
                    ring: targetRing,
                    layout: parentRing.layouts[index],
                    effectiveRadius: 0 
                });
            }
        }
    });

    if (children.length === 0) {
        return parentRing.outerradius;
    }
    
    // 2. 子のサブツリーを再帰的にレイアウトし、実効半径を取得
    children.forEach(child => {
        child.effectiveRadius = layoutSubtreeAndGetEffectiveRadius(child.ring, new Set(visited)); // visited をコピーして渡す
    });

    // 3. 子リングを親の周りに配置
    const ringGap = 50;
    children.forEach(child => {
        // 目標の位置と角度を計算
        const jointWorldAngle = parentRing.angle + child.layout.angle;
        const alignAngle = jointWorldAngle - HALF_PI;
        const distance = parentRing.outerradius + child.effectiveRadius + ringGap;
        const newX = parentRing.pos.x + distance * cos(alignAngle);
        const newY = parentRing.pos.y + distance * sin(alignAngle);
        
        // 子の向きは親を向くように設定
        const directionToParent = atan2(parentRing.pos.y - newY, parentRing.pos.x - newX);
        const newAngle = directionToParent + HALF_PI;
        
        // ★新しい関数でサブツリー全体を変換
        transformSubtree(child.ring, newX, newY, newAngle);
    });

    // 4. 子リング同士の衝突を解消
    const maxIterations = 10;
    for (let iter = 0; iter < maxIterations; iter++) {
        let collisionFound = false;
        for (let i = 0; i < children.length; i++) {
            for (let j = i + 1; j < children.length; j++) {
                const childA = children[i];
                const childB = children[j];
                
                const distBetween = dist(childA.ring.pos.x, childA.ring.pos.y, childB.ring.pos.x, childB.ring.pos.y);
                const requiredDist = childA.effectiveRadius + childB.effectiveRadius;

                if (distBetween < requiredDist) {
                    collisionFound = true;
                    const overlap = requiredDist - distBetween;
                    
                    const ringToMoveData = (childA.effectiveRadius >= childB.effectiveRadius) ? childB : childA;
                    
                    const angleFromParent = atan2(ringToMoveData.ring.pos.y - parentRing.pos.y, ringToMoveData.ring.pos.x - parentRing.pos.x);
                    
                    const dx = overlap * cos(angleFromParent);
                    const dy = overlap * sin(angleFromParent);

                    // 目標の位置と角度を再計算
                    const newX = ringToMoveData.ring.pos.x + dx;
                    const newY = ringToMoveData.ring.pos.y + dy;
                    const directionToParent = atan2(parentRing.pos.y - newY, parentRing.pos.x - newX);
                    const newAngle = directionToParent + HALF_PI;

                    // ★ここでも新しい関数を使い、衝突解消の移動と回転をサブツリー全体に適用
                    transformSubtree(ringToMoveData.ring, newX, newY, newAngle);
                }
            }
        }
        if (!collisionFound) break;
    }

    // 5. 親リングの新しい実効半径を計算して返す
    let maxExtent = parentRing.outerradius;
    children.forEach(child => {
        const distToChildCenter = dist(parentRing.pos.x, parentRing.pos.y, child.ring.pos.x, child.ring.pos.y);
        maxExtent = max(maxExtent, distToChildCenter + child.effectiveRadius);
    });
    
    return maxExtent;
}

/**
 * 指定されたリングとそのすべての子孫リングを、指定されたオフセット分だけ移動させます。
 * @param {MagicRing} ringToMove - 移動を開始するリング
 * @param {number} dx - X方向の移動量
 * @param {number} dy - Y方向の移動量
 * @param {Set<MagicRing>} movedRings - この移動操作で既に動かしたリングのセット
 */
function moveRingAndDescendants(ringToMove, dx, dy, movedRings) {
    if (!ringToMove || movedRings.has(ringToMove)) {
        return;
    }
    movedRings.add(ringToMove);

    ringToMove.pos.x += dx;
    ringToMove.pos.y += dy;

    // このリングに接続されている子リングを探し、再帰的に移動
    const children = ringToMove.items
        .filter(item => item && item.type === 'joint' && item.value instanceof MagicRing)
        .map(joint => joint.value);

    [...new Set(children)].forEach(child => {
        moveRingAndDescendants(child, dx, dy, movedRings);
    });
}

/**
 * 指定されたリングのサブツリー全体を、指定された中心点(cx, cy)周りに角度angleだけ回転させます。
 * 位置と向きの両方が更新されます。
 * @param {MagicRing} ring - 回転を開始するリング
 * @param {number} cx - 回転の中心X座標
 * @param {number} cy - 回転の中心Y座標
 * @param {number} angle - 回転させる角度（ラジアン）
 * @param {Set<MagicRing>} rotatedRings - 無限再帰防止用のセット
 */
function rotateSubtreeAroundPoint(ring, cx, cy, angle, rotatedRings) {
    if (!ring || rotatedRings.has(ring)) {
        return;
    }
    rotatedRings.add(ring);

    // 1. リングの位置を(cx, cy)周りに回転
    const relX = ring.pos.x - cx;
    const relY = ring.pos.y - cy;
    const cosA = cos(angle);
    const sinA = sin(angle);
    ring.pos.x = cx + (relX * cosA - relY * sinA);
    ring.pos.y = cy + (relX * sinA + relY * cosA);

    // 2. リング自身の向きも同じ角度だけ回転
    ring.angle += angle;

    // 3. 子孫リングに対しても再帰的に処理を実行
    const children = ring.items
        .filter(item => item && item.type === 'joint' && item.value instanceof MagicRing)
        .map(joint => joint.value);

    [...new Set(children)].forEach(child => {
        // 子孫の回転の中心は同じ(cx, cy)
        rotateSubtreeAroundPoint(child, cx, cy, angle, rotatedRings);
    });
}

/**
 * 指定されたリングの位置と角度を更新し、その変化に応じてサブツリー全体を適切に変換（移動＆回転）します。
 * @param {MagicRing} ringToUpdate - 更新対象のリング
 * @param {number} newX - 新しい目標X座標
 * @param {number} newY - 新しい目標Y座標
 * @param {number} newAngle - 新しい目標角度 (ラジアン)
 */
function transformSubtree(ringToUpdate, newX, newY, newAngle) {
    const oldPos = { x: ringToUpdate.pos.x, y: ringToUpdate.pos.y };
    const oldAngle = ringToUpdate.angle;

    // 1. 平行移動量を計算
    const dx = newX - oldPos.x;
    const dy = newY - oldPos.y;

    // 2. 回転量を計算
    const angleChange = newAngle - oldAngle;

    // 3. まず、サブツリー全体を平行移動させる
    // (ringToUpdate自身もここで新しい位置へ移動する)
    moveRingAndDescendants(ringToUpdate, dx, dy, new Set());

    // 4. 次に、ringToUpdateの子孫たちを、その新しい中心周りに回転させる
    if (abs(angleChange) > 0.001) { // 浮動小数点数の誤差を考慮
        const children = ringToUpdate.items
            .filter(item => item && item.type === 'joint' && item.value instanceof MagicRing)
            .map(joint => joint.value);

        [...new Set(children)].forEach(child => {
            rotateSubtreeAroundPoint(
                child,
                newX, // 回転の中心は "新しい" 親の位置
                newY,
                angleChange,
                new Set([ringToUpdate]) // 親自身は回転させないので除外
            );
        });
    }
    
    // 5. 最後に、ringToUpdate自身の角度を目標の角度に設定
    ringToUpdate.angle = newAngle;
}
// ---------------------------------------------
// ズームインアウト
// ---------------------------------------------
function ZoomIn()
{
    zoomSize += 0.1;
    if (zoomSize > 5) zoomSize = 5;
}
function ZoomOut()
{
    zoomSize -= 0.1;
    if (zoomSize < 0.1) zoomSize = 0.1;
}
function ZoomReset()
{
    zoomSize = 1;
}

function CommitMagicSpell()
{
    const magicSpell = GenerateSpell();
    const data = {
        isActive: true,
        message: "MagicSpell",
        value: 0,
        text: magicSpell,
    };

    sendJsonToUnity('JsReceiver', 'ReceiveGeneralData', data);
}

function GenerateSpell()
{
    const spell = rings[0].Spell();
    return spell;
}