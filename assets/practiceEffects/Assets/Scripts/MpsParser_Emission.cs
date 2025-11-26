using UnityEngine;
using System.Collections.Generic;
using System;

// ----------------------------------------------------------------------------------
// EmissionModuleとそれに関連するStartColorのパース処理を分離したファイル
// ----------------------------------------------------------------------------------
public static partial class MpsParser
{
    private static EmissionModuleData ParseEmissionModule(Scanner scanner)
    {
        var emission = new EmissionModuleData { enabled = true };
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                case "enabled": emission.enabled = scanner.ConsumeBool(); break;
                case "rateOverTime": emission.rateOverTime = ParseUniversalMinMaxCurve(scanner); break;
                case "burstCount":
                    var curve = ParseUniversalMinMaxCurve(scanner);
                    emission.minBurstCount = (int)curve.min;
                    emission.maxBurstCount = (int)curve.max;
                    break;
                default:
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return emission;
    }
}