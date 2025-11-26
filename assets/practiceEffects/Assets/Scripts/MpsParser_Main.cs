using UnityEngine;
using System.Collections.Generic;
using System;

// ----------------------------------------------------------------------------------
// MainModuleとそれに関連するStartColorのパース処理を分離したファイル
// ----------------------------------------------------------------------------------
public static partial class MpsParser
{
    private static MainModuleData ParseMainModule(Scanner scanner)
    {
        var main = new MainModuleData();
        while (scanner.Peek() != ">")
        {
            string key = scanner.Consume().Substring(1);
            switch (key)
            {
                // Basic
                case "duration": main.duration = scanner.ConsumeFloat(); break;
                case "looping": main.looping = scanner.ConsumeBool(); break;
                case "prewarm": main.prewarm = scanner.ConsumeBool(); break;
                case "startDelay": main.startDelay = ParseUniversalMinMaxCurve(scanner); break;
                case "startLifetime": main.startLifetime = ParseUniversalMinMaxCurve(scanner); break;
                case "startSpeed": main.startSpeed = ParseUniversalMinMaxCurve(scanner); break;

                // Size
                // startSize3Dの直接指定を削除 (startSize入力時のデータ構造で自動判定されるため)
                case "startSize":
                    var sizeData = ParseAxisSeparatedCurve(scanner);
                    main.startSize3D = sizeData.isSeparated;
                    if (sizeData.isSeparated)
                    {
                        main.startSizeX = sizeData.x;
                        main.startSizeY = sizeData.y;
                        main.startSizeZ = sizeData.z;
                    }
                    else
                    {
                        main.startSize = sizeData.uniform;
                    }
                    break;

                // Rotation
                case "startRotation":
                    var rotData = ParseAxisSeparatedCurve(scanner);
                    main.startRotation3D = rotData.isSeparated;
                    if (rotData.isSeparated)
                    {
                        main.startRotationX = rotData.x;
                        main.startRotationY = rotData.y;
                        main.startRotation = rotData.z; // Z軸
                    }
                    else
                    {
                        main.startRotation = rotData.uniform;
                    }
                    break;
                case "flipRotation": main.flipRotation = scanner.ConsumeFloat(); break;

                // Color & Gravity
                case "startColor": main.startColor = ParseMinMaxGradient(scanner); break;
                case "randomColor": main.randomColor = scanner.ConsumeBool(); break;
                case "gravityModifier": main.gravityModifier = ParseUniversalMinMaxCurve(scanner); break;

                // Simulation
                case "simulationSpace":
                    string spaceStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(spaceStr, true, out ParticleSystemSimulationSpace space))
                        main.simulationSpace = space;
                    break;
                case "simulationSpeed": main.simulationSpeed = scanner.ConsumeFloat(); break;
                case "useUnscaledTime": main.useUnscaledTime = scanner.ConsumeBool(); break;

                // Scaling
                case "scalingMode":
                    string scalingStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(scalingStr, true, out ParticleSystemScalingMode scaling))
                        main.scalingMode = scaling;
                    break;

                // Play On Awake
                case "playOnAwake": main.playOnAwake = scanner.ConsumeBool(); break;

                // Emitter Velocity
                case "emitterVelocityMode":
                    string evmStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(evmStr, true, out ParticleSystemEmitterVelocityMode evm))
                        main.emitterVelocityMode = evm;
                    break;

                // Max Particles
                case "maxParticles": main.maxParticles = (int)scanner.ConsumeFloat(); break;

                // Stop Action
                case "stopAction":
                    string stopStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(stopStr, true, out ParticleSystemStopAction stopAction))
                        main.stopAction = stopAction;
                    break;

                // Culling Mode
                case "cullingMode":
                    string cullStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(cullStr, true, out ParticleSystemCullingMode cull))
                        main.cullingMode = cull;
                    break;

                // Ring Buffer Mode
                case "ringBufferMode":
                    string ringStr = scanner.ConsumeStringInParens();
                    if (Enum.TryParse(ringStr, true, out ParticleSystemRingBufferMode ring))
                        main.ringBufferMode = ring;
                    break;

                // Random Seed
                case "autoRandomSeed": main.autoRandomSeed = scanner.ConsumeBool(); break;
                case "randomSeed": main.randomSeed = (uint)scanner.ConsumeFloat(); break;

                default:
                    Debug.LogWarning($"Unknown main module key: '~{key}'. Skipping.");
                    SkipUnknownValue(scanner);
                    break;
            }
        }
        return main;
    }
}