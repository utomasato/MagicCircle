let isPanning;
let panStart = {};
let isDragging;
let dragOffset;
let isRotating;
let rotateOffset;
let isAddRing;
let isAddSigil;
let isAddNum;
let isAddStr;
let isAddName;
let isAddArrayRing;
let isAddDictRing; // DictRing追加用にフラグを追加
let mousePos = {};
let selectRing;
let isItemDragging;
let draggingItem = {};

// --- UI要素を管理するためのグローバル変数 ---
let currentUiPanel = null; 
let currentInputElement = null;
let currentSelectElement = null;
let editingItem = null;

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
    isAddNum = false;
    isAddStr = false;
    isAddName = false;
    isAddArrayRing = false;
    isAddDictRing = false; // 初期化
    mousePos = {x: 0, y: 0};
    selectRing = null;
    isItemDragging = false;
    draggingItem = null;

    if (currentUiPanel) {
        currentUiPanel.remove();
        currentUiPanel = null;
    }
    currentInputElement = null;
    currentSelectElement = null;
    editingItem = null;
}

function MouseDownEvent()
{
    // パネルの外側がクリックされた場合の処理
    if (currentUiPanel) {
        const panelRect = currentUiPanel.elt.getBoundingClientRect();
        if (mouseX < panelRect.left || mouseX > panelRect.right || mouseY < panelRect.top || mouseY > panelRect.bottom) {
            if (currentInputElement) {
                finishTextInput(); 
            } else {
                currentUiPanel.remove();
                currentUiPanel = null;
                currentSelectElement = null;
                editingItem = null;
            }
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
                            } else { 
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
                case "ring": 
                    const ringObject = ClickObj[1][0];
                    const clickLocation = ClickObj[1][1];
                    const ringItemInfo = ClickObj[1][2];

                    if (ringItemInfo && ringItemInfo.item) {
                        const itemInRing = ringItemInfo.item;
                        if (itemInRing.type === 'joint') {
                            createJointPanel(itemInRing);
                        } else if (itemInRing.type === 'sigil') {
                            if (itemInRing.value != "RETURN" && itemInRing.value != "COMPLETE")
                                createSigilDropdown(itemInRing);
                        } else {
                            createTextInput(itemInRing);
                        }
                    } else if (clickLocation === 'inner') { 
                        createRingPanel(ringObject);
                    }
                    break;
                case "item": 
                    const fieldItem = fieldItems[ClickObj[1]];
                    if (fieldItem.type === 'joint') {
                        createJointPanel(fieldItem);
                    } else if (fieldItem.type === 'sigil') {
                        createSigilDropdown(fieldItem);
                    } else {
                        createTextInput(fieldItem);
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
        if (!CheckMouseOnMenu()) 
        {
            selectRing = new MagicRing(mousePos);
            selectRing.isNew = true;
            rings.push(selectRing);
            StartDragRing(selectRing, mousePos);
            isAddRing = false;
        }
    }
    else if (isAddArrayRing) 
    {
        if (!CheckMouseOnMenu())
        {
            selectRing = new ArrayRing(mousePos);
            selectRing.isNew = true;
            rings.push(selectRing);
            StartDragRing(selectRing, mousePos);
            isAddArrayRing = false;
        }
    }
    else if (isAddDictRing)
    {
        if (!CheckMouseOnMenu())
        {
            selectRing = new DictRing(mousePos);
            selectRing.isNew = true;
            rings.push(selectRing);
            StartDragRing(selectRing, mousePos);
            isAddDictRing = false;
        }
    }
    else if (isAddSigil)
    {
        if (!CheckMouseOnMenu()) 
        {
            const newItem = new Sigil(0, 0, "add", null);
            newItem.isNew = true;
            fieldItems.push(newItem);
            StartDragItem(newItem, fieldItems.length-1)
            isAddSigil = false;
        }
    }
    else if (isAddNum)
    {
        if (!CheckMouseOnMenu()) 
        {
            const newItem = new Chars(0, 0, "0", null);
            newItem.isNew = true;
            fieldItems.push(newItem);
            StartDragItem(newItem, fieldItems.length-1)
            isAddNum = false;
        }
    }
    else if (isAddStr)
    {
        if (!CheckMouseOnMenu()) 
        {
            const newItem = new StringToken(0, 0, "Hello", null);
            newItem.isNew = true;
            fieldItems.push(newItem);
            StartDragItem(newItem, fieldItems.length-1)
            isAddStr = false;
        }
    }
    else if (isAddName)
    {
        if (!CheckMouseOnMenu()) 
        {
            const newItem = new Name(0, 0, "name", null);
            newItem.isNew = true;
            fieldItems.push(newItem);
            StartDragItem(newItem, fieldItems.length-1)
            isAddName = false;
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

// ... (CheckMouseObject and other utility functions remain the same)
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
// Buttons
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
// Ring Drag
// ---------------------------------------------
function StartDragRing(ring, pos)
{
    isDragging = true;
    dragOffset.x = ring.pos.x - pos.x;
    dragOffset.y = ring.pos.y - pos.y;  
}

function DragRing(ring, pos)
{
    if (!isDragging) return;
    ring.pos.x = pos.x + dragOffset.x;
    ring.pos.y = pos.y + dragOffset.y;
}

function EndDragRing()
{
    if (CheckMouseObject()[0] == "menu")
    {
        rings = rings.filter(function( item ) {
            return item !== selectRing;
        });
    }
    isDragging = false;

    if (selectRing && selectRing.isNew) {
        mousePos = GetMousePos();
        createRingPanel(selectRing);
        selectRing.isNew = false; 
    }
}

// ---------------------------------------------
// Ring Rotate
// ---------------------------------------------
function StartRotateRing(ring, pos)
{
    isRotating = true;
    const mouseAngle = Math.atan2(pos.y - ring.pos.y, pos.x - ring.pos.x);
    rotateOffset = (ring.angle) - mouseAngle;
}

function RotateRing(ring, pos)
{
    if(!isRotating) return;
    const mouseAngle = Math.atan2(pos.y - ring.pos.y, pos.x - ring.pos.x);
    const newAngle = mouseAngle + rotateOffset;
    ring.angle = newAngle;
}

function EndRotateRing(ring)
{
    isRotating = false;
}

// ---------------------------------------------
// Item Drag
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

    if (originalRing) {
        originalRing.RemoveItem(originalIndex);
    }

    switch(obj[0]) 
    {
        case "menu":
            draggedItem.parentRing = null;
            break;

        case "ring":
            const newring = obj[1][0];
            const iteminfo = newring.CheckPosItem(mousePos);
            
            if (iteminfo.item == null) { 
                newring.InsertItem(draggedItem, iteminfo.index);
            } else {
                if (newring == originalRing)
                {
                    if (originalIndex <= iteminfo.index+1 && iteminfo.index)
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

    if (draggedItem && draggedItem.isNew) {
        mousePos = GetMousePos();

        if (draggedItem.type === 'joint') {
            createJointPanel(draggedItem);
        } else if (draggedItem.type === 'sigil') {
            if (draggedItem.value != "RETURN" && draggedItem.value != "COMPLETE") {
                createSigilDropdown(draggedItem);
            }
        } else {
            createTextInput(draggedItem);
        }
        draggedItem.isNew = false; 
    }

    draggingItem = null;
    isItemDragging = false;
    if (originalRing) {
        originalRing.CalculateLayout();
    }
}

// ---------------------------------------------
// UI Panel Functions
// ---------------------------------------------

function createBasePanel(titleText, closeCallback, deleteCallback) {
    if (currentUiPanel) return null; 

    // Main panel
    currentUiPanel = createDiv(''); 
    currentUiPanel.position(GetMouseX() + 15, GetMouseY() - 10);
    currentUiPanel.style('z-index', '1000');
    currentUiPanel.style('background-color', 'rgba(240, 240, 240, 0.95)');
    currentUiPanel.style('padding', '8px');
    currentUiPanel.style('border-radius', '6px');
    currentUiPanel.style('box-shadow', '0 2px 5px rgba(0,0,0,0.2)');
    currentUiPanel.style('display', 'flex');
    currentUiPanel.style('flex-direction', 'column');
    currentUiPanel.style('gap', '8px');

    // Header
    const header = createDiv('');
    header.parent(currentUiPanel);
    header.style('display', 'flex');
    header.style('justify-content', 'space-between');
    header.style('align-items', 'center');

    const title = createP(titleText);
    title.parent(header);
    title.style('margin', '0');
    title.style('font-weight', 'bold');
    title.style('color', '#333');
    
    const closeButton = createButton('×');
    closeButton.parent(header);
    closeButton.style('border', 'none');
    closeButton.style('background', 'transparent');
    closeButton.style('font-size', '18px');
    closeButton.style('cursor', 'pointer');
    closeButton.style('padding', '0 4px');
    closeButton.elt.addEventListener('mousedown', (e) => {
        e.stopPropagation(); 
        closeCallback();
    });

    const contentArea = createDiv('');
    contentArea.parent(currentUiPanel);

    let footer = null;
    if (deleteCallback) {
        footer = createDiv('');
        footer.parent(currentUiPanel);
        footer.style('display', 'flex');
        footer.style('justify-content', 'flex-end');
        footer.style('margin-top', '8px');
        footer.style('border-top', '1px solid #ddd');
        footer.style('padding-top', '8px');

        const deleteButton = createButton('Delete');
        deleteButton.parent(footer);
        deleteButton.style('border', '1px solid #ff4d4d');
        deleteButton.style('background', '#fff');
        deleteButton.style('color', '#ff4d4d');
        deleteButton.style('font-size', '12px');
        deleteButton.style('cursor', 'pointer');
        deleteButton.style('padding', '2px 8px');
        deleteButton.style('border-radius', '4px');
        deleteButton.elt.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            deleteCallback();
        });
    }

    return { panel: currentUiPanel, contentArea: contentArea };
}


function finishTextInput() {
    if (isFinishingText) return;
    isFinishingText = true;

    if (currentInputElement && editingItem) {
        editingItem.value = currentInputElement.value();
        
        if (editingItem.parentRing) {
            editingItem.parentRing.CalculateLayout();
        }
    }

    if(currentUiPanel) {
        currentUiPanel.remove();
        currentUiPanel = null;
    }
    currentInputElement = null;
    editingItem = null;

    setTimeout(() => {
        isFinishingText = false;
    }, 50); 
}

function createTextInput(item) {
    const handleDelete = () => {
        if (item.parentRing) {
            const ring = item.parentRing;
            const index = ring.items.indexOf(item);
            if (index > -1) {
                ring.RemoveItem(index);
                ring.CalculateLayout();
            }
        } else {
            fieldItems = fieldItems.filter(fItem => fItem !== item);
        }
        finishTextInput(); 
    };
    
    const panelResult = createBasePanel('Edit Value', finishTextInput, handleDelete);
    if (!panelResult) return;
    const { contentArea } = panelResult;

    editingItem = item;

    currentInputElement = createInput(item.value);
    currentInputElement.parent(contentArea); 
    currentInputElement.style('border', '1px solid #ccc');
    currentInputElement.style('padding', '4px');
    currentInputElement.style('font-size', '14px');
    
    const inputEl = currentInputElement.elt;
    inputEl.focus();
    inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;

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

function createSigilDropdown(item) {
    const closeDropdown = () => {
        if (currentUiPanel) {
            currentUiPanel.remove();
            currentUiPanel = null;
        }
        currentSelectElement = null;
        editingItem = null;
    };
    
    const handleDelete = () => {
        if (item.parentRing) {
            const ring = item.parentRing;
            const index = ring.items.indexOf(item);
            if (index > -1) {
                ring.RemoveItem(index);
                ring.CalculateLayout();
            }
        } else {
            fieldItems = fieldItems.filter(fItem => fItem !== item);
        }
        closeDropdown();
    };

    const panelResult = createBasePanel('Select Sigil', closeDropdown, handleDelete);
    if (!panelResult) return;
    const { contentArea } = panelResult;

    editingItem = item;

    currentSelectElement = createSelect();
    currentSelectElement.parent(contentArea); 
    
    const sigilOptions = [
    "pop","exch","dup","copy","index", "roll", "add", "sub","mul","div","idiv","mod","abs","neg","sqrt","atan","cos","sin","rand","srand","rrand","array","string","length","get","put","getinterval","putinterval","forall","dict","begin","end","def","eq","ne","ge","gt","le","lt","and","not","or","xor","true","false","exec","if","ifelse","for","repeat","loop","exit", "color", "setcolor", "currentcolor", "print", "stack"
    ];

    sigilOptions.forEach(opt => {
        currentSelectElement.option(opt);
    });
    
    currentSelectElement.selected(item.value);

    currentSelectElement.changed(() => {
        if (editingItem) {
            editingItem.value = currentSelectElement.value();
            
            if (editingItem.parentRing) {
                editingItem.parentRing.CalculateLayout();
            }
        }
        closeDropdown();
    });
}

function createRingPanel(ring) {
    const closePanel = () => {
        if (currentUiPanel) {
            currentUiPanel.remove();
            currentUiPanel = null;
        }
        editingItem = null;
    };
    
    const handleDelete = () => {
        rings = rings.filter(r => r !== ring);
        closePanel();
    };

    const panelResult = createBasePanel('Ring Settings', closePanel, handleDelete);
    if (!panelResult) return;
    const { contentArea } = panelResult;

    editingItem = ring;

    if (ring.isNew) {
        const typeLabel = createP('Ring Type:');
        typeLabel.parent(contentArea);
        typeLabel.style('margin', '5px 0 2px 0');

        const typeSelect = createSelect();
        typeSelect.parent(contentArea);
        typeSelect.option('MagicRing');
        typeSelect.option('ArrayRing');
        typeSelect.option('DictRing'); // ★DictRingを追加
        typeSelect.selected(ring.constructor.name);

        typeSelect.changed(() => {
            const newType = typeSelect.value();
            const ringIndex = rings.indexOf(ring);

            if (ringIndex !== -1 && ring.constructor.name !== newType) {
                let newRing;
                if (newType === 'MagicRing') {
                    newRing = new MagicRing(ring.pos);
                } else if (newType === 'ArrayRing') { 
                    newRing = new ArrayRing(ring.pos);
                } else { // DictRing
                    newRing = new DictRing(ring.pos);
                }
                newRing.isNew = false; 
                rings[ringIndex] = newRing;
            }
            closePanel(); 
        });
    }

    if (ring instanceof MagicRing) {
        const jointButton = createButton('Create Joint');
        jointButton.parent(contentArea);
        jointButton.style('width', '100%');
        jointButton.style('padding', '5px');
        jointButton.style('margin-top', '5px');
        jointButton.style('cursor', 'pointer');
        
        jointButton.elt.addEventListener('mousedown', (e) => {
            e.stopPropagation();

            const radius = ring.outerradius;
            const angle = ring.angle;
            const jointSpawnX = ring.pos.x + (radius + 60) * Math.sin(angle + 1/20*PI);
            const jointSpawnY = ring.pos.y - (radius + 60) * Math.cos(angle + 1/20*PI);

            const newJoint = new Joint(jointSpawnX, jointSpawnY, ring, null);
            fieldItems.push(newJoint);

            closePanel(); 
        });
    }
}

function createJointPanel(item) {
    const closePanel = () => {
        if (currentUiPanel) {
            currentUiPanel.remove();
            currentUiPanel = null;
        }
        editingItem = null;
    };

    const handleDelete = () => {
        if (item.parentRing) {
            const ring = item.parentRing;
            const index = ring.items.indexOf(item);
            if (index > -1) {
                ring.RemoveItem(index);
                ring.CalculateLayout();
            }
        } else {
            fieldItems = fieldItems.filter(fItem => fItem !== item);
        }
        closePanel();
    };

    const panelResult = createBasePanel('Joint', closePanel, handleDelete);
    if (!panelResult) return;
    
    editingItem = item;
}

// ---------------------------------------------
// Panning
// ---------------------------------------------
function StartPan(mousePos)
{
    isPanning = true;
    panStart = mousePos;
    SetMouseCursor('grabbing');
}

function Pan(mousePos)
{
    if (!isPanning) return;
    const dx = mousePos.x - panStart.x;
    const dy = mousePos.y - panStart.y;
    cameraPos.x -= dx / zoomSize;
    cameraPos.y -= dy / zoomSize;
    panStart = mousePos;
}

function EndPan()
{
    if (!isPanning) return;
    isPanning = false;
    SetMouseCursor('grab');
}