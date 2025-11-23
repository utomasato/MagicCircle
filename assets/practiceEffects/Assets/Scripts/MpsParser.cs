using UnityEngine;
using System.Collections.Generic;
using System;
using System.Globalization;



/// <summary>
/// Transform情報を格納するための構造体。Nullable型を使い、指定されなかった項目は更新しないようにする。
/// </summary>
public struct TransformData
{
    public Vector3? position;
    public Vector3? rotation;
    public Vector3? scale;
}

/// <summary>
/// オブジェクト生成情報を格納するための構造体
/// </summary>
public struct ObjectCreationData
{
    public string objectType;
}


[System.Serializable]
public class AnimationDatas
{
    public bool isActive_pos = false;
    public bool isActive_rot = false;
    public bool isActive_scale = false;
    public AnimationData posAnimData;
    public AnimationData rotAnimData;
    public AnimationData scaleAnimData;
}

[System.Serializable]
public class AnimationData
{
    public Vector3 from = Vector3.zero;
    public Vector3 to = Vector3.zero;
    public float duration = 1000;
    public bool loop = false;
    public bool reverse = false;
    public bool easeIn = false;
    public bool easeOut = false;
}


/// <summary>
/// p5.jsから送られてくるmpsコードを解析し、ParticlePresetオブジェクトに変換する静的クラスです。
/// </summary>
public static class MpsParser
{
    // 文字列をトークン単位で読み進めるためのヘルパークラス
    private class Scanner
    {
        private readonly string[] _tokens;
        private int _position;

        public Scanner(string text)
        {
            text = text.Replace("<", " < ")
                       .Replace(">", " > ")
                       .Replace("[", " [ ")
                       .Replace("]", " ] ")
                       .Replace("(", " ( ")
                       .Replace(")", " ) ")
                       .Replace("~", " ~");
            _tokens = text.Split(new[] { ' ', '\t', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
            _position = 0;
        }

        public string Peek() => _position < _tokens.Length ? _tokens[_position] : null;
        public string Consume() => _position < _tokens.Length ? _tokens[_position++] : null;
        public void Expect(string token)
        {
            var consumed = Consume();
            if (consumed != token)
                throw new Exception($"Parse Error: Expected '{token}' but got '{consumed}'.");
        }

        /// <summary>
        /// トークンをfloatとして消費します。パースに失敗した場合は警告を出し、0.0fを返します。
        /// </summary>
        public float ConsumeFloat()
        {
            string token = Consume();
            if (token == null) // コードの終端に達した場合
            {
                Debug.LogWarning($"Parse Warning: Expected a number (float) but reached end of code. Defaulting to 0.0f.");
                return 0.0f;
            }

            if (float.TryParse(token, NumberStyles.Float, CultureInfo.InvariantCulture, out float result))
            {
                return result;
            }
            else
            {
                Debug.LogWarning($"Parse Warning: Expected a number (float) but got '{token}'. Defaulting to 0.0f.");
                return 0.0f; // デフォルト値を返す
            }
        }

        /// <summary>
        /// トークンをboolとして消費します。パースに失敗した場合は警告を出し、falseを返します。
        /// </summary>
        public bool ConsumeBool()
        {
            string token = Consume();
            if (token == null) // コードの終端に達した場合
            {
                Debug.LogWarning($"Parse Warning: Expected a boolean (true/false) but reached end of code. Defaulting to false.");
                return false;
            }

            if (bool.TryParse(token, out bool result))
            {
                return result;
            }
            else
            {
                Debug.LogWarning($"Parse Warning: Expected a boolean (true/false) but got '{token}'. Defaulting to false.");
                return false; // デフォルト値を返す
            }
        }

        /// <summary>
        /// '(' から ')' までのトークンを連結して1つの文字列として消費します。スペースを含む文字列に対応します。
        /// </summary>
        public string ConsumeStringInParens()
        {
            Expect("(");
            string content = "";
            while (Peek() != null && Peek() != ")")
            {
                content += Consume() + " ";
            }
            Expect(")");
            return content.Trim();
        }
    }
    /// <summary>
    /// オブジェクト生成用のmpsコードを解析します。
    /// </summary>
    public static ObjectCreationData ParseObjectCreation(string mpsCode)
    {
        var scanner = new Scanner(mpsCode);
        var data = new ObjectCreationData();

        scanner.Expect("<");
        while (scanner.Peek() != null && scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1); // '~' を取り除く
            switch (key)
            {
                case "shape":
                    data.objectType = scanner.ConsumeStringInParens();
                    break;
                default:
                    Debug.LogWarning($"Unknown object creation key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner); // このキーの値をスキップ
                    break;
            }
        }
        scanner.Expect(">");

        return data;
    }

    /// <summary>
    /// Transform情報（位置、回転、スケール）のmpsコードを解析します。
    /// </summary>
    public static TransformData ParseTransform(string transformCode)
    {
        var scanner = new Scanner(transformCode);
        var data = new TransformData();

        scanner.Expect("<");
        while (scanner.Peek() != null && scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1); // '~' を取り除く
            switch (key)
            {
                case "position":
                    data.position = ParseVector3(scanner);
                    break;
                case "rotation":
                    data.rotation = ParseVector3(scanner);
                    break;
                case "scale":
                    //data.scale = ParseVector3(scanner);
                    if (scanner.Peek() == "[")
                    {
                        data.scale = ParseVector3(scanner);
                    }
                    else
                    {
                        float x = scanner.ConsumeFloat();
                        data.scale = new Vector3(x, x, x);
                    }
                    break;
                default:
                    Debug.LogWarning($"Unknown transform key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner); // このキーの値をスキップ
                    break;
            }
        }
        scanner.Expect(">");

        return data;
    }

    private static Vector3 ParseVector3(Scanner scanner)
    {
        scanner.Expect("[");
        var x = scanner.ConsumeFloat();
        var y = scanner.ConsumeFloat();
        var z = scanner.ConsumeFloat();
        scanner.Expect("]");
        return new Vector3(x, y, z);
    }

    /// <summary>
    /// Animation情報（位置、回転、スケール）のmpsコードを解析します。
    /// </summary>
    public static AnimationDatas ParseAnimation(string animationCode)
    {
        var scanner = new Scanner(animationCode);
        var data = new AnimationDatas();

        scanner.Expect("<");
        while (scanner.Peek() != null && scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1); // '~' を取り除く
            switch (key)
            {
                case "position":
                    scanner.Expect("<");
                    data.isActive_pos = true;
                    data.posAnimData = ParseAnimElement(scanner);
                    scanner.Expect(">");
                    break;
                case "rotate":
                    scanner.Expect("<");
                    data.isActive_rot = true;
                    data.rotAnimData = ParseAnimElement(scanner);
                    scanner.Expect(">");
                    break;
                case "scale":
                    scanner.Expect("<");
                    data.isActive_scale = true;
                    data.scaleAnimData = ParseAnimElement(scanner);
                    scanner.Expect(">");
                    break;
                default:
                    Debug.LogWarning($"Unknown animation key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner); // このキーの値をスキップ
                    break;
            }
        }
        scanner.Expect(">");

        return data;
    }

    private static AnimationData ParseAnimElement(Scanner scanner)
    {
        // scanner.Expect("<"); // 呼び出し元で < を消費するように変更
        var animData = new AnimationData();
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "from": animData.from = ParseVector3(scanner); break;
                case "to": animData.to = ParseVector3(scanner); break;
                case "duration": animData.duration = scanner.ConsumeFloat(); break;
                case "loop": animData.loop = scanner.ConsumeBool(); break;
                case "reverse": animData.reverse = scanner.ConsumeBool(); break;
                case "easeIn": animData.easeIn = scanner.ConsumeBool(); break;
                case "easeOut": animData.easeOut = scanner.ConsumeBool(); break;
                default:
                    Debug.LogWarning($"Unknown animation module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner); // このキーの値をスキップ
                    break;
            }
        }
        // scanner.Expect(">"); // 呼び出し元で > を消費
        return animData;
    }


    /// <summary>
    /// mpsコード文字列をParticlePresetオブジェクトに変換するメイン関数
    /// </summary>
    public static ParticlePreset Parse(string mpsCode, Dictionary<string, Material> materialDict, Dictionary<string, Mesh> meshDict)
    {
        var scanner = new Scanner(mpsCode);
        var preset = new ParticlePreset();

        scanner.Expect("<");
        ParseObjectContent(scanner, preset, materialDict, meshDict);
        scanner.Expect(">");

        return preset;
    }

    // オブジェクト '<' ... '>' の中身を解析
    private static void ParseObjectContent(Scanner scanner, ParticlePreset preset, Dictionary<string, Material> materialDict, Dictionary<string, Mesh> meshDict)
    {
        while (scanner.Peek() != null && scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            scanner.Expect("<");

            switch (key)
            {
                case "main": preset.main = ParseMainModule(scanner); break;
                case "emission": preset.emission = ParseEmissionModule(scanner); break;
                case "shape": preset.shape = ParseShapeModule(scanner); break;
                case "velocityOverLifetime": preset.velocityOverLifetime = ParseVelocityOverLifetimeModule(scanner); break;
                case "limitVelocityOverLifetime": preset.limitVelocityOverLifetime = ParseLimitVelocityOverLifetimeModule(scanner); break;
                case "inheritVelocity": preset.inheritVelocity = ParseInheritVelocityModule(scanner); break;
                case "forceOverLifetime": preset.forceOverLifetime = ParseForceOverLifetimeModule(scanner); break;
                case "colorOverLifetime": preset.colorOverLifetime = ParseColorOverLifetimeModule(scanner); break;
                case "colorBySpeed": preset.colorBySpeed = ParseColorBySpeedModule(scanner); break;
                case "sizeOverLifetime": preset.sizeOverLifetime = ParseSizeOverLifetimeModule(scanner); break;
                case "sizeBySpeed": preset.sizeBySpeed = ParseSizeBySpeedModule(scanner); break;
                case "rotationOverLifetime": preset.rotationOverLifetime = ParseRotationOverLifetimeModule(scanner); break;
                case "rotationBySpeed": preset.rotationBySpeed = ParseRotationBySpeedModule(scanner); break;
                case "externalForces": preset.externalForces = ParseExternalForcesModule(scanner); break;
                case "noise": preset.noise = ParseNoiseModule(scanner); break;
                case "collision": preset.collision = ParseCollisionModule(scanner); break;
                case "triggers": preset.triggers = new TriggersModuleData { enabled = true }; SkipModuleContent(scanner); break; // triggersは中身をパースしない
                case "subEmitters": preset.subEmitters = new SubEmittersModuleData { enabled = true }; SkipModuleContent(scanner); break; // 同上
                case "textureSheetAnimation": preset.textureSheetAnimation = ParseTextureSheetAnimationModule(scanner); break;
                case "lights": preset.lights = new LightsModuleData { enabled = true }; SkipModuleContent(scanner); break; // 同上
                case "trails": preset.trails = ParseTrailsModule(scanner); break;
                case "customData": preset.customData = new CustomDataModuleData { enabled = true }; SkipModuleContent(scanner); break; // 同上
                case "renderer": preset.renderer = ParseRendererModule(scanner, materialDict, meshDict); break;
                default:
                    // 例外をスローせず、警告を出して不明なモジュールをスキップする
                    Debug.LogWarning($"Unknown MPS module key: '~{key}'. Skipping this module.");
                    SkipModuleContent(scanner); // このモジュールの < ... > の中身を読み飛ばす
                    break;
            }
            scanner.Expect(">");
        }
    }

    /// <summary>
    /// 不明なキーに続く値を安全に読み飛ばします。
    /// 値がブロック（<...> or [...] or (...)）の場合はそれを読み飛ばし、
    /// 単一の値（数値や文字列）の場合はそれを1つ消費します。
    /// </summary>
    private static void SkipUnknownValue(Scanner scanner)
    {
        string next = scanner.Peek();
        if (next == "<")
        {
            scanner.Consume(); // < を消費
            SkipModuleContent(scanner);
            scanner.Consume(); // > を消費
        }
        else if (next == "[")
        {
            scanner.Consume(); // [ を消費
            SkipBracketContent(scanner); // [ ... ] の中身を読み飛ばす
            scanner.Consume(); // ] を消費
        }
        else if (next == "(")
        {
            scanner.Consume(); // ( を消費
            while (scanner.Peek() != null && scanner.Peek() != ")")
            {
                scanner.Consume(); // ( ... ) の中身を読み飛ばす
            }
            scanner.Consume(); // ) を消費
        }
        else
        {
            // 単一の値（数値、true/falseなど）
            scanner.Consume();
        }
    }

    /// <summary>
    /// 不明なモジュールの内容 < ... > を安全に読み飛ばします。
    /// '<' を読み取った直後から呼び出され、
    /// 対応する '>' の直前まで読み進めます（ネストされた < > にも対応）。
    /// </summary>
    private static void SkipModuleContent(Scanner scanner)
    {
        int depth = 0;
        while (scanner.Peek() != null)
        {
            string token = scanner.Peek();

            if (token == "<")
            {
                depth++;
            }
            else if (token == ">")
            {
                if (depth == 0)
                {
                    // 探していた閉じタグ '>' を見つけた
                    // この '>' は switch 文の外側にある Expect(">"); で消費されるため、ここでは消費しない
                    return;
                }
                depth--;
            }

            // トークンを消費して次に進む
            scanner.Consume();
        }
        Debug.LogWarning("Parse Error: Reached end of code while skipping module. Missing '>'.");
    }

    /// <summary>
    /// 不明な配列 [ ... ] の内容を安全に読み飛ばします。
    /// </summary>
    private static void SkipBracketContent(Scanner scanner)
    {
        int depth = 0;
        while (scanner.Peek() != null)
        {
            string token = scanner.Peek();
            if (token == "[")
            {
                depth++;
            }
            else if (token == "]")
            {
                if (depth == 0)
                {
                    return; // 閉じる ] を見つけた
                }
                depth--;
            }
            scanner.Consume();
        }
        Debug.LogWarning("Parse Error: Reached end of code while skipping bracket content. Missing ']'.");
    }


    private static MainModuleData ParseMainModule(Scanner scanner)
    {
        var main = new MainModuleData();
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "duration": main.duration = scanner.ConsumeFloat(); break;
                case "startDelay": main.startDelay = ParseMinMaxCurveOrConstant(scanner); break;
                case "startLifetime": main.startLifetime = ParseMinMaxCurveOrConstant(scanner); break;
                case "startSpeed": main.startSpeed = ParseMinMaxCurveOrConstant(scanner); break;
                case "startSize3D": main.startSize3D = scanner.ConsumeBool(); break;
                case "startSize":
                    if (scanner.Peek() == "[")
                    {
                        scanner.Consume(); // 最初の'['を消費
                        if (scanner.Peek() == "[")
                        {
                            // 3Dレンジ形式: [[minX maxX] [minY maxY] [minZ maxZ]]
                            // または 3Dカーブ形式: [[curveX] [curveY] [curveZ]]
                            main.startSize3D = true;
                            main.startSizeX = ParseMinMaxCurve(scanner);
                            main.startSizeY = ParseMinMaxCurve(scanner);
                            main.startSizeZ = ParseMinMaxCurve(scanner);
                            scanner.Expect("]"); // 最後の']'を消費
                        }
                        else
                        {
                            // 1Dレンジ [min max] または 3D固定 [x y z]
                            var values = new List<float>();
                            while (scanner.Peek() != "]" && scanner.Peek() != null)
                            {
                                values.Add(scanner.ConsumeFloat());
                            }
                            scanner.Expect("]"); // 最後の']'を消費

                            if (values.Count == 2)
                            {
                                // 1Dレンジ
                                main.startSize3D = false;
                                main.startSize = new MinMaxCurveData { min = values[0], max = values[1] };
                            }
                            else if (values.Count == 3)
                            {
                                // 3D固定
                                main.startSize3D = true;
                                main.startSizeX = new MinMaxCurveData { min = values[0], max = values[0] };
                                main.startSizeY = new MinMaxCurveData { min = values[1], max = values[1] };
                                main.startSizeZ = new MinMaxCurveData { min = values[2], max = values[2] };
                            }
                            else
                            {
                                // 値の数が不正だが、パーサー位置は修正済みなので続行可能
                                Debug.LogWarning($"Invalid number of arguments for startSize. Expected 2 or 3, but got {values.Count}. Skipping.");
                            }
                        }
                    }
                    else
                    {
                        // 定数
                        main.startSize3D = false;
                        float value = scanner.ConsumeFloat();
                        main.startSize = new MinMaxCurveData { min = value, max = value };
                    }
                    break;
                case "startRotation": main.startRotation = ParseMinMaxCurveOrConstant(scanner); break;
                case "startColor":
                    if (scanner.Peek() == "[") // 単色 [r g b a] を期待
                    {
                        // 【修正】 安全に配列の中身を読み取る
                        scanner.Expect("[");
                        List<float> values = new List<float>();
                        while (scanner.Peek() != "]" && scanner.Peek() != null)
                        {
                            values.Add(scanner.ConsumeFloat());
                        }
                        scanner.Expect("]");

                        if (values.Count == 4)
                        {
                            float r = values[0];
                            float g = values[1];
                            float b = values[2];
                            float a = values[3];
                            var singleColor = new Color(r, g, b, a);

                            // 単色をシンプルなグラデーションとして表現
                            main.startColor = new GradientData();
                            main.startColor.colorKeys.Add(new ColorKeyData { color = singleColor, time = 0.0f });
                            main.startColor.alphaKeys.Add(new AlphaKeyData { alpha = singleColor.a, time = 0.0f });
                        }
                        else
                        {
                            // 要素数が合わない場合は警告を出してスキップ（パーサーは既に ']' を消費して復帰している）
                            Debug.LogWarning($"Parse Warning: 'startColor' expects 4 values [r g b a], but got {values.Count}. Skipping.");
                        }
                    }
                    else // グラデーション < ... >
                    {
                        main.startColor = ParseGradient(scanner);
                    }
                    break;
                case "simulationSpace":
                    string spaceStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(spaceStr, true, out ParticleSystemSimulationSpace space))
                    {
                        main.simulationSpace = space;
                    }
                    else
                    {
                        Debug.LogWarning($"Unknown simulation space '{spaceStr}'. Defaulting to Local.");
                        main.simulationSpace = ParticleSystemSimulationSpace.Local;
                    }
                    break;
                default:
                    Debug.LogWarning($"Unknown main module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return main;
    }

    private static EmissionModuleData ParseEmissionModule(Scanner scanner)
    {
        var emission = new EmissionModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled":
                    emission.enabled = scanner.ConsumeBool();
                    break;
                case "rateOverTime":
                    emission.rateOverTime = ParseMinMaxCurveOrConstant(scanner);
                    break;
                case "burstCount":
                    var curve = ParseMinMaxCurveOrConstant(scanner);
                    emission.minBurstCount = (int)curve.min;
                    emission.maxBurstCount = (int)curve.max;
                    break;
                default:
                    Debug.LogWarning($"Unknown emission module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return emission;
    }

    private static ShapeModuleData ParseShapeModule(Scanner scanner)
    {
        var shape = new ShapeModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled":
                    shape.enabled = scanner.ConsumeBool();
                    break;
                case "shape":
                    string shapeTypeStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(shapeTypeStr, true, out ParticleSystemShapeType shapeType))
                    {
                        shape.shapeType = shapeType;
                    }
                    else
                    {
                        Debug.LogWarning($"Unknown shape type '{shapeTypeStr}'. Defaulting to Cone.");
                        shape.shapeType = ParticleSystemShapeType.Cone;
                    }
                    break;
                case "angle": shape.angle = scanner.ConsumeFloat(); break;
                case "radius": shape.radius = scanner.ConsumeFloat(); break;
                case "radiusThickness": shape.radiusThickness = scanner.ConsumeFloat(); break;
                default:
                    Debug.LogWarning($"Unknown shape module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return shape;
    }

    private static ColorOverLifetimeModuleData ParseColorOverLifetimeModule(Scanner scanner)
    {
        var col = new ColorOverLifetimeModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": col.enabled = scanner.ConsumeBool(); break;
                case "gradient": col.color = ParseGradient(scanner); break;
                default:
                    Debug.LogWarning($"Unknown colorOverLifetime module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return col;
    }

    private static RotationOverLifetimeModuleData ParseRotationOverLifetimeModule(Scanner scanner)
    {
        var rot = new RotationOverLifetimeModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": rot.enabled = scanner.ConsumeBool(); break;
                case "separateAxes": rot.separateAxes = scanner.ConsumeBool(); break;
                case "x": rot.x = ParseMinMaxCurveOrConstant(scanner); break;
                case "y": rot.y = ParseMinMaxCurveOrConstant(scanner); break;
                case "z": rot.z = ParseMinMaxCurveOrConstant(scanner); break;
                default:
                    Debug.LogWarning($"Unknown rotationOverLifetime module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return rot;
    }

    private static LimitVelocityOverLifetimeModuleData ParseLimitVelocityOverLifetimeModule(Scanner scanner)
    {
        var lvol = new LimitVelocityOverLifetimeModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": lvol.enabled = scanner.ConsumeBool(); break;
                case "limit": lvol.limit = ParseMinMaxCurveOrConstant(scanner); break;
                case "dampen": lvol.dampen = scanner.ConsumeFloat(); break;
                default:
                    Debug.LogWarning($"Unknown limitVelocityOverLifetime module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return lvol;
    }

    private static InheritVelocityModuleData ParseInheritVelocityModule(Scanner scanner)
    {
        var iv = new InheritVelocityModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": iv.enabled = scanner.ConsumeBool(); break;
                case "mode":
                    string modeStr = scanner.Consume();
                    if (Enum.TryParse(modeStr, true, out ParticleSystemInheritVelocityMode mode))
                        iv.mode = mode;
                    break;
                case "curve": iv.curve = ParseMinMaxCurveOrConstant(scanner); break;
                default:
                    Debug.LogWarning($"Unknown inheritVelocity module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return iv;
    }

    private static ColorBySpeedModuleData ParseColorBySpeedModule(Scanner scanner)
    {
        var cbs = new ColorBySpeedModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": cbs.enabled = scanner.ConsumeBool(); break;
                case "color": cbs.color = ParseGradient(scanner); break;
                case "range":
                    scanner.Expect("[");
                    cbs.range = new Vector2(scanner.ConsumeFloat(), scanner.ConsumeFloat());
                    scanner.Expect("]");
                    break;
                default:
                    Debug.LogWarning($"Unknown colorBySpeed module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return cbs;
    }

    private static SizeBySpeedModuleData ParseSizeBySpeedModule(Scanner scanner)
    {
        var sbs = new SizeBySpeedModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": sbs.enabled = scanner.ConsumeBool(); break;
                case "size": sbs.size = ParseMinMaxCurveOrConstant(scanner); break;
                case "range":
                    scanner.Expect("[");
                    sbs.range = new Vector2(scanner.ConsumeFloat(), scanner.ConsumeFloat());
                    scanner.Expect("]");
                    break;
                default:
                    Debug.LogWarning($"Unknown sizeBySpeed module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return sbs;
    }

    private static RotationBySpeedModuleData ParseRotationBySpeedModule(Scanner scanner)
    {
        var rbs = new RotationBySpeedModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": rbs.enabled = scanner.ConsumeBool(); break;
                case "z": rbs.z = ParseMinMaxCurveOrConstant(scanner); break;
                case "range":
                    scanner.Expect("[");
                    rbs.range = new Vector2(scanner.ConsumeFloat(), scanner.ConsumeFloat());
                    scanner.Expect("]");
                    break;
                default:
                    Debug.LogWarning($"Unknown rotationBySpeed module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return rbs;
    }

    private static ExternalForcesModuleData ParseExternalForcesModule(Scanner scanner)
    {
        var ef = new ExternalForcesModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": ef.enabled = scanner.ConsumeBool(); break;
                case "multiplier": ef.multiplier = ParseMinMaxCurveOrConstant(scanner); break;
                default:
                    Debug.LogWarning($"Unknown externalForces module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return ef;
    }

    private static CollisionModuleData ParseCollisionModule(Scanner scanner)
    {
        var collision = new CollisionModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": collision.enabled = scanner.ConsumeBool(); break;
                case "dampen": collision.dampen = ParseMinMaxCurveOrConstant(scanner); break;
                case "bounce": collision.bounce = ParseMinMaxCurveOrConstant(scanner); break;
                case "lifetimeLoss": collision.lifetimeLoss = ParseMinMaxCurveOrConstant(scanner); break;
                default:
                    Debug.LogWarning($"Unknown collision module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return collision;
    }

    private static VelocityOverLifetimeModuleData ParseVelocityOverLifetimeModule(Scanner scanner)
    {
        var vol = new VelocityOverLifetimeModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            // 以前の ConsumeStringInParens から標準的な ~key 形式に変更
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "x": vol.x = ParseMinMaxCurveOrConstant(scanner); break;
                case "y": vol.y = ParseMinMaxCurveOrConstant(scanner); break;
                case "z": vol.z = ParseMinMaxCurveOrConstant(scanner); break;

                case "space":
                    string spaceStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(spaceStr, true, out ParticleSystemSimulationSpace space))
                    {
                        vol.space = space;
                    }
                    else
                    {
                        Debug.LogWarning($"Unknown simulation space '{spaceStr}'. Defaulting to Local.");
                        vol.space = ParticleSystemSimulationSpace.Local;
                    }
                    break;

                case "orbitalX": vol.orbitalX = ParseMinMaxCurveOrConstant(scanner); break;
                case "orbitalY": vol.orbitalY = ParseMinMaxCurveOrConstant(scanner); break;
                case "orbitalZ": vol.orbitalZ = ParseMinMaxCurveOrConstant(scanner); break;

                // OffsetはVector3または個別指定に対応
                case "offset": vol.orbitalOffset = ParseVector3(scanner); break;
                case "offsetX": vol.orbitalOffset.x = scanner.ConsumeFloat(); break;
                case "offsetY": vol.orbitalOffset.y = scanner.ConsumeFloat(); break;
                case "offsetZ": vol.orbitalOffset.z = scanner.ConsumeFloat(); break;

                case "radial": vol.radial = ParseMinMaxCurveOrConstant(scanner); break;
                case "speedModifier": vol.speedModifier = ParseMinMaxCurveOrConstant(scanner); break;

                default:
                    Debug.LogWarning($"Unknown velocityOverLifetime key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return vol;
    }

    private static ForceOverLifetimeModuleData ParseForceOverLifetimeModule(Scanner scanner)
    {
        var fol = new ForceOverLifetimeModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string axis = scanner.ConsumeStringInParens();
            switch (axis)
            {
                case "x": fol.x = ParseMinMaxCurveOrConstant(scanner); break;
                case "y": fol.y = ParseMinMaxCurveOrConstant(scanner); break;
                case "z": fol.z = ParseMinMaxCurveOrConstant(scanner); break;
                default:
                    Debug.LogWarning($"Unknown forceOverLifetime axis: '{axis}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return fol;
    }

    private static NoiseModuleData ParseNoiseModule(Scanner scanner)
    {
        var noise = new NoiseModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": noise.enabled = scanner.ConsumeBool(); break;
                case "strength": noise.strength = ParseMinMaxCurveOrConstant(scanner); break;
                case "frequency": noise.frequency = scanner.ConsumeFloat(); break;
                case "scrollSpeed": noise.scrollSpeed = ParseMinMaxCurveOrConstant(scanner); break;
                default:
                    Debug.LogWarning($"Unknown noise module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return noise;
    }

    private static TextureSheetAnimationModuleData ParseTextureSheetAnimationModule(Scanner scanner)
    {
        var tsa = new TextureSheetAnimationModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": tsa.enabled = scanner.ConsumeBool(); break;
                case "tilesX": tsa.numTilesX = (int)scanner.ConsumeFloat(); break;
                case "tilesY": tsa.numTilesY = (int)scanner.ConsumeFloat(); break;
                case "frameOverTime": tsa.frameOverTime = ParseMinMaxCurveOrConstant(scanner); break;
                default:
                    Debug.LogWarning($"Unknown textureSheetAnimation module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return tsa;
    }

    private static TrailsModuleData ParseTrailsModule(Scanner scanner)
    {
        var trails = new TrailsModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled":
                    trails.enabled = scanner.ConsumeBool();
                    break;
                case "mode":
                    string modeStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(modeStr, true, out ParticleSystemTrailMode mode))
                        trails.mode = mode;
                    break;
                case "ratio":
                    trails.ratio = scanner.ConsumeFloat();
                    break;
                case "lifetime":
                    trails.lifetime = ParseMinMaxCurveOrConstant(scanner);
                    break;
                case "minVertexDistance":
                    trails.minVertexDistance = scanner.ConsumeFloat();
                    break;
                case "worldSpace":
                    trails.worldSpace = scanner.ConsumeBool();
                    break;
                case "dieWithParticles":
                    trails.dieWithParticles = scanner.ConsumeBool();
                    break;
                case "ribbonCount":
                    trails.ribbonCount = (int)scanner.ConsumeFloat();
                    break;
                case "splitSubEmitterRibbons":
                    trails.splitSubEmitterRibbons = scanner.ConsumeBool();
                    break;
                case "textureMode":
                    string texModeStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(texModeStr, true, out ParticleSystemTrailTextureMode texMode))
                        trails.textureMode = texMode;
                    break;
                case "sizeAffectsWidth":
                    trails.sizeAffectsWidth = scanner.ConsumeBool();
                    break;
                case "sizeAffectsLifetime":
                    trails.sizeAffectsLifetime = scanner.ConsumeBool();
                    break;
                case "inheritParticleColor":
                    trails.inheritParticleColor = scanner.ConsumeBool();
                    break;
                case "colorOverLifetime":
                    trails.colorOverLifetime = ParseGradient(scanner);
                    break;
                case "widthOverTrail":
                    trails.widthOverTrail = ParseMinMaxCurveOrConstant(scanner);
                    break;
                case "colorOverTrail":
                    trails.colorOverTrail = ParseGradient(scanner);
                    break;
                case "generateLightingData":
                    trails.generateLightingData = scanner.ConsumeBool();
                    break;
                default:
                    Debug.LogWarning($"Unknown trails module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return trails;
    }

    private static SizeOverLifetimeModuleData ParseSizeOverLifetimeModule(Scanner scanner)
    {
        var sol = new SizeOverLifetimeModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": sol.enabled = scanner.ConsumeBool(); break;
                // --- ▼▼▼ ここから修正: size入力の柔軟化（1D/3D対応） ▼▼▼ ---
                case "size":
                    if (scanner.Peek() == "[")
                    {
                        scanner.Consume(); // 最初の'['を消費

                        // 3Dまたは1Dの判断
                        // startSizeと同様に、リストの中身を確認して分岐する
                        // パターン:
                        // 1. [val val val] -> 3D定数
                        // 2. [val val] -> 1D MinMax
                        // 3. [[...]] -> 1Dカーブ または 3D MinMax/カーブ

                        // --- ケースA: 次がさらに '[' で始まる場合（カーブやMinMaxのリスト） ---
                        if (scanner.Peek() == "[")
                        {
                            // 要素を全て読み取ってから判断する
                            List<MinMaxCurveData> items = new List<MinMaxCurveData>();
                            while (scanner.Peek() == "[")
                            {
                                items.Add(ParseMinMaxCurve(scanner));
                            }
                            scanner.Expect("]"); // 外側の']'

                            if (items.Count == 3)
                            {
                                // 要素が3つある場合は3D (X, Y, Z) として扱う
                                sol.separateAxes = true;
                                sol.x = items[0];
                                sol.y = items[1];
                                sol.z = items[2];
                            }
                            else if (items.Count == 1)
                            {
                                // 要素が1つだけなら 1D Curve (MinMaxCurveDataそのもの)
                                sol.separateAxes = false;
                                sol.size = items[0];
                            }
                            else
                            {
                                // 要素数が2つなどの場合、これは 1D Curve のキーフレームリストを
                                // 誤って個別のMinMaxCurveDataとしてパースしてしまった可能性がある
                                // またはユーザーが誤った数のデータを渡したか

                                // ここでは、パースされた MinMaxCurveData (min, maxを持つ) を
                                // CurveData (Keys) に変換して 1D Curve として再構築する救済措置をとる
                                sol.separateAxes = false;
                                var curve = new CurveData();
                                foreach (var item in items)
                                {
                                    // ParseMinMaxCurve は [t v] を min=t, max=v として読み込んでいるはず
                                    curve.keys.Add(new KeyframeData { time = item.min, value = item.max });
                                }
                                sol.size = new MinMaxCurveData { curve = curve };
                            }
                        }
                        // --- ケースB: 次が数値の場合（定数リスト） ---
                        else
                        {
                            List<float> values = new List<float>();
                            while (scanner.Peek() != "]" && scanner.Peek() != null)
                            {
                                values.Add(scanner.ConsumeFloat());
                            }
                            scanner.Expect("]"); // 外側の']'

                            if (values.Count == 3)
                            {
                                // 3D 定数 [x y z]
                                sol.separateAxes = true;
                                sol.x = new MinMaxCurveData { min = values[0], max = values[0] };
                                sol.y = new MinMaxCurveData { min = values[1], max = values[1] };
                                sol.z = new MinMaxCurveData { min = values[2], max = values[2] };
                            }
                            else if (values.Count == 2)
                            {
                                // 1D MinMax [min max]
                                sol.separateAxes = false;
                                sol.size = new MinMaxCurveData { min = values[0], max = values[1] };
                            }
                            else if (values.Count == 1)
                            {
                                // 1D 定数 [val]
                                sol.separateAxes = false;
                                sol.size = new MinMaxCurveData { min = values[0], max = values[0] };
                            }
                            else
                            {
                                Debug.LogWarning($"Invalid number of arguments for sizeOverLifetime size. Expected 1, 2, or 3, but got {values.Count}.");
                            }
                        }
                    }
                    else
                    {
                        // 単一の数値（定数）
                        float val = scanner.ConsumeFloat();
                        sol.separateAxes = false;
                        sol.size = new MinMaxCurveData { min = val, max = val };
                    }
                    break;
                // --- ▲▲▲ ここまで修正 ▲▲▲ ---
                default:
                    Debug.LogWarning($"Unknown sizeOverLifetime module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return sol;
    }

    private static RendererModuleData ParseRendererModule(Scanner scanner, Dictionary<string, Material> materialDict, Dictionary<string, Mesh> meshDict)
    {
        var renderer = new RendererModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": renderer.enabled = scanner.ConsumeBool(); break;
                case "renderMode":
                    string renderModeStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(renderModeStr, true, out ParticleSystemRenderMode mode))
                    {
                        renderer.renderMode = mode;
                    }
                    else
                    {
                        Debug.LogWarning($"Unknown render mode '{renderModeStr}'. Defaulting to Billboard.");
                        renderer.renderMode = ParticleSystemRenderMode.Billboard;
                    }
                    break;
                case "meshDistribution":
                    string distStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(distStr, true, out ParticleSystemMeshDistribution dist))
                    {
                        renderer.meshDistribution = dist;
                    }
                    else
                    {
                        Debug.LogWarning($"Unknown mesh distribution '{distStr}'. Defaulting to Triangle.");
                    }
                    break;
                case "meshes":
                    string meshNamesStr = scanner.ConsumeStringInParens();
                    string[] meshNames = meshNamesStr.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var meshName in meshNames)
                    {
                        if (meshDict.TryGetValue(meshName, out Mesh mesh))
                        {
                            renderer.meshes.Add(mesh);
                        }
                        else
                        {
                            Debug.LogWarning($"Mesh with name '{meshName}' not found in SystemManager's mesh list.");
                        }
                    }
                    break;
                case "materialName":
                    string materialName = scanner.ConsumeStringInParens();
                    if (materialDict.TryGetValue(materialName, out Material mat))
                    {
                        renderer.material = mat;
                    }
                    else
                    {
                        Debug.LogError($"Material '{materialName}' not found in SystemManager's material list.");
                    }
                    break;
                case "trailMaterialName":
                    string trailMaterialName = scanner.ConsumeStringInParens();
                    if (materialDict.TryGetValue(trailMaterialName, out Material trailMat))
                    {
                        renderer.trailMaterial = trailMat;
                    }
                    else
                    {
                        Debug.LogError($"Trail Material '{trailMaterialName}' not found in SystemManager's material list.");
                    }
                    break;
                case "alignment":
                    string aligStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(aligStr, true, out ParticleSystemRenderSpace alig))
                    {
                        renderer.alignment = alig;
                    }
                    else
                    {
                        Debug.LogWarning($"Unknown alignment '{aligStr}'. Defaulting to Triangle.");
                    }
                    break;
                case "shader": // "~shader (Additive)" のように指定
                case "blendMode": // "~blendMode (Additive)" でも可
                    renderer.blendMode = scanner.ConsumeStringInParens();
                    break;
                // ★ Sorting Fudge のパース処理を追加
                case "sortingFudge":
                    renderer.sortingFudge = scanner.ConsumeFloat();
                    break;
                default:
                    Debug.LogWarning($"Unknown renderer module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return renderer;
    }

    /// <summary>
    /// 定数、MinMax、またはキーフレーム配列（カーブ）をパースします。
    /// 対応フォーマット:
    /// - 定数: 1.0
    /// - MinMax: [1.0 2.0]
    /// - カーブ配列: [[0 0] [0.5 1] [1 0]]
    /// - 従来カーブ: <~keys ...>
    /// </summary>
    private static MinMaxCurveData ParseMinMaxCurveOrConstant(Scanner scanner)
    {
        var data = new MinMaxCurveData();
        string nextToken = scanner.Peek();

        if (nextToken == "[")
        {
            scanner.Expect("["); // consume first '['

            // 次のトークンが '[' なら、[[t v] [t v]] の形式（カーブキー配列）とみなす
            if (scanner.Peek() == "[")
            {
                // カーブとしてパース
                data.curve = ParseCurveFromKeyArray(scanner);
                scanner.Expect("]"); // 閉じる ']'
            }
            else
            {
                // MinMax [min max] としてパース
                data.min = scanner.ConsumeFloat();
                data.max = scanner.ConsumeFloat();
                scanner.Expect("]");
            }
        }
        else if (nextToken == "<")
        {
            // 従来の <~keys ...> 形式
            data.curve = ParseCurve(scanner);
            data.min = 0;
            data.max = 0;
        }
        else
        {
            // 定数
            float value = scanner.ConsumeFloat();
            data.min = value;
            data.max = value;
        }
        return data;
    }

    /// <summary>
    /// StartSizeの3Dモードなどで使用される、[ ... ] で囲まれたMinMaxまたはカーブをパースします。
    /// 対応フォーマット:
    /// - MinMax: [1.0 2.0]
    /// - カーブ配列: [[0 0] [0.5 1] [1 0]]
    /// </summary>
    private static MinMaxCurveData ParseMinMaxCurve(Scanner scanner)
    {
        var data = new MinMaxCurveData();
        scanner.Expect("[");

        if (scanner.Peek() == "[")
        {
            // カーブ配列 [[t v]...]
            data.curve = ParseCurveFromKeyArray(scanner);
            scanner.Expect("]");
        }
        else
        {
            // MinMax [min max]
            data.min = scanner.ConsumeFloat();
            data.max = scanner.ConsumeFloat();
            scanner.Expect("]");
        }
        return data;
    }

    /// <summary>
    /// 既に外側の [ を消費した状態から、内部の [time value] 配列のリストを読み取り、CurveDataを生成します。
    /// Peek() == "[" である間ループします。
    /// </summary>
    private static CurveData ParseCurveFromKeyArray(Scanner scanner)
    {
        var curve = new CurveData();
        // 呼び出し元で外側の '[' は消費済み、またはチェック済み
        // ここでは内側の [t v] を連続して読み取る
        while (scanner.Peek() == "[")
        {
            scanner.Expect("[");
            // [time value] を読み取る
            List<float> values = new List<float>();
            while (scanner.Peek() != "]" && scanner.Peek() != null)
            {
                values.Add(scanner.ConsumeFloat());
            }
            scanner.Expect("]");

            if (values.Count >= 2)
            {
                curve.keys.Add(new KeyframeData { time = values[0], value = values[1] });
            }
            else
            {
                Debug.LogWarning($"Parse Warning: Invalid Keyframe data in array. Expected [time value], but got {values.Count} elements.");
            }
        }
        return curve;
    }

    private static GradientData ParseGradient(Scanner scanner)
    {
        var gradient = new GradientData { colorKeys = new List<ColorKeyData>(), alphaKeys = new List<AlphaKeyData>() };
        scanner.Expect("<");
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "colorKeys":
                    gradient.colorKeys = ParseColorKeysList(scanner);
                    break;
                case "alphaKeys":
                    gradient.alphaKeys = ParseAlphaKeysList(scanner);
                    break;
                default:
                    Debug.LogWarning($"Unknown gradient key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        scanner.Expect(">");
        return gradient;
    }

    private static CurveData ParseCurve(Scanner scanner)
    {
        var curve = new CurveData();
        scanner.Expect("<");
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1); // ~key を消費
            if (key == "keys")
            {
                curve.keys = ParseKeysList(scanner);
            }
            else
            {
                Debug.LogWarning($"Unknown curve key: '~{key}'. Skipping.");
                SkipUnknownValue(scanner);
            }
        }
        scanner.Expect(">");
        return curve;
    }

    private static List<KeyframeData> ParseKeysList(Scanner scanner)
    {
        var keyList = new List<KeyframeData>();
        scanner.Expect("[");
        while (scanner.Peek() == "[")
        {
            scanner.Expect("[");

            // ブロック内の数値をすべて読み取る
            List<float> values = new List<float>();
            while (scanner.Peek() != "]" && scanner.Peek() != null)
            {
                values.Add(scanner.ConsumeFloat());
            }

            // time, value の2つが必要
            if (values.Count == 2)
            {
                keyList.Add(new KeyframeData { time = values[0], value = values[1] });
            }
            else
            {
                Debug.LogWarning($"Parse Warning: Invalid Keyframe data. Expected 2 values (time, value), but got {values.Count}. Skipping this key.");
            }

            scanner.Expect("]");
        }
        scanner.Expect("]");
        return keyList;
    }

    private static List<ColorKeyData> ParseColorKeysList(Scanner scanner)
    {
        var keyList = new List<ColorKeyData>();
        scanner.Expect("[");
        while (scanner.Peek() == "[")
        {
            scanner.Expect("[");

            // ブロック内の数値をすべて読み取る
            List<float> values = new List<float>();
            while (scanner.Peek() != "]" && scanner.Peek() != null)
            {
                values.Add(scanner.ConsumeFloat());
            }

            // 【変更】順序を [time, r, g, b, a] に統一
            // r, g, b, a, time の5つが必要
            if (values.Count == 5)
            {
                keyList.Add(new ColorKeyData
                {
                    // 旧: values[0]..[3]がcolor, [4]がtime
                    // 新: values[0]がtime, values[1]..[4]がcolor
                    time = values[0],
                    color = new Color(values[1], values[2], values[3], values[4])
                });
            }
            else
            {
                Debug.LogWarning($"Parse Warning: Invalid ColorKey data. Expected 5 values (time, r, g, b, a), but got {values.Count}. Skipping this key.");
            }

            scanner.Expect("]");
        }
        scanner.Expect("]");
        return keyList;
    }

    private static List<AlphaKeyData> ParseAlphaKeysList(Scanner scanner)
    {
        var keyList = new List<AlphaKeyData>();
        scanner.Expect("[");
        while (scanner.Peek() == "[")
        {
            scanner.Expect("[");

            // ブロック内の数値をすべて読み取る
            List<float> values = new List<float>();
            while (scanner.Peek() != "]" && scanner.Peek() != null)
            {
                values.Add(scanner.ConsumeFloat());
            }

            // 【変更】順序を [time, alpha] に統一
            // alpha, time の2つが必要
            if (values.Count == 2)
            {
                // 旧: values[0]がalpha, values[1]がtime
                // 新: values[0]がtime, values[1]がalpha
                keyList.Add(new AlphaKeyData { time = values[0], alpha = values[1] });
            }
            else
            {
                Debug.LogWarning($"Parse Warning: Invalid AlphaKey data. Expected 2 values (time, alpha), but got {values.Count}. Skipping this key.");
            }

            scanner.Expect("]");
        }
        scanner.Expect("]");
        return keyList;
    }
}