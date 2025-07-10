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


class Button
{
    constructor(x, y, w, h, c, anchor, pivot, pressed)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;
        this.anchor = anchor;
        this.pivot = pivot;
        this.pressed = pressed;
    }
    
    Draw()
    {
        let [width, height] = GetScreenSize();
        const x = width * this.anchor.x + this.x - this.w * this.pivot.x;
        const y = height * this.anchor.y + this.y - this.h * this.pivot.y;
        FillRect(x, y, this.w, this.h, this.c);
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