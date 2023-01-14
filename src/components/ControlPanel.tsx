import ResizableBox from "../ResizableBox";
import useChart from "../hooks/useChart";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AxisOptions, Chart, ChartOptions, Datum } from "react-charts";
import NumberInput from "./NumberInput";
import sinusoid from "../assets/sinusoid.svg";
import saw from "../assets/saw.svg";
import square from "../assets/square.svg";
import triangle from "../assets/triangle.svg";
import bumpdip from "../assets/bumpdip.svg";
import audiofile from "../assets/audiofile.svg";
import ShowHideToggle from "./ShowHideToggle";
import CopyToast from "./CopyToast";
import shallow from "zustand/shallow";

import useAudioBufferStore from "../stores/audioBufferStore";
import { useSettingsStore } from "../stores/settingsStore";
import useData from "../hooks/useData";
import SelectToggle from "./SelectToggle";
import KeyframeTable from "./KeyframeTable";
import { SaveSettings } from "./SaveLoadImportExport/SaveSettings";
import SettingsSelector from "./SaveLoadImportExport/SettingsSelector";
import ExportSettingsButton from "./SaveLoadImportExport/ExportSettingsButton";
import ImportSettingsButton from "./SaveLoadImportExport/ImportSettingsButton";

export default function ControlPanel() {
  const [settings, updateSetting] = useSettingsStore(
    (state) => [state.settings, state.updateSetting] as const
  );

  const {
    saveName,
    saveId,
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
    keyframes,
    decimalPrecision,
  } = settings;

  const [
    {
      chartCount,
      activeSeriesIndex,
      showPoints,
      memoizeSeries,
      showAxes,
      boxWidth,
    },
    setState,
  ] = React.useState({
    activeSeriesIndex: -1,
    chartCount: 1,
    showPoints: true,
    memoizeSeries: true,
    height: 400,
    showAxes: true,
    boxWidth: 0,
  });

  const data = useData({
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
    keyframes,
  });

  const [chartType, setChartType] = React.useState("line");
  const [highlightedText, setHighlightedText] = React.useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    updateSetting(event?.currentTarget?.name, event?.currentTarget?.value);
  }

  function handleChangeSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    updateSetting(event?.currentTarget?.name, event?.currentTarget?.value);
  }

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

  // const ticksOnXAxis = document.querySelectorAll(
  //   "#root > div:nth-child(2) > div > div > div > div > div > svg > g.axes > g:nth-child(1) > g.Axis-Group.inner > g > g.domainAndTicks > g > text"
  // );

  // const linesOnXAxis = document.querySelectorAll(
  // "#root > div:nth-child(2) > div > div > div > div > div > svg > g.axes > g:nth-child(1) > g.Axis-Group.inner > g > g.grid > g:nth-child(6)"
  // );

  // ticksOnXAxis.forEach((tick) => {
  //   if (Number(tick.textContent) % frameRate === 0) {
  //     tick.classList.add('tick-highlight');
  //     tick.classList.remove('tick-hide');
  //   } else {
  //     tick.classList.add('tick-hide');
  //     tick.classList.remove('tick-highlight');

  //   }
  // });

  const primaryAxis = React.useMemo<
    AxisOptions<(typeof data)[number]["data"][number]>
  >(
    () => ({
      getValue: (datum) => Number(datum.primary),
      primaryAxisId: "primary",
      show: showAxes,
      primary: true,
      dataType: "linear",
      scaleType: "linear",
      // tickRotation: datums < 100 ? 0 : 45,
    }),
    [showAxes]
  );

  const secondaryAxes = React.useMemo<
    AxisOptions<(typeof data)[number]["data"][number]>[]
  >(
    () => [
      {
        getValue: (datum) => datum.secondary,
        showDatumElements: showPoints,
        show: showAxes,
        dataType: "linear",
        elementType: chartType === "bar" ? "bar" : "line",
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
      Number(datum.primary) <= 9 ? "  " : ""
    }${Number(datum.secondary) < 0 ? "" : " "}${
      Number(datum.secondary).toFixed(decimalPrecision) === "-0.00" ? " " : ""
    }${datum.primary >= 10 ? " " : ""}${datum.primary <= 99 ? " " : ""}${
      linkFrameOffset == true ? i + Number(leftRightOffset) : i
    }:${Math.sign(Number(datum.secondary)) === 1 || -1 ? "" : ""}${
      Math.sign(Number(datum.secondary)) === -1 ? "" : ""
    }(${Number(datum.secondary)
      .toFixed(decimalPrecision)
      .replace("-0.00", "0.00")})`;
  });

  const yArrayRaw = data[0].data.map((datum: { secondary: any }) => {
    return datum.secondary?.toFixed(decimalPrecision);
  });

  const yArraySum = yArrayRaw.reduce(
    (accumulator: number, currentValue: number) =>
      Number(accumulator as number) + Number(currentValue as number)
  );
  const yArrayAbsSum = yArrayRaw.reduce(
    (accumulator: number, currentValue: number) =>
      Number(accumulator as number) + Number(Math.abs(currentValue as number))
  );

  const yArrayAvg = (yArraySum as number) / yArrayRaw.length;
  const yArrayAbsAvg = (yArrayAbsSum as number) / yArrayRaw.length;
  const yArrayMin = Math.min(...(yArrayRaw as number[]));
  const yArrayMax = Math.max(...(yArrayRaw as number[]));

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

  // const calculateColor = (value: number, minValue: number, maxValue: number) => {
  //   const percentage = 1 * (value - minValue) / (maxValue - minValue);
  //   //console.log("percentage", percentage)
  //   return percentage;
  // };

  // const opacity = yArrayRaw.map((value, i) => {
  //   return calculateColor(value[i], yArrayMin, yArrayMax);
  // });

  return (
    <>
      <div className="flex flex-col justify-center">
        {[...new Array(chartCount)].map((d, i) => (
          <ResizableBox
            key={i}
            height={240}
            width={boxWidth * datums * 3 + 1440}>
            <Chart
              options={{
                data,
                primaryAxis,
                secondaryAxes,
                memoizeSeries,
                dark: true,
                tooltip: true,

                getDatumStyle: (d, _status) => ({
                  color: "#F97316",
                  //stroke: "#F97316",

                  // opacity:
                  //   activeSeriesIndex > -1
                  //     ? datum.seriesIndex === activeSeriesIndex
                  //       ? 1
                  //       : 0.1
                  //     : 1,
                }),

                getSeriesStyle: (series, _status) => ({
                  stroke: "#F97316",
                  // opacity: `rgba(249, 115, 22, })`,
                  // stroke: `rgba(249, 115, 22, ${opacity[i]})`,
                  color: `rgba(255, 255, 255, )`,
                  //backgroundColor: "white",
                  //color: "white",
                  //stroke: "white",
                  // opacity:
                  //   activeSeriesIndex > -1
                  //     ? series.index === activeSeriesIndex
                  //       ? 1
                  //       : 0.1
                  //     : 1,
                }),

                // primaryCursor: {
                //   value: primaryCursorValue,
                //   onChange: (value) => {
                //     setPrimaryCursorValue(value);
                //   },
                // },
                // secondaryCursor: {
                //   value: secondaryCursorValue,
                //   onChange: (value) => {
                //     setSecondaryCursorValue(value);
                //   },
                // },
                // onFocusDatum: (datum) => {
                //   setState((old) => ({
                //     ...old,
                //     activeSeriesIndex: datum ? datum.seriesIndex : -1,
                //   }));
                // },
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
        <div className="mb-4 flex shrink flex-row justify-center space-x-2 bg-darkest-blue font-mono text-gray-400">
          Min: {yArrayMin?.toFixed(decimalPrecision)} |
          Max:{" "}{yArrayMax?.toFixed(decimalPrecision)} | 
          Sum: {Number(datums) > 1 ? yArraySum?.toFixed(decimalPrecision) : yArraySum} | 
          Average: {Number(datums) > 1 ? yArrayAvg?.toFixed(decimalPrecision) : yArrayAvg} | 
          Absolute Sum: {Number(datums) > 1 ? yArraySum.toFixed(decimalPrecision) : yArraySum} |
          Absolute Avg: {Number(datums) > 1 ? yArrayAbsAvg.toFixed(decimalPrecision) : yArrayAbsAvg} | 
          Duration: {(yArrayRaw.length / frameRate).toFixed(decimalPrecision)}s{" "}
          <label>
            | Chart{" "}
            <select
              className="border-2 border-dark-blue bg-darker-blue"
              value={chartType}
              onChange={setChartTypeHandler}>
              <option value="line">Line</option>
              <option value="bar">Bar</option>
            </select>
          </label>
        </div>

        {/* Control Panel */}
        <div className="ml-2 flex max-w-2xl grow justify-start space-x-2 font-mono md:flex-col lg:flex-row ">
          {/* Save Settings */}

          <fieldset className="min-w-fit space-x-2 bg-darkest-blue font-mono">
            <legend className="border-1 flex flex-col ">
              Presets (experimental)
            </legend>
            <div className="mb-2 mt-2 flex flex-row justify-between">
              <ImportSettingsButton />
              <ExportSettingsButton />
            </div>
            <SettingsSelector />
            <SaveSettings />
          </fieldset>

          {/* Wave Settings */}

          <fieldset className="min-w-fit space-x-2 bg-darkest-blue p-4 font-mono">
            <legend className="flex flex-row">
              Select Wave or upload{" "}
              <span className="pl-2">
                <input
                  className="text-orange-500"
                  type="file"
                  ref={fileInput}
                  onChange={handleFileUpload}
                />
              </span>{" "}
            </legend>

            <div className="flex flex-col">
              {/* Primary Wave Settings */}
              <fieldset className="mb-2 min-w-fit shrink border-2 border-dark-blue pl-2 pr-2 pb-2">
                <legend className="mb-2">
                  Primary Wave
                  {/* Sin/Cos */}
                  <label>
                    {" "}
                    <select
                      className="border-2 border-dark-blue bg-darker-blue"
                      value={toggleSinCos}
                      onChange={(e) => {
                        e.persist();
                        updateSetting("toggleSinCos", e.target.value);
                      }}>
                      <option value="cos">Cosine</option>
                      <option value="sin">Sine</option>
                    </select>
                  </label>
                </legend>
                <div className="mb-2 flex shrink flex-row justify-start text-center text-xs">
                  {/* Sinusoid */}
                  <input
                    className="radio appearance-none"
                    type="radio"
                    id="sinusoid"
                    name="waveType"
                    value="sinusoid"
                    onChange={handleChange}
                  />
                  <label
                    className={`mr-2 border-2 bg-darker-blue p-1 ${
                      waveType === "sinusoid"
                        ? "border-orange-500"
                        : "border-dark-blue"
                    } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                    htmlFor="sinusoid">
                    <img
                      src={sinusoid}
                      alt="sinusoid"
                      className={"aspect-square w-16"}
                    />
                  </label>
                  {/* Saw */}
                  <input
                    className="radio appearance-none"
                    type="radio"
                    id="saw"
                    name="waveType"
                    value="saw"
                    onChange={handleChange}
                  />
                  <label
                    className={`mr-2 border-2 bg-darker-blue p-1 ${
                      waveType === "saw"
                        ? "border-orange-500"
                        : "border-dark-blue"
                    } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                    htmlFor="saw">
                    <img src={saw} alt="saw" className={"aspect-square w-16"} />
                  </label>
                  {/* Triangle */}

                  <input
                    className="radio appearance-none"
                    type="radio"
                    id="triangle"
                    name="waveType"
                    value="triangle"
                    onChange={handleChange}
                  />
                  <label
                    className={`mr-2 border-2 bg-darker-blue p-1 ${
                      waveType === "triangle"
                        ? "border-orange-500"
                        : "border-dark-blue"
                    } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                    htmlFor="triangle">
                    <img
                      src={triangle}
                      alt="triangle"
                      className={"aspect-square w-16"}
                    />
                  </label>
                  {/* Square */}
                  <input
                    className="radio appearance-none"
                    type="radio"
                    id="square"
                    name="waveType"
                    value="square"
                    onChange={handleChange}
                  />
                  <label
                    className={`mr-2 border-2 bg-darker-blue p-1 ${
                      waveType === "square"
                        ? "border-orange-500"
                        : "border-dark-blue"
                    } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                    htmlFor="square">
                    <img
                      src={square}
                      alt="square"
                      className={"aspect-square w-16"}
                    />
                  </label>
                  {/* Bumpdip */}
                  <input
                    className="radio appearance-none"
                    type="radio"
                    id="bumpdip"
                    name="waveType"
                    value="bumpdip"
                    onChange={handleChange}
                  />
                  <label
                    className={`mr-2 border-2 bg-darker-blue p-1 ${
                      waveType === "bumpdip"
                        ? "border-orange-500"
                        : "border-dark-blue"
                    } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                    htmlFor="bumpdip">
                    <img
                      src={bumpdip}
                      alt="bumpdip"
                      className={"aspect-square w-16"}
                    />
                  </label>
                  {/* Audio */}
                  <input
                    className="radio appearance-none"
                    type="radio"
                    id="audio"
                    name="audio"
                    value="audio"
                    checked={waveType === "audio"}
                    onChange={(e) => {
                      e.persist();
                      updateSetting("waveType", e.target.value);
                    }}
                  />
                  <label
                    className={`border-2 bg-darker-blue p-1 ${
                      waveType === "audio"
                        ? "border-orange-500"
                        : "border-dark-blue"
                    } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                    htmlFor="audio">
                    <img
                      src={audiofile}
                      alt="audio"
                      className={"aspect-square w-16"}
                    />
                  </label>
                </div>
                {/* Primary Wave Settings */}
                <div className="flex flex-auto">
                  {/* Amplitude */}
                  <label className="z-index-100 mr-2 flex shrink flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                    AMPLITUDE{" "}
                    <NumberInput
                      name="amplitude"
                      min={-100}
                      max={100}
                      step={0.01}
                      onChange={handleChange}
                    />
                  </label>
                  {/* Up/Down Offset*/}
                  <label className="z-index-100 mr-2 flex shrink flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                    SHIFT UP/DOWN{" "}
                    <NumberInput
                      name="upDownOffset"
                      min={-100}
                      max={100}
                      step={0.01}
                      onChange={handleChange}
                    />
                  </label>
                  {/* Bend*/}
                  <label className="z-index-100 mr-2 flex shrink flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                    BEND{" "}
                    <NumberInput
                      name="bend"
                      // value={bend === 0 && waveType != "saw" ? 1 : bend}
                      min={1}
                      max={waveType === "saw" ? 100 : 200}
                      step={waveType === "saw" ? 0.1 : 2}
                      onChange={handleChange}
                    />
                  </label>

                  {/* Noise*/}
                  <label className="z-index-100 flex shrink flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                    NOISE{" "}
                    <NumberInput
                      name="noiseAmount"
                      min={0}
                      max={100}
                      step={0.01}
                      onChange={handleChange}
                    />
                  </label>
                </div>
              </fieldset>
              {/* Modulator Settings */}
              <fieldset className="border-2 border-dark-blue pl-2 pr-2 pb-2 ">
                <legend className="mb-2 flex flex-row space-x-2">
                  <label className="ml-2 flex flex-row items-center">
                    <input
                      name="modEnabled"
                      type="checkbox"
                      className="form-checkbox h-5 w-5 cursor-pointer text-orange-500"
                      checked={modEnabled}
                      onChange={(e) => {
                        e.persist();
                        updateSetting("modEnabled", e.target.checked);
                      }}
                    />
                  </label>{" "}
                  Enable Modulator
                  {/* checkbox for modEnabled */}
                  {/* Sin/Cos */}
                  <label>
                    {" "}
                    <select
                      name="modToggleSinCos"
                      className="border-2 border-dark-blue bg-darker-blue"
                      value={modToggleSinCos}
                      onChange={(e) => {
                        e.persist();
                        updateSetting("modToggleSinCos", e.target.value);
                      }}>
                      <option value="cos">Cosine</option>
                      <option value="sin">Sine</option>
                    </select>
                  </label>
                </legend>
                {/* Secondary Wave Settings */}
                <div className="flex flex-col flex-wrap ">
                  <div className="mb-2 flex flex-row">
                    {/* Mod Amplitude */}
                    <label className="z-index-100 mr-2  flex flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                      MOD AMPLITUDE{" "}
                      <NumberInput
                        name="modAmp"
                        min={-100}
                        max={100}
                        step={0.01}
                        onChange={handleChange}
                      />
                    </label>
                    {/* Mod Up/Down Offset*/}
                    <label className="z-index-100 mr-2  flex flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                      MOD SHIFT UP/DOWN{" "}
                      <NumberInput
                        name="modMoveUpDown"
                        min={-100}
                        max={100}
                        step={0.1}
                        onChange={handleChange}
                      />
                    </label>
                    {/* Mod Bend*/}
                    <label className="z-index-100 mr-2  flex flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                      MOD BEND{" "}
                      <NumberInput
                        name="modBend"
                        min={1}
                        max={1000}
                        step={2}
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                  <div className="flex flex-row">
                    {/* Mod Tempo*/}
                    <label className="z-index-100 mr-2  flex flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                      MOD TEMPO{" "}
                      <NumberInput
                        name="modTempo"
                        min={1}
                        max={1000}
                        step={1}
                        onChange={handleChange}
                      />
                    </label>
                    {/* Mod Rhythm Rate*/}
                    <label className="z-index-100 mr-2  flex flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                      MOD RHYTHM RATE {/* option selector for rhythmRates */}
                      <select
                        name="modRhythmRate"
                        className="border-2 border-dark-blue bg-darker-blue"
                        value={modRhythmRate}
                        onChange={handleChangeSelect}>
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
                    <label className="z-index-100 mr-2  flex flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                      MOD FRAME RATE{" "}
                      <NumberInput
                        name="modFrameRate"
                        min={1}
                        max={1000}
                        step={1}
                        onChange={handleChange}
                      />
                    </label>
                    {/* Move Left/Right */}
                    {/* <label className="flex flex-col  bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm mr-2">
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
          <div className="flex flex-col font-mono">
            {/* Frame Settings */}
            <fieldset className="flex flex-row justify-start bg-darkest-blue pl-3 pr-3 pb-3 font-mono">
              <legend>Frame Settings</legend>
              <label className="z-index-100 mr-2 flex  flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                FRAME RATE (FPS)
                <NumberInput
                  name="frameRate"
                  min={1}
                  max={240}
                  step={1}
                  onChange={handleChange}
                />
              </label>
              <label className="z-index-100 flex flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                FRAME COUNT
                <NumberInput
                  name="datums"
                  min={1}
                  max={10000}
                  step={1}
                  onChange={handleChange}
                />
              </label>
            </fieldset>

            {/* Sync Settings */}
            <fieldset className="flex-row-auto justify-start bg-darkest-blue pl-3 pr-3 pb-3 font-mono">
              <legend>Sync Settings</legend>
              {/* Tempo and Shift Left/Right */}
              <div className="mb-2 flex flex-row space-x-2">
                {/* Tempo */}
                <label className="z-index-100 flex flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                  TEMPO (BPM)
                  <NumberInput
                    name="tempo"
                    min={1}
                    max={10000}
                    step={1}
                    onChange={handleChange}
                  />
                </label>
                {/* Shift Left/Right */}

                <label className="z-index-100 flex  flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                  SHIFT LEFT/RIGHT
                  {/* Link Horizonal Offset & Starting Frame */}
                  <label className="text-xs">
                    START FRAME{" "}
                    <input
                      name="linkFrameOffset"
                      type="checkbox"
                      checked={linkFrameOffset}
                      onChange={(e) => {
                        e.persist();
                        updateSetting("linkFrameOffset", e.target.checked);
                      }}
                    />
                  </label>
                  <NumberInput
                    name="leftRightOffset"
                    min={0}
                    max={10000}
                    step={1}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="flex flex-col">
                <fieldset className="border-2 border-dark-blue pl-2 pr-2">
                  <legend className="text-sm">SYNC RATE</legend>
                  {/*New Rythm Rate*/}
                  <div className="mb-2 flex flex-col-reverse flex-wrap justify-start text-center font-mono text-xs">
                    {/* Row 1 */}

                    <div className="mt-2 flex flex-row">
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="halfbarTriplet"
                        name="rhythmRate"
                        value="40"
                        checked={rhythmRate === 40}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2  ${
                          rhythmRate == 40
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="halfbarTriplet">
                        1/2T
                      </label>
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="quarterbarTriplet"
                        name="rhythmRate"
                        value="20"
                        checked={rhythmRate === 20}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2  ${
                          rhythmRate == 20
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="quarterbarTriplet">
                        1/4T
                      </label>
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="eighthbarTriplet"
                        name="rhythmRate"
                        value="10"
                        checked={rhythmRate === 10}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2  ${
                          rhythmRate == 10
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="eighthbarTriplet">
                        1/8T
                      </label>
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="sixteenthbarTriplet"
                        name="rhythmRate"
                        value="5"
                        checked={rhythmRate === 5}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2 ${
                          rhythmRate == 5
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="sixteenthbarTriplet">
                        1/16T
                      </label>
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="thirtysecondbarTriplet"
                        name="rhythmRate"
                        value="2.5"
                        checked={rhythmRate === 2.5}
                        onChange={handleChange}
                      />
                      <label
                        className={`grow border-2 bg-darker-blue p-2  ${
                          rhythmRate == 2.5
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="thirtysecondbarTriplet">
                        1/32T
                      </label>
                    </div>

                    {/* Row 2 */}
                    <div className="mt-2 flex flex-row">
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="halfbar"
                        name="rhythmRate"
                        value="120"
                        checked={rhythmRate === 120}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2 ${
                          rhythmRate == 120
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="halfbar">
                        1/2
                      </label>
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="quarterbar"
                        name="rhythmRate"
                        value="60"
                        checked={rhythmRate === 60}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2  ${
                          rhythmRate == 60
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="quarterbar">
                        1/4
                      </label>

                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="eighthbar"
                        name="rhythmRate"
                        value="30"
                        checked={rhythmRate === 30}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2  ${
                          rhythmRate == 30
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="eighthbar">
                        1/8
                      </label>

                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="sixteenthbar"
                        name="rhythmRate"
                        value="15"
                        checked={rhythmRate === 15}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2  ${
                          rhythmRate == 15
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="sixteenthbar">
                        1/16
                      </label>

                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="thirtysecondbar"
                        name="rhythmRate"
                        value="7.5"
                        checked={rhythmRate === 7.5}
                        onChange={handleChange}
                      />
                      <label
                        className={`grow border-2 bg-darker-blue p-2  ${
                          rhythmRate == 7.5
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="thirtysecondbar">
                        1/32
                      </label>
                    </div>
                    {/* Row 3 */}
                    <div className="flex flex-row">
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="thirtytwoBars"
                        name="rhythmRate"
                        value="7680"
                        checked={rhythmRate === 7680}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2  ${
                          rhythmRate == 7680
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="thirtytwoBars">
                        32
                      </label>
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="16bars"
                        name="rhythmRate"
                        value="3840"
                        checked={rhythmRate === 3840}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2  ${
                          rhythmRate == 3840
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="16bars">
                        16
                      </label>
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="8bars"
                        name="rhythmRate"
                        value="1920"
                        checked={rhythmRate === 1920}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2 ${
                          rhythmRate == 1920
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="8bars">
                        8
                      </label>
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="4bars"
                        name="rhythmRate"
                        value="960"
                        checked={rhythmRate === 960}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2  ${
                          rhythmRate == 960
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="4bars">
                        4
                      </label>
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="2bars"
                        name="rhythmRate"
                        value="480"
                        checked={rhythmRate === 480}
                        onChange={handleChange}
                      />
                      <label
                        className={`mr-2 grow border-2 bg-darker-blue p-2  ${
                          rhythmRate == 480
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="2bars">
                        2
                      </label>
                      <input
                        className="radio appearance-none"
                        type="radio"
                        id="1bar"
                        name="rhythmRate"
                        value="240"
                        checked={rhythmRate === 240}
                        onChange={handleChange}
                      />
                      <label
                        className={`grow border-2 bg-darker-blue  p-2  ${
                          rhythmRate == 240
                            ? "border-orange-500"
                            : "border-dark-blue"
                        } cursor-pointer duration-300 ease-out hover:border-orange-600`}
                        htmlFor="1bar">
                        1
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>
              <div className="mt-1 flex max-w-xs flex-col justify-start">
                Decimal Places
                <NumberInput
                  name={"decimalPrecision"}
                  min={0}
                  max={10}
                  step={1}
                  onChange={handleChange}
                />
              </div>
            </fieldset>
          </div>
          <fieldset>
            <legend className="text-white">Timing Table</legend>
            <table className="bg-darkest-blue text-sm">
              <thead className="text-left">
                <tr>
                  <th>Rate</th>
                  <th>Time</th>
                  <th>Frames</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-dark-blue text-left">
                <tr>
                  <td>32bars</td>
                  <td>{(6960 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((6960 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
                <tr>
                  <td>16bars</td>
                  <td>{(3840 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((3840 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
                <tr>
                  <td>8bars</td>
                  <td>{(1920 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((1920 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
                <tr>
                  <td>4bars</td>
                  <td>{(960 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((960 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
                <tr>
                  <td>2bars</td>
                  <td>{(480 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((480 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
                <tr>
                  <td>1bar</td>
                  <td>{(240 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((240 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
                <tr>
                  <td>1/2</td>
                  <td>{(120 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((120 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>

                <tr>
                  <td>1/4</td>
                  <td>{(60 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((60 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
                <tr>
                  <td>1/2t</td>
                  <td>{(40 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((40 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>

                <tr>
                  <td>1/8</td>
                  <td>{(30 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((30 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
                <tr>
                  <td>1/4t</td>
                  <td>{(20 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((20 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
                <tr>
                  <td>1/16</td>
                  <td>{(15 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((15 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
                <tr>
                  <td>1/8t</td>
                  <td>{(10 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((10 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
                <tr>
                  <td>1/32</td>
                  <td>{(7.5 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((7.5 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
                <tr>
                  <td>1/16t</td>
                  <td>{(5 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>{((5 / tempo) * frameRate).toFixed(decimalPrecision)}</td>
                </tr>
                <tr>
                  <td>1/32t</td>
                  <td>{(2.5 / tempo).toFixed(decimalPrecision)}s</td>
                  <td>
                    {((2.5 / tempo) * frameRate).toFixed(decimalPrecision)}
                  </td>
                </tr>
              </tbody>
            </table>
          </fieldset>
        </div>

        {/* Outputs */}
        <div className="mt-1 flex grow flex-row items-center justify-start">
          {/* a button to copy keyframeOutput to the clipboard */}

          <div>
            <label>
              <button
                className="bg-green-800 p-2 font-mono text-white transition-all duration-150 ease-out hover:bg-green-600 active:bg-green-700"
                onCopy={copyHighlightedTextHandler}
                onClick={() => {
                  navigator.clipboard.writeText(yArray as unknown as string);
                }}>
                <CopyToast>Copy Keyframes</CopyToast>
              </button>
            </label>
            <label>
              <button
                className="bg-green-700 p-2 font-mono text-white transition-all duration-150 ease-out hover:bg-green-500 active:bg-green-600"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `(${currentFormula}${modEnabled ? "*" : ""}${
                      modEnabled ? currentFormulaMod : ""
                    })`
                  );
                }}>
                <CopyToast>Copy Formula</CopyToast>
              </button>
              <div className="inline-flex bg-darkest-blue p-3 font-mono">
                {waveType != "audio"
                  ? `${
                      linkFrameOffset == true ? Number(leftRightOffset) : 0
                    }: (${currentFormula}${modEnabled ? "*" : ""}${
                      modEnabled ? currentFormulaMod : ""
                    })`
                  : "N/A"}
              </div>
            </label>
            <label>
              <textarea
                className="min-w-980px mb-2 flex h-96 w-max resize flex-row items-start justify-start border-2 border-dark-blue bg-darkest-blue font-mono"
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

        <div className="mt-10 flex flex-row justify-center justify-items-center text-3xl">
          {/* <KeyframeTable keyframes={yArrayRaw} frameRate={frameRate}  /> */}
        </div>
      </div>
    </>
  );
}
