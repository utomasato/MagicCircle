## pop
![シジル画像](images/sigils/sigil_pop.png) 

### 説明
pop：スタックの最上位から値を1つ取り出して破棄します。

### Code
![サンプル魔法陣画像](images/samples/sample_pop.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="10" /><Item type="sigil" value="pop" /><Item type="sigil" value="stack" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
10 pop stack
```

## exch
![シジル画像](images/sigils/sigil_exch.png) 

### 説明
exch：スタックの最上位にある2つの値の順番を入れ替えます。

### Code
![サンプル魔法陣画像](images/samples/sample_exch.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="1" /><Item type="chars" value="2" /><Item type="sigil" value="exch" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
1 2 exch print
```

## dup
![シジル画像](images/sigils/sigil_dup.png) 

### 説明
dup：スタックの最上位にある値をコピーして、スタックに積み直します。

### Code
![サンプル魔法陣画像](images/samples/sample_dup.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="99" /><Item type="sigil" value="dup" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
99 dup print
```

## copy
![シジル画像](images/sigils/sigil_copy.png) 

### 説明
copy：スタックの上からn個の要素をコピーして、スタックに積み増します。

### Code
![サンプル魔法陣画像](images/samples/sample_copy.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="1" /><Item type="chars" value="2" /><Item type="chars" value="2" /><Item type="sigil" value="copy" /><Item type="sigil" value="stack" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
1 2 2 copy stack
```

## index
![シジル画像](images/sigils/sigil_index.png) 

### 説明
index：スタックの上からn番目の要素をコピーして、スタックの最上位に積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_index.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="10" /><Item type="chars" value="20" /><Item type="chars" value="1" /><Item type="sigil" value="index" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
10 20 1 index print
```

## roll
![シジル画像](images/sigils/sigil_roll.png) 

### 説明
roll：スタックのn個の要素を、指定した回数だけ循環的に回転させます。

### Code
![サンプル魔法陣画像](images/samples/sample_roll.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="1" /><Item type="chars" value="2" /><Item type="chars" value="3" /><Item type="chars" value="3" /><Item type="chars" value="1" /><Item type="sigil" value="roll" /><Item type="sigil" value="stack" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
1 2 3 3 1 roll stack
```

## add
![シジル画像](images/sigils/sigil_add.png) 

### 説明
add：スタックから2つ値を取り出し、足し合わせたものをスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_add.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="1" /><Item type="chars" value="2" /><Item type="sigil" value="add" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
1 2 add print
```

## sub
![シジル画像](images/sigils/sigil_sub.png) 

### 説明
sub：スタックから2つ値を取り出し、引き算した結果をスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_sub.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="10" /><Item type="chars" value="3" /><Item type="sigil" value="sub" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
10 3 sub print
```

## mul
![シジル画像](images/sigils/sigil_mul.png) 

### 説明
mul：スタックから2つ値を取り出し、掛け合わせた結果をスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_mul.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="4" /><Item type="chars" value="5" /><Item type="sigil" value="mul" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
4 5 mul print
```

## div
![シジル画像](images/sigils/sigil_div.png) 

### 説明
div：スタックから2つ値を取り出し、割り算した結果（実数）を積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_div.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="10" /><Item type="chars" value="4" /><Item type="sigil" value="div" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
10 4 div print
```

## idiv
![シジル画像](images/sigils/sigil_idiv.png) 

### 説明
idiv：スタックから2つ値を取り出し、割り算の商（整数）を積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_idiv.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="10" /><Item type="chars" value="3" /><Item type="sigil" value="idiv" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
10 3 idiv print
```

## mod
![シジル画像](images/sigils/sigil_mod.png) 

### 説明
mod：スタックから2つ値を取り出し、割り算の余りをスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_mod.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="10" /><Item type="chars" value="3" /><Item type="sigil" value="mod" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
10 3 mod print
```

## abs
![シジル画像](images/sigils/sigil_abs.png) 

### 説明
abs：スタックの最上位にある値の絶対値を計算して積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_abs.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="-15" /><Item type="sigil" value="abs" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
-15 abs print
```

## neg
![シジル画像](images/sigils/sigil_neg.png) 

### 説明
neg：スタックの最上位にある値の符号を反転させます。

### Code
![サンプル魔法陣画像](images/samples/sample_neg.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="10" /><Item type="sigil" value="neg" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
10 neg print
```

## sqrt
![シジル画像](images/sigils/sigil_sqrt.png) 

### 説明
sqrt：スタックの最上位にある値の平方根を計算して積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_sqrt.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="16" /><Item type="sigil" value="sqrt" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
16 sqrt print
```

## atan
![シジル画像](images/sigils/sigil_atan.png) 

### 説明
atan：2つの値から逆正接（アークタンジェント）を度数法で計算して積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_atan.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="1" /><Item type="chars" value="1" /><Item type="sigil" value="atan" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
1 1 atan print
```

## cos
![シジル画像](images/sigils/sigil_cos.png) 

### 説明
cos：角度（度数法）をスタックから取り出し、余弦（コサイン）を積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_cos.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="60" /><Item type="sigil" value="cos" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
60 cos print
```

## sin
![シジル画像](images/sigils/sigil_sin.png) 

### 説明
sin：角度（度数法）をスタックから取り出し、正弦（サイン）を積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_sin.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="30" /><Item type="sigil" value="sin" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
30 sin print
```

## rand
![シジル画像](images/sigils/sigil_rand.png) 

### 説明
rand：0から最大値（2147483647）までの乱数を生成して積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_rand.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="rand" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
rand print
```

## srand
![シジル画像](images/sigils/sigil_srand.png) 

### 説明
srand：乱数のシード値を設定します（現在の実装では未処理）。

### Code
![サンプル魔法陣画像](images/samples/sample_srand.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="12345" /><Item type="sigil" value="srand" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
12345 srand
```

## rrand
![シジル画像](images/sigils/sigil_rrand.png) 

### 説明
rrand：乱数のシードを現在時刻等で初期化します（現在の実装では未処理）。

### Code
![サンプル魔法陣画像](images/samples/sample_rrand.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="rrand" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
rrand
```

## length
![シジル画像](images/sigils/sigil_length.png) 

### 説明
length：配列、辞書、または文字列の要素数（長さ）をスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_length.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="(hello)" /><Item type="sigil" value="length" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
(hello) length print
```

## get
![シジル画像](images/sigils/sigil_get.png) 

### 説明
get：配列や辞書から、指定したインデックスやキーに対応する値を取り出します。

### Code
![サンプル魔法陣画像](images/samples/sample_get.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="[10 20 30]" /><Item type="chars" value="1" /><Item type="sigil" value="get" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
[10 20 30] 1 get print
```

## put
![シジル画像](images/sigils/sigil_put.png) 

### 説明
put：配列や辞書、文字列の指定した位置に、新しい値を書き込みます。

### Code
![サンプル魔法陣画像](images/samples/sample_put.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="[10 20 30]" /><Item type="chars" value="1" /><Item type="chars" value="99" /><Item type="sigil" value="put" /><Item type="sigil" value="stack" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
[10 20 30] 1 99 put stack
```

## string
![シジル画像](images/sigils/sigil_string.png) 

### 説明
string：指定した長さの空の文字列オブジェクトを作成して積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_string.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="10" /><Item type="sigil" value="string" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
10 string print
```

## cvi
![シジル画像](images/sigils/sigil_cvi.png) 

### 説明
cvi：文字列の最初の文字を、その文字コード（整数）に変換して積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_cvi.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="(A)" /><Item type="sigil" value="cvi" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
(A) cvi print
```

## chr
![シジル画像](images/sigils/sigil_chr.png) 

### 説明
chr：整数（文字コード）を、対応する1文字の文字列に変換して積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_chr.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="65" /><Item type="sigil" value="chr" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
65 chr print
```

## getinterval
![シジル画像](images/sigils/sigil_getinterval.png) 

### 説明
getinterval：配列や文字列から、指定範囲の部分配列・文字列を抽出します。

### Code
![サンプル魔法陣画像](images/samples/sample_getinterval.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="(abcdef)" /><Item type="chars" value="1" /><Item type="chars" value="3" /><Item type="sigil" value="getinterval" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
(abcdef) 1 3 getinterval print
```

## putinterval
![シジル画像](images/sigils/sigil_putinterval.png) 

### 説明
putinterval：配列や文字列の指定位置に、別の配列や文字列の内容を上書きします。

### Code
![サンプル魔法陣画像](images/samples/sample_putinterval.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="(abcdef)" /><Item type="chars" value="1" /><Item type="chars" value="(XYZ)" /><Item type="sigil" value="putinterval" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
(abcdef) 1 (XYZ) putinterval print
```

## array
![シジル画像](images/sigils/sigil_array.png) 

### 説明
array：指定した要素数を持つ、空の配列オブジェクトを作成して積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_array.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="5" /><Item type="sigil" value="array" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
5 array print
```

## forall
![シジル画像](images/sigils/sigil_forall.png) 

### 説明
forall：配列や辞書の各要素に対して、指定した手続きを繰り返し実行します。

### Code
![サンプル魔法陣画像](images/samples/sample_forall.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="[1 2 3]" /><Item type="chars" value="{ print }" /><Item type="sigil" value="forall" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
[1 2 3] { print } forall
```

## dict
![シジル画像](images/sigils/sigil_dict.png) 

### 説明
dict：新しい空の辞書（連想配列）を作成してスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_dict.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="10" /><Item type="sigil" value="dict" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
10 dict print
```

## begin
![シジル画像](images/sigils/sigil_begin.png) 

### 説明
begin：辞書を辞書スタックに積み、以降の変数定義や検索の対象にします。

### Code
![サンプル魔法陣画像](images/samples/sample_begin.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="10" /><Item type="sigil" value="dict" /><Item type="sigil" value="begin" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
10 dict begin
```

## end
![シジル画像](images/sigils/sigil_end.png) 

### 説明
end：現在アクティブな辞書を辞書スタックから取り除きます。

### Code
![サンプル魔法陣画像](images/samples/sample_end.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="end" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
end
```

## def
![シジル画像](images/sigils/sigil_def.png) 

### 説明
def：現在の辞書に、名前と値を対応付けて変数を定義します。

### Code
![サンプル魔法陣画像](images/samples/sample_def.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="/x" /><Item type="chars" value="100" /><Item type="sigil" value="def" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
/x 100 def
```

## eq
![シジル画像](images/sigils/sigil_eq.png) 

### 説明
eq：スタックの2つの値が等しければtrue、そうでなければfalseを積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_eq.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="5" /><Item type="chars" value="5" /><Item type="sigil" value="eq" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
5 5 eq print
```

## ne
![シジル画像](images/sigils/sigil_ne.png) 

### 説明
ne：スタックの2つの値が等しくなければtrue、等しければfalseを積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_ne.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="5" /><Item type="chars" value="10" /><Item type="sigil" value="ne" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
5 10 ne print
```

## ge
![シジル画像](images/sigils/sigil_ge.png) 

### 説明
ge：1つ目の値が2つ目の値以上であればtrueをスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_ge.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="10" /><Item type="chars" value="5" /><Item type="sigil" value="ge" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
10 5 ge print
```

## gt
![シジル画像](images/sigils/sigil_gt.png) 

### 説明
gt：1つ目の値が2つ目の値より大きければtrueをスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_gt.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="10" /><Item type="chars" value="5" /><Item type="sigil" value="gt" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
10 5 gt print
```

## le
![シジル画像](images/sigils/sigil_le.png) 

### 説明
le：1つ目の値が2つ目の値以下であればtrueをスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_le.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="5" /><Item type="chars" value="10" /><Item type="sigil" value="le" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
5 10 le print
```

## lt
![シジル画像](images/sigils/sigil_lt.png) 

### 説明
lt：1つ目の値が2つ目の値より小さければtrueをスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_lt.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="5" /><Item type="chars" value="10" /><Item type="sigil" value="lt" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
5 10 lt print
```

## and
![シジル画像](images/sigils/sigil_and.png) 

### 説明
and：2つの論理値の論理積（AND）を計算してスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_and.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="true" /><Item type="sigil" value="false" /><Item type="sigil" value="and" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
true false and print
```

## or
![シジル画像](images/sigils/sigil_or.png) 

### 説明
or：2つの論理値の論理和（OR）を計算してスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_or.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="true" /><Item type="sigil" value="false" /><Item type="sigil" value="or" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
true false or print
```

## xor
![シジル画像](images/sigils/sigil_xor.png) 

### 説明
xor：2つの論理値の排他的論理和（XOR）を計算して積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_xor.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="true" /><Item type="sigil" value="false" /><Item type="sigil" value="xor" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
true false xor print
```

## not
![シジル画像](images/sigils/sigil_not.png) 

### 説明
not：スタック最上位の論理値を反転（真偽を逆に）させます。

### Code
![サンプル魔法陣画像](images/samples/sample_not.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="true" /><Item type="sigil" value="not" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
true not print
```

## true
![シジル画像](images/sigils/sigil_true.png) 

### 説明
true：論理値の真（true）をスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_true.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="true" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
true print
```

## false
![シジル画像](images/sigils/sigil_false.png) 

### 説明
false：論理値の偽（false）をスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_false.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="false" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
false print
```

## null
![シジル画像](images/sigils/sigil_null.png) 

### 説明
null：null値をスタックに積みます。

### Code
![サンプル魔法陣画像](images/samples/sample_null.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="null" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
null print
```

## exec
![シジル画像](images/sigils/sigil_exec.png) 

### 説明
exec：スタックにある手続き（プログラムの塊）を実行します。

### Code
![サンプル魔法陣画像](images/samples/sample_exec.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="{ 1 2 add print }" /><Item type="sigil" value="exec" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
{ 1 2 add print } exec
```

## if
![シジル画像](images/sigils/sigil_if.png) 

### 説明
if：条件が真の場合に、指定した手続きを実行します。

### Code
![サンプル魔法陣画像](images/samples/sample_if.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="true" /><Item type="chars" value="{ 100 print }" /><Item type="sigil" value="if" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
true { 100 print } if
```

## ifelse
![シジル画像](images/sigils/sigil_ifelse.png) 

### 説明
ifelse：条件に応じて、実行する2つの手続きを切り替えます。

### Code
![サンプル魔法陣画像](images/samples/sample_ifelse.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="true" /><Item type="chars" value="{ 1 print }" /><Item type="chars" value="{ 2 print }" /><Item type="sigil" value="ifelse" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
true { 1 print } { 2 print } ifelse
```

## repeat
![シジル画像](images/sigils/sigil_repeat.png) 

### 説明
repeat：指定した回数だけ、手続きを繰り返し実行します。

### Code
![サンプル魔法陣画像](images/samples/sample_repeat.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="3" /><Item type="chars" value="{ 1 print }" /><Item type="sigil" value="repeat" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
3 { 1 print } repeat
```

## for
![シジル画像](images/sigils/sigil_for.png) 

### 説明
for：開始、増分、終了値を指定して、数値を変化させながら手続きを繰り返します。

### Code
![サンプル魔法陣画像](images/samples/sample_for.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="1" /><Item type="chars" value="1" /><Item type="chars" value="5" /><Item type="chars" value="{ print }" /><Item type="sigil" value="for" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
1 1 5 { print } for
```

## loop
![シジル画像](images/sigils/sigil_loop.png) 

### 説明
loop：exitが呼ばれるまで、手続きを無限に繰り返し実行します。

### Code
![サンプル魔法陣画像](images/samples/sample_loop.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="{ 1 print exit }" /><Item type="sigil" value="loop" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
{ 1 print exit } loop
```

## exit
![シジル画像](images/sigils/sigil_exit.png) 

### 説明
exit：実行中のloop（繰り返し）から即座に脱出します。

### Code
![サンプル魔法陣画像](images/samples/sample_exit.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="{ exit }" /><Item type="sigil" value="loop" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
{ exit } loop
```

## magicactivate
![シジル画像](images/sigils/sigil_magicactivate.png) 

### 説明
magicactivate：指定したデータを魔法としてUnity側に送信し実行します。

### Code
![サンプル魔法陣画像](images/samples/sample_magicactivate.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="(fire)" /><Item type="sigil" value="magicactivate" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
(fire) magicactivate
```

## spawnobj
![シジル画像](images/sigils/sigil_spawnobj.png) 

### 説明
spawnobj：指定したパラメータでUnity上に新しいオブジェクトを生成します。

### Code
![サンプル魔法陣画像](images/samples/sample_spawnobj.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="(bullet)" /><Item type="sigil" value="spawnobj" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
(bullet) spawnobj
```

## transform
![シジル画像](images/sigils/sigil_transform.png) 

### 説明
transform：Unityオブジェクトの位置、回転、スケールを変更します。

### Code
![サンプル魔法陣画像](images/samples/sample_transform.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="0" /><Item type="chars" value="10" /><Item type="chars" value="0" /><Item type="sigil" value="transform" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
0 10 0 transform
```

## attachtoparent
![シジル画像](images/sigils/sigil_attachtoparent.png) 

### 説明
attachtoparent：Unityオブジェクトを別のオブジェクトの子要素にします。

### Code
![サンプル魔法陣画像](images/samples/sample_attachtoparent.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="sigil" value="attachtoparent" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
attachtoparent
```

## animation
![シジル画像](images/sigils/sigil_animation.png) 

### 説明
animation：Unityオブジェクトに対して、指定したアニメーションを再生します。

### Code
![サンプル魔法陣画像](images/samples/sample_animation.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="(play_anim)" /><Item type="sigil" value="animation" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
(play_anim) animation
```

## print
![シジル画像](images/sigils/sigil_print.png) 

### 説明
print：スタックの値を1つ取り出し、出力ログに表示します。

### Code
![サンプル魔法陣画像](images/samples/sample_print.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="(Hello)" /><Item type="sigil" value="print" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
(Hello) print
```

## stack
![シジル画像](images/sigils/sigil_stack.png) 

### 説明
stack：現在のスタックの内容をすべて出力ログに表示します。

### Code
![サンプル魔法陣画像](images/samples/sample_stack.png) 
```xml
<?xml version="1.0" encoding="UTF-8"?><MagicCircleLayout startRingId="0"><Rings><Ring id="0" type="MagicRing" x="0.00" y="0.00" angle="0.0000"><Comments></Comments><Items><Item type="sigil" value="RETURN" /><Item type="chars" value="1" /><Item type="chars" value="2" /><Item type="chars" value="3" /><Item type="sigil" value="stack" /></Items></Ring></Rings><FieldItems></FieldItems></MagicCircleLayout>
```
```
1 2 3 stack
```
