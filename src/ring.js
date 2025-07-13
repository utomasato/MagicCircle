
class MagicRing 
{
    constructor(pos) 
    {
        this.pos = pos;
        this.radius = 0;
        this.innerradius = 0;
        this.outerradius = 0;
        this.rotate = 0;
        this.color = color(0, 0, 0, 128);
        this.items = [new Sigil(0, 0, "RETURN", this),
            new Sigil(0, 0, "add", this),
            new Chars(0, 0, "longName", this),
            new Chars(0, 0, "a", this),
            new StringToken(0, 0, "a", this),
            new Sigil(0, 0, "sub", this),
            new Chars(0, 0, "bcdefghijklmnop", this),
            new Sigil(0, 0, "mul", this),
            new StringToken(0, 0, "BCDEFGHIJKOMNOP", this),
            new Sigil(0, 0, "div", this),
            ];
        this.circumference = 0;
        this.itemRadWidth = {sigil: 0, char: 0, charSpacing:0, padding: 0};
        this.layouts = [];
        this.CalculateLayout();
        this.angle = 0;
    }

    
    CalculateLayout()
    {
        this.layouts = [];
        // リングの長さを求める
        let totalLength = 0;
        this.items.forEach(item => 
        {
            if (item)
            {
                totalLength += item.GetLength() + config.itemPadding;
            }
        });
        this.circumference = Math.max(totalLength, config.minRingCircumference);
        // 円周の長さから半径を求める
        this.radius = this.circumference;
        this.innerradius = this.radius - config.ringWidth/2;
        this.outerradius = this.radius + config.ringWidth/2;
        
        // 各アイテムの要素ごとのリング内での角度を求める
        this.itemRadWidth = 
        {
            sigil: config.sigilWidth / this.circumference * TWO_PI,
            char: config.charWidth / this.circumference * TWO_PI,
            charSpacing: config.charSpacing / this.circumference * TWO_PI,
            stringSide: config.stringSideWidth / this.circumference * TWO_PI,
            padding: config.itemPadding / this.circumference * TWO_PI,
        };
        
        let currentAngle = this.items[0].GetLength() / this.circumference * PI;
        this.items.forEach(item =>
        {
            if (item)
            {
                currentAngle -= item.GetLength() / this.circumference * PI; // アイテムの描画位置(中心)
                const itemEndAngle = currentAngle - (item.GetLength() / this.circumference * PI) - this.itemRadWidth.padding/2; // 次のアイテムとの境目
                this.layouts.push({angle: currentAngle, angle2: itemEndAngle}); // [描画されるアイテム, 描画される位置(中心), 次のアイテムとの境目]
                currentAngle -= (item.GetLength() / this.circumference * PI + this.itemRadWidth.padding);
            }
        });
        /*
        this.layouts.forEach(layout => {
            console.log(layout.angle2);
        });
        console.log("--------------------");
        */
    }
    
    Draw() 
    {
        
        PushTransform();
        Translate(this.pos.x, this.pos.y);
        Rotate(this.angle);
        if(debugMode)
        {
            FillCircle(0, 0, this.outerradius + config.ringRotateHandleWidth, color(200,200,200));
        }
        DrawCircle(0, 0, this.innerradius, color(0,0,0)); // 内側の円
        DrawCircle(0, 0, this.outerradius, color(0,0,0)); // 外側の円

        //this.layouts.forEach(l=>{
        //    l.item.DrawByRing(this.radius, l.angle, this.itemRadWidth)
        //});
        for (let i = 0; i< this.items.length; i++)
        {
            if (this.items[i])
            {
                this.items[i].DrawByRing(this.radius, this.layouts[i].angle, this.itemRadWidth);
            }
        }
        if(debugMode){
            this.DrawDebugLine();
        }
        PopTransform();
    }
    
    DrawDebugLine()
    {
        this.layouts.forEach(l=>{
            PushTransform();
            Rotate(l.angle);
            DrawLine(0, -this.innerradius, 0, -this.outerradius, color(0,255,0));
            PopTransform();
            PushTransform();
            Rotate(l.angle2);
            DrawLine(0, -this.innerradius, 0, -this.outerradius, color(0,0,255));
            PopTransform();
        });
    }
    
    RemoveItem(index)
    {
        this.items.splice(index,1);
    }
    InsertItem(item, index)
    {
        this.items.splice(index, 0, item);
    }
    
    CheckDistance(pos)
    {
        return Math.sqrt((pos.x - this.pos.x)**2 + (pos.y - this.pos.y)**2);
    }
    
    CheckPosIsOn(pos)
    {
        const distance = this.CheckDistance(pos)
        if (distance < this.outerradius + config.ringRotateHandleWidth)
        {
            if (distance < this.outerradius)
            {
                if (distance < this.innerradius)
                {
                    return [this, "inner"];
                }
                const iteminfo = this.CheckPosItem(pos);
                //console.log(itemandindex.item.type + ": " + itemandindex.item.value + " index: " + itemandindex.index);
                return [this, "ring", iteminfo]
            }
            return [this, "outer"];
        }
        return false;
    }
    
    CheckPosItem(pos)
    {
        const mouseAngle = -PI - Math.atan2(pos.x - this.pos.x, pos.y - this.pos.y);
        const angle = (((mouseAngle - this.angle)/PI % 2 + 2) % 2 - 2) * PI;
        for (let i = 0; i < this.layouts.length; i++)
        {
            const layout = this.layouts[i];
            if (layout.angle2 <= angle)
            {
                return {item :this.items[i], index: i};
            }
        }
        return {item: this.items[0], index: 0};
    }
}

class RingItem {
    constructor(x, y, value, ring)
    {
        this.x = x;
        this.y = y;
        this.type = "item";
        this.value = value;
        this.ring = ring;
    }
    
    GetLength()
    {
        return 0;
    }
    
    DrawByRing(radius, layout, itemRadWidth)
    {}
    
    DrawByCanvas()
    {}
    
    DrawByDrag()
    {}
    
    SetValue(newValue)
    {
        this.value = newValue;
    }
    
    CheckPosIsOn(pos)
    {
        return false;
    }
}

class Sigil extends RingItem {
    constructor(x, y, value, ring)
    {
        super();
        //this.x = x;
        //this.y = y;
        this.type = "sigil";
        this.value = value;
        this.ring = ring;
    }
    
    GetLength()
    {
        return config.sigilWidth;
    }

    DrawByRing(radius, angle, itemRadWidth)
    {
        PushTransform();
        Rotate(angle);
        DrawSigil(this.value, 0, -radius);
        PopTransform();
    }
    
    DrawByDrag()
    {
        const ClickObj = CheckMouseObject();
        if (ClickObj[0] == "ring")
        {
            const ring = ClickObj[1][0];
            const mouseAngle = Math.atan2(ring.pos.x - mousePos.x, ring.pos.y - mousePos.y);
            DrawSigil(this.value, GetMouseX(), GetMouseY(), -mouseAngle, zoomSize);
        }
        else
        {
            DrawSigil(this.value, GetMouseX(), GetMouseY(), PI, zoomSize);
        }
    }
    
    DrawByCanvas()
    {
        if(debugMode){
            //DrawRect(this.pos.x-config.sigilSize/2, this.pos.y-config.sigilSize/2, config.sigilSize, config.sigilSize, color(0,255,0));
            DrawRect(this.pos.x-this.GetLength()*PI, this.pos.y-config.sigilSize/2, this.GetLength()*TWO_PI, config.sigilSize, color(0,255,0));
        }
        DrawSigil(this.value, this.pos.x, this.pos.y, PI);
    }
    
    CheckPosIsOn(pos)
    {
        if (this.pos.x-config.sigilSize/2 < pos.x && pos.x < this.pos.x+config.sigilSize/2 && this.pos.y-config.sigilSize/2  < pos.y && pos.y < this.pos.y+config.sigilSize/2)
        {
            return true;
        }
        return false;
    }
}

class Chars extends RingItem {
    constructor(x, y, value, ring)
    {
        super();
        this.x = x;
        this.y = y;
        this.type = "chars";
        this.value = value;
        this.ring = ring;
    }
    
    GetLength()
    {
        return this.value.length * config.charWidth + (this.value.length-1) * config.charSpacing;
    }
    
    DrawByRing(radius, angle, itemRadWidth)
    {
        PushTransform();
        Rotate(angle + PI);
        const radwide = this.GetLength() / radius * TWO_PI;
        Rotate(radwide/2 - itemRadWidth.char/2);
        const chars = this.value.split('');
        chars.forEach(char =>
        {
            DrawText(config.fontSize, char, 0, radius, config.fontColor, CENTER);
            Rotate(-itemRadWidth.char-itemRadWidth.charSpacing);
        });
        PopTransform();
    }
    
    DrawByDrag()
    {
        const ClickObj = CheckMouseObject();
        if (ClickObj[0] == "ring")
        {
            const ring = ClickObj[1][0];
            const mouseAngle = Math.atan2(ring.pos.x - mousePos.x, ring.pos.y - mousePos.y);
            PushTransform();
            Translate(GetMouseX(), GetMouseY());
            Rotate(-mouseAngle + PI);
            DrawText(config.fontSize * zoomSize, this.value, 0, 0, config.fontColor, CENTER);
            PopTransform();
        }
        else
        {
            DrawText(config.fontSize * zoomSize, this.value, GetMouseX(), GetMouseY(), config.fontColor, CENTER);
        }
    }
    
    DrawByCanvas()
    {
        if(debugMode){
            DrawRect(this.pos.x-this.GetLength()*PI, this.pos.y-config.fontSize/2, this.GetLength()*TWO_PI, config.fontSize, color(0,255,0));
        }
        DrawText(config.fontSize, this.value, this.pos.x, this.pos.y, config.fontColor, CENTER);
    }
    
    CheckPosIsOn(pos)
    {
        if (this.pos.x-this.GetLength()*PI < pos.x && pos.x < this.pos.x+this.GetLength()*PI && this.pos.y-config.fontSize/2  < pos.y && pos.y < this.pos.y+config.fontSize/2)
        {
            return true;
        }
        return false;
    }
}

class StringToken extends RingItem {
    constructor(x, y, value, ring)
    {
        super();
        this.x = x;
        this.y = y;
        this.type = "string_token";
        this.value = value;
        this.ring = ring;
    }
    
    GetLength()
    {
        return this.value.length * config.charWidth + (this.value.length-1) * config.charSpacing + config.stringSideWidth*2;
    }
    
    DrawByRing(radius, angle, itemRadWidth)
    {
        PushTransform();
        Rotate(angle + PI);
        const radwide = this.GetLength() / radius * TWO_PI;
        Rotate(radwide/2 - itemRadWidth.stringSide);
        arc(0, radius, config.stringSideWidth*TWO_PI*2, config.stringSideWidth*TWO_PI*2, HALF_PI, -HALF_PI);
        Rotate(-itemRadWidth.char/2);
        const chars = this.value.split('');
        chars.forEach(char =>
        {
            DrawText(config.fontSize, char, 0, radius, config.fontColor, CENTER);
            Rotate(-itemRadWidth.char-itemRadWidth.charSpacing);
        });
        Rotate(itemRadWidth.char/2 + itemRadWidth.charSpacing);
        noFill();
        stroke(config.sigilColor);
        strokeWeight(1);
        arc(0, radius, config.stringSideWidth*TWO_PI*2, config.stringSideWidth*TWO_PI*2, -HALF_PI, HALF_PI);
        const innerlineradius = (radius-config.stringSideWidth*TWO_PI)*2;
        const outerlineradius = (radius+config.stringSideWidth*TWO_PI)*2
        const outlinewidth = this.value.length * itemRadWidth.char + (this.value.length-1) * itemRadWidth.charSpacing;
        arc(0, 0, innerlineradius, innerlineradius, HALF_PI, HALF_PI+outlinewidth);
        arc(0, 0, outerlineradius, outerlineradius, HALF_PI, HALF_PI+outlinewidth);
        PopTransform();
    }
    
    DrawByDrag()
    {
        const ClickObj = CheckMouseObject();
        PushTransform();
        
        Translate(GetMouseX(), GetMouseY());
        if (ClickObj[0] == "ring")
        {
            const ring = ClickObj[1][0];
            const mouseAngle = Math.atan2(ring.pos.x - mousePos.x, ring.pos.y - mousePos.y);
            Rotate(-mouseAngle + PI);
        }
        Scale(zoomSize);
        DrawText(config.fontSize, this.value, 0, 0, config.fontColor, CENTER);
        const textlen = config.fontSize*this.value.length*0.6;
        const outlineradius = config.stringSideWidth*TWO_PI;
        DrawLine(-textlen/2, outlineradius, textlen/2, outlineradius, color(config.sigilColor));
        DrawLine(-textlen/2, -outlineradius, textlen/2, -outlineradius, color(config.sigilColor));
        noFill();
        arc(-textlen/2, 0, outlineradius*2, outlineradius*2, HALF_PI, -HALF_PI);
        arc(textlen/2, 0, outlineradius*2, outlineradius*2, -HALF_PI, HALF_PI);
        PopTransform();
    }
    
    DrawByCanvas()
    {
        if(debugMode){
            DrawRect(this.pos.x-this.GetLength()*PI, this.pos.y-config.fontSize/2, this.GetLength()*TWO_PI, config.fontSize, color(0,255,0));
        }
        DrawText(config.fontSize, this.value, this.pos.x, this.pos.y, config.fontColor, CENTER);
        const textlen = config.fontSize*this.value.length*0.6;
        const outlineradius = config.stringSideWidth*TWO_PI;
        DrawLine(this.pos.x-textlen/2, this.pos.y+outlineradius, this.pos.x+textlen/2, this.pos.y+outlineradius, color(config.sigilColor));
        DrawLine(this.pos.x-textlen/2, this.pos.y-outlineradius, this.pos.x+textlen/2, this.pos.y-outlineradius, color(config.sigilColor));
        noFill();
        arc(this.pos.x-textlen/2, this.pos.y, outlineradius*2, outlineradius*2, HALF_PI, -HALF_PI);
        arc(this.pos.x+textlen/2, this.pos.y, outlineradius*2, outlineradius*2, -HALF_PI, HALF_PI);
    }
    
    CheckPosIsOn(pos)
    {
        if (this.pos.x-this.GetLength()*PI < pos.x && pos.x < this.pos.x+this.GetLength()*PI && this.pos.y-config.fontSize/2  < pos.y && pos.y < this.pos.y+config.fontSize/2)
        {
            return true;
        }
        return false;
    }
}

class Button
{
    constructor(x, y, w, h, color, anchor, pivot, text, pressed)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.anchor = anchor;
        this.pivot = pivot;
        this.text = text;
        this.pressed = pressed;
    }
    
    Draw()
    {
        let [width, height] = GetScreenSize();
        const x = width * this.anchor.x + this.x - this.w * this.pivot.x;
        const y = height * this.anchor.y + this.y - this.h * this.pivot.y;
        //FillRect(x, y, this.w, this.h, this.color);
        DrawRoundRect(x, y, this.w, this.h, 10, color(0,0,0), 3); 
        FillRoundRect(x, y, this.w, this.h, 10, this.color);
        DrawText(24, this.text, x + this.w/2, y + this.h/2, color(0, 0, 0), CENTER);
    }
    
    CheckPressed()
    {
        let [width, height] = GetScreenSize();
        const x = width * this.anchor.x + this.x - this.w * this.pivot.x;
        const y = height * this.anchor.y + this.y - this.h * this.pivot.y;
        if (x < GetMouseX() && GetMouseX() < x + this.w && y < GetMouseY() && GetMouseY() < y + this.h)
        {
            this.pressed();
            return true;
        }
        return false;
    }
}