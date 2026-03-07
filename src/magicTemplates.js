const templateDatas = {
    fire: {
        parameters: //このテンプレートで設定できるパラメータ
        {
            scale: { type: "numberOrVector3", defaultValue: "1" },
            position: { type: "vector3", defaultValue: "0 0 0" },
            rotation: { type: "vector3", defaultValue: "-90 0 0" },
            color1: { type: "color", defaultValue: "1.0 0.6 0.0 1.0" },
            color2: { type: "color", defaultValue: "1.0 0.0 0.0 1.0" },
        },
        converter: //入力されたパラメータからコードに変換する変換器
            (prms, prmfgs) => {
                return `{dict begin ~root < ~shape (empty) > spawnobj ~setMagic { ~magic $preset magicactivate $magic $root attachtoparent } def ~preset < ~main < ~startLifetime [ 0.5 2 ] ~startSpeed 0.5 ~startSize [ 0.2 0.4 ] ~startRotation [ 0 360 ] > ~emission < ~rateOverTime 50 > ~shape < ~angle 5 ~radius 0.0001 > ~colorOverLifetime < ~gradient < ~colorKeys [ [ 0.0 ${prms.color1} ] [ 0.6 ${prms.color2} ] [ 1.0 ${prms.color2} ] ] ~alphaKeys [ [ 0.0 0.0 ] [ 0.5 1.0 ] [ 1.0 0.0 ] ] > > ~rotationOverLifetime < ~z [ -45 45 ] > ~renderer < ~material <~texture (Smoke_1)> > > def $setMagic { $preset ~renderer get dup ~material <~shader (AlphaBlended) ~texture (Smoke_1)> put ~sortingFudge 10 put } exec $setMagic $root < ~position [ ${prms.position} ] ~rotation [ ${prms.rotation} ] ~scale ${prms.scale} > transform $root end}`;
            },
        invalidVariableNames: // 入れてほしくない変数（例えば　scaleにrootとか入れられられると困る）
            ["root", "setMagic", "magic", "preset"],
        execute:
            (prms) => {
                const interp = activeInterpreter;
                const idList = [];
                for (let i = 0; i < 3; i++) idList.push(interp.generateUUID());
                let data = { message: "CreateObject", id: idList[0], text: "< ~shape(empty) >", };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[1], text: `< ~main < ~startLifetime [ 0.5 2 ] ~startSpeed 0.5 ~startSize [ 0.2 0.4 ] ~startRotation [ 0 360 ] > ~emission < ~rateOverTime 50 > ~shape < ~angle 5 ~radius 0.0001 > ~colorOverLifetime < ~gradient < ~colorKeys [ [ 0.0 ${prms.color1} ] [ 0.6 ${prms.color2} ] [ 1.0 ${prms.color2} ] ] ~alphaKeys [ [ 0.0 0.0 ] [ 0.5 1.0 ] [ 1.0 0.0 ] ] > > ~rotationOverLifetime < ~z [ -45 45 ] > ~renderer < ~materialName (Smoke_1) > >`, };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "AttachToParent", id: idList[1], text: idList[0], };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[2], text: `< ~main < ~startLifetime [ 0.5 2 ] ~startSpeed 0.5 ~startSize [ 0.2 0.4 ] ~startRotation [ 0 360 ] > ~emission < ~rateOverTime 50 > ~shape < ~angle 5 ~radius 0.0001 > ~colorOverLifetime < ~gradient < ~colorKeys [ [ 0.0 ${prms.color1} ] [ 0.6 ${prms.color2} ] [ 1.0 ${prms.color2} ] ] ~alphaKeys [ [ 0.0 0.0 ] [ 0.5 1.0 ] [ 1.0 0.0 ] ] > >  ~rotationOverLifetime < ~z [ -45 45 ] > ~renderer < ~materialName (Smoke_1) ~shader (Alphablended) ~sortingFudge 10 > >`, };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "AttachToParent", id: idList[2], text: idList[0], };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "TransformObject", id: idList[0], text: `< ~position [ ${prms.position} ] ~rotation[ ${prms.rotation} ] ~scale ${prms.scale} >`, };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                interp.stack.push({ type: "unityObject", value: idList[0] });
            },
    },
    bullet: {
        parameters:
        {
            scale: { type: "numberOrVector3", defaultValue: "2" },
            position: { type: "vector3", defaultValue: "0 0 0" },
            rotation: { type: "vector3", defaultValue: "0 0 0" },
            color: { type: "color", defaultValue: "1.0 0.5 0.0 1.0" },
            speed: { type: "number", defaultValue: "10" }, // startSpeed
            range: { type: "number", defaultValue: "20" }, // startSpeed * startLifetime
            delay: { type: "number", defaultValue: "0" },
            interval: { type: "number", defaultValue: "1" }, // duration
        },
        converter:
            (prms, prmfgs) => {
                return `{ dict begin ~root < ~shape (empty) > spawnobj ~actualLifetime ${prms.range} ${prms.speed} div def ~setMagic { ~magic $preset magicactivate $magic $root attachtoparent } def ~preset < ~main < ~duration ${prms.interval} ~startDelay ${prms.delay} ~startLifetime $actualLifetime ~startSpeed ${prms.speed} ~startSize < ~x 30 ~y 30 ~z 75 > ~startColor [ ${prms.color} ] > ~emission < ~rateOverTime 0 ~burstCount 2 > ~colorOverLifetime < ~gradient < ~alphaKeys [ [ 0.0 0.0 ] [ 0.05 1.0 ] [ 0.95 1.0 ] [ 1.0 0.0 ] ] > > ~renderer < ~renderMode (Mesh) ~meshDistribution (NonUniformRandom) ~meshes (Bullet) ~material < ~texture (Glow_2) > ~alignment (Local) > > def $setMagic { $preset ~rotationOverLifetime < ~z 500 > put $preset ~renderer get ~material < ~texture (Glow_3) > put } exec $setMagic { $preset ~renderer get dup ~material < ~shader (AlphaBlended) ~texture (Glow_3) > put ~sortingFudge 10 put } exec $setMagic { $preset ~main get ~startSize < ~x 10 ~y 10 ~z 200 > put $preset ~rotationOverLifetime < ~z 800 > put $preset ~renderer get dup dup ~meshes (Cylinder_1) put ~material < ~texture (Spiral) ~shader (Additive) > put ~sortingFudge 0 put } exec $setMagic { $preset ~main get ~startSize 0.1 put $preset ~trails < ~lifetime 0.2 > put $preset ~renderer < ~material < ~texture (Glow_1) > ~trailMaterial < ~texture (Trail_1) > > put } exec $setMagic { $preset ~renderer get dup ~trailMaterial < ~shader (AlphaBlended) ~texture (Trail_1) > put ~sortingFudge 10 put } exec $setMagic $root < ~position [ ${prms.position} ] ~rotation [ ${prms.rotation} ] ~scale ${prms.scale} > transform $root end }`;
            },
        invalidVariableNames:
            ["root", "setMagic", "magic", "preset"],
        execute:
            (prms) => {
                const interp = activeInterpreter;
                const idList = [];
                for (let i = 0; i < 7; i++) idList.push(interp.generateUUID());
                data = { message: "CreateObject", id: idList[0], text: "< ~shape(empty) >", };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[1], text: `< ~main < ~duration ${prms.interval} ~startDelay ${prms.delay} ~startLifetime ${prms.range / prms.speed} ~startSpeed ${prms.speed} ~startSize < ~x 30 ~y 30 ~z 75 > ~startColor[ ${prms.color} ] > ~emission < ~rateOverTime 0 ~burstCount 2 > ~colorOverLifetime < ~gradient < ~alphaKeys[[0 0][0.05 1 ][0.95 1][1 0 ] ] > > ~renderer < ~renderMode(Mesh) ~meshDistribution(NonUniformRandom) ~meshes(Bullet) ~material < ~texture(Glow_2) > ~alignment(Local) > >`, };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[1], text: idList[0], };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[2], text: `< ~main < ~duration ${prms.interval} ~startDelay ${prms.delay} ~startLifetime ${prms.range / prms.speed} ~startSpeed ${prms.speed} ~startSize < ~x 30 ~y 30 ~z 75 > ~startColor[ ${prms.color} ] > ~emission < ~rateOverTime 0 ~burstCount 2 > ~colorOverLifetime < ~gradient < ~alphaKeys[[0 0][0.05 1 ][0.95 1][1 0 ] ] > > ~renderer < ~renderMode(Mesh) ~meshDistribution(NonUniformRandom) ~meshes(Bullet) ~material < ~texture(Glow_3) > ~alignment(Local) > ~rotationOverLifetime < ~z 500 > >` };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[2], text: idList[0], };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[3], text: `< ~main < ~duration ${prms.interval} ~startDelay ${prms.delay} ~startLifetime ${prms.range / prms.speed} ~startSpeed ${prms.speed} ~startSize < ~x 30 ~y 30 ~z 75 > ~startColor[ ${prms.color} ] > ~emission < ~rateOverTime 0 ~burstCount 2 > ~colorOverLifetime < ~gradient < ~alphaKeys[[0 0][0.05 1 ][0.95 1][1 0 ] ] > > ~renderer < ~renderMode(Mesh) ~meshDistribution(NonUniformRandom) ~meshes(Bullet) ~material < ~shader(AlphaBlended) ~texture(Glow_3) > ~alignment(Local) ~sortingFudge 10 > ~rotationOverLifetime < ~z 500 > >` };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[3], text: idList[0], };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[4], text: `< ~main < ~duration ${prms.interval} ~startDelay ${prms.delay} ~startLifetime ${prms.range / prms.speed} ~startSpeed ${prms.speed} ~startSize < ~x 10 ~y 10 ~z 200 > ~startColor[ ${prms.color} ] > ~emission < ~rateOverTime 0 ~burstCount 2 > ~colorOverLifetime < ~gradient < ~alphaKeys[[0 0][0.05 1 ][0.95 1][1 0 ] ] > > ~renderer < ~renderMode(Mesh) ~meshDistribution(NonUniformRandom) ~meshes(Cylinder_1) ~material < ~texture(Spiral) ~shader(Additive) > ~alignment(Local) ~sortingFudge 0 > ~rotationOverLifetime < ~z 800 > >` };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[4], text: idList[0], };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[5], text: `< ~main < ~duration ${prms.interval} ~startDelay ${prms.delay} ~startLifetime ${prms.range / prms.speed} ~startSpeed ${prms.speed} ~startSize 0.1 ~startColor[ ${prms.color} ] > ~emission < ~rateOverTime 0 ~burstCount 2 > ~colorOverLifetime < ~gradient < ~alphaKeys[[0 0][0.05 1 ][0.95 1][1 0 ] ] > > ~renderer < ~material < ~texture(Glow_1) > ~trailMaterial < ~texture(Trail_1) > > ~rotationOverLifetime < ~z 800 > ~trails < ~lifetime 0.2 > >` };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[5], text: idList[0], };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[6], text: `< ~main < ~duration ${prms.interval} ~startDelay ${prms.delay} ~startLifetime ${prms.range / prms.speed} ~startSpeed ${prms.speed} ~startSize 0.1 ~startColor[ ${prms.color} ] > ~emission < ~rateOverTime 0 ~burstCount 2 > ~colorOverLifetime < ~gradient < ~alphaKeys[[0 0][0.05 1 ][0.95 1][1 0 ] ] > > ~renderer < ~material < ~texture(Glow_1) > ~trailMaterial < ~shader(AlphaBlended) ~texture(Trail_1) > ~sortingFudge 10 > ~rotationOverLifetime < ~z 800 > ~trails < ~lifetime 0.2 > >` };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[6], text: idList[0], };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "TransformObject", id: idList[0], text: `< ~position [ ${prms.position} ] ~rotation[ ${prms.rotation} ] ~scale ${prms.scale} >`, };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                interp.stack.push({ type: "unityObject", value: idList[0] });
            },
    },
    charge: {
        parameters:
        {
            scale: { type: "numberOrVector3", defaultValue: "2" },
            position: { type: "vector3", defaultValue: "0 0 0" },
            rotation: { type: "vector3", defaultValue: "0 0 0" },
            color1: { type: "color", defaultValue: "1.0 0.5 0.0 1.0" }, // core smoke
            color2: { type: "color", defaultValue: "1.0 0.5 0.0 1.0" }, // trail
            color3: { type: "color", defaultValue: "0.25 0.125 0.0 1.0" }, // black
            color4: { type: "color", defaultValue: "1.0 0.8 0.6 1.0" }, // dot
            interval: { type: "number", defaultValue: "2" },
        },
        converter:
            (prms, prmfgs) => {
                const position = prmfgs.position ? " ~position [ " + prms.position + " ]" : "";
                const rotation = prmfgs.rotation ? " ~rotation [ " + prms.rotation + " ]" : "";
                const color1 = prms.color1.split(" ").slice(0, 3).join(" ");
                const color2 = prms.color2.split(" ").slice(0, 3).join(" ");
                const color3 = prms.color3.split(" ").slice(0, 3).join(" ");
                const color4 = prms.color4.split(" ").slice(0, 3).join(" ");
                return `{ dict begin ~root < ~shape (empty) > spawnobj ~setMagic { ~magic $preset magicactivate $magic $root attachtoparent } def ~preset < ~main < ~duration ${prms.interval} ~startLifetime 1 ~startSpeed 0 ~startColor [ ${color2} 1 ] > ~emission < ~rateOverTime 0 ~bursts [<~count 20>] > ~shape < ~shape (Sphere) ~radius 4 ~radiusThickness 0.2 > ~velocityOverLifetime < ~orbitalY [ [ 0 0 ] [ 1 15 ] ] ~radial -5 > ~colorOverLifetime < ~gradient < ~alphaKeys [ [ 0.0 0.0 ] [ 0.2 1.0 ] [ 1.0 1.0 ] ] > > ~trails < ~lifetime [ 0.1 0.2 ] ~minVertexDistance 0.1 ~sizeAffectsWidth false ~widthOverTrail [ [ 0 0.05 ] [ 1 0 ] ] > ~renderer < ~renderMode (None) ~trailMaterialName (Smoke_2) > > def $setMagic { $preset dup dup dup ~main get ~startColor [ ${color3} 1 ] put ~emission get ~bursts [<~count 8>] put ~trails get ~widthOverTrail [ [ 0 0.15 ] [ 1 0.02 ] ] put ~renderer get ~shader (alphablended) put } exec $setMagic { $preset ~main get dup dup ~startLifetime [ 0.7 1 ] put ~startSize [ 0.2 0.3 ] put ~startColor [ ${color4} 1 ] put $preset ~emission get ~bursts [<~count 20>] put $preset ~velocityOverLifetime < ~orbitalY [ [ 0 0 ] [ 1 10 ] ] ~radial [ -2 -3 ] > put $preset ~colorOverLifetime get ~gradient get ~alphaKeys [ [ 0 0 ] [ 0.2 1 ] [ 0.8 1 ] [ 1 0 ] ] put $preset ~trails get ~enabled false put $preset ~renderer < ~materialName (Cross) > put } exec $setMagic { $preset ~main get dup dup ~startSize [ 2 3 ] put ~startRotation [ 0 360 ] put ~startColor [ ${color1} 0.1 ] put $preset ~emission get ~bursts [<~count 100>] put $preset ~velocityOverLifetime < ~orbitalY [ [ 0 1 ] [ 1 20 ] ] ~radial -5 > put $preset ~colorOverLifetime get ~gradient get ~alphaKeys [ [ 0 0 ] [ 1 0.5 ] ] put $preset ~sizeOverLifetime < ~size [ [ 0 1 ] [ 0.5 1 ] [ 1 0 ] ] > put $preset ~renderer < ~materialName (Smoke_2) > put } exec $setMagic { $preset ~main get ~startColor [ ${color1} 0.05 ] put $preset ~renderer get dup ~shader (alphablended) put ~sortingFudge 10 put } exec $setMagic ~preset < ~main < ~duration ${prms.interval} ~startDelay 0.2 ~startLifetime 1 ~startSpeed 0 ~startSize 1.5 ~startColor [ ${color1} 1 ] > ~emission < ~rateOverTime 0 ~bursts [<~count 5>] > ~sizeOverLifetime < ~size [ [ 0 0 ] [ 0.3 0.6 ] [ 0.7 1 ] [ 1 0 ] ] > ~renderer < ~materialName (Grow_1) > > def $setMagic { $preset ~main get ~startColor [ ${color1} 1 ] put $preset ~renderer get dup ~shader (alphablended) put ~sortingFudge 10 put } exec $setMagic $root <${position}${rotation} ~scale ${prms.scale} > transform $root end}`;
            },
        invalidVariableNames:
            ["root", "setMagic", "magic", "preset"],
        execute:
            (prms) => {
                const interp = activeInterpreter;
                const idList = [];
                for (let i = 0; i < 8; i++) idList.push(interp.generateUUID());
                let data;

                data = { message: "CreateObject", id: idList[0], text: "< ~shape (empty) >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[1], text: "< ~main < ~duration 2 ~startLifetime 1 ~startSpeed 0 ~startColor [ 1 0.5 0 1 ] > ~emission < ~rateOverTime 0 ~burstCount 20 > ~shape < ~shape (Sphere) ~radius 4 ~radiusThickness 0.2 > ~velocityOverLifetime < ~orbitalY [ [ 0 0 ] [ 1 15 ] ] ~radial -5 > ~colorOverLifetime < ~gradient < ~alphaKeys [ [ 0 0 ] [ 0.2 1 ] [ 1 1 ] ] > > ~trails < ~lifetime [ 0.1 0.2 ] ~minVertexDistance 0.1 ~sizeAffectsWidth false ~widthOverTrail [ [ 0 0.05 ] [ 1 0 ] ] > ~renderer < ~renderMode (None) ~trailMaterialName (Smoke_2) > >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[1], text: idList[0] };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[2], text: "< ~main < ~duration 2 ~startLifetime 1 ~startSpeed 0 ~startColor [ 0.25 0.2 0 1 ] > ~emission < ~rateOverTime 0 ~burstCount 8 > ~shape < ~shape (Sphere) ~radius 4 ~radiusThickness 0.2 > ~velocityOverLifetime < ~orbitalY [ [ 0 0 ] [ 1 15 ] ] ~radial -5 > ~colorOverLifetime < ~gradient < ~alphaKeys [ [ 0 0 ] [ 0.2 1 ] [ 1 1 ] ] > > ~trails < ~lifetime [ 0.1 0.2 ] ~minVertexDistance 0.1 ~sizeAffectsWidth false ~widthOverTrail [ [ 0 0.15 ] [ 1 0.02 ] ] > ~renderer < ~renderMode (None) ~trailMaterialName (Smoke_2) ~shader (alphablended) > >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[2], text: idList[0] };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[3], text: "< ~main < ~duration 2 ~startLifetime [ 0.7 1 ] ~startSpeed 0 ~startColor [ 1 0.8 0.6 1 ] ~startSize [ 0.2 0.3 ] > ~emission < ~rateOverTime 0 ~burstCount 20 > ~shape < ~shape (Sphere) ~radius 4 ~radiusThickness 0.2 > ~velocityOverLifetime < ~orbitalY [ [ 0 0 ] [ 1 10 ] ] ~radial [ -2 -3 ] > ~colorOverLifetime < ~gradient < ~alphaKeys [ [ 0 0 ] [ 0.2 1 ] [ 0.8 1 ] [ 1 0 ] ] > > ~trails < ~lifetime [ 0.1 0.2 ] ~minVertexDistance 0.1 ~sizeAffectsWidth false ~widthOverTrail [ [ 0 0.15 ] [ 1 0.02 ] ] ~enabled false > ~renderer < ~materialName (Cross) > >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[3], text: idList[0] };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[4], text: "< ~main < ~duration 2 ~startLifetime [ 0.7 1 ] ~startSpeed 0 ~startColor [ 1 0.5 0 0.1 ] ~startSize [ 2 3 ] ~startRotation [ 0 360 ] > ~emission < ~rateOverTime 0 ~burstCount 100 > ~shape < ~shape (Sphere) ~radius 4 ~radiusThickness 0.2 > ~velocityOverLifetime < ~orbitalY [ [ 0 1 ] [ 1 20 ] ] ~radial -5 > ~colorOverLifetime < ~gradient < ~alphaKeys [ [ 0 0 ] [ 1 0.5 ] ] > > ~trails < ~lifetime [ 0.1 0.2 ] ~minVertexDistance 0.1 ~sizeAffectsWidth false ~widthOverTrail [ [ 0 0.15 ] [ 1 0.02 ] ] ~enabled false > ~renderer < ~materialName (Smoke_2) > ~sizeOverLifetime < ~size [ [ 0 1 ] [ 0.5 1 ] [ 1 0 ] ] > >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[4], text: idList[0] };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[5], text: "< ~main < ~duration 2 ~startLifetime [ 0.7 1 ] ~startSpeed 0 ~startColor [ 1 0.5 0 0.05 ] ~startSize [ 2 3 ] ~startRotation [ 0 360 ] > ~emission < ~rateOverTime 0 ~burstCount 100 > ~shape < ~shape (Sphere) ~radius 4 ~radiusThickness 0.2 > ~velocityOverLifetime < ~orbitalY [ [ 0 1 ] [ 1 20 ] ] ~radial -5 > ~colorOverLifetime < ~gradient < ~alphaKeys [ [ 0 0 ] [ 1 0.5 ] ] > > ~trails < ~lifetime [ 0.1 0.2 ] ~minVertexDistance 0.1 ~sizeAffectsWidth false ~widthOverTrail [ [ 0 0.15 ] [ 1 0.02 ] ] ~enabled false > ~renderer < ~materialName (Smoke_2) ~shader (alphablended) ~sortingFudge 10 > ~sizeOverLifetime < ~size [ [ 0 1 ] [ 0.5 1 ] [ 1 0 ] ] > >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[5], text: idList[0] };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[6], text: "< ~main < ~duration 2 ~startDelay 0.2 ~startLifetime 1 ~startSpeed 0 ~startSize 1.5 ~startColor [ 1 0.5 0 1 ] > ~emission < ~rateOverTime 0 ~burstCount 5 > ~sizeOverLifetime < ~size [ [ 0 0 ] [ 0.3 0.6 ] [ 0.7 1 ] [ 1 0 ] ] > ~renderer < ~materialName (Grow_1) > >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[6], text: idList[0] };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[7], text: "< ~main < ~duration 2 ~startDelay 0.2 ~startLifetime 1 ~startSpeed 0 ~startSize 1.5 ~startColor [ 0.5 0.3 0 1 ] > ~emission < ~rateOverTime 0 ~burstCount 5 > ~sizeOverLifetime < ~size [ [ 0 0 ] [ 0.3 0.6 ] [ 0.7 1 ] [ 1 0 ] ] > ~renderer < ~materialName (Grow_1) ~shader (alphablended) ~sortingFudge 10 > >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[7], text: idList[0] };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "TransformObject", id: idList[0], text: "< ~scale 1 >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                interp.stack.push({ type: "unityObject", value: idList[0] });
            },
    },
    barrier: {
        parameters: {
            scale: { type: "numberOrVector3", defaultValue: "1" },
            position: { type: "vector3", defaultValue: "0 0 0" },
            rotation: { type: "vector3", defaultValue: "0 0 0" },
        },
        converter: // 入力されたパラメータからコードに変換する変換器
            (prms, prmfgs) => {
                // scale, position, rotationを反映するように修正
                return `{ dict begin ~root < ~shape (empty) > spawnobj ~setMagic { ~magic $preset magicactivate $magic $root attachtoparent } def ~preset < ~main < ~startLifetime 2 ~startSpeed 0 ~startSize 100 ~startRotation < ~x [ 0 360 ] ~y [ 0 360 ] ~z [ 0 360 ] > ~startColor [ 0.4 0.8 1 1 ] > ~emission < ~rateOverTime 2 > ~colorOverLifetime < ~gradient < ~alphaKeys [ [ 0.0 0.0 ] [ 0.3 1.0 ] [ 1.0 0.0 ] ] > > ~customData < ~x 0.2 ~y 0.2 ~z 0.85 ~w 0.35 > ~renderer < ~renderMode (Mesh) ~meshes (Sphere_1) ~material < ~texture (Smoke_4) ~shader (Aura) > ~alignment (Local) > > def $setMagic $magic < ~position [ 0 0.7 0 ] > transform { $preset ~customData < ~x 0.2 ~y 0.2 ~z 2.8 ~w 1 > put $preset ~renderer get ~material < ~shader (Aura) > put } exec $setMagic $magic < ~position [ 0 0.7 0 ] > transform { $preset ~main get ~startRotation < ~y [ 0 360 ] > put $preset ~sizeOverLifetime < ~size [ [ 0 0.5 ] [ 1 1 ] ] > put $preset ~customData < ~x -0.3 ~y [ -0.3 0.3 ] ~z 0.8 ~w 0.35 > put $preset ~renderer get dup ~meshes (Ring_1) put ~material < ~texture (Smoke_4) ~shader (Aura) > put } exec $setMagic $root < ~position [ ${prms.position} ] ~rotation [ ${prms.rotation} ] ~scale ${prms.scale} > transform $root end }`;
            },
        invalidVariableNames: // 入れてほしくない変数
            ["root", "setMagic", "magic", "preset"],
        execute:
            (prms) => {
                const interp = activeInterpreter;
                const idList = [];
                for (let i = 0; i < 4; i++) idList.push(interp.generateUUID());
                let data;

                data = { message: "CreateObject", id: idList[0], text: "< ~shape (empty) >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[1], text: "< ~main < ~startLifetime 2 ~startSpeed 0 ~startSize 100 ~startRotation < ~x [ 0 360 ] ~y [ 0 360 ] ~z [ 0 360 ] > ~startColor [ 0.4 0.8 1 1 ] > ~emission < ~rateOverTime 2 > ~colorOverLifetime < ~gradient < ~alphaKeys [ [ 0 0 ] [ 0.3 1 ] [ 1 0 ] ] > > ~customData < ~x 0.2 ~y 0.2 ~z 0.85 ~w 0.35 > ~renderer < ~renderMode (Mesh) ~meshes (Sphere_1) ~material < ~texture (Smoke_4) ~shader (Aura) > ~alignment (Local) > >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[1], text: idList[0] };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "TransformObject", id: idList[1], text: "< ~position [ 0 0.7 0 ] >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[2], text: "< ~main < ~startLifetime 2 ~startSpeed 0 ~startSize 100 ~startRotation < ~x [ 0 360 ] ~y [ 0 360 ] ~z [ 0 360 ] > ~startColor [ 0.4 0.8 1 1 ] > ~emission < ~rateOverTime 2 > ~colorOverLifetime < ~gradient < ~alphaKeys [ [ 0 0 ] [ 0.3 1 ] [ 1 0 ] ] > > ~customData < ~x 0.2 ~y 0.2 ~z 2.8 ~w 1 > ~renderer < ~renderMode (Mesh) ~meshes (Sphere_1) ~material < ~shader (Aura) > ~alignment (Local) > >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[2], text: idList[0] };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "TransformObject", id: idList[2], text: "< ~position [ 0 0.7 0 ] >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "MagicSpell", id: idList[3], text: "< ~main < ~startLifetime 2 ~startSpeed 0 ~startSize 100 ~startRotation < ~y [ 0 360 ] > ~startColor [ 0.4 0.8 1 1 ] > ~emission < ~rateOverTime 2 > ~colorOverLifetime < ~gradient < ~alphaKeys [ [ 0 0 ] [ 0.3 1 ] [ 1 0 ] ] > > ~customData < ~x -0.3 ~y [ -0.3 0.3 ] ~z 0.8 ~w 0.35 > ~renderer < ~renderMode (Mesh) ~meshes (Ring_1) ~material < ~texture (Smoke_4) ~shader (Aura) > ~alignment (Local) > ~sizeOverLifetime < ~size [ [ 0 0.5 ] [ 1 1 ] ] > >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);
                data = { message: "AttachToParent", id: idList[3], text: idList[0] };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                data = { message: "TransformObject", id: idList[0], text: "< ~scale 1 >" };
                sendJsonToUnity("JsReceiver", "ReceiveGeneralData", data);

                interp.stack.push({ type: "unityObject", value: idList[0] });
            },
    },
};


function ExecuteTemplateMagic(magic, values) {
    const prms = EvaluateParameters(magic, values);
    templateDatas[magic].execute(prms);
}

function GetTemplateSpell(magic) {
    return "{aaaa}";
}

function EvaluateParameters(magic, values) {
    const magicData = templateDatas[magic];
    let prms = Object.fromEntries(Object.entries(magicData.parameters).map(([key, value]) => [key, value.defaultValue]));
    for (let i = 0; i < values.length; i++) {
        const key = values[i];
        const val = values[i + 1];
        if (val == undefined) break;
        if (key.type != "name") continue;
        i++;
        let array = [];
        console.log([key, val]);
        switch (magicData.parameters[key.value].type) {
            case "number":
                if (val.type == "number")
                    prms[key.value] = val.value;
                break;
            case "vector3":
                if (val.type == "array") {

                    for (const item of val.value) {
                        if (item.type == "number")
                            array.push(item.value);
                    }
                    console.log(array);
                    prms[key.value] = array.slice(0, 3).join(" ");
                }
                break;
            case "numberOrVector3":
                if (val.type == "number") {
                    prms[key.value] = val.value;
                    break;
                }
                if (val.type == "array") {
                    for (const item of val.value) {
                        if (item.type == "number")
                            array.push(item.value);
                    }
                    prms[key.value] = "[ " + array.slice(0, 3).join(" ") + " ]";
                }
                break;
            case "color":
                if (val.type == "array") {

                    for (const item of val.value) {
                        if (item.type == "number")
                            array.push(item.value);
                    }
                    console.log(array);
                    prms[key.value] = array.slice(0, 4).join(" ");
                }
                break;
        }
    }
    return prms;
}
