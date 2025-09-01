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
    SetMouseCursor('grab');       // つかめる
    
    config = {
        bgColor: color(255, 255, 255),
        gridColor: color(200, 200, 200, 100),
        gridWidth: 100,
        menuHeight: 100,
        menuBgColor: color(55, 55, 55, 200),
        ringWidth: 45,
        minRingCircumference: 50,
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
        new Button(10, 10, 80, 80, color(255, 200, 200), {x: 0, y: 0}, {x: 0, y: 0}, "ring", function(){isAddRing = true;}),
        new Button(100, 10, 80, 80, color(255, 200, 200), {x: 0, y: 0}, {x: 0, y: 0}, "sigil", function(){isAddSigil = true;}),
        new Button(-10, 10, 80, 80, color(255, 200, 200), {x: 1, y: 0}, {x: 1, y: 0}, "▶️", function(){CommitMagicSpell();}),
        new Button(10, -10, 40, 40, color(200, 200, 200), {x: 0, y: 1}, {x: 0, y: 1}, "-", function(){ZoomOut();}),
        new Button(10, -60, 40, 40, color(200, 200, 200), {x: 0, y: 1}, {x: 0, y: 1}, "=", function(){ZoomReset();}),
        new Button(10, -110, 40, 40, color(200, 200, 200), {x: 0, y: 1}, {x: 0, y: 1}, "+", function(){ZoomIn();}),
        new Button(10, 110, 40, 40, color(200, 200, 200), {x: 0, y: 0}, {x: 0, y: 0}, "a", function(){cursormode = "grad"; SetMouseCursor('grab');}),
        new Button(10, 155, 40, 40, color(200, 200, 200), {x: 0, y: 0}, {x: 0, y: 0}, "b", function(){cursormode = "default"; SetMouseCursor('default');}),
        
    ];
    
    zoomSize = 1;
    cameraPos = {x: 0, y: 0};
    
    InputInitialize();
    
    //test
    rings.push(new MagicRing({x: 0, y: 0}));
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