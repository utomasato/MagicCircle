// =============================================
// UI Panel Functions
// =============================================

function createBasePanel(titleText, closeCallback, deleteCallback) {
    if (currentUiPanel) return null;
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
    closeButton.elt.addEventListener('mousedown', (e) => { e.stopPropagation(); closeCallback(); });
    const contentArea = createDiv('');
    contentArea.parent(currentUiPanel);
    if (deleteCallback) {
        const footer = createDiv('');
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
        deleteButton.elt.addEventListener('mousedown', (e) => { e.stopPropagation(); deleteCallback(); });
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
    if (currentUiPanel) {
        currentUiPanel.remove();
        currentUiPanel = null;
    }
    currentInputElement = null;
    editingItem = null;
    setTimeout(() => { isFinishingText = false; }, 50);
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
    inputEl.addEventListener('keydown', keyInterceptor, true);
    inputEl.addEventListener('blur', finishTextInput);
}

function createSigilDropdown(item) {
    const closeDropdown = () => {
        if (currentUiPanel) { currentUiPanel.remove(); currentUiPanel = null; }
        currentSelectElement = null; editingItem = null;
    };
    const handleDelete = () => {
        if (item.parentRing) {
            const ring = item.parentRing;
            const index = ring.items.indexOf(item);
            if (index > -1) { ring.RemoveItem(index); ring.CalculateLayout(); }
        } else { fieldItems = fieldItems.filter(fItem => fItem !== item); }
        closeDropdown();
    };
    const panelResult = createBasePanel('Select Sigil', closeDropdown, handleDelete);
    if (!panelResult) return;
    const { contentArea } = panelResult;
    editingItem = item;
    currentSelectElement = createSelect();
    currentSelectElement.parent(contentArea);
    const sigilOptions = ["pop", "exch", "dup", "copy", "index", "roll", "add", "sub", "mul", "div", "idiv", "mod", "abs", "neg", "sqrt", "atan", "cos", "sin", "rand", "srand", "rrand", "array", "string", "length", "get", "put", "getinterval", "putinterval", "forall", "dict", "begin", "end", "def", "eq", "ne", "ge", "gt", "le", "lt", "and", "not", "or", "xor", "true", "false", "exec", "if", "ifelse", "for", "repeat", "loop", "exit", "color", "setcolor", "currentcolor", "print", "stack"];
    sigilOptions.forEach(opt => { currentSelectElement.option(opt); });
    currentSelectElement.selected(item.value);
    currentSelectElement.changed(() => {
        if (editingItem) {
            editingItem.value = currentSelectElement.value();
            if (editingItem.parentRing) { editingItem.parentRing.CalculateLayout(); }
        }
        closeDropdown();
    });
}

function createRingPanel(ring) {
    const closePanel = () => { if (currentUiPanel) { currentUiPanel.remove(); currentUiPanel = null; } editingItem = null; };
    const handleDelete = () => { rings = rings.filter(r => r !== ring); closePanel(); };
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
        typeSelect.option('DictRing');
        typeSelect.selected(ring.constructor.name);
        typeSelect.changed(() => {
            const newType = typeSelect.value();
            const ringIndex = rings.indexOf(ring);
            if (ringIndex !== -1 && ring.constructor.name !== newType) {
                let newRing;
                if (newType === 'MagicRing') { newRing = new MagicRing(ring.pos); }
                else if (newType === 'ArrayRing') { newRing = new ArrayRing(ring.pos); }
                else { newRing = new DictRing(ring.pos); }
                newRing.isNew = false;
                rings[ringIndex] = newRing;
            }
            closePanel();
        });
    }
    // Joint作成ボタンを全てのリングタイプで表示するように修正
    if (ring instanceof MagicRing || ring instanceof DictRing || ring instanceof ArrayRing) {
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
            const jointSpawnX = ring.pos.x + (radius + 60) * Math.sin(angle + 1 / 20 * PI);
            const jointSpawnY = ring.pos.y - (radius + 60) * Math.cos(angle + 1 / 20 * PI);
            const newJoint = new Joint(jointSpawnX, jointSpawnY, ring, null);
            fieldItems.push(newJoint);
            closePanel();
        });
    }
}

function createJointPanel(item) {
    const closePanel = () => { if (currentUiPanel) { currentUiPanel.remove(); currentUiPanel = null; } editingItem = null; };
    const handleDelete = () => {
        if (item.parentRing) {
            const ring = item.parentRing;
            const index = ring.items.indexOf(item);
            if (index > -1) { ring.RemoveItem(index); ring.CalculateLayout(); }
        } else { fieldItems = fieldItems.filter(fItem => fItem !== item); }
        closePanel();
    };
    const panelResult = createBasePanel('Joint', closePanel, handleDelete);
    if (!panelResult) return;
    editingItem = item;
}
