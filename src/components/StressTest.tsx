import ResizableBox from "../ResizableBox";
import useDemoConfig from "../useDemoConfig";
import React from "react";
import { AxisOptions, Chart } from "react-charts";
import NumberInput from "./NumberInput";
import {
  curveCatmullRom,
  curveCardinal,
  curveStep,
  curveStepAfter,
  curveStepBefore,
} from "d3-shape";
import sinusoid from "../assets/sinusoid.svg";
import saw from "../assets/saw.svg";
import square from "../assets/square.svg";
import triangle from "../assets/triangle.svg";
import bumpdip from "../assets/bumpdip.svg";

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
      boxWidth,
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
    boxWidth: 0,
  });

  const { data, randomizeData } = useDemoConfig({
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
  });

  const [chartType, setChartType] = React.useState("line");
  const [highlightedText, setHighlightedText] = React.useState("");
  const [primaryCursorValue, setPrimaryCursorValue] = React.useState();
  const [secondaryCursorValue, setSecondaryCursorValue] = React.useState();

  // const audioFile = useRef(null);
  // const interval = 24; // extract amplitude data 24 times per second
  // const amplitudeData = useAmplitudeData(audioFile as unknown as Blob, interval);

  const primaryAxis = React.useMemo<
    AxisOptions<typeof data[number]["data"][number]>
  >(
    () => ({
      getValue: (datum) => datum.primary,
      show: showAxes,
      dataType: "linear",
      primary: true,
     
      tickCount: 10,
    }),
    [showAxes]
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
        tickCount: 10,
        curve: curveCatmullRom,
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

  React.useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;

    if (liveData) {
      interval = setInterval(() => {
        randomizeData();
      }, liveDataInterval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [liveData, liveDataInterval, randomizeData]);

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
      (accumulator as number) + Math.abs(currentValue!)
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

  return (
    <>
      <br />
      {[...new Array(chartCount)].map((_d, i) => (
        <ResizableBox
          key={i}
          height={height}
          width={boxWidth * datumCount * 3 + 1440}>
          <Chart
            options={{
              data,
              primaryAxis,
              secondaryAxes,
              memoizeSeries,
              dark: true,
              tooltip: true,
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
   <div className="flex flex-row justify-center space-x-2 mb-4 font-mono">
        Duration: {(datumCount / frameRate).toFixed(2)}s |  Max: {yArrayMax?.toFixed(2)} | Min:{" "}
        {yArrayMin?.toFixed(2)} | Average: {yArrayAvg?.toFixed(2)} | Absolute Sum:{" "}
        {yArraySum} |
      </div>
     
      {/* Control Panel */}
      <div className="flex flex-row justify-center space-x-4 font-mono">
        {/* Wave Settings */}
        <fieldset className="bg-darkest-blue p-4 space-x-2 font-mono">
          <legend>Select Wave</legend>
          <div className="flex flex-col">
            {/* Wave Type */}
            <div className="flex flex-row justify-start justify-items-start text-center text-xs mb-2">
              <input
                className="appearance-none radio"
                type="radio"
                id="sinusoid"
                name="wave"
                value="sinusoid"
              />
              <label
                className={`p-4 border-2 bg-darker-blue mr-2 ${
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
                  className={"aspect-square w-20"}
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
                className={`p-4 border-2 bg-darker-blue mr-2 ${
                  waveType === "saw" ? "border-orange-500" : "border-dark-blue"
                } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                htmlFor="saw"
                onClick={() => {
                  setState((old) => ({ ...old, waveType: "saw" }));
                }}>
                <img src={saw} alt="saw" className={"aspect-square w-20"} />
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
                className={`p-4 border-2 bg-darker-blue mr-2 ${
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
                  className={"aspect-square w-20"}
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
                className={`p-4 border-2 mr-2 bg-darker-blue ${
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
                  className={"aspect-square w-20"}
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
                className={`p-4 border-2 bg-darker-blue ${
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
                  className={"aspect-square w-20"}
                />

                {/* Bumpdip */}
              </label>
            </div>
            {/* Wave Settings */}
            <div className="flex flex-row grow space-x-2">
              {/* Amplitude */}
              <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm">
                AMPLITUDE{" "}
                <NumberInput
                  value={amplitude}
                  min={-100}
                  max={100}
                  step={0.01}
                  onChange={(value) =>
                    setState((old) => ({ ...old, amplitude: value as number }))
                  }
                />
              </label>
              {/* Bend*/}
              <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm">
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
              {/* Up/Down Offset*/}
              <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm">
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
              
            </div>
          </div>
        </fieldset>
        <div className="grid grid-cols-1 font-mono">
          {/* Frame Settings */}
          <fieldset className="bg-darkest-blue flex row-auto justify-start p-4 space-x-3 font-mono">
            <legend>Frame Settings</legend>
            <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm">
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
          <fieldset className="bg-darkest-blue flex row-auto justify-start p-4 space-x-3 font-mono">
            <legend>Sync Settings</legend>
            <div className="flex flex-col">
              {/*New Rythm Rate*/}
              <div className="flex flex-row-reverse justify-start justify-items-start text-center text-xs mb-2">
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
                  className={`p-2 border-2 bg-darker-blue mr-2 ${
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
                  className={`p-2 border-2 bg-darker-blue mr-2 ${
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
                  className={`p-2 border-2 bg-darker-blue mr-2 ${
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
                  className={`p-2 border-2 bg-darker-blue mr-2 ${
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
                  className={`p-2 border-2 bg-darker-blue mr-2 ${
                    rhythmRate === 240
                      ? "border-orange-500"
                      : "border-dark-blue"
                  } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                  htmlFor="1bar">
                  1
                </label>
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
                  className={`p-2 border-2 bg-darker-blue mr-2 ${
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
                  className={`p-2 border-2 bg-darker-blue mr-2 ${
                    rhythmRate === 60 ? "border-orange-500" : "border-dark-blue"
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
                  className={`p-2 border-2 bg-darker-blue mr-2 ${
                    rhythmRate === 30 ? "border-orange-500" : "border-dark-blue"
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
                  className={`p-2 border-2 bg-darker-blue mr-2 ${
                    rhythmRate === 15 ? "border-orange-500" : "border-dark-blue"
                  } hover:border-orange-600 cursor-pointer ease-out duration-300`}
                  htmlFor="sixteenthbar">
                  1/16
                </label>
              </div>
              <div className="flex flex-row grow space-x-2">
                {/* Tempo */}
                <label className="flex flex-col grow bg-darker-blue pl-1 pt-1 border-2 border-dark-blue z-index-100 text-sm">
                  TEMPO (BPM)
                  <NumberInput
                    value={tempo}
                    min={1}
                    max={240}
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
            </div>
          </fieldset>
          
        
        </div>
        
      </div>
     
   


      <div className="flex flex-row justify-center justify-items-center">
        <div className="flex flex-row justify-center justify-items-center ">
          
          {/* a button to copy the currentFormula to the clipboard */}
          
       
        </div>
      </div>
      <br />
     
      <div className="flex flex-row grow justify-center items-center">
          {/* a button to copy keyframeOutput to the clipboard */}
        <label>
        <button
            className="bg-orange-800 text-white font-mono p-2"
            onCopy={copyHighlightedTextHandler}
            onClick={() => {
              navigator.clipboard.writeText(yArray as unknown as string);
            }}
            
          >
            Copy Keyframes
          </button>
          <button
            className="bg-orange-700 text-white font-mono p-2"
            onClick={() => {
              navigator.clipboard.writeText(currentFormula);
            }}
          >
            Copy Formula
          </button>
          <div className="font-mono inline-flex bg-darkest-blue p-3">
            {`${
              linkFrameOffset == true ? leftRightOffset : 0
            }: ${currentFormula}`}
          </div>
        <textarea
          className="flex flex-row justify-center items-center h-96 w-2/3 min-w-1080px w-1080px resize-x font-mono bg-darkest-blue border-2 border-dark-blue "
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
          }}
          style={{
            width: "1080px",
          }}
        />
        </label>
      
      </div>
      <table className="text-left mt-4 border-2 border-dark-blue">
                <thead>
                  <tr>
                    <th>Divisions</th>
                    <th>Seconds</th>
                    <th>Frames</th>
                  </tr>
                </thead>
                <tbody className="border-2 border-dark-blue">
                  <tr className="border-2 border-dark-blue">
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
                    <td>1/2 note</td>
                    <td>{(120 / tempo).toFixed(2)}</td>
                    <td>{((120 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/2 note triplet</td>
                    <td>{(40 / tempo).toFixed(2)}</td>
                    <td>{((40 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/4 note (beat)</td>
                    <td>{(60 / tempo).toFixed(2)}</td>
                    <td>{((60 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/4 note triplet</td>
                    <td>{(20 / tempo).toFixed(2)}</td>
                    <td>{((20 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/8 note</td>
                    <td>{(30 / tempo).toFixed(2)}</td>
                    <td>{((30 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/8 note triplet</td>
                    <td>{(10 / tempo).toFixed(2)}</td>
                    <td>{((10 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/16 note</td>
                    <td>{(15 / tempo).toFixed(2)}</td>
                    <td>{((15 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/16 note triplet</td>
                    <td>{(5 / tempo).toFixed(2)}</td>
                    <td>{((5 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/32 note</td>
                    <td>{(7.5 / tempo).toFixed(2)}</td>
                    <td>{((7.5 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>1/32 note triplet</td>
                    <td>{(2.5 / tempo).toFixed(2)}</td>
                    <td>{((2.5 / tempo) * frameRate).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
      {/* <h3>Timing Chart</h3>
      <table>
        <thead>
          <tr>
            <th>Divisions</th>
            <th>Seconds</th>
            <th>Frames</th>
          </tr>
        </thead>
        <tbody>
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
            <td>1/2 note</td>
            <td>{(120 / tempo).toFixed(2)}</td>
            <td>{((120 / tempo) * frameRate).toFixed(2)}</td>
          </tr>
          <tr>
            <td>1/2 note triplet</td>
            <td>{(40 / tempo).toFixed(2)}</td>
            <td>{((40 / tempo) * frameRate).toFixed(2)}</td>
          </tr>
          <tr>
            <td>1/4 note (beat)</td>
            <td>{(60 / tempo).toFixed(2)}</td>
            <td>{((60 / tempo) * frameRate).toFixed(2)}</td>
          </tr>
          <tr>
            <td>1/4 note triplet</td>
            <td>{(20 / tempo).toFixed(2)}</td>
            <td>{((20 / tempo) * frameRate).toFixed(2)}</td>
          </tr>
          <tr>
            <td>1/8 note</td>
            <td>{(30 / tempo).toFixed(2)}</td>
            <td>{((30 / tempo) * frameRate).toFixed(2)}</td>
          </tr>
          <tr>
            <td>1/8 note triplet</td>
            <td>{(10 / tempo).toFixed(2)}</td>
            <td>{((10 / tempo) * frameRate).toFixed(2)}</td>
          </tr>
          <tr>
            <td>1/16 note</td>
            <td>{(15 / tempo).toFixed(2)}</td>
            <td>{((15 / tempo) * frameRate).toFixed(2)}</td>
          </tr>
          <tr>
            <td>1/16 note triplet</td>
            <td>{(5 / tempo).toFixed(2)}</td>
            <td>{((5 / tempo) * frameRate).toFixed(2)}</td>
          </tr>
          <tr>
            <td>1/32 note</td>
            <td>{(7.5 / tempo).toFixed(2)}</td>
            <td>{((7.5 / tempo) * frameRate).toFixed(2)}</td>
          </tr>
          <tr>
            <td>1/32 note triplet</td>
            <td>{(2.5 / tempo).toFixed(2)}</td>
            <td>{((2.5 / tempo) * frameRate).toFixed(2)}</td>
          </tr>
        </tbody>
      </table> */}
            {/* Old */}
            <div className="inputs-container">
        {/* Rhythm Rate */}
        <label>
          Rhythm Rate{" "}
          <select
            value={rhythmRate}
            onChange={(e) => {
              e.persist();
              setState((old) => ({
                ...old,
                rhythmRate: parseFloat(e.target.value),
              }));
            }}>
            <option value="3840">16 bars</option>
            <option value="1920">8 bars</option>
            <option value="960">4 bars</option>
            <option value="480">2 bars</option>
            <option value="240">1 bar</option>
            <option value="120">1/2 note</option>
            <option value="40">1/2 note triplet</option>
            <option value="60">1/4 note (beat)</option>
            <option value="20">1/4 note triplet</option>
            <option value="30">1/8 note</option>
            <option value="10">1/8 note triplet</option>
            <option value="15">1/16 note</option>
            <option value="5">1/16 note triplet</option>
            <option value="7.5">1/32 note</option>
            <option value="2.5">1/32 note triplet</option>
          </select>
        </label>

        {/* Sin/Cos */}
        <label>
          sin/cos{" "}
          <select
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
        <br />
        {/* Chart Type */}
        <label>
          Chart{" "}
          <select value={chartType} onChange={setChartTypeHandler}>
            <option value="line">Line</option>
            <option value="bar">Bar</option>
          </select>
        </label>
        {/* Link Horizonal Offset & Starting Frame */}
        <label>
          Link Offset 🡸🡺 & Start Frame{" "}
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

        <br />
      </div>
    </>
  );
}


