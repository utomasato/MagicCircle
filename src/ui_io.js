let currentFileHandle = null;

document.addEventListener('keydown', async (e) => {
    // 既存の保存処理 (Ctrl+S / Cmd+S)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const xmlContent = generateLayoutXML();
        try {
            if (currentFileHandle) {
                const writable = await currentFileHandle.createWritable();
                await writable.write(xmlContent); await writable.close();
                showToast('Saved!');
            } else {
                if ('showSaveFilePicker' in window) {
                    const handle = await window.showSaveFilePicker({ types: [{ description: 'XML file', accept: { 'text/xml': ['.xml'] } }], suggestedName: 'magic_circle.xml' });
                    const writable = await handle.createWritable();
                    await writable.write(xmlContent); await writable.close();
                    currentFileHandle = handle; alert('保存しました。');
                } else {
                    downloadFile(xmlContent, 'magic_circle.xml');
                }
            }
        } catch (err) { if (err.name !== 'AbortError') alert('保存に失敗しました: ' + err.message); }
    }

    // Undo: Ctrl+Z or Cmd+Z (Shiftが押されていないこと)
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (typeof Undo === 'function') Undo();
    }

    // Redo: Ctrl+Shift+Z or Cmd+Shift+Z (または Ctrl+Y)
    else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
    ) {
        e.preventDefault();
        if (typeof Redo === 'function') Redo();
    }
});

// ... 以下、既存のコードが続く

function showToast(message) {
    const msg = createDiv(message);
    msg.style('position', 'fixed').style('bottom', '20px').style('right', '20px')
        .style('background', 'rgba(40, 167, 69, 0.9)').style('color', 'white')
        .style('padding', '10px 20px').style('border-radius', '5px').style('z-index', '3000')
        .style('font-family', 'sans-serif').style('pointer-events', 'none');
    setTimeout(() => msg.remove(), 2000);
}

function downloadFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateLayoutXML() {
    const ringIdMap = new Map(); rings.forEach((r, i) => ringIdMap.set(r, i));
    const startRingId = startRing ? ringIdMap.get(startRing) : -1;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<MagicCircleLayout startRingId="${startRingId}">\n <Rings>\n`;
    rings.forEach(r => { if (typeof ringToXML === 'function') xml += ringToXML(r, ringIdMap); });
    xml += ' </Rings>\n <FieldItems>\n';
    fieldItems.forEach(i => { if (typeof itemToXML === 'function') xml += itemToXML(i, ringIdMap); });
    xml += ' </FieldItems>\n</MagicCircleLayout>\n';
    return xml;
}

// ui_io.js より抜粋

function createModalBase(titleText, closeCallback) {
    // 1. 既存のモーダルやパネルを完全に削除（二重表示の防止）
    if (currentModalPanel) {
        currentModalPanel.remove();
        currentModalPanel = null;
    }
    if (currentUiPanel) {
        currentUiPanel.remove();
        currentUiPanel = null;
    }

    const overlay = createDiv('');
    currentModalPanel = overlay;
    overlay.addClass('modal-overlay');
    // オーバーレイ自体でクリックが背後に抜けないようにする
    overlay.elt.addEventListener('mousedown', (e) => e.stopPropagation());

    const panel = createDiv('');
    panel.parent(overlay);
    panel.addClass('modal-content');
    // パネル本体でのクリックイベントがp5.jsのCanvasに伝わるのを防ぐ
    panel.elt.addEventListener('mousedown', (e) => e.stopPropagation());

    const header = createDiv('');
    header.parent(panel);
    header.addClass('modal-header');

    const title = createP(titleText).parent(header).addClass('modal-title');
    const closeBtn = createButton('×').parent(header).addClass('ui-btn-close').style('font-size', '24px');

    closeBtn.mousePressed(() => {
        if (currentModalPanel) {
            currentModalPanel.remove();
            currentModalPanel = null;
        }
        if (closeCallback) closeCallback();
    });

    return panel;
}

async function showXMLPanel(xmlContent) {
    const panel = createModalBase('XML Output');

    const textArea = createElement('textarea').parent(panel).addClass('modal-textarea');
    textArea.value(xmlContent);
    textArea.attribute('readonly', '');

    const footer = createDiv('').parent(panel).addClass('modal-footer');

    const saveAsBtn = createButton('💾 成果物として保存').parent(footer).addClass('ui-btn').style('border-color', '#28a745').style('color', '#28a745');
    saveAsBtn.mousePressed(async () => {
        saveAsBtn.attribute('disabled', '');

        // 1. エディタ側のUIを隠す
        const wasUIHidden = isUIHidden;
        isUIHidden = true;
        if (currentModalPanel) currentModalPanel.style('display', 'none');

        try {
            if ('showDirectoryPicker' in window) {
                const parentHandle = await window.showDirectoryPicker();
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                const folderName = `magic_export_${timestamp}`;
                const newDirectoryHandle = await parentHandle.getDirectoryHandle(folderName, { create: true });

                // 再描画を待機（UIが消えるのを待つ）
                await new Promise(resolve => setTimeout(resolve, 150));

                const p5Canvas = document.getElementById('defaultCanvas0');
                const unityCanvas = document.getElementById('unity-canvas');
                const resizer = document.getElementById('resizer');

                // --- 画面全体の合成処理 ---
                // Unityのバッファがクリアされる前にキャプチャするため、requestAnimationFrameを使用
                const combinedBlob = await new Promise((resolve) => {
                    requestAnimationFrame(() => {
                        const offscreen = document.createElement('canvas');
                        const ctx = offscreen.getContext('2d');

                        offscreen.width = window.innerWidth;
                        offscreen.height = window.innerHeight;

                        // 背景を白で塗る
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, offscreen.width, offscreen.height);

                        // p5.js (エディタ) を描画
                        const p5Rect = p5Canvas.getBoundingClientRect();
                        ctx.drawImage(p5Canvas, p5Rect.left, p5Rect.top, p5Rect.width, p5Rect.height);

                        // 中央のリサイズバーを描画
                        const resizerRect = resizer.getBoundingClientRect();
                        ctx.fillStyle = "#cccccc";
                        ctx.fillRect(resizerRect.left, resizerRect.top, resizerRect.width, resizerRect.height);

                        // Unity (実行画面) を描画
                        const unityRect = unityCanvas.getBoundingClientRect();
                        ctx.drawImage(unityCanvas, unityRect.left, unityRect.top, unityRect.width, unityRect.height);

                        offscreen.toBlob(resolve, 'image/png');
                    });
                });

                // --- ファイル保存 ---
                const imgFileHandle = await newDirectoryHandle.getFileHandle('full_screenshot.png', { create: true });
                const imgWritable = await imgFileHandle.createWritable();
                await imgWritable.write(combinedBlob);
                await imgWritable.close();

                const xmlFileHandle = await newDirectoryHandle.getFileHandle('magic_circle.xml', { create: true });
                const xmlWritable = await xmlFileHandle.createWritable();
                await xmlWritable.write(textArea.value());
                await xmlWritable.close();

                const readmeContent =
                    `【Magic Circle F/X Editor - 成果物パック】\n` +
                    `------------------------------------------\n` +
                    `ご体験いただきありがとうございました！\n\n` +
                    `このフォルダには以下のファイルが含まれています：\n` +
                    `1. magic_circle.png  : あなたが作成した魔法陣の画像（エディタ＋実行画面）\n` +
                    `2. magic_circle.xml  : 魔法陣の設計データ（再編集用）\n` +
                    `3. README           : この説明ファイル\n\n` +
                    `■ 魔法の再現・再編集について\n` +
                    `この魔法を再度エディタで読み込んだり、発動させたりしたい場合は、\n` +
                    `下記のGitHubより「MagicEditor」をダウンロードしてください。\n` +
                    `ツールを起動後、同梱の「magic_circle.xml」をインポートすることで再現が可能です。\n\n` +
                    `■ ツールについて\n` +
                    `MagicEditor GitHub: https://github.com/utomasato/MagicEditor\n` +
                    `------------------------------------------\n` +
                    `Exported at: ${new Date().toLocaleString()}`;

                const readmeHandle = await newDirectoryHandle.getFileHandle('README.txt', { create: true });
                const readmeWritable = await readmeHandle.createWritable();
                await readmeWritable.write(readmeContent);
                await readmeWritable.close();

                currentFileHandle = xmlFileHandle;
                alert(`フォルダ 「${folderName}」 内に画面全体とデータを保存しました。`);

            } else {
                downloadFile(textArea.value(), 'magic_circle.xml');
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err);
                alert('保存に失敗しました: ' + err.message);
            }
        } finally {
            isUIHidden = wasUIHidden;
            if (currentModalPanel) {
                currentModalPanel.style('display', 'flex');
            }
            if (saveAsBtn.elt) saveAsBtn.removeAttribute('disabled');
            showXMLPanel(textArea.value());
        }
    });

    if (currentFileHandle) {
        const overwriteBtn = createButton('💾 XMLのみ上書き').parent(footer).addClass('ui-btn').addClass('ui-btn-primary');
        overwriteBtn.mousePressed(async () => {
            overwriteBtn.attribute('disabled', '');
            try {
                const writable = await currentFileHandle.createWritable();
                await writable.write(textArea.value());
                await writable.close();
                showToast('XMLを更新しました。');
            } catch (err) {
                alert('失敗しました: ' + err.message);
            } finally {
                if (overwriteBtn.elt) overwriteBtn.removeAttribute('disabled');
            }
        });
    }

    const copyBtn = createButton('コピー').parent(footer).addClass('ui-btn');
    copyBtn.mousePressed(() => {
        textArea.elt.select();
        document.execCommand('copy');
        copyBtn.html('コピーしました！');
        setTimeout(() => { if (copyBtn.elt) copyBtn.html('コピー'); }, 2000);
    });
}

function showXMLInputPanel() {
    const panel = createModalBase('XML Import');

    const toolbar = createDiv('').parent(panel).style('display', 'flex').style('margin-bottom', '5px');
    const openFileBtn = createButton('📂 ファイルを開く').parent(toolbar).addClass('ui-btn');

    const fileInput = createInput('', 'file').parent(panel).style('display', 'none').attribute('accept', '.xml');
    const textArea = createElement('textarea', 'ここにXMLをペーストしてください...').parent(panel).addClass('modal-textarea');
    textArea.elt.addEventListener('focus', () => { if (textArea.value() === 'ここにXMLをペーストしてください...') textArea.value(''); });

    openFileBtn.mousePressed(async () => {
        if ('showOpenFilePicker' in window) {
            try {
                const [handle] = await window.showOpenFilePicker({ types: [{ description: 'XML Files', accept: { 'text/xml': ['.xml'] } }], multiple: false });
                currentFileHandle = handle;
                const file = await handle.getFile(); textArea.value(await file.text()); errorMsg.hide();
            } catch (err) { if (err.name !== 'AbortError') console.error(err); }
        } else { fileInput.elt.click(); }
    });

    fileInput.elt.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) { const reader = new FileReader(); reader.onload = (e) => { textArea.value(e.target.result); errorMsg.hide(); currentFileHandle = null; }; reader.readAsText(file); }
    });

    const errorMsg = createP('').parent(panel).style('color', 'red').style('font-size', '12px').hide();
    const footer = createDiv('').parent(panel).addClass('modal-footer');

    const handleImport = (mode) => {
        try { importFromXML(textArea.value(), mode); if (currentModalPanel) { currentModalPanel.remove(); currentModalPanel = null; } }
        catch (e) { errorMsg.html(e.message); errorMsg.show(); }
    };

    createButton('追加 (Add)').parent(footer).addClass('ui-btn').style('border-color', '#28a745').style('color', '#28a745').mousePressed(() => handleImport('add'));
    createButton('上書き (Overwrite)').parent(footer).addClass('ui-btn').addClass('ui-btn-danger').mousePressed(() => handleImport('overwrite'));
}