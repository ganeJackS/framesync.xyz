import react, { useEffect, useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import shallow from "zustand/shallow";
import useAudioBufferStore from "../stores/audioBufferStore";
import useAudio2Keyframes from "./useAudio2Keyframes";

import { Settings, State } from "../stores/settingsStore";

export default function useData({
  // datums,
  // tempo,
  // frameRate,
  // amplitude,
  // upDownOffset,
  // leftRightOffset,
  // rhythmRate,
  // waveType,
  // bend,
  // toggleSinCos,
  // linkFrameOffset,
  // noiseAmount,
  // modEnabled,
  // modAmp,
  // modToggleSinCos,
  // modTempo,
  // modRhythmRate,
  // modFrameRate,
  // modBend,
  // modMoveLeftRight,
  // modMoveUpDown,
}: {
  // datums: number;
  // tempo: number;
  // frameRate: number;
  // amplitude: number;
  // upDownOffset: number;
  // leftRightOffset: number;
  // rhythmRate: number;
  // waveType: string;
  // bend: number;
  // toggleSinCos: string;
  // linkFrameOffset: boolean;
  // noiseAmount: number;
  // modEnabled: boolean;
  // modAmp: number;
  // modToggleSinCos: string;
  // modTempo: number;
  // modRhythmRate: number;
  // modFrameRate: number;
  // modBend: number;
  // modMoveLeftRight: number;
  // modMoveUpDown: number;
}) {
  
  const [settings, updateSetting] = useSettingsStore(
    (state) => [state.settings, state.updateSetting],
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
  } = settings;

  const [audioBuffer, setAudioBuffer] = useAudioBufferStore((state) => [
    state.audioBuffer,
    state.setAudioBuffer,
  ]);

  const keyframes = useAudio2Keyframes(audioBuffer as AudioBuffer, frameRate);

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
    keyframes,
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
  keyframes?: number[]
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
      keyframes
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
  keyframes?: number[]
) => {
  //let length: number = Number(datums);
  let audioKeyframesLength: number = keyframes?.length as number;

  waveType === "audio"
    ? (length = audioKeyframesLength - 1 - leftRightOffset)
    : (length = datums);



  return {
    label: `${waveType}`,
    data: [...new Array(datums >= 1 ? Number(datums) : Number(datums = 1))].map((_, i) => {
      let t: number = i + Number(leftRightOffset);
      let modt: number = i + Number(modMoveLeftRight);
      let ak = keyframes as number[];
      let y;

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
                Math.sin(((tempo / rhythmRate) * Math.PI * i) / frameRate) **
                  Number(`${bend}0`) +
              Number(upDownOffset));
      } else if (waveType === "audio") {
        y = Number(amplitude) * Number(ak[t]) ** Number(bend) + Number(upDownOffset);
      }

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
              (y as number) *
              (Number(modAmp) *
                Math.cos(
                  ((Number(modTempo) / Number(modRhythmRate)) * Math.PI * modt) /
                    Number(modFrameRate)

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
                  ((Number(modTempo) / Number(modRhythmRate)) * Math.PI * modt) /
                    Number(modFrameRate)
                ) **
                  Number(
                    `${
                      waveType === "bumpdip" ? Number(modBend) : Number(modBend)
                    }0`
                  ) +
                Number(modMoveUpDown)));
      }

      Number.isNaN(y) ? (y = 1) : (y = y);


      return {
        primary: linkFrameOffset === true ? t : t - Number(leftRightOffset),
        secondary: y,
      };
    }),
  };
};
