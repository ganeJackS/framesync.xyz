import ResizableBox from "../ResizableBox";
import useDemoConfig from "../useDemoConfig";
import React from "react";
import { AxisOptions, Chart } from "react-charts";

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


  const primaryAxis = React.useMemo<
    AxisOptions<typeof data[number]["data"][number]>
  >(
    () => ({
      getValue: (datum) => datum.primary,
      show: showAxes,
      dataType: "linear",
      primary: true,
      position: "bottom",
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
        dataType: "ordinal",
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
    }${datum.primary >= 10 ? " " : ""}${datum.primary <= 99 ? " " : ""}${
      linkFrameOffset == true ? i + leftRightOffset : i
    }:${Math.sign(Number(datum.secondary)) === 1 || -1 ? " " : ""}${
      Math.sign(Number(datum.secondary)) === -1 ? "" : ""
    }(${datum.secondary?.toFixed(2).replace("-0.00", " 0.00")})`;
  });

  const yArrayRaw = data[0].data.map((datum) => { return datum.secondary });

  //console.log(yArray);


  const yArraySum = yArrayRaw.reduce((accumulator, currentValue) => accumulator? + currentValue!: 0);
  const yArrayAvg = ((yArraySum as number) / yArrayRaw.length);
  const yArrayMin = Math.min(...yArrayRaw as number[]);
  const yArrayMax = Math.max(...yArrayRaw as number[]);
  
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
      <div className="inputs-container">
        {/* Tempo */}
        <label>
          Tempo <br />
          <input
            type="number"
            min="1"
            value={tempo}
            placeholder="1"
            onChange={(e) => {
              e.persist();
              setState((old) => ({
                ...old,
                tempo: parseInt(e.target.value),
              }));
            }}
          />
        </label>
        <br />
        {/* Frame Rate */}
        <label>
          Frame Rate <br />
          <input
            type="number"
            min="1"
            placeholder="1"
            value={frameRate}
            onChange={(e) => {
              e.persist();
              setState((old) => ({
                ...old,
                frameRate: parseInt(e.target.value),
              }));
            }}
          />
        </label>
        <br />
        {/* Frame Count */}
        <label>
          Frame Count <br />
          <input
            type="number"
            min="1"
            max="1200"
            placeholder="1"
            value={datumCount}
            onChange={(e) => {
              e.persist();

              setState((old) => ({
                ...old,
                datumCount: parseInt(e.target.value),
              }));
            }}
          />
        </label>
        {/* Amplitude */}
        <label>
          Amplitude <br />
          <input
            type="number"
            step="0.1"
            value={amplitude}
            onChange={(e) => {
              e.persist();
              setState((old) => ({
                ...old,
                amplitude: parseFloat(e.target.value),
              }));
            }}
          />
        </label>
        {/* Up/Down Offset*/}
        <label>
          Offset🡹🡻{" "}
          <input
            type="number"
            step="0.1"
            value={upDownOffset}
            onChange={(e) => {
              e.persist();
              setState((old) => ({
                ...old,
                upDownOffset: parseFloat(e.target.value),
              }));
            }}
          />
        </label>
        {/* Left/Right Offset*/}
        <label>
          Offset 🡸🡺{" "}
          <input
            type="number"
            step="1"
            min="0"
            value={leftRightOffset}
            onChange={(e) => {
              e.persist();
              setState((old) => ({
                ...old,
                leftRightOffset: parseFloat(e.target.value),
              }));
            }}
          />
        </label>
        {/* Bend*/}
        <label>
          Bend{" "}
          <input
            type="number"
            step={waveType === "saw" ? "1" : "2"}
            min={waveType === "saw" ? 0 : 1}
            max={waveType === "saw" ? 30 : 200}
            list="tickmarks"
            value={bend}
            placeholder="1"
            onChange={(e) => {
              e.persist();
              setState((old) => ({
                ...old,
                bend: parseFloat(e.target.value),
              }));
            }}
          />
        </label>
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
        {/* Wave Type */}
        <label>
          Wave Type{" "}
          <select
            value={waveType}
            onChange={(e) => {
              e.persist();
              setState((old) => ({
                ...old,
                waveType: e.target.value,
              }));
            }}>
            <option value="sinusoid">Sinusoid</option>
            <option value="saw">Saw</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
            <option value="bumpdip">BumpDip</option>
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
      <br />
      {[...new Array(chartCount)].map((_d, i) => (
        <ResizableBox
          key={i}
          height={height}
          width={boxWidth * datumCount * 3 + 1440}
          >
          <Chart
            options={{
              data,
              primaryAxis,
              secondaryAxes,
              memoizeSeries,
              dark: true,
              tooltip: true,
              getSeriesStyle: (series, _status) => ({
                color: "orange",
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
          className="zoom-slider"
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
      <h3>Metrics</h3>
      Duration: {(datumCount / frameRate).toFixed(2)}s |

      Sum: {yArraySum} |

      Max: {yArrayMax?.toFixed(2)} |

      Min: {yArrayMin?.toFixed(2)} |

      Average: {yArrayAvg?.toFixed(2)} |

      
      <br />
      <br />
      
      <br />
      <div className="outputContainer">
        <h3>Formula Output</h3>
        <div className="formulaOutput">{`${
          linkFrameOffset == true ? leftRightOffset : 0
        }: ${currentFormula}`}</div>

        <h3>Raw Keyframe Output</h3>

        <label>
          <textarea
            id="keyframeOutput"
            style={{
              width: "90%",
              height: "300px",
              position: "relative",
              overflow: "scroll",
            }}
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
          />
        </label>
      </div>
      <br />
      <h3>Timing Chart</h3>
      {/* create a table with a column for beat divisions and seconds and frames. Each row is a beat division and the seconds column is the seconds for that beat division. Divide the beat divisions by the tempo. Use the values from the opions on the dropdown field below */}
      <table>
        <thead>
          <tr>
            <th>Divisions</th>
            <th>Seconds</th>
            <th>Frames</th>
          </tr>
        </thead>
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
      </table>
    </>
  );
}
