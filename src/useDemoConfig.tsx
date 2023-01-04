import React, { useContext } from "react";
import useAudio2Keyframes from "./useAudio2Keyframes";
import { useAudioBufferStore } from "./audioBufferStore";

const options = {
  elementType: ["line", "area", "bar"],
  primaryAxisType: ["linear", "time", "log", "band"],
  secondaryAxisType: ["linear", "time", "log", "band"],
  primaryAxisPosition: ["top", "left", "right", "bottom"],
  secondaryAxisPosition: ["top", "left", "right", "bottom"],
  secondaryAxisStack: [true, false],
  primaryAxisShow: [true, false],
  secondaryAxisShow: [true, false],
  interactionMode: ["primary", "closest"],
  tooltipGroupingMode: ["single", "primary", "secondary", "series"],
  tooltipAnchor: [
    "closest",
    "top",
    "bottom",
    "left",
    "right",
    "center",
    "gridTop",
    "gridBottom",
    "gridLeft",
    "gridRight",
    "gridCenter",
    "pointer",
  ],
  tooltipAlign: [
    "auto",
    "top",
    "bottom",
    "left",
    "right",
    "topLeft",
    "topRight",
    "bottomLeft",
    "bottomRight",
    "center",
  ],
  snapCursor: [true, false],
} as const;

type DataType = "time" | "ordinal" | "linear";
type ElementType = typeof options["elementType"][number];
type PrimaryAxisType = typeof options["primaryAxisType"][number];
type SecondaryAxisType = typeof options["secondaryAxisType"][number];
type PrimaryAxisPosition = typeof options["primaryAxisPosition"][number];
type SecondaryAxisPosition = typeof options["secondaryAxisPosition"][number];
type TooltipAnchor = typeof options["tooltipAnchor"][number];
type TooltipAlign = typeof options["tooltipAlign"][number];
type InteractionMode = typeof options["interactionMode"][number];
type TooltipGroupingMode = typeof options["tooltipGroupingMode"][number];

const optionKeys = Object.keys(options) as (keyof typeof options)[];

export default function useChartConfig({
  series = 1,
  datums = 10,
  useR,
  show = [],
  count = 12,
  resizable = true,
  canRandomize = true,
  dataType = "time",
  elementType = "line",
  primaryAxisType = "time",
  secondaryAxisType = "linear",
  primaryAxisPosition = "bottom",
  secondaryAxisPosition = "left",
  primaryAxisStack = false,
  secondaryAxisStack = true,
  primaryAxisShow = true,
  secondaryAxisShow = true,
  tooltipAnchor = "closest",
  tooltipAlign = "auto",
  interactionMode = "closest",
  tooltipGroupingMode = "primary",
  snapCursor = true,
  tempo = 120,
  frameRate = 24,
  amplitude = 2.0,
  upDownOffset = 0,
  leftRightOffset = 0,
  rhythmRate = 60,
  waveType = "sinusoid",
  bend = 0,
  toggleSinCos = "cos",
  linkFrameOffset = false,
  noiseAmount = 0,
  modEnabled = false,
  modAmp = 1,
  modToggleSinCos = "cos",
  modTempo = 120,
  modRhythmRate = 60,
  modRate = 1,
  modFrameRate = 24,
  modBend = 1,
  modMoveUpDown = 0,
  modMoveLeftRight = 0,  
}: {
  series: number;
  datums?: number;
  useR?: boolean;
  show?: (keyof typeof options)[];
  count?: number;
  resizable?: boolean;
  canRandomize?: boolean;
  dataType?: DataType;
  elementType?: ElementType;
  primaryAxisType?: PrimaryAxisType;
  secondaryAxisType?: SecondaryAxisType;
  primaryAxisPosition?: PrimaryAxisPosition;
  secondaryAxisPosition?: SecondaryAxisPosition;
  primaryAxisStack?: boolean;
  secondaryAxisStack?: boolean;
  primaryAxisShow?: boolean;
  secondaryAxisShow?: boolean;
  tooltipAnchor?: TooltipAnchor;
  tooltipAlign?: TooltipAlign;
  interactionMode?: InteractionMode;
  tooltipGroupingMode?: TooltipGroupingMode;
  snapCursor?: boolean;
  tempo?: number;
  frameRate?: number;
  amplitude?: number;
  upDownOffset?: number;
  leftRightOffset?: number;
  rhythmRate?: number;
  waveType?: string;
  bend?: number;
  toggleSinCos?: string;
  linkFrameOffset?: boolean;
  noiseAmount?: number;
  modEnabled?: boolean;
  modAmp?: number;
  modToggleSinCos?: string;
  modTempo?: number;
  modRhythmRate?: number;
  modFrameRate?: number;
  modRate?: number;
  modBend?: number;
  modMoveLeftRight?: number;
  modMoveUpDown?: number;  
}) {
  const [audioBuffer, setAudioBuffer] = useAudioBufferStore(state => [state.audioBuffer, state.setAudioBuffer]);
  const keyframes = useAudio2Keyframes(audioBuffer as AudioBuffer, frameRate);
  const [state, setState] = React.useState({
    count,
    resizable,
    canRandomize,
    dataType,
    elementType,
    primaryAxisType,
    secondaryAxisType,
    primaryAxisPosition,
    secondaryAxisPosition,
    primaryAxisStack,
    secondaryAxisStack,
    primaryAxisShow,
    secondaryAxisShow,
    tooltipAnchor,
    tooltipAlign,
    interactionMode,
    tooltipGroupingMode,
    snapCursor,
    datums,
    data: makeDataFrom(
      dataType,
      series,
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
      modRate,
      modFrameRate,
      modBend,
      modMoveUpDown,
      modMoveLeftRight,
      keyframes,
      useR,
    ),
    
  });

  React.useEffect(() => {
    setState((old) => ({
      ...old,
      data: makeDataFrom(
        dataType,
        series,
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
        modRate,
        modFrameRate,
        modBend,
        modMoveUpDown,
        modMoveLeftRight, 
        keyframes,
        useR,
      ),
    }));
  }, [
    count,
    dataType,
    datums,
    series,
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
    modRate,
    modFrameRate,
    modBend,
    modMoveUpDown,
    modMoveLeftRight,
    keyframes,
    useR,
  ]);
  

  const Options = optionKeys
    .filter((option) => show.indexOf(option) > -1)
    .map((option) => (
      <div key={option}>
        {option}: &nbsp;
        <select
          value={state[option] as string}
          onChange={({ target: { value } }) =>
            setState((old) => ({
              ...old,
              [option]:
                typeof options[option][0] === "boolean"
                  ? value === "true"
                  : value,
            }))
          }>
          {options[option].map((d: any) => (
            <option value={d as string} key={d.toString()}>
              {d.toString()}
            </option>
          ))}
        </select>
        <br />
      </div>
    ));
  return {
    ...state,
    Options,
  };
}

function makeDataFrom(
  dataType: DataType,
  series: number,
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
  modRate?: number,
  modBend?: number,
  modMoveLeftRight?: number,
  modMoveUpDown?: number,
  keyframes?: number[],
  useR?: boolean
) {
  return [...new Array(series)].map((d, i) =>
    makeSeries(
      i,
      dataType,
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
      modRate,
      modFrameRate,
      modBend,
      modMoveUpDown,
      modMoveLeftRight,
      keyframes,
      useR,
    )
  );
}


function makeSeries(
  i: number,
  dataType: DataType,
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
  modRate?: number,
  modBend?: number,
  modMoveLeftRight?: number,
  modMoveUpDown?: number,
  keyframes?: number[],
  useR?: boolean
) {
  
 
    let audioKeyframeLength = keyframes?.length;
    let datumLength = datums;
    let length;

    waveType === "audio" ? (length = audioKeyframeLength) : (length = datumLength);
    length === undefined ? (length = 1) : (length = length);

  return {
    label: `${waveType} ${1}`,
    data: [...new Array(length >= 1 ? length : (length = 1))].map((_, i) => {
      let t:number = i + leftRightOffset;
      let y;
      let ak = keyframes as number[];

      waveType === "audio" ? (y = ak[i]) : (y = 0);
      


      if (waveType === "sinusoid") {
        toggleSinCos === "cos"
          ? (y =
              amplitude *
                Math.cos(((tempo / rhythmRate) * Math.PI * t) / frameRate) **
                  bend +
              upDownOffset)
          : (y =
              amplitude *
                Math.sin(((tempo / rhythmRate) * Math.PI * t) / frameRate) **
                  bend +
              upDownOffset);
      } else if (waveType === "saw") {
        y =
          -((2 * amplitude) / Math.PI) *
            Math.atan(
              (1 * bend) /
                Math.tan((t * Math.PI * tempo) / rhythmRate / frameRate)
            ) +
          upDownOffset;
      } else if (waveType === "square") {
        toggleSinCos === "cos"
          ? (y =
              amplitude *
                Math.sign(
                  Math.cos(((tempo / rhythmRate) * Math.PI * t) / frameRate)
                ) **
                  bend +
              upDownOffset)
          : (y =
              amplitude *
                Math.sign(
                  Math.sin(((tempo / rhythmRate) * Math.PI * t) / frameRate) **
                    bend
                ) +
              upDownOffset);
      } else if (waveType === "triangle") {
        toggleSinCos === "cos"
          ? (y =
              ((2 * amplitude) / Math.PI) *
                Math.asin(
                  Math.cos(((tempo / rhythmRate) * Math.PI * t) / frameRate) **
                    bend
                ) +
              upDownOffset)
          : (y =
              ((2 * amplitude) / Math.PI) *
                Math.asin(
                  Math.sin(((tempo / rhythmRate) * Math.PI * t) / frameRate) **
                    bend
                ) +
              upDownOffset);
      } else if (waveType === "bumpdip") {
        toggleSinCos === "cos"
          ? (y =
              amplitude *
                Math.cos(((tempo / rhythmRate) * Math.PI * t) / frameRate) **
                  Number(`${bend}0`) +
              upDownOffset)
          : (y =
              amplitude *
                Math.sin(((tempo / rhythmRate) * Math.PI * i) / frameRate) **
                  Number(`${bend}0`) +
              upDownOffset);
      } else if (waveType === "audio") {
        y = (amplitude) * (ak[i])**(bend) + upDownOffset;
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
                  ((Number(modTempo) / Number(modRhythmRate)) * Math.PI * t) /
                    Number(modFrameRate) +
                    Number(modMoveLeftRight)
                ) **
                Number(`${waveType === "bumpdip" ? Number(modBend) : Number(modBend)}0`) +
                Number(modMoveUpDown)))
          : (y =
              (y as number) *
              (Number(modAmp) *
                Math.sin(
                  ((Number(modTempo) / Number(modRhythmRate)) * Math.PI * t) /
                    Number(modFrameRate) +
                    Number(modMoveLeftRight)
                ) **
                Number(`${waveType === "bumpdip" ? Number(modBend) : Number(modBend)}0`) +
                Number(modMoveUpDown)));
      }

      return {
        primary: linkFrameOffset === true ? t.toString() : t - leftRightOffset,
        secondary: y,
      };
    }),
 


  };
}
