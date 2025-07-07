let touchFlag = false;
let touchFlagPrev = false;

/*
function draw() {
    touchFlagsPrev = touchFlag;
}
*/

// マウス/タッチでボール追加
function touchStarted() {
    touchFlag = true;
}    

function touchEnded() {
    touchFlag = false;
}

// マウス：押されている間
function CheckTouch()
{
    return touchFlag && touchFlagPrev;
}

// マウス：今フレームで押された
function CheckTouchStart()
{
    return touchFlag && !touchFlagPrev;
}

// マウス：今フレームで離された
function CheckTouchEnded()
{
    return !touchFlag && touchFlagPrev;
}