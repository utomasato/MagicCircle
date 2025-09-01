let isPanning;
let panStart = {};
let isDragging;
let dragOffset;
let isRotating;
let rotateOffset;
let isAddRing;
let isAddSigil;
let mousePos = {};
let selectRing;
let isItemDragging;
let draggingItem = {};

// p5.domで生成したinput要素と、編集中のアイテムを保持するためのグローバル変数
let currentInputElement = null;
let editingItem = null;
// ▼▼▼ 修正点1: 終了処理の重複実行を防ぐためのフラグを追加 ▼▼▼
let isFinishingText = false;


function InputInitialize()
{
    isPanning = false;
    panStart = {x: 0, y: 0};
    isDragging = false;
    dragOffset = {x: 0, y: 0};
    isRotating = false;
    isAddRing = false;
    isAddSigil = false;
    mousePos = {x: 0, y: 0};
    selectRing = null;
    isItemDragging = false;
    draggingItem = null;

    // 既存の入力欄があれば削除
    if (currentInputElement) {
        currentInputElement.remove();
        currentInputElement = null;
        editingItem = null;
    }
}

function MouseDownEvent()
{

    // もし入力欄が表示されていて、その入力欄以外をクリックしたら入力欄を消す
    if (currentInputElement) {
        const inpRect = currentInputElement.elt.getBoundingClientRect();
        if (
            mouseX < inpRect.left || mouseX > inpRect.right ||
            mouseY < inpRect.top  || mouseY > inpRect.bottom
        ) {
            finishTextInput(); // 入力内容を確定して削除
            return; 
        }
    }

    if (GetMouseX() > GetScreenSize()[0]) return;
    const ClickObj = CheckMouseObject();
    switch (cursormode)
    {
        case "grad":
            switch (ClickObj[0])
            {
                case "menu":
                case "button":
                    break;
                case "ring":
                    selectRing = ClickObj[1][0];
                    switch (ClickObj[1][1])
                    {
                        case "inner":
                            StartDragRing(selectRing, mousePos);
                            break;
                        case "outer":
                            StartRotateRing(selectRing, mousePos);
                            break;
                        case "ring":
                            const iteminfo = ClickObj[1][2];
                            if (iteminfo.item && iteminfo.index != 0) {
                                StartDragItem(iteminfo.item, iteminfo.index);
                            } else { // シジルや空きスロットは回転
                                StartRotateRing(selectRing, mousePos);
                            }
                            break;
                    }
                    break;
                case "item":
                    StartDragItem(fieldItems[ClickObj[1]], ClickObj[1]);
                    break;
                default :
                    StartPan(GetMousePos());
            }
            break;
        case "default":
            switch (ClickObj[0])
            {
                case "menu":
                case "button":
                    break;
                case "ring": // リング内のアイテムをクリックした場合
                    const iteminfo = ClickObj[1][2];
                    if (iteminfo && iteminfo.item && iteminfo.item.type !== "sigil") {
                        ChangeItem(iteminfo.item);
                    }
                    break;
                case "item": // リング外のアイテムをクリックした場合
                    const item = fieldItems[ClickObj[1]];
                    if (item && item.type !== "sigil") {
                         ChangeItem(item);
                    }
                    break;
                default :
                    StartPan(GetMousePos());
            }
            break;
    }
}

function MouseHoldEvent()
{
    if (GetMouseX() > GetScreenSize()[0]) return;
    if (isAddRing)
    {
        if (!CheckMouseOnMenu()) // マウスがメニューから外れたら
        {
            selectRing = new MagicRing(mousePos);
            rings.push(selectRing);
            StartDragRing(selectRing, mousePos);
            isAddRing = false;
        }
    }
    else if (isAddSigil)
    {
        if (!CheckMouseOnMenu()) // マウスがメニューから外れたら
        {
            const newItem = new Sigil(0, 0, "add", null);
            fieldItems.push(newItem);
            StartDragItem(newItem, fieldItems.length-1)
            isAddSigil = false;
        }
    }
    else if (isDragging)
    {
        DragRing(selectRing, mousePos);
    }
    else if (isRotating)
    {
        RotateRing(selectRing, mousePos);
    }
    else if (isPanning) 
    {
        Pan(GetMousePos());
    }
    else if (isItemDragging)
    {
        
    }
}

function MouseUpEvent()
{
    if (GetMouseX() > GetScreenSize()[0]) return;
    if (isDragging)
    {
        EndDragRing();
    }
    else if (isRotating)
    {
        EndRotateRing();
    }
    else if (isPanning)
    {
        EndPan();
    }
    else if (isItemDragging)
    {
        EndDragItem();
    }
    isAddRing = false;
}

// ---------------------------------------------
// マウスの位置に何があるか
// ---------------------------------------------
function CheckMouseObject()
{
    if (CheckButtons())
    {
        return ["button"];
    }
    if (CheckMouseOnMenu())
    {
        return ["menu"];
    }
    const ring = CheckMouseOnRing();
    if (ring)
    {
        return ["ring", ring];
    }
    const hititem = CheckMouseOnItem();
    if (hititem[0])
    {       
        return ["item", hititem[1]];
    }
    
    return [null];
}

function CheckMouseOnRing()
{
    let hitRing;
    for (const ring of rings)
    {
        hitRing = ring.CheckPosIsOn(mousePos);
        if (hitRing) break;
    }
    return hitRing;
}

function CheckMouseOnItem()
{
    let ishit = false;
    let index = 0;
    for (let i = 0; i < fieldItems.length; i++)
    {
        ishit = fieldItems[i].CheckPosIsOn(mousePos);
        if (ishit)
        {
            index = i;
            break;
        }
    }
    return [ishit, index];
}

function CheckMouseOnMenu()
{
    if (GetMouseY() < config.menuHeight)
    {
        return true;
    }
    return false;
}

// ---------------------------------------------
// ボタン
// ---------------------------------------------
function DrawButtons()
{
    buttons.forEach (btn =>
    {
        btn.Draw();
    })
}

function CheckButtons()
{   
    let isbutton = false;
    buttons.forEach (btn =>
    {
        const result = btn.CheckPressed();
        if (result) isbutton = true;
    });
    return isbutton;
}

// ---------------------------------------------
// リングをドラッグして動かす
// ---------------------------------------------
function StartDragRing(ring, pos)
{
    isDragging = true;
    dragOffset.x = ring.pos.x - pos.x;
    dragOffset.y = ring.pos.y - pos.y; 
    console.log("StartDrag");   
}

function DragRing(ring, pos)
{
    if (!isDragging) return;
    ring.pos.x = pos.x + dragOffset.x;
    ring.pos.y = pos.y + dragOffset.y;
    console.log("Drag");
}

function EndDragRing()
{
    if (CheckMouseObject()[0] == "menu")
    {
        console.log("menu");
        rings = rings.filter(function( item ) {
            return item !== selectRing;
        });
    }
    isDragging = false;
    console.log("EndDrag");
}

// ---------------------------------------------
// リングをドラッグして回す
// ---------------------------------------------
function StartRotateRing(ring, pos)
{
    isRotating = true;
    const mouseAngle = Math.atan2(pos.y - ring.pos.y, pos.x - ring.pos.x);
    rotateOffset = (ring.angle) - mouseAngle;
    console.log("StartRotate");
}

function RotateRing(ring, pos)
{
    if(!isRotating) return;
    const mouseAngle = Math.atan2(pos.y - ring.pos.y, pos.x - ring.pos.x);
    const newAngle = mouseAngle + rotateOffset;
    ring.angle = newAngle;
    console.log("Rotate");
}

function EndRotateRing(ring)
{
    isRotating = false;
    console.log("EndRotate");
}

// ---------------------------------------------
// アイテムをドラッグして移動させる
// ---------------------------------------------
function StartDragItem(item, index)
{
    isItemDragging = true;
    draggingItem = {item: item, index: index};
    if (item.parentRing)
        item.parentRing.items[index] = null;
    else
        fieldItems.splice(index,1);
}

function EndDragItem()
{
    if (!draggingItem || !draggingItem.item) {
        isItemDragging = false;
        draggingItem = null;
        return;
    }

    const obj = CheckMouseObject();
    const draggedItem = draggingItem.item;
    const originalRing = draggedItem.parentRing;
    const originalIndex = draggingItem.index;

    // 先に元のリングからアイテムを完全に削除する
    if (originalRing) {
        originalRing.RemoveItem(originalIndex);
    }

    switch(obj[0]) // ドロップした位置
    {
        case "menu":
            draggedItem.parentRing = null;
            break;

        case "ring":
            const newring = obj[1][0];
            const iteminfo = newring.CheckPosItem(mousePos);
            
            if (iteminfo.item == null) { // リングの空白スロットにドラッグした時
                newring.InsertItem(draggedItem, iteminfo.index);
            } else {
                if (newring == originalRing)
                {
                    if (originalIndex <= iteminfo.index+1)
                        newring.InsertItem(draggedItem, iteminfo.index);
                    else
                        newring.InsertItem(draggedItem, iteminfo.index +1);
                } else {
                    newring.InsertItem(draggedItem, iteminfo.index + 1);
                }
            }
            draggedItem.parentRing = newring;
            newring.CalculateLayout();
            break;

        default:
            draggedItem.parentRing = null;
            fieldItems.push(draggedItem);
            draggedItem.pos = mousePos;
    }
    draggingItem = null;
    isItemDragging = false;
    if (originalRing) {
        originalRing.CalculateLayout();
    }
}

// ---------------------------------------------
// テキスト入力関連の関数
// ---------------------------------------------

function finishTextInput() {
    if (isFinishingText) return;
    isFinishingText = true;

    if (currentInputElement && editingItem) {
        editingItem.value = currentInputElement.value();
        
        if (editingItem.parentRing) {
            editingItem.parentRing.CalculateLayout();
        }
    }

    if(currentInputElement) {
        currentInputElement.remove();
        currentInputElement = null;
    }
    
    editingItem = null;

    setTimeout(() => {
        isFinishingText = false;
    }, 50); 
}

function ChangeItem(item) {
    if (currentInputElement) {
        return;
    }

    editingItem = item; // 現在編集中のアイテムを保存

    currentInputElement = createInput(item.value);
    currentInputElement.position(GetMouseX() + 15, GetMouseY() - 10);
    currentInputElement.style('z-index', '1000');
    currentInputElement.style('border', '1px solid black');
    currentInputElement.style('padding', '4px');
    currentInputElement.style('font-size', '14px');
    currentInputElement.elt.focus();

    const keyInterceptor = (e) => {
        e.stopImmediatePropagation();
        if (e.key === 'Enter') {
            e.preventDefault();
            finishTextInput();
        }
    };

    currentInputElement.elt.addEventListener('keydown', keyInterceptor, true);
    currentInputElement.elt.addEventListener('blur', finishTextInput);
}

// ---------------------------------------------
// 描画範囲を移動させる
// ---------------------------------------------
function StartPan(mousePos)
{
    isPanning = true;
    panStart = mousePos;
    SetMouseCursor('grabbing');
    console.log("panStart");
}

function Pan(mousePos)
{
    if (!isPanning) return;
    const dx = mousePos.x - panStart.x;
    const dy = mousePos.y - panStart.y;
    cameraPos.x -= dx / zoomSize;
    cameraPos.y -= dy / zoomSize;
    panStart = mousePos;
    console.log("pan");
}

function EndPan()
{
    if (!isPanning) return;
    isPanning = false;
    SetMouseCursor('grab');
    console.log("panEnd");
}
