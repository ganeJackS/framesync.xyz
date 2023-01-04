import ResizableBox from "../ResizableBox";
import useDemoConfig from "../useDemoConfig";
import React, { useRef, useState } from "react";
import { AxisOptions, Chart, ChartOptions, Datum } from "react-charts";
import NumberInput from "./NumberInput";
import { curveMonotoneX } from "d3-shape";
import sinusoid from "../assets/sinusoid.svg";
import saw from "../assets/saw.svg";
import square from "../assets/square.svg";
import triangle from "../assets/triangle.svg";
import bumpdip from "../assets/bumpdip.svg";
import audiofile from "../assets/audiofile.svg";
import ShowHideToggle from "./ShowHideToggle";
import CopyToast from "./CopyToast";

import { useAudioBufferStore } from "../audioBufferStore";

export default function StressTest() {
  const [
    {
      chartCount,
      seriesCount,
      datumCount,
      activeSeriesIndex,
      liveData,
      liveDataInterval,
      showPoints,
      memoizeSeries,
      contentEditable,
      brush,
      height,
      showAxes,
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
      boxWidth,
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
    },
    setState,
  ] = React.useState({
    activeSeriesIndex: -1,
    chartCount: 1,
    seriesCount: 1,
    datumCount: 120,
    liveData: false,
    liveDataInterval: 1000,
    showPoints: true,
    memoizeSeries: true,
    height: 400,
    showAxes: true,
    contentEditable: true,
    brush: true,

    tempo: 120,
    frameRate: 24,
    amplitude: 2.0,
    upDownOffset: 0,
    leftRightOffset: 0,
    rhythmRate: 60,
    waveType: "sinusoid",
    bend: 1,
    toggleSinCos: "cos",
    linkFrameOffset: false,
    noiseAmount: 0,
    boxWidth: 0,

    modEnabled: false,
    modAmp: 1,
    modToggleSinCos: "cos",
    modTempo: 120,
    modRhythmRate: 1920,
    modRate: 1,
    modFrameRate: 24,
    modBend: 1,
    modMoveUpDown: 0,
    modMoveLeftRight: 0,
  });

  const { data } = useDemoConfig({
    series: seriesCount,
    datums: datumCount,
    dataType: "time",

    tempo: tempo,
    frameRate: frameRate,
    amplitude: amplitude,
    upDownOffset: upDownOffset,
    leftRightOffset: leftRightOffset,
    rhythmRate: rhythmRate,
    waveType: waveType,
    bend: bend,
    toggleSinCos: toggleSinCos,
    linkFrameOffset: linkFrameOffset,
    noiseAmount: noiseAmount,
    modEnabled: modEnabled,
    modAmp: modAmp,
    modToggleSinCos: modToggleSinCos,
    modTempo: modTempo,
    modRhythmRate: modRhythmRate,
    modFrameRate: modFrameRate,
    modRate: modRate,
    modBend: modBend,
    modMoveLeftRight: modMoveLeftRight,
    modMoveUpDown: modMoveUpDown,

    tooltipAlign: "auto",
    tooltipAnchor: "closest",
    snapCursor: true,
    interactionMode: "primary",
    tooltipGroupingMode: "primary",
    show: ["elementType", "interactionMode"],
  });

  const [chartType, setChartType] = React.useState("line");
  const [highlightedText, setHighlightedText] = React.useState("");
  const [primaryCursorValue, setPrimaryCursorValue] = React.useState();
  const [secondaryCursorValue, setSecondaryCursorValue] = React.useState();

  const fileInput = useRef<HTMLInputElement>(null);
  //const audioElement = useRef<HTMLAudioElement>(null);
  const [audioBuffer, setAudioBuffer] = useAudioBufferStore((state) => [
    state.audioBuffer,
    state.setAudioBuffer,
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const arrayBuffer = fileReader.result as ArrayBuffer;
      const audioContext = new AudioContext();
      audioContext.decodeAudioData(
        arrayBuffer,
        (buffer: React.SetStateAction<AudioBuffer | null>) => {
          setAudioBuffer(buffer as AudioBuffer);
          //audioElement.current!.src = URL.createObjectURL(file);
        }
      );
    };
    fileReader.readAsArrayBuffer(file);
  };

  // const ticksOnAxis = document.querySelectorAll(
  //   "g:nth-child(1) > g.Axis-Group.inner > g.Axis > g.domainAndTicks > g.tick > text.tickLabel"
  // ); //select all text elements
  // ticksOnAxis.forEach((tick) => {
  //   if (Number(tick.textContent) % frameRate === 0) {
  //     tick.style.fill = "#f8f9fa";
  //   } else {
  //     tick.style.fill = "#adb5bd";
  //   }
  // });

  const primaryAxis = React.useMemo<
    AxisOptions<typeof data[number]["data"][number]>
  >(
    () => ({
      getValue: (datum) => Number(datum.primary),
      axisType: "ordinal",
      primaryAxisId: "primary",
      dataType: "band",
      show: showAxes,
      primary: true,
      scaleType: "band",
      formatters: {
        scale: (value) =>
          (value / frameRate) % (rhythmRate / tempo) === 0 ? `${value}` : value,
      },
    }),
    [showAxes, rhythmRate, tempo, frameRate, data]
  );

  const secondaryAxes = React.useMemo<
    AxisOptions<typeof data[number]["data"][number]>[]
  >(
    () => [
      {
        getValue: (datum) => datum.secondary,
        showDatumElements: showPoints,
        show: showAxes,
        dataType: "linear",
        elementType: chartType === "bar" ? "bar" : "line",
        curve: curveMonotoneX,
      },
    ],
    [showAxes, showPoints, chartType]
  );

  function setChartTypeHandler(e: React.ChangeEvent<HTMLSelectElement>) {
    setChartType(e.target.value);
  }

  // a handler that stores and updates the text selection start and end in the textarea
  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const { selectionStart, selectionEnd } = e.target;
    setHighlightedText(e.target.value.substring(selectionStart, selectionEnd));
  }

  function copyHighlightedTextHandler() {
    navigator.clipboard.writeText(
      highlightedText.replace(/[^0-9.,():-]/g, "").trimStart()
    );
  }

  const yArray = data[0].data.map((datum, i) => {
    return `${Number(datum.primary) % frameRate === 0 ? "\r\n" : ""}${
      datum.primary <= 9 ? "  " : ""
    }${datum.primary >= 10 ? "  " : ""}${datum.primary <= 99 ? " " : ""}${
      linkFrameOffset == true ? i + leftRightOffset : i
    }:${Math.sign(Number(datum.secondary)) === 1 || -1 ? " " : ""}${
      Math.sign(Number(datum.secondary)) === -1 ? "" : ""
    }(${datum.secondary?.toFixed(2).replace("-0.00", "0.00")})`;
  });

  const yArrayRaw = data[0].data.map((datum) => {
    return datum.secondary;
  });

  //console.log(yArray);

  const yArraySum = yArrayRaw.reduce(
    (accumulator, currentValue) =>
      (accumulator as number) + Math.abs(currentValue as number)
  );

  const yArrayAvg = (yArraySum as number) / yArrayRaw.length;
  const yArrayMin = Math.min(...(yArrayRaw as number[]));
  const yArrayMax = Math.max(...(yArrayRaw as number[]));

  // console.log(yArraySum);

  let currentFormula = `(${amplitude} * ${
    toggleSinCos === "cos" ? "cos" : "sin"
  }((${tempo} / ${rhythmRate} * 3.141 * t / ${frameRate} + ${leftRightOffset}))**${bend} + ${upDownOffset})`;

  if (waveType === "sinusoid") {
    currentFormula = `(${amplitude} * ${
      toggleSinCos === "cos" ? "cos" : "sin"
    }((${tempo} / ${rhythmRate} * 3.141 * t / ${frameRate} + ${leftRightOffset}))**${bend} + ${upDownOffset})`;
  } else if (waveType === "saw") {
    currentFormula = `(-(2 * ${amplitude} / 3.141) * arctan((1 * ${bend} + 1) / tan((t * 3.141 * ${tempo} / ${rhythmRate} / ${frameRate} + ${leftRightOffset}))) + ${upDownOffset})`;
  } else if (waveType === "triangle") {
    currentFormula = `((2 * ${amplitude} / 3.141) * arcsin(${
      toggleSinCos === "cos" ? "cos" : "sin"
    }( ${tempo} / ${rhythmRate} * 3.141 * t / ${frameRate})**${bend} + ${leftRightOffset}) + ${upDownOffset})`;
  } else if (waveType === "bumpdip") {
    currentFormula = `(${amplitude} * ${
      toggleSinCos === "cos" ? "cos" : "sin"
    }((${tempo} / ${rhythmRate} * 3.141 * t / ${frameRate} + ${leftRightOffset}))**${bend}0 + ${upDownOffset})`;
  } else if (waveType === "square") {
    currentFormula = ``;
  }

  const currentFormulaMod = `(${modAmp} * ${
    modToggleSinCos === "cos" ? "cos" : "sin"
  }((${modTempo} / ${modRhythmRate} * 3.141 * t / ${modFrameRate} + ${modMoveLeftRight}))**${
    waveType != "bumpdup" ? modBend : modBend + 0
  } + ${modMoveUpDown})`;

  return (
    <>
      <br />
      {[...new Array(chartCount)].map((_d, i) => (
        <ResizableBox
          key={i}
          height={240}
          width={boxWidth * datumCount * 3 + 1440}>
          <Chart
            options={{
              data,
              primaryAxis,
              secondaryAxes,
              memoizeSeries,
              dark: true,
              tooltip: true,

              getDatumStyle: (datum, _status) => ({
                color: "#F97316",
                stroke: "#F97316",
                opacity:
                  activeSeriesIndex > -1
                    ? datum.seriesIndex === activeSeriesIndex
                      ? 1
                      : 0.1
                    : 1,
              }),

              getSeriesStyle: (series, _status) => ({
                color: "#F97316",
                opacity:
                  activeSeriesIndex > -1
                    ? series.index === activeSeriesIndex
                      ? 1
                      : 0.1
                    : 1,
              }),

              primaryCursor: {
                value: primaryCursorValue,
                onChange: (value) => {
                  setPrimaryCursorValue(value);
                },
              },
              secondaryCursor: {
                value: secondaryCursorValue,
                onChange: (value) => {
                  setSecondaryCursorValue(value);
                },
              },
              onFocusDatum: (datum) => {
                setState((old) => ({
                  ...old,
                  activeSeriesIndex: datum ? datum.seriesIndex : -1,
                }));
              },
            }}
          />
        </ResizableBox>
      ))}
      {/* Zoom slider */}
      <label>
        <input
          className="zoom-slider bg-darkest-blue"
          type="range"
          min="0"
          max="100"
          step="1"
          value={boxWidth}
          onChange={(e) => {
            e.persist();
            setState((old) => ({
              ...old,
              boxWidth: parseFloat(e.target.value),
            }));
          }}
        />
      </label>
      {/* Stats */}
      <div className="flex flex-row justify-center shrink text-gray-400 bg-darkest-blue space-x-2 mb-4 font-mono">
        Min: {yArrayMin?.toFixed(2)} | Max: {yArrayMax?.toFixed(2)} | Average:{" "}
        {yArrayAvg?.toFixed(2)} | Absolute Sum: {yArraySum?.toFixed(2)} |
        Duration: {(datumCount / frameRate).toFixed(2)}s{/* Chart Type */}
        <label>
          | Chart{" "}
          <select
            className="bg-darker-blue border-2 border-dark-blue"
            value={chartType}
            onChange={setChartTypeHandler}>
            <option value="line">Line</option>
            <option value="bar">Bar</option>
          </select>
        </label>
      </div>
      {/* Control Panel */}
      <div className="flex flex-row justify-center justify-items-start space-x-4 font-mono">
        {/* Wave Settings */}
        <fieldset className=" bg-darkest-blue p-4 space-x-2 font-mono">
          <legend className="flex flex-row">
            Select Wave or{" "}
            <span className="pl-2">
              <input
              className="text-orange-500" 
              type="file" 
              ref={fileInput} 
              onChange={handleFileUpload} 
            
              />
            </span>{" "}
          </legend>
          <div></div>
          <div className="flex flex-col">
            {/* Primary Wave Settings */}
            <fieldset className="border-2 border-dark-blue pl-2 pr-2 pb-2 mb-2">
              <legend className="mb-2">
                Primary Wave
                {/* Sin/Cos */}
                <label>
                  {" "}
                  <select
                    className="bg-darker-blue border-2 border-dark-blue"
                    value={toggleSinCos}
                    onChange={(e) => {
                      e.persist();
                      setState((old) => ({
                        ...old,
                        toggleSinCos: e.target.value,
                      }));
                    }}>
                    <option value="cos">Cosine</option>
                    <option value="sin">Sine</option>
                  </select>
                </label>
              </legend>
              <div className="flex flex-row justify-start justify-items-start text-center text-xs mb-2">
                <input
                  className="appearance-none radio"
                  type="radio"
                  id="sinusoid"
                  name="wave"
                  value="sinusoid"
                />
                <label
                  className={`p-1 border-2 bg-darker-blue mr-2 ${
                    waveType === "sinusoid"
                      ? "border-orange-500"
                      : "border-dark-blue"
                  } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                  htmlFor="sinusoid"
                  onClick={() => {
                    setState((old) => ({ ...old, waveType: "sinusoid" }));
                  }}>
                  <img
                    src={sinusoid}
                    alt="sinusoid"
                    className={"aspect-square w-16"}
                  />
                  {/* Sinusoid */}
                </label>

                <input
                  className="appearance-none radio"
                  type="radio"
                  id="saw"
                  name="wave"
                  value="saw"
                />
                <label
                  className={`p-1 border-2 bg-darker-blue mr-2 ${
                    waveType === "saw"
                      ? "border-orange-500"
                      : "border-dark-blue"
                  } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                  htmlFor="saw"
                  onClick={() => {
                    setState((old) => ({ ...old, waveType: "saw" }));
                  }}>
                  <img src={saw} alt="saw" className={"aspect-square w-16"} />
                  {/* Saw */}
                </label>

                <input
                  className="appearance-none radio"
                  type="radio"
                  id="triangle"
                  name="wave"
                  value="triangle"
                />
                <label
                  className={`p-1 border-2 bg-darker-blue mr-2 ${
                    waveType === "triangle"
                      ? "border-orange-500"
                      : "border-dark-blue"
                  } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                  htmlFor="triangle"
                  onClick={() => {
                    setState((old) => ({ ...old, waveType: "triangle" }));
                  }}>
                  <img
                    src={triangle}
                    alt="triangle"
                    className={"aspect-square w-16"}
                  />

                  {/* Triangle */}
                </label>

                <input
                  className="appearance-none radio"
                  type="radio"
                  id="square"
                  name="wave"
                  value="square"
                />
                <label
                  className={`p-1 border-2 mr-2 bg-darker-blue ${
                    waveType === "square"
                      ? "border-orange-500"
                      : "border-dark-blue"
                  } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                  htmlFor="square"
                  onClick={() => {
                    setState((old) => ({ ...old, waveType: "square" }));
                  }}>
                  <img
                    src={square}
                    alt="square"
                    className={"aspect-square w-16"}
                  />

                  {/* Square */}
                </label>
                <input
                  className="appearance-none radio"
                  type="radio"
                  id="bumpdip"
                  name="wave"
                  value="bumpdip"
                />
                <label
                  className={`p-1 border-2 mr-2 bg-darker-blue ${
                    waveType === "bumpdip"
                      ? "border-orange-500"
                      : "border-dark-blue"
                  } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                  htmlFor="bumpdip"
                  onClick={() => {
                    setState((old) => ({ ...old, waveType: "bumpdip" }));
                  }}>
                  <img
                    src={bumpdip}
                    alt="bumpdip"
                    className={"aspect-square w-16"}
                  />

                  {/* Bumpdip */}
                </label>
                <input
                  className="appearance-none radio"
                  type="radio"
                  id="audio"
                  name="audio"
                  value="audio"
                  //check if audio file is loaded
                />
                <label
                  className={`p-1 border-2 bg-darker-blue ${
                    waveType === "audio"
                      ? "border-orange-500"
                      : "border-dark-blue"
                  } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                  htmlFor="audio"
                  onClick={() => {
                    setState((old) => ({ ...old, waveType: "audio" }));
                  }}>
                  <img
                    src={audiofile}
                    alt="audio"
                    className={"aspect-square w-16"}
                  />

                  {/* Audio */}
                </label>
              </div>
              {/* Primary Wave Settings */}
              <div className="flex flex-row grow">
                {/* Amplitude */}
                <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm mr-2">
                  AMPLITUDE{" "}
                  <NumberInput
                    value={amplitude}
                    min={-100}
                    max={100}
                    step={0.01}
                    onChange={(value) =>
                      setState((old) => ({
                        ...old,
                        amplitude: value as number,
                      }))
                    }
                  />
                </label>
                {/* Up/Down Offset*/}
                <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm mr-2">
                  SHIFT UP/DOWN{" "}
                  <NumberInput
                    value={upDownOffset}
                    min={-100}
                    max={100}
                    step={0.1}
                    isInt={false}
                    onChange={(value) =>
                      setState((old) => ({
                        ...old,
                        upDownOffset: parseFloat(value as string),
                      }))
                    }
                  />
                </label>
                {/* Bend*/}
                <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm mr-2">
                  BEND{" "}
                  <NumberInput
                    value={bend === 0 && waveType != "saw" ? 1 : bend}
                    min={1}
                    max={waveType === "saw" ? 100 : 200}
                    step={waveType === "saw" ? 1 : 2}
                    isInt={true}
                    onChange={(value) =>
                      setState((old) => ({ ...old, bend: value as number }))
                    }
                  />
                </label>

                {/* Noise*/}
                <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm">
                  NOISE{" "}
                  <NumberInput
                    value={noiseAmount}
                    min={0}
                    max={100}
                    step={0.01}
                    isInt={false}
                    onChange={(value) =>
                      setState((old) => ({
                        ...old,
                        noiseAmount: parseFloat(value as unknown as string),
                      }))
                    }
                  />
                </label>
              </div>
            </fieldset>
            {/* Modulator Settings */}
            <fieldset className="border-2 border-dark-blue pl-2 pr-2 pb-2 ">
              <legend className="flex flex-row space-x-2 mb-2">
                <label className="flex flex-row items-center ml-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-orange-500 cursor-pointer"
                    checked={modEnabled}
                    onChange={(e) => {
                      e.persist();
                      setState((old) => ({
                        ...old,
                        modEnabled: e.target.checked,
                      }));
                    }}
                  />
                </label>{" "}
                Enable Modulator
                {/* checkbox for modEnabled */}
                {/* Sin/Cos */}
                <label>
                  {" "}
                  <select
                    className="bg-darker-blue border-2 border-dark-blue"
                    value={modToggleSinCos}
                    onChange={(e) => {
                      e.persist();
                      setState((old) => ({
                        ...old,
                        modToggleSinCos: e.target.value,
                      }));
                    }}>
                    <option value="cos">Cosine</option>
                    <option value="sin">Sine</option>
                  </select>
                </label>
              </legend>
              {/* Secondary Wave Settings */}
              <div className="flex flex-col flex-wrap grow">
                <div className="flex flex-row mb-2">
                  {/* Mod Amplitude */}
                  <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm mr-2">
                    MOD AMPLITUDE{" "}
                    <NumberInput
                      value={modAmp}
                      min={-100}
                      max={100}
                      step={0.01}
                      onChange={(value) =>
                        setState((old) => ({ ...old, modAmp: value as number }))
                      }
                    />
                  </label>
                  {/* Mod Up/Down Offset*/}
                  <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm mr-2">
                    MOD SHIFT UP/DOWN{" "}
                    <NumberInput
                      value={modMoveUpDown}
                      min={-100}
                      max={100}
                      step={0.1}
                      isInt={false}
                      onChange={(value) =>
                        setState((old) => ({
                          ...old,
                          modMoveUpDown: parseFloat(value as string),
                        }))
                      }
                    />
                  </label>
                  {/* Mod Bend*/}
                  <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm mr-2">
                    MOD BEND{" "}
                    <NumberInput
                      value={modBend}
                      min={1}
                      max={1000}
                      step={2}
                      isInt={true}
                      onChange={(value) =>
                        setState((old) => ({
                          ...old,
                          modBend: value as number,
                        }))
                      }
                    />
                  </label>
                </div>
                <div className="flex flex-row">
                  {/* Mod Tempo*/}
                  <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm mr-2">
                    MOD TEMPO{" "}
                    <NumberInput
                      value={modTempo}
                      min={1}
                      max={1000}
                      step={1}
                      isInt={true}
                      onChange={(value) =>
                        setState((old) => ({
                          ...old,
                          modTempo: parseInt(value as string),
                        }))
                      }
                    />
                  </label>
                  {/* Mod Rhythm Rate*/}
                  <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm mr-2">
                    MOD RHYTHM RATE {/* option selector for rhythmRates */}
                    <select
                      className="bg-darker-blue border-2 border-dark-blue"
                      value={modRhythmRate}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          modRhythmRate: parseInt(e.target.value),
                        }));
                      }}>
                      <option value="3840">16</option>
                      <option value="1920">8</option>
                      <option value="960">4</option>
                      <option value="480">2</option>
                      <option value="240">1</option>
                      <option value="120">1/2</option>
                      <option value="40">1/2t</option>
                      <option value="60">1/4 (beat)</option>
                      <option value="20">1/4t</option>
                      <option value="30">1/8</option>
                      <option value="10">1/8t</option>
                      <option value="15">1/16</option>
                      <option value="5">1/16t</option>
                      <option value="7.5">1/32</option>
                      <option value="2.5">1/32t</option>
                    </select>
                  </label>
                  {/* Mod Frame Rate*/}
                  <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm mr-2">
                    MOD FRAME RATE{" "}
                    <NumberInput
                      value={modFrameRate}
                      min={1}
                      max={1000}
                      step={1}
                      isInt={true}
                      onChange={(value) =>
                        setState((old) => ({
                          ...old,
                          modFrameRate: parseInt(value as string),
                        }))
                      }
                    />
                  </label>
                  {/* Move Left/Right */}
                  {/* <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm mr-2">
                    MOD SHIFT LEFT/RIGHT{" "}
                    <NumberInput
                      value={modMoveLeftRight}
                      min={0}
                      max={100000}
                      step={1}
                      isInt={true}
                      onChange={(value) =>
                        setState((old) => ({
                          ...old,
                          modMoveLeftRight: parseInt(value as string),
                        }))
                      }
                    />
                  </label> */}
                </div>
              </div>
            </fieldset>
          </div>
        </fieldset>
        {/* Framesync Settings */}
        <div className="grid grid-cols-1 font-mono">
          {/* Frame Settings */}
          <fieldset className="bg-darkest-blue flex flex-row justify-start pl-3 pr-3 pb-3 font-mono">
            <legend>Frame Settings</legend>
            <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 mr-2 border-2 border-dark-blue z-index-100 text-sm">
              FRAME RATE (FPS)
              <NumberInput
                value={frameRate}
                min={1}
                max={240}
                step={1}
                isInt={true}
                onChange={(value) =>
                  setState((old) => ({
                    ...old,
                    frameRate: parseInt(value as string),
                  }))
                }
              />
            </label>
            <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm">
              FRAME COUNT
              <NumberInput
                value={datumCount}
                min={1}
                max={10000}
                step={1}
                isInt={true}
                onChange={(value) =>
                  setState((old) => ({
                    ...old,
                    datumCount: parseInt(value as string),
                  }))
                }
              />
            </label>
          </fieldset>

          {/* Sync Settings */}
          <fieldset className="bg-darkest-blue flex-row-auto justify-start  pl-3 pr-3 pb-3 font-mono">
            <legend>Sync Settings</legend>
            {/* Tempo and Shift Left/Right */}
            <div className="flex flex-row grow space-x-2 mb-2">
              {/* Tempo */}
              <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm">
                TEMPO (BPM)
                <NumberInput
                  value={tempo}
                  min={1}
                  max={10000}
                  step={1}
                  isInt={true}
                  onChange={(value) =>
                    setState((old) => ({
                      ...old,
                      tempo: parseInt(value as string),
                    }))
                  }
                />
              </label>
              {/* Shift Left/Right */}

              <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm">
                SHIFT LEFT/RIGHT
                {/* Link Horizonal Offset & Starting Frame */}
                <label className="text-xs">
                  START FRAME{" "}
                  <input
                    type="checkbox"
                    checked={linkFrameOffset}
                    onChange={(e) => {
                      e.persist();
                      setState((old) => ({
                        ...old,
                        linkFrameOffset: e.target.checked,
                      }));
                    }}
                  />
                </label>
                <NumberInput
                  value={leftRightOffset}
                  min={0}
                  max={10000}
                  step={1}
                  isInt={true}
                  onChange={(value) =>
                    setState((old) => ({
                      ...old,
                      leftRightOffset: parseInt(value as string),
                    }))
                  }
                />
              </label>
            </div>

            <div className="flex flex-col">
              <fieldset className="border-2 border-dark-blue pl-2 pr-2">
                <legend className="text-sm">RHYTHM RATE</legend>
                {/*New Rythm Rate*/}
                <div className="flex flex-col-reverse flex-wrap justify-start text-center text-xs font-mono mb-2">
                  {/* Row 1 */}

                  <div className="flex flex-row mt-2">
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="halfbarTriplet"
                      name="rhythmRate"
                      value="40"
                      checked={rhythmRate === 40}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue  ${
                        rhythmRate === 40
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="halfbarTriplet">
                      1/2T
                    </label>
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="quarterbarTriplet"
                      name="rhythmRate"
                      value="20"
                      checked={rhythmRate === 20}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue  ${
                        rhythmRate === 20
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="quarterbarTriplet">
                      1/4T
                    </label>
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="eighthbarTriplet"
                      name="rhythmRate"
                      value="10"
                      checked={rhythmRate === 10}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue  ${
                        rhythmRate === 10
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="eighthbarTriplet">
                      1/8T
                    </label>
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="sixteenthbarTriplet"
                      name="rhythmRate"
                      value="5"
                      checked={rhythmRate === 5}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue ${
                        rhythmRate === 5
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="sixteenthbarTriplet">
                      1/16T
                    </label>
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="thirtysecondbarTriplet"
                      name="rhythmRate"
                      value="2.5"
                      checked={rhythmRate === 2.5}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow bg-darker-blue  ${
                        rhythmRate === 2.5
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="thirtysecondbarTriplet">
                      1/32T
                    </label>
                  </div>

                  {/* Row 2 */}
                  <div className="flex flex-row mt-2">
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="halfbar"
                      name="rhythmRate"
                      value="120"
                      checked={rhythmRate === 120}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue ${
                        rhythmRate === 120
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="halfbar">
                      1/2
                    </label>
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="quarterbar"
                      name="rhythmRate"
                      value="60"
                      checked={rhythmRate === 60}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue  ${
                        rhythmRate === 60
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="quarterbar">
                      1/4
                    </label>

                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="eighthbar"
                      name="rhythmRate"
                      value="30"
                      checked={rhythmRate === 30}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue  ${
                        rhythmRate === 30
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="eighthbar">
                      1/8
                    </label>

                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="sixteenthbar"
                      name="rhythmRate"
                      value="15"
                      checked={rhythmRate === 15}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue  ${
                        rhythmRate === 15
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="sixteenthbar">
                      1/16
                    </label>

                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="thirtysecondbar"
                      name="rhythmRate"
                      value="7.5"
                      checked={rhythmRate === 7.5}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow bg-darker-blue  ${
                        rhythmRate === 7.5
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="thirtysecondbar">
                      1/32
                    </label>
                  </div>
                  {/* Row 3 */}
                  <div className="flex flex-row">
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="thirtytwoBars"
                      name="rhythmRate"
                      value="7680"
                      checked={rhythmRate === 7680}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue  ${
                        rhythmRate === 7680
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="thirtytwoBars">
                      32
                    </label>
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="16bars"
                      name="rhythmRate"
                      value="3840"
                      checked={rhythmRate === 3840}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue  ${
                        rhythmRate === 3840
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="16bars">
                      16
                    </label>
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="8bars"
                      name="rhythmRate"
                      value="1920"
                      checked={rhythmRate === 1920}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue ${
                        rhythmRate === 1920
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="8bars">
                      8
                    </label>
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="4bars"
                      name="rhythmRate"
                      value="960"
                      checked={rhythmRate === 960}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue  ${
                        rhythmRate === 960
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="4bars">
                      4
                    </label>
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="2bars"
                      name="rhythmRate"
                      value="480"
                      checked={rhythmRate === 480}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow mr-2 bg-darker-blue  ${
                        rhythmRate === 480
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="2bars">
                      2
                    </label>
                    <input
                      className="appearance-none radio"
                      type="radio"
                      id="1bar"
                      name="rhythmRate"
                      value="240"
                      checked={rhythmRate === 240}
                      onChange={(e) => {
                        e.persist();
                        setState((old) => ({
                          ...old,
                          rhythmRate: parseFloat(e.target.value),
                        }));
                      }}
                    />
                    <label
                      className={`p-2 border-2 grow  bg-darker-blue  ${
                        rhythmRate === 240
                          ? "border-orange-500"
                          : "border-dark-blue"
                      } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                      htmlFor="1bar">
                      1
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
          </fieldset>

          <div className="flex flex-col justify-center justify-items-center">
            <ShowHideToggle label={"Timing Table"}>
              <table className=" mt-4 border-2 border-dark-blue">
                <thead>
                  <tr>
                    <th>Divisions</th>
                    <th>Seconds</th>
                    <th>Frames</th>
                  </tr>
                </thead>
                <tbody className="border-2 border-dark-blue text-right">
                  <tr>
                    <td>16 bars</td>
                    <td>{(3840 / tempo).toFixed(2)}</td>
                    <td>{((3840 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>8 bars</td>
                    <td>{(1920 / tempo).toFixed(2)}</td>
                    <td>{((1920 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>4 bars</td>
                    <td>{(960 / tempo).toFixed(2)}</td>
                    <td>{((960 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>2 bars</td>
                    <td>{(480 / tempo).toFixed(2)}</td>
                    <td>{((480 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1 bar</td>
                    <td>{(240 / tempo).toFixed(2)}</td>
                    <td>{((240 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/2 </td>
                    <td>{(120 / tempo).toFixed(2)}</td>
                    <td>{((120 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>

                  <tr>
                    <td>(beat) 1/4</td>
                    <td>{(60 / tempo).toFixed(2)}</td>
                    <td>{((60 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/2t</td>
                    <td>{(40 / tempo).toFixed(2)}</td>
                    <td>{((40 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>

                  <tr>
                    <td>1/8</td>
                    <td>{(30 / tempo).toFixed(2)}</td>
                    <td>{((30 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/4t</td>
                    <td>{(20 / tempo).toFixed(2)}</td>
                    <td>{((20 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/16</td>
                    <td>{(15 / tempo).toFixed(2)}</td>
                    <td>{((15 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/8t</td>
                    <td>{(10 / tempo).toFixed(2)}</td>
                    <td>{((10 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/32</td>
                    <td>{(7.5 / tempo).toFixed(2)}</td>
                    <td>{((7.5 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/16t</td>
                    <td>{(5 / tempo).toFixed(2)}</td>
                    <td>{((5 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/32t</td>
                    <td>{(2.5 / tempo).toFixed(2)}</td>
                    <td>{((2.5 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </ShowHideToggle>
          </div>
        </div>
      </div>
      {/* Outputs */}
      <div className="flex flex-row grow justify-center items-center mt-1">
        {/* a button to copy keyframeOutput to the clipboard */}

        <div>
          <label>
            <button
              className="bg-green-800 text-white font-mono p-2 hover:bg-green-600 active:bg-green-700 transition-all ease-out duration-150"
              onCopy={copyHighlightedTextHandler}
              onClick={() => {
                navigator.clipboard.writeText(yArray as unknown as string);
              }}>
              <CopyToast>Copy Keyframes</CopyToast>
            </button>
          </label>
          <label>
            <button
              className="bg-green-700 text-white font-mono p-2 hover:bg-green-500 active:bg-green-600 transition-all ease-out duration-150"
              onClick={() => {
                navigator.clipboard.writeText(
                  `(${currentFormula}${modEnabled ? "*" : ""}${
                    modEnabled ? currentFormulaMod : ""
                  })`
                );
              }}>
              <CopyToast>Copy Formula</CopyToast>
            </button>
            <div className="font-mono inline-flex bg-darkest-blue p-3">
              {waveType != "audio"
                ? `${
                    linkFrameOffset == true ? leftRightOffset : 0
                  }: (${currentFormula}${modEnabled ? "*" : ""}${
                    modEnabled ? currentFormulaMod : ""
                  })`
                : "N/A"}
            </div>
          </label>
          <label>
            <textarea
              className="flex flex-row justify-center items-center h-96 w-2/3 min-w-980px w-980px resize font-mono bg-darkest-blue border-2 border-dark-blue mb-20"
              id="keyframeOutput"
              onSelect={handleTextChange}
              onCopy={copyHighlightedTextHandler}
              cols={frameRate}
              wrap="off"
              value={yArray}
              onChange={(e) => {
                e.persist();
                setState((old) => ({
                  ...old,
                  yArray: e.target.value,
                }));
              }}
              style={{
                width: "980px",
              }}></textarea>
          </label>
        </div>
      </div>

      <div className="flex flex-col justify-center items-cenbter mt-1"></div>

      {/* <div className="flex flex-row justify-center justify-items-center mt-10 text-3xl">
        <KeyframeTable keyframes={keyframes} frameRate={frameRate} />
      </div> */}
    </>
  );
}
