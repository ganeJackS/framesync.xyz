import ResizableBox from "../ResizableBox";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AxisOptions,
  Chart,
  ChartOptions,
  Datum,
  GridDimensions,
  AxisOptionsWithScaleType,
  AxisBand,
  AxisBandOptions,
  AxisOptionsBase,
  AxisTimeOptions,
} from "react-charts";
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
import { Settings, State, useSettingsStore } from "../stores/settingsStore";
import useData from "../hooks/useData";
import SelectToggle from "./SelectToggle";
import KeyframeTable from "./KeyframeTable";
import { SaveSettings } from "./SaveLoadImportExport/SaveSettings";
import SettingsSelector from "./SaveLoadImportExport/SettingsSelector";
import ExportSettingsButton from "./SaveLoadImportExport/ExportSettingsButton";
import ImportSettingsButton from "./SaveLoadImportExport/ImportSettingsButton";
import { curveLinear } from "d3-shape";
import hash from "object-hash";

export default function ControlPanel() {
  const [
    settings,
    locks,
    //factoryPresets,
    //userPresets,
    updateSetting,
    //updateSettingFromList,
    updateLock,
  ] = useSettingsStore(
    (state) => [
      state.settings,
      state.locks,
      //state.factoryPresets,
      //state.userPresets,
      state.updateSetting,
      //state.updateSettingFromList,
      state.updateLock,
    ],
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
    hardMax,
    hardMin,
    channelProcess,
  } = settings;

  const { lockDatumCount, lockTempo, lockFrameRate } = locks;

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
    channelProcess,
  });

  const [chartType, setChartType] = React.useState("line");
  const [highlightedText, setHighlightedText] = React.useState("");
  const [primaryCursorValue, setPrimaryCursorValue] = React.useState();
  const [secondaryCursorValue, setSecondaryCursorValue] = React.useState(0);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    updateSetting(
      event?.target?.name as keyof Settings["state"],
      event?.target?.value
    );
  }
  function handleChangeSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    updateSetting(
      event?.target?.name as keyof Settings["state"],
      event?.target?.value
    );
  }

  const fileInput = useRef<HTMLInputElement>(null);
  const audioElement = useRef<HTMLAudioElement>(null);
  const [setAudioBuffer] = useAudioBufferStore((state) => [
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
          audioElement.current!.src = URL.createObjectURL(file);
        }
      );
    };

    fileReader.readAsArrayBuffer(file);
    // file.text().then((text) => {
    //   console.log(hash(text));
    // });
    updateSetting("waveType", "audio");
    updateSetting("channelProcess", "stereo");
  };

  const primaryAxis = React.useMemo<
    AxisOptions<(typeof data)[number]["data"][number]>
  >(
    () => ({
      getValue: (datum) => datum.primary,
      primaryAxisId: "primary",
      position: "bottom",
      show: showAxes,
      primary: true,
      tickCount: datums > 150 ? 24 : 48,
      shouldNice: true,
      curve: curveLinear,
      scaleType: "linear",
      minDomainLength: 10,

      // formatters: {
      //   scale: (value) => {
      //     return value % frameRate === 0 ? value : ".";
      //   },
      // },
    }),
    [showAxes, datums, frameRate, rhythmRate, tempo]
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
        curve: curveLinear,
      },
    ],
    [showAxes, showPoints, chartType]
  );

  datums >= 1 ? datums : datums + 1;

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

  const yArray = data[0].data.map(
    (datum: { primary: number; secondary: any }, i: number) => {
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
    }
  );

  const yArrayRaw = data[0].data.map((datum: { secondary: any }) => {
    return datum.secondary?.toFixed(decimalPrecision);
  });

  const primaryWaveArray = data[0].data.map(
    (datum: { primaryWave: number }) => {
      return datum.primaryWave?.toFixed(decimalPrecision);
    }
  );

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

  const primaryWaveMax = Math.max(...(primaryWaveArray as unknown as number[]));
  const primaryWaveMin = Math.min(...(primaryWaveArray as unknown as number[]));

  let currentFormula = `(${amplitude} * ${
    toggleSinCos === "cos" ? "cos" : "sin"
  }((${tempo} / ${rhythmRate} * 3.141 * (t + ${leftRightOffset}) / ${frameRate} ))**${bend} + ${upDownOffset})`;

  if (waveType === "sinusoid") {
    currentFormula = `(${amplitude} * ${
      toggleSinCos === "cos" ? "cos" : "sin"
    }((${tempo} / ${rhythmRate} * 3.141 * (t + ${leftRightOffset}) / ${frameRate}))**${bend} + ${upDownOffset})`;
  } else if (waveType === "saw") {
    currentFormula = `(-(2 * ${amplitude} / 3.141) * arctan((1 * ${bend} + 1) / tan(((t  + ${leftRightOffset}) * 3.141 * ${tempo} / ${rhythmRate} / ${frameRate}))) + ${upDownOffset})`;
  } else if (waveType === "triangle") {
    currentFormula = `((2 * ${amplitude} / 3.141) * arcsin(${
      toggleSinCos === "cos" ? "cos" : "sin"
    }(${tempo} / ${rhythmRate} * 3.141 * (t + ${leftRightOffset}) / ${frameRate})**${bend}) + ${upDownOffset})`;
  } else if (waveType === "bumpdip") {
    currentFormula = `(${amplitude} * ${
      toggleSinCos === "cos" ? "cos" : "sin"
    }((${tempo} / ${rhythmRate} * 3.141 * (t + ${leftRightOffset}) / ${frameRate}))**${bend}0 + ${upDownOffset})`;
  } else if (waveType === "square") {
    currentFormula = `where((${amplitude} * ${
      toggleSinCos === "cos" ? "cos" : "sin"
    }((${tempo} / ${rhythmRate} * 3.141 * (t + ${leftRightOffset}) / ${frameRate}))**${bend} + ${upDownOffset})>=${upDownOffset}, ${primaryWaveMax}, ${primaryWaveMin})`;
  }

  const currentFormulaMod = `(${modAmp} * ${
    modToggleSinCos === "cos" ? "cos" : "sin"
  }((${tempo} / ${modRhythmRate} * 3.141 * (t + ${modMoveLeftRight}) / ${frameRate} ))**${
    waveType != "bumpdip" ? modBend : modBend + 0
  } + ${modMoveUpDown})`;

  const frameInSeconds = Number(
    (Number(primaryCursorValue) / frameRate).toFixed(decimalPrecision)
  );

  const cursorValues = `${
    primaryCursorValue === undefined ? 0 : primaryCursorValue
  }:(${
    secondaryCursorValue?.toFixed(decimalPrecision) === undefined
      ? Number(0).toFixed(decimalPrecision)
      : secondaryCursorValue.toFixed(decimalPrecision)
  }) @ ${
    Number.isNaN(frameInSeconds)
      ? Number(0).toFixed(decimalPrecision)
      : frameInSeconds
  } seconds`;

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
                memoizeSeries: true,
                dark: true,
                tooltip: false,
                getSeriesStyle: (series) => ({
                  color: "#F97316",
                  stroke: "#F97316",
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
              }}
            />
          </ResizableBox>
        ))}
        {/* Zoom slider */}
        <label>
          <input
            className="zoom-slider h-10 bg-darkest-blue"
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
        {/* frame and value */}
        <div className="flex flex-row justify-center space-x-2 bg-darkest-blue font-mono text-gray-400">
          {cursorValues}
        </div>

        {/* Stats */}
        {/* <div className="mb-4 flex shrink flex-row justify-center space-x-2 bg-darkest-blue font-mono text-gray-400">
          Min: {yArrayMin?.toFixed(decimalPrecision)} | Max:{" "}
          {yArrayMax?.toFixed(decimalPrecision)} | Sum:{" "}
          {Number(datums) > 1
            ? yArraySum?.toFixed(decimalPrecision)
            : yArraySum}{" "}
          | Average:{" "}
          {Number(datums) > 1
            ? yArrayAvg?.toFixed(decimalPrecision)
            : yArrayAvg}{" "}
          | Absolute Sum:{" "}
          {Number(datums) > 1 ? yArraySum.toFixed(decimalPrecision) : yArraySum}{" "}
          | Absolute Avg:{" "}
          {Number(datums) > 1
            ? yArrayAbsAvg.toFixed(decimalPrecision)
            : yArrayAbsAvg}{" "}
          | Duration: {(yArrayRaw.length / frameRate).toFixed(decimalPrecision)}
          s{" "}
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
        </div> */}

        {/* Control Panel */}
        <div className="w-md ml-2 flex justify-start space-x-2 font-mono md:flex-col lg:flex-row ">
          {/* Save Settings */}

          <fieldset className="min-w-fit space-x-2 rounded-sm border border-dark-blue bg-darkest-blue font-mono shadow-sm">
            <legend className="border-1 flex flex-col ">
              Animation Presets
            </legend>

            <SettingsSelector />
            <SaveSettings />

            <div className="flex flex-col p-2 align-middle">
              <SelectToggle
                name={"Lock Frame Count"}
                isOrange={lockDatumCount}
                onToggle={(e) => {
                  updateLock("lockDatumCount", e ? true : false);
                }}
              />

              <SelectToggle
                name={"Lock Frame Rate"}
                isOrange={lockFrameRate}
                onToggle={(e) => {
                  updateLock("lockFrameRate", e ? true : false);
                }}
              />

              <SelectToggle
                name={"Lock Tempo"}
                isOrange={lockTempo}
                onToggle={(e) => {
                  updateLock("lockTempo", e ? true : false);
                }}
              />
            </div>
            <div className="mb-2 mt-2 flex flex-row justify-start space-x-1">
              <ImportSettingsButton />
              <ExportSettingsButton />
            </div>
          </fieldset>

          {/* Wave Settings */}
          <fieldset className="w-fit space-x-2 rounded-sm border border-dark-blue bg-darkest-blue pl-1 pr-3 pt-2 pb-2 font-mono shadow-sm">
            <legend className="flex flex-row">Wave Settings
            <select
                  className="border-2 border-dark-blue bg-darker-blue ml-2"
                  value={chartType}
                  onChange={setChartTypeHandler}>
                  <option value="line">Line</option>
                  <option value="bar">Bar</option>
                </select>
            </legend>

            <span className="mb-2 max-w-lg pl-2 pr-2 pb-2 text-xs shadow-inner">
              Select a Primary Wave or upload an wav/mp3 file for
              audio2keyframes
            </span>

            {/* Audio Controls */}
            <div className="mb-2 border border-dark-blue">
              <ShowHideToggle
                label="Audio Controls"
                showLabel="Show"
                hideLabel="Hide">
                <div className="flex flex-col">
                  <input
                    className=" border-y pt-2 border-dark-blue bg-darkest-blue pr-2 text-orange-500"
                    type="file"
                    ref={fileInput}
                    onChange={handleFileUpload}
                  />
                  <audio
                    className={`mt-3 block w-auto rounded-none bg-darkest-blue ${
                      waveType === "audio" ? "" : "opacity-30"
                    }`}
                    ref={audioElement}
                    controls
                    use-credentials
                  />
                </div>
              </ShowHideToggle>
            </div>
            <div className="flex w-full flex-col">
              {/* Primary Wave Settings */}
              <fieldset className="mb-2 max-w-lg  border-2 border-dark-blue pl-2 pr-2 pb-2 shadow-inner">
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
                  </label>{" "}
                  <select
                    className={`border-2 border-dark-blue bg-darker-blue ${
                      waveType === "audio" ? "" : "opacity-30"
                    }`}
                    value={channelProcess}
                    onChange={(e) => {
                      e.persist();
                      updateSetting("channelProcess", e.target.value);
                    }}>
                    <option value="stereo">Stereo</option>
                    <option value="stereoNegative">StereoN</option>
                  </select>
                </legend>
                <div className="mb-2 flex max-w-fit shrink flex-row justify-start text-center text-xs text-gray-300">
                  {/* Sinusoid */}
                  <input
                    className="radio appearance-none"
                    type="radio"
                    id="sinusoid"
                    name="waveType"
                    value="sinusoid"
                    checked={waveType === "sinusoid"}
                    onChange={handleChange}
                  />
                  <label
                    className={`mr-2 border-2 bg-darker-blue p-1 ${
                      waveType === "sinusoid"
                        ? "border-orange-500"
                        : "border-dark-blue"
                    } cursor-pointer duration-150 ease-out hover:border-orange-600`}
                    htmlFor="sinusoid"
                    title="Sinusoid">
                    Sinusoid
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
                    checked={waveType === "saw"}
                    onChange={handleChange}
                  />
                  <label
                    className={`mr-2 border-2 bg-darker-blue p-1 ${
                      waveType === "saw"
                        ? "border-orange-500"
                        : "border-dark-blue"
                    } cursor-pointer duration-150 ease-out hover:border-orange-600`}
                    htmlFor="saw"
                    title="Sawtooth">
                    Sawtooth
                    <img src={saw} alt="saw" className={"aspect-square w-16"} />
                  </label>
                  {/* Triangle */}

                  <input
                    className="radio appearance-none"
                    type="radio"
                    id="triangle"
                    name="waveType"
                    value="triangle"
                    checked={waveType === "triangle"}
                    onChange={handleChange}
                  />
                  <label
                    className={`mr-2 border-2 bg-darker-blue p-1 ${
                      waveType === "triangle"
                        ? "border-orange-500"
                        : "border-dark-blue"
                    } cursor-pointer duration-150 ease-out hover:border-orange-600`}
                    htmlFor="triangle"
                    title="Triangle">
                    Triangle
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
                    checked={waveType === "square"}
                    onChange={handleChange}
                  />
                  <label
                    className={`mr-2 border-2 bg-darker-blue p-1 ${
                      waveType === "square"
                        ? "border-orange-500"
                        : "border-dark-blue"
                    } cursor-pointer duration-150 ease-out hover:border-orange-600`}
                    htmlFor="square"
                    title="Square">
                    Square
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
                    checked={waveType === "bumpdip"}
                    onChange={handleChange}
                  />
                  <label
                    className={`mr-2 border-2 bg-darker-blue p-1 ${
                      waveType === "bumpdip"
                        ? "border-orange-500"
                        : "border-dark-blue"
                    } cursor-pointer duration-150 ease-out hover:border-orange-600`}
                    htmlFor="bumpdip"
                    title="Bumpdip">
                    BumpDip
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
                    } cursor-pointer duration-150 ease-out hover:border-orange-600`}
                    htmlFor="audio"
                    title="Audio">
                    .wav/.mp3
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
                  <label
                    title="[Y-Axis] Sets the range of keyframe values. Higher absolute value = more effect. Lower absolute value = less effect. Use negative values to invert the polarity of the wave. Max is highest value, min is lowest. Use negative values for dips or positive for bumps."
                    className="z-index-100 mr-2 flex w-1/4 flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                    AMPLITUDE{" "}
                    <NumberInput
                      name="amplitude"
                      min={-10000}
                      max={10000}
                      step={0.01}
                      onChange={handleChange}
                    />
                  </label>
                  {/* Up/Down Offset*/}
                  <label
                    title="[Y-Axis] Moves entire keyframe value range up or down. Useful for creating biased effects, for example, zoom in effects that change in speed but do not ever zoom out. Leave at 0 for balanced effect."
                    className="z-index-100 mr-2 flex w-1/4 flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
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
                  <label
                    title="[Y-Axis] Bend adds curviness to the wave. Can be used to focus values around a specific point or add smoothness to movement, depending on the wave type."
                    className="z-index-100 mr-2 flex w-1/4 flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                    BEND{" "}
                    <NumberInput
                      name="bend"
                      min={1}
                      max={waveType === "saw" ? 200 : 500}
                      step={waveType === "saw" ? 0.1 : 2}
                      onChange={handleChange}
                    />
                  </label>

                  {/* Noise*/}
                  <label
                    title="[Y-Axis] Adds randomness. Only applies to keyframe string. Higher values = more random."
                    className="z-index-100 flex w-1/4 flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
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
              <fieldset className="mb-2 max-w-lg  border-2 border-dark-blue pl-2 pr-2 pb-2 shadow-inner">
                <legend className="mb-2 flex flex-row space-x-2">
                  <label className="ml-2 flex flex-row items-center">
                    <SelectToggle
                      name={"Enable Modulator"}
                      isOrange={modEnabled}
                      onToggle={(modEnabled) => {
                        updateSetting("modEnabled", modEnabled ? true : false);
                      }}
                    />
                  </label>{" "}
                  {/* checkbox for modEnabled */}
                  {/* Sin/Cos */}
                  <label>
                    <select
                      name="modToggleSinCos"
                      className={`border-2 border-dark-blue bg-darker-blue ${
                        modEnabled ? "" : "opacity-50"
                      }`}
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
                <div className={`${modEnabled ? "" : "opacity-50"}`}>
                  <div className="flex flex-col">
                    <div className="mb-2 flex flex-row text-xs">
                      {/* Mod Amplitude */}
                      <label className="z-index-100 mr-2 flex w-1/4 flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1">
                        M-AMPLITUDE{" "}
                        <NumberInput
                          name="modAmp"
                          min={-100}
                          max={100}
                          step={0.01}
                          onChange={handleChange}
                        />
                      </label>
                      {/* Mod Up/Down Offset*/}
                      <label className="z-index-100 mr-2 flex w-1/4 flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1">
                        M-UP/DOWN{" "}
                        <NumberInput
                          name="modMoveUpDown"
                          min={-100}
                          max={100}
                          step={0.1}
                          onChange={handleChange}
                        />
                      </label>
                      {/* Mod Bend*/}
                      <label className="z-index-100 mr-2 flex w-1/4 flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1">
                        M-BEND{" "}
                        <NumberInput
                          name="modBend"
                          min={1}
                          max={1000}
                          step={2}
                          onChange={handleChange}
                        />
                      </label>
                      <label className="z-index-100  flex w-1/4 flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1">
                        M-LEFT/RIGHT{" "}
                        <NumberInput
                          name="modMoveLeftRight"
                          min={0}
                          max={100000}
                          step={1}
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <div className="flex flex-row">
                      {/* Mod Tempo*/}
                      {/* <label className="z-index-100 mr-2  flex flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                        MOD TEMPO{" "}
                        <NumberInput
                          name="modTempo"
                          min={1}
                          max={1000}
                          step={1}
                          onChange={handleChange}
                        />
                      </label> */}
                      {/* Mod Rhythm Rate*/}
                      <label className="z-index-100 mr-2  flex flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-xs">
                        M-SYNC RATE {/* option selector for rhythmRates */}
                        <select
                          name="modRhythmRate"
                          className="border-2 border-dark-blue bg-darker-blue"
                          value={modRhythmRate}
                          onChange={handleChangeSelect}>
                          <option value="7680">32</option>
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
                      {/* <label className="z-index-100 mr-2  flex flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                        MOD FRAME RATE{" "}
                        <NumberInput
                          name="modFrameRate"
                          min={1}
                          max={1000}
                          step={1}
                          onChange={handleChange}
                        />
                      </label> */}
                      {/* Move Left/Right */}
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
            {/* <fieldset className="flex flex-col border-2 border-dark-blue bg-darkest-blue pl-1 pt-1 pb-2 text-sm">
              <legend className="text-sm">Global Limits</legend>
              <div className="flex flex-row">
                <label className="z-index-100 mr-2 flex  flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                  HARD MIN{" "}
                  <NumberInput
                    name="hardMin"
                    min={-100000}
                    max={100000}
                    step={0.01}
                    onChange={handleChange}
                  />
                </label>
                <label className="z-index-100 mr-2 flex  flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                  HARD MAX{" "}
                  <NumberInput
                    name="hardMax"
                    min={-100000}
                    max={100000}
                    step={0.01}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </fieldset> */}
          </fieldset>

          {/* Framesync Settings */}
          <div className="flex w-fit flex-col font-mono">
            {/* Frame Settings */}
            <fieldset className="flex max-w-xs flex-row justify-start rounded-sm border border-dark-blue bg-darkest-blue pl-3 pr-3 pb-3 font-mono shadow-sm">
              <legend>Frame Settings</legend>
              <label
                title="Set this to the FPS you'll use in the video output section of Deforum. The higher the frame rate, the smoother the motion. If in doubt, try 12, 24, 30, 60, or 120 FPS. Or if your BPM is not evenly divisible by these frame rates, you may want to match the frame rate and your BPM. Or do as suggested in the tempo tip."
                className="z-index-100 mr-2 flex  w-1/2 flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                FRAME RATE (FPS)
                <NumberInput
                  name="frameRate"
                  min={1}
                  max={240}
                  step={1}
                  onChange={handleChange}
                />
              </label>
              <label
                title="The number of frames visible in the graph above and the number of keyframes generated in the keyframes output. Has no effect on formulas."
                className="z-index-100 flex  w-1/2 flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
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
            <fieldset className="flex-row-auto max-w-xs justify-start  rounded-sm border border-dark-blue bg-darkest-blue pl-3 pr-3 pb-3 font-mono shadow-sm">
              <legend>Sync Settings</legend>
              {/* Tempo and Shift Left/Right */}
              <div className="mb-2 flex flex-row space-x-2">
                {/* Tempo */}
                <label
                  title="You may get better results by setting this to 120bpm and then speeding up/slowing down the video to match the target bpm using video editing software."
                  className={`z-index-100 flex  w-1/2 flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm ${
                    waveType === "audio" ? "opacity-50" : ""
                  }`}>
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

                <label
                  title="Shifts the entire wave left or right over time in frames. Check 'START FRAME' to set this value as the starting frame in the 'Keyframes' output."
                  className="z-index-100 flex  w-1/2 flex-col border-2 border-dark-blue bg-darker-blue pl-1 pt-1 text-sm">
                  SHIFT LEFT/RIGHT
                  <NumberInput
                    name="leftRightOffset"
                    min={0}
                    max={10000}
                    step={1}
                    onChange={handleChange}
                  />
                </label>
              </div>
              {/* Link Horizonal Offset & Starting Frame */}
              <label className="flex flex-auto justify-end pr-1 text-xs">
                <SelectToggle
                  name={"Start here?"}
                  isOrange={linkFrameOffset}
                  onToggle={() =>
                    updateSetting("linkFrameOffset", !linkFrameOffset)
                  }
                />
              </label>
              <div className="flex w-fit flex-col">
                <fieldset
                  disabled={waveType === "audio" ? true : false}
                  className={`border-2 border-dark-blue pl-2 pr-2 ${
                    waveType === "audio" ? "opacity-50" : ""
                  }`}>
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
                        } cursor-pointer duration-150 ease-out hover:border-orange-600`}
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
            <legend className="text-white">Metrics</legend>
            <table className="text-sm font-mono text-right bg-darkest-blue divide-y divide-dark-blue border border-darkest-blue text-gray-300">
            <thead className="text-right">
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
            <tr>
              <td>Max</td>
              <td>{yArrayMax?.toFixed(decimalPrecision)}</td>
            </tr>
            <tr>
              <td>Min</td>
              <td>{yArrayMin?.toFixed(decimalPrecision)}</td>
            </tr>
         
            <tr>
              <td>Sum</td>
              <td>
                {Number(datums) > 1
                  ? yArraySum?.toFixed(decimalPrecision)
                  : yArraySum}
              </td>
            </tr>
            <tr>
              <td>Avg</td>
              <td>
                {Number(datums) > 1
                  ? yArrayAvg?.toFixed(decimalPrecision)
                  : yArrayAvg}
              </td>
            </tr>
            <tr>
              <td>Abs Sum</td>
              <td>
                {Number(datums) > 1
                  ? yArraySum.toFixed(decimalPrecision)
                  : yArraySum}
              </td>
            </tr>
            <tr>
              <td>Abs Avg</td>
              <td>
                {Number(datums) > 1
                  ? yArrayAbsAvg.toFixed(decimalPrecision)
                  : yArrayAbsAvg}
              </td>
            </tr>
            <tr>
              <td>Duration</td>
              <td>
                {(yArrayRaw.length / frameRate).toFixed(decimalPrecision)}s
              </td>
            </tr>
            
          </table>
          </fieldset>


          <fieldset>
            <legend className="text-white">Timing Table</legend>
            <table className="bg-darkest-blue text-sm text-gray-300">
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
        <div className="mt-2 mb-2 flex h-0.5 w-full flex-col bg-darkest-blue"></div>

        {/* Outputs */}
        <div className="ml-4 flex w-full flex-col">
          <h2 className="text-lg text-green-500">
            Copy an Output Below and Paste into Deforum
          </h2>
          <ShowHideToggle
            label="Info"
            showLabel="Show More"
            hideLabel="Hide More"
            hide={true}>
            <ul className="text-sm text-slate-300">
              <li>
                Copy a formula or keyframes string below and paste them into
                your desired parameter in Deforum.
              </li>
              <li>
                - The keyframes and the formula are equivalent, so you can use
                either one.
              </li>
              <li>
                - However, if you add NOISE, it will only be applied to the
                keyframes string.
              </li>
              <li>
                - For readability, each row of keyframes is equal to 1 second of
                keyframe data i.e. a new row is added every interval of your
                frame rate.
              </li>
            </ul>
          </ShowHideToggle>
        </div>
        <div className="mt-1 ml-4 flex flex-col justify-start">
          <div className="flex flex-row items-center">
            <label>
              <button
                className="w-max bg-green-800 p-2 font-mono text-white transition-all duration-150 ease-out hover:bg-green-600 active:bg-green-700"
                onCopy={copyHighlightedTextHandler}
                onClick={() => {
                  navigator.clipboard.writeText(yArray as unknown as string);
                }}>
                <CopyToast>Copy Keyframes</CopyToast>
              </button>
            </label>
            <label>
              {/* Copy Keyframes Button */}

              {/* Copy Formula Button */}
              <button
                className="w-max bg-green-700 p-2 font-mono text-white transition-all duration-150 ease-out hover:bg-green-500 active:bg-green-600"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `(${currentFormula}${modEnabled ? "*" : ""}${
                      modEnabled ? currentFormulaMod : ""
                    })`
                  );
                }}>
                <CopyToast>Copy Formula</CopyToast>
              </button>
              {/* Formula String */}
              <div className="inline-flex bg-darkest-blue p-2 font-mono text-xs">
                {waveType != "audio"
                  ? `${
                      linkFrameOffset == true ? Number(leftRightOffset) : 0
                    }: (${currentFormula}${modEnabled ? "*" : ""}${
                      modEnabled ? currentFormulaMod : ""
                    })`
                  : "No formulas for audio"}
              </div>
            </label>
            {/* Keyframes String */}
          </div>
          <textarea
            className="mb-2 box-border flex h-96 resize flex-col  rounded-sm border border-dark-blue bg-darkest-blue font-mono shadow-sm"
            id="keyframeOutput"
            onSelect={handleTextChange}
            onCopy={copyHighlightedTextHandler}
            wrap="off"
            value={yArray}
            onChange={(e) => {
              e.persist();
              setState((old) => ({
                ...old,
                yArray: e.target.value,
              }));
            }}></textarea>
        </div>

        <div className="mt-10 flex flex-row justify-center justify-items-center text-3xl">
          {/* <KeyframeTable keyframes={yArrayRaw} frameRate={frameRate}  /> */}
        </div>
      </div>
    </>
  );
}
