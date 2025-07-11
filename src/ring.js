class MagicRing 
{
    constructor(pos) 
    {
        this.pos = pos;
        this.radius = 30;
        this.rotate = 0;
        this.color = color(0, 0, 0, 128);
        this.items = [];
        this.items 
    }

    Draw() 
    {
        PushTransform();
        Translate(this.pos.x, this.pos.y);
        FillCircle(0, 0, this.radius, this.color);
        PopTransform();
    }
    
    CheckDistance(pos)
    {
        return Math.sqrt((pos.x - this.pos.x)**2 + (pos.y - this.pos.y)**2);
    }
    
    CheckPosIsOn(pos)
    {
        const distance = this.CheckDistance(pos)
        if (distance < this.radius)
        {
            return this;
        }
        return null;
    }
}

class RingItem {
    constructor()
    {
        this.x = x;
        this.y = y;
        this.type = "item";
        this.value = value;
    }
    
    GetLength()
    {
        return 0;
    }
    
    Draw(radWidth, config)
    {
    }
}

class Sigil extends RingItem {
    constructor()
    {
        super();
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
        FillRect(x, y, this.w, this.h, this.color);
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
        }
    }
}