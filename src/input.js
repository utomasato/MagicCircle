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
}

function MouseDownEvent()
{
    const ClickObj = CheckMouseObject();
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
                    if (iteminfo.index == 0)
                    {
                        StartRotateRing(selectRing, mousePos);
                    }
                    else
                    {
                        StartDragItem(selectRing.items[iteminfo.index], iteminfo.index);
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
}

function MouseHoldEvent()
{
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
    if (item.ring)
        item.ring.items[index] = null;
    else
        fieldItems.splice(index,1);
}

function EndDragItem()
{
    const obj = CheckMouseObject()
    switch(obj[0])
    {
        case "ring":
            const newring = obj[1][0];
            const iteminfo = newring.CheckPosItem(mousePos);
            if (iteminfo.item == null) // 元の場所に戻す
            {
                newring.items[iteminfo.index] = draggingItem.item;
            }
            else
            {
                const oldring = draggingItem.item.ring;
                if (oldring == newring) // リングの中で移動する時
                {
                    newring.RemoveItem(draggingItem.index);
                    const insertidnex = max(iteminfo.index, 1);
                    newring.InsertItem(draggingItem.item, insertidnex);
                    newring.CalculateLayout();
                }
                else // 違うリングに行く時
                {
                    if (oldring)
                    {
                        oldring.RemoveItem(draggingItem.index);
                        oldring.CalculateLayout();
                    }
                    newring.InsertItem(draggingItem.item, iteminfo.index+1);
                    newring.CalculateLayout();
                    draggingItem.item.ring = newring;
                }
            }
            break;
        default:
            fieldItems.push(draggingItem.item);
            draggingItem.item.pos = mousePos;
            const oldring = draggingItem.item.ring;
            if (oldring)
            {
                oldring.RemoveItem(draggingItem.index);
                oldring.CalculateLayout();
            }
            // 無所属になる
            draggingItem.item.ring = null;      
    }
    draggingItem = null;
    isItemDragging = false;
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


