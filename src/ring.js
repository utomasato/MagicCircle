class MagicRing 
{
    constructor(pos) 
    {
        this.pos = pos;
        this.radius = 30;
        this.rotate = 0;
        this.color = color(0, 0, 0, 128);
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