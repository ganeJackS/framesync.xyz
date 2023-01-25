import react, { useEffect, useRef, useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import shallow from "zustand/shallow";
import useAudioBufferStore from "../stores/audioBufferStore";
import useAudio2Keyframes from "./useAudio2Keyframes";

import { Settings, State } from "../stores/settingsStore";

export default function useData({}: {}) {
  const [settings, updateSetting] = useSettingsStore(
    (state) => [state.settings, state.updateSetting],
    shallow
  );

  const settingsRef = useRef(useSettingsStore.getState().settings);

  useEffect(
    () =>
      useSettingsStore.subscribe(
        (state) => (settingsRef.current = state.settings)
      ),
    []
  );

  const {
    datums,
    tempo,
    frameRate,
    amplitude,
    upDownOffset,
    leftRightOffset,
    rhythmRate,
    waveType,
    bend,
    toggleSinCos,
    linkFrameOffset,
    noiseAmount,
    modEnabled,
    modAmp,
    modToggleSinCos,
    modTempo,
    modRhythmRate,
    modFrameRate,
    modBend,
    modMoveLeftRight,
    modMoveUpDown,
    hardMax,
    hardMin,
    channelProcess,
  } = settingsRef.current;

  const [audioBuffer] = useAudioBufferStore((state) => [state.audioBuffer]);

  const keyframes = useAudio2Keyframes(
    audioBuffer as AudioBuffer,
    frameRate,
    channelProcess
  );

  const data = makeDataFrom(
    datums,
    tempo,
    frameRate,
    amplitude,
    upDownOffset,
    leftRightOffset,
    rhythmRate,
    waveType,
    bend,
    toggleSinCos,
    linkFrameOffset,
    noiseAmount,
    modEnabled,
    modAmp,
    modToggleSinCos,
    modTempo,
    modRhythmRate,
    modFrameRate,
    modBend,
    modMoveUpDown,
    modMoveLeftRight,
    keyframes
  );

  return data;
}

const series = 1;

const makeDataFrom = (
  datums: number,
  tempo: number,
  frameRate: number,
  amplitude: number,
  upDownOffset: number,
  leftRightOffset: number,
  rhythmRate: number,
  waveType: string,
  bend: number,
  toggleSinCos: string,
  linkFrameOffset: boolean,
  noiseAmount: number,
  modEnabled?: boolean,
  modAmp?: number,
  modToggleSinCos?: string,
  modTempo?: number,
  modRhythmRate?: number,
  modFrameRate?: number,
  modBend?: number,
  modMoveLeftRight?: number,
  modMoveUpDown?: number,
  keyframes?: number[],
  hardMax?: number,
  hardMin?: number
) => {
  return [...new Array(series)].map((d, i) =>
    makeSeries(
      datums,
      tempo,
      frameRate,
      amplitude,
      upDownOffset,
      leftRightOffset,
      rhythmRate,
      waveType,
      bend,
      toggleSinCos,
      linkFrameOffset,
      noiseAmount,
      modEnabled,
      modAmp,
      modToggleSinCos,
      modTempo,
      modRhythmRate,
      modFrameRate,
      modBend,
      modMoveUpDown,
      modMoveLeftRight,
      keyframes,
      hardMax,
      hardMin
    )
  );
};

const makeSeries = (
  datums: number,
  tempo: number,
  frameRate: number,
  amplitude: number,
  upDownOffset: number,
  leftRightOffset: number,
  rhythmRate: number,
  waveType: string,
  bend: number,
  toggleSinCos: string,
  linkFrameOffset: boolean,
  noiseAmount?: number,
  modEnabled?: boolean,
  modAmp?: number,
  modToggleSinCos?: string,
  modTempo?: number,
  modRhythmRate?: number,
  modFrameRate?: number,
  modBend?: number,
  modMoveLeftRight?: number,
  modMoveUpDown?: number,
  keyframes?: number[],
  hardMax?: number,
  hardMin?: number
) => {
  //let length: number = Number(datums);
  let audioKeyframesLength: number = keyframes?.length as number;

  if (waveType === "audio") {
    datums = datums < audioKeyframesLength ? audioKeyframesLength : datums;
  }

  // waveType === "audio"
  // ? (datums === audioKeyframesLength ? audioKeyframesLength : datums)
  // : (datums);

  //datums = datums > audioKeyframesLength ? audioKeyframesLength : datums;

  return {
    label: `wave 1`,
    data: [
      ...new Array(
        (datums as number) >= 1 ? Number(datums) : Number((datums = 1))
      ),
    ].map((_, i) => {
      let t: number = i + Number(leftRightOffset);
      let modt: number = i + Number(modMoveLeftRight);
      let ak = keyframes as number[];
      let y = 0;

      waveType === "audio" ? (y = ak[t]) : (y = 0);

      if (waveType === "sinusoid") {
        toggleSinCos === "cos"
          ? (y =
              amplitude *
                Math.cos(
                  ((tempo / Number(rhythmRate)) * Math.PI * t) / frameRate
                ) **
                  bend +
              Number(upDownOffset))
          : (y =
              amplitude *
                Math.sin(((tempo / rhythmRate) * Math.PI * t) / frameRate) **
                  bend +
              Number(upDownOffset));
      } else if (waveType === "saw") {
        y =
          -((2 * amplitude) / Math.PI) *
            Math.atan(
              (1 * bend) /
                Math.tan((t * Math.PI * tempo) / rhythmRate / frameRate)
            ) +
          Number(upDownOffset);
      } else if (waveType === "square") {
        toggleSinCos === "cos"
          ? (y =
              amplitude *
                Math.sign(
                  Math.cos(((tempo / rhythmRate) * Math.PI * t) / frameRate)
                ) **
                  bend +
              Number(upDownOffset))
          : (y =
              amplitude *
                Math.sign(
                  Math.sin(((tempo / rhythmRate) * Math.PI * t) / frameRate) **
                    bend
                ) +
              Number(upDownOffset));
      } else if (waveType === "triangle") {
        toggleSinCos === "cos"
          ? (y =
              ((2 * amplitude) / Math.PI) *
                Math.asin(
                  Math.cos(((tempo / rhythmRate) * Math.PI * t) / frameRate) **
                    bend
                ) +
              Number(upDownOffset))
          : (y =
              ((2 * amplitude) / Math.PI) *
                Math.asin(
                  Math.sin(((tempo / rhythmRate) * Math.PI * t) / frameRate) **
                    bend
                ) +
              Number(upDownOffset));
      } else if (waveType === "bumpdip") {
        toggleSinCos === "cos"
          ? (y =
              amplitude *
                Math.cos(((tempo / rhythmRate) * Math.PI * t) / frameRate) **
                  Number(`${bend}0`) +
              Number(upDownOffset))
          : (y =
              amplitude *
                Math.sin(((tempo / rhythmRate) * Math.PI * t) / frameRate) **
                  Number(`${bend}0`) +
              Number(upDownOffset));
      } else if (waveType === "audio") {
        y =
          Number(amplitude) * Number(ak[t]) ** Number(bend) +
          Number(upDownOffset);
      }

      y = easeInOutElastic(y);
      //y = easeInOutBack(easeInOutElastic(y));

      const primaryWaveY = Number(y);

      // Noise Generator
      if ((y as number) > 0) {
        y = (y as number) + Math.random() * Number(noiseAmount);
      } else if ((y as number) < 0) {
        y = (y as number) - Math.random() * Number(noiseAmount);
      }

      if (!modEnabled) {
        y = y;
      } else {
        modToggleSinCos === "cos"
          ? (y =
              (y as number) +
              (Number(modAmp) *
                Math.cos(
                  ((Number(tempo) / Number(modRhythmRate)) * Math.PI * modt) /
                    Number(frameRate)
                ) **
                  Number(
                    `${
                      waveType === "bumpdip" ? Number(modBend) : Number(modBend)
                    }0`
                  ) +
                Number(modMoveUpDown)))
          : (y =
              (y as number) *
              (Number(modAmp) *
                Math.sin(
                  ((Number(tempo) / Number(modRhythmRate)) * Math.PI * modt) /
                    Number(frameRate)
                ) **
                  Number(
                    `${
                      waveType === "bumpdip" ? Number(modBend) : Number(modBend)
                    }0`
                  ) +
                Number(modMoveUpDown)));
      }


      // normalize y
   



      // let scalingFactor;
      // if (y > hardMax) {
      //   scalingFactor = hardMax / y;
      // } else if (y < hardMin) {
      //   scalingFactor = hardMin / y;
      // } else {
      //   scalingFactor = 1;
      // }

      // y = y * scalingFactor;

      // const c5 = (2 * Math.PI) / 4.5;

      // y === 0
      //   ? 0
      //   : y === 1
      //   ? 1
      //   : y < 0.5
      //   ? y = -(Math.pow(2, 20 * y - 10) * Math.sin((20 * y - 11.125) * c5)) / 2
      //   : y = (Math.pow(2, -20 * y + 10) * Math.sin((20 * y - 11.125) * c5)) / 2 +
      //     1;

     Number.isNaN(y) ? (y = upDownOffset) : (y = y);

      // if ((y as number) > Number(hardMax)) {
      //   y = Number(hardMax);
      // } else if ((y as number) < Number(hardMin)) {
      //   y = Number(hardMin);
      // }

      //y = y - 0;

      //y = y * amplitude

      return {
        primary: linkFrameOffset === true ? t : t - Number(leftRightOffset),
        secondary: Number(y),
        primaryWave: Number(primaryWaveY),
      };
    }),
  };
};



function easeOutElastic(x: number): number {
  const c4 = (2 * Math.PI) / 3;

  return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

function easeInOutElastic(x: number): number {
  const c5 = (2 * Math.PI) / 4.5;
  
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
  }

function easeInOutBounce(x: number): number {
  return x < 0.5
    ? (1 - easeOutBounce(1 - 2 * x)) / 2
    : (1 + easeOutBounce(2 * x - 1)) / 2;
}

function easeOutBounce(x: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (x < 1 / d1) {
    return n1 * x * x;
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }
}

function easeInBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  
  return c3 * x * x * x - c1 * x * x;
  }

  function easeInOutBack(x: number): number {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    
    return x < 0.5
      ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
      : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
    }