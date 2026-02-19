## add
![シジル画像](images/sigils/sigil_add.png) 

### 説明
スタックから2つ値を取り出し、足し合わせたものをスタックに積みます。

### Code
![サンプル魔法陣画像](images/sumples_add.png) 
```
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="1" /><Item type="chars" value="2" /><Item type="sigil" value="add" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
1 2 add print
```
