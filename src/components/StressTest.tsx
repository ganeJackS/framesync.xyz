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
      rhythmRate,
      waveType,
      bend,
      toggleSinCos,

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
    amplitude: 2.00,
    upDownOffset: 0,
    rhythmRate: 60,
    waveType: 'sinusoid',
    bend: 1,
    toggleSinCos: "cos",

  });

  const { data, randomizeData } = useDemoConfig({
    series: seriesCount,
    datums: datumCount,
    dataType: "time",
    tempo: tempo,
    frameRate: frameRate,
    amplitude: amplitude,
    upDownOffset: upDownOffset,
    rhythmRate: rhythmRate,
    waveType: waveType,
    bend: bend,
    toggleSinCos: toggleSinCos,
 
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
      dataType: "ordinal",
      primary: true,
      position: "bottom",
      tickCount: 10,
      

    }),
    [showAxes, frameRate, datumCount]
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
 // console.log(highlightedText);

  function copyHighlightedTextHandler() {
    navigator.clipboard.writeText(highlightedText.replace(/[^0-9.,():-]/g, " ").trimStart());
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
         return  `${datum.primary % frameRate === 0 ? "\r\n" : "" }${datum.primary <= 9 ? "  " : ""}${datum.primary >= 10 ? " " : ""}${datum.primary <= 99 ? " " : ""}${i}:${Math.sign(Number(datum.secondary)) === 1 || -1 ? " " : ""}${Math.sign(Number(datum.secondary)) === -1 ? "" : ""}(${datum.secondary?.toFixed(2).replace("-0.00", "0.00")})`   
    });

    // console.log(yArray);
    // const yArraySum = yArray.reduce((a, b) => a + b, 0);
    // console.log(yArraySum);




  return (
    <>
     
        <br />
        
        {/* Value Sum {yArraySum} */}
        
        {/* Duration {datumCount / frameRate}s */}

        
      
      
      <br />

      <div className="inputs-container">
      {/* Tempo */}
      <label>
        Tempo{" "}
        <br />

        <input
          type="number"
          min="1"
          value={tempo}
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
        Frame Rate{" "}
        <br />

        <input
          type="number"
          min="1"
          value={frameRate >= 1 ? frameRate : 0}
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
        Frame Count{" "}
        <br />

        <input
          type="number"
          min="1"
          max="1200"
          value={datumCount === null ? datumCount : 1}
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
        Amplitude{" "}
        <br />
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
        Offset{" "}
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
      {/* Bend*/}
      <label>
        Bend{" "}
        <input
          type="number"
          step={waveType === "saw" ? "0.1" : "2"}
          min={waveType === "saw" ? -30 : 1}
          max={waveType === "saw" ?  30 : 200}
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
        <select
          value={chartType}
          onChange={setChartTypeHandler}>
          <option value="line">Line</option>
          <option value="bar">Bar</option>
        </select>
      </label>
    
      <br />
      </div>
      <br />
      {[...new Array(chartCount)].map((d, i) => (
        <ResizableBox key={i} height={height}>
          <Chart
            options={{
              data,
              primaryAxis,
              secondaryAxes,
              memoizeSeries,
              dark: true,
              
              getSeriesStyle: (series) => ({
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
      ))
      }
     
      
      <p id="log"></p>

      <textarea
        id="keyframeOutput"
        style={{ width: "90%", height: "300px", position: "relative", overflow: "scroll" }}
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
      
    </>
  );  
}