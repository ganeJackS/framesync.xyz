import React, { useContext } from "react";
import useAudio2Keyframes from "./useAudio2Keyframes";
import useAudioBufferStore from "../stores/audioBufferStore";
import {useSettingsStore, Settings} from "../stores/settingsStore";
import shallow from "zustand/shallow";

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

export default function useChart({
  series = 1,

  show = [],
  count = 12,
  resizable = true,
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
}: {
  series: number;
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
}) {

  
  // const [state, setState] = React.useState({
  //   count,
  //   resizable,
  //   elementType,
  //   primaryAxisType,
  //   secondaryAxisType,
  //   primaryAxisPosition,
  //   secondaryAxisPosition,
  //   primaryAxisStack,
  //   secondaryAxisStack,
  //   primaryAxisShow,
  //   secondaryAxisShow,
  //   tooltipAnchor,
  //   tooltipAlign,
  //   interactionMode,
  //   tooltipGroupingMode,
  //   snapCursor,
  //   datums,
  //   data: makeDataFrom(
  //     dataType,
  //     series,
  //     datums,
  //     tempo,
  //     frameRate,
  //     amplitude,
  //     upDownOffset,
  //     leftRightOffset,
  //     rhythmRate,
  //     waveType,
  //     bend,
  //     toggleSinCos,
  //     linkFrameOffset,
  //     noiseAmount,
  //     modEnabled,
  //     modAmp,
  //     modToggleSinCos,
  //     modTempo,
  //     modRhythmRate,
  //     modFrameRate,
  //     modBend,
  //     modMoveUpDown,
  //     modMoveLeftRight,
  //     keyframes,
  //   ),
  // });


  

  // React.useEffect(() => {
  //   setState((old: any) => ({
  //     ...old,
  //     data: makeDataFrom(
  //       dataType,
  //       seriesCount,
  //       datums,
  //       tempo,
  //       frameRate,
  //       amplitude,
  //       upDownOffset,
  //       leftRightOffset,
  //       rhythmRate,
  //       waveType,
  //       bend,
  //       toggleSinCos,
  //       linkFrameOffset,
  //       noiseAmount,
  //       modEnabled,
  //       modAmp,
  //       modToggleSinCos,
  //       modTempo,
  //       modRhythmRate,
  //       modFrameRate,
  //       modBend,
  //       modMoveUpDown,
  //       modMoveLeftRight, 
  //       keyframes,
  //     ),
  //   }));
  // }, [
  //   dataType,
  //   datums,
  //   seriesCount,
  //   tempo,
  //   frameRate,
  //   amplitude,
  //   upDownOffset,
  //   leftRightOffset,
  //   rhythmRate,
  //   waveType,
  //   bend,
  //   toggleSinCos,
  //   linkFrameOffset,
  //   noiseAmount,
  //   modEnabled,
  //   modAmp,
  //   modToggleSinCos,
  //   modTempo,
  //   modRhythmRate,
  //   modFrameRate,
  //   modBend,
  //   modMoveUpDown,
  //   modMoveLeftRight,
  //   keyframes,
  // ]);
  

//   const Options = optionKeys
//     .filter((option) => show.indexOf(option) > -1)
//     .map((option) => (
//       <div key={option}>
//         {option}: &nbsp;
//         <select
//           value={state[option] as string}
//           onChange={({ target: { value } }) =>
//             setState((old: any) => ({
//               ...old,
//               [option]:
//                 typeof options[option][0] === "boolean"
//                   ? value === "true"
//                   : value,
//             }))
//           }>
//           {options[option].map((d: any) => (
//             <option value={d as string} key={d.toString()}>
//               {d.toString()}
//             </option>
//           ))}
//         </select>
//         <br />
//       </div>
//     ));
//   return {
//     ...state,
//     Options,
//   };
// }


}