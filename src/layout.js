// =============================================
// Auto-layout and Transform Functions
// =============================================

function alignConnectedRings(startRing) {
    if (!startRing) return;
    layoutSubtreeAndGetEffectiveRadius(startRing, new Set());
}

function layoutSubtreeAndGetEffectiveRadius(parentRing, visited) {
    if (!parentRing || visited.has(parentRing)) {
        return parentRing ? parentRing.outerradius : 0;
    }
    visited.add(parentRing);
    parentRing.CalculateLayout();
    const children = [];
    parentRing.items.forEach((item, index) => {
        if (item && item.type === 'joint' && item.value instanceof MagicRing) {
            const targetRing = item.value;
            if (targetRing && !children.some(c => c.ring === targetRing)) { // targetRingの存在チェックを追加
                children.push({
                    ring: targetRing,
                    layout: parentRing.layouts[index],
                    effectiveRadius: 0
                });
            }
        }
    });
    if (children.length === 0) { return parentRing.outerradius; }
    children.forEach(child => {
        child.effectiveRadius = layoutSubtreeAndGetEffectiveRadius(child.ring, new Set(visited));
    });
    const ringGap = 50;
    children.forEach(child => {
        const jointWorldAngle = parentRing.angle + child.layout.angle;
        const alignAngle = jointWorldAngle - HALF_PI;
        const distance = parentRing.outerradius + child.effectiveRadius + ringGap;
        const newX = parentRing.pos.x + distance * cos(alignAngle);
        const newY = parentRing.pos.y + distance * sin(alignAngle);
        const directionToParent = atan2(parentRing.pos.y - newY, parentRing.pos.x - newX);
        const newAngle = directionToParent + HALF_PI;
        transformSubtree(child.ring, newX, newY, newAngle);
    });
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
                    const newX = ringToMoveData.ring.pos.x + dx;
                    const newY = ringToMoveData.ring.pos.y + dy;
                    const directionToParent = atan2(parentRing.pos.y - newY, parentRing.pos.x - newX);
                    const newAngle = directionToParent + HALF_PI;
                    transformSubtree(ringToMoveData.ring, newX, newY, newAngle);
                }
            }
        }
        if (!collisionFound) break;
    }
    let maxExtent = parentRing.outerradius;
    children.forEach(child => {
        const distToChildCenter = dist(parentRing.pos.x, parentRing.pos.y, child.ring.pos.x, child.ring.pos.y);
        maxExtent = max(maxExtent, distToChildCenter + child.effectiveRadius);
    });
    return maxExtent;
}

function moveRingAndDescendants(ringToMove, dx, dy, movedRings) {
    if (!ringToMove || movedRings.has(ringToMove)) { return; }
    movedRings.add(ringToMove);
    ringToMove.pos.x += dx;
    ringToMove.pos.y += dy;
    const children = ringToMove.items
        .filter(item => item && item.type === 'joint' && item.value instanceof MagicRing)
        .map(joint => joint.value);
    [...new Set(children)].forEach(child => {
        moveRingAndDescendants(child, dx, dy, movedRings);
    });
}

function rotateSubtreeAroundPoint(ring, cx, cy, angle, rotatedRings) {
    if (!ring || rotatedRings.has(ring)) { return; }
    rotatedRings.add(ring);
    const relX = ring.pos.x - cx;
    const relY = ring.pos.y - cy;
    const cosA = cos(angle);
    const sinA = sin(angle);
    ring.pos.x = cx + (relX * cosA - relY * sinA);
    ring.pos.y = cy + (relX * sinA + relY * cosA);
    ring.angle += angle;
    const children = ring.items
        .filter(item => item && item.type === 'joint' && item.value instanceof MagicRing)
        .map(joint => joint.value);
    [...new Set(children)].forEach(child => {
        rotateSubtreeAroundPoint(child, cx, cy, angle, rotatedRings);
    });
}

function transformSubtree(ringToUpdate, newX, newY, newAngle) {
    const oldPos = { x: ringToUpdate.pos.x, y: ringToUpdate.pos.y };
    const oldAngle = ringToUpdate.angle;
    const dx = newX - oldPos.x;
    const dy = newY - oldPos.y;
    const angleChange = newAngle - oldAngle;
    moveRingAndDescendants(ringToUpdate, dx, dy, new Set());
    if (abs(angleChange) > 0.001) {
        const children = ringToUpdate.items
            .filter(item => item && item.type === 'joint' && item.value instanceof MagicRing)
            .map(joint => joint.value);
        [...new Set(children)].forEach(child => {
            rotateSubtreeAroundPoint(child, newX, newY, angleChange, new Set([ringToUpdate]));
        });
    }
    ringToUpdate.angle = newAngle;
}
