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
    navigator.clipboard.writeText(highlightedText.replace(/[^0-9.,(): -]/g, ""));
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


    // const yArrayValue = data[0].data[0].secondary;
    // map yArrayValue to a new array
    const yArray = data[0].data.map((datum, i) => {
      // return `${datum.primary % frameRate === 0 ? "\r\n" : "" }${datum.primary <= 10 ? " " : ""}${datum.primary % 10 <= 100 ? " " : ""}${i}: ${datum.secondary?.toFixed(2)}`
    
         return  `${datum.primary % frameRate === 0 ? "\r\n" : "" }${datum.primary <= 9 ? "  " : ""}${datum.primary >= 10 ? " " : ""}${datum.primary <= 99 ? " " : ""}${i}:${datum.primary <= 9 ? "" : ""}${Math.sign(Number(datum.secondary)) === 1 ? " " : ""}${Math.sign(Number(datum.secondary)) === 0 ? " " : ""}(${datum.secondary?.toFixed(2).replace("-0.00", " 0.00")})`   
       // return  `${datum.primary % frameRate === 0 || i === 0 ? "\r\n" : "" }${i}: (${datum.secondary?.toFixed(2).replace("-0.00", " 0.00")})`   
      // `${datum.primary % frameRate === 0 ? "\r\n" : "" }${datum.primary <= 9 ? " " : ""}${datum.primary >= 10 ? " " : ""}${datum.primary >= 100 ? "" : " "}${datumCount.toString.length <= 2 ? " " : ""}${i}: ${datum.secondary?.toFixed(2)}` 
       // return `${datumCount > 100}${datum.primary % frameRate === 0 ? "\r\n" : "" }${datum.primary <= 9 ? " " : ""}${datum.primary <= 9 ? " " : ""}${datumCount.toString.length <= 2 ? " " : ""}${i}: ${datum.secondary?.toFixed(2)}`
    });

    // console.log(yArray);
    // console.log("test" + yArrayNoRegex);
    // const yArray2 = data[0].data.join(", ")
    //  console.log(yArray);
    // reduce yArray to a single value
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
        Frame Count{" "}
        <br />

        <input
          type="number"
          min="1"
          max="1200"
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


         // e.clipboardData.setData("text/plain", copyText.replace(/[^0-9.,():-]/g, ""));



// 0: 2.00,1: 1.93,2: 1.73,3: 1.41,4: 1.00,5: 0.52,6: 0.00,7: -0.52,8: -1.00,9: -1.41,10: -1.73,11: -1.93,12: -2.00,13: -1.93,14: -1.73,15: -1.41,16: -1.00,17: -0.52,18:  0.00,19: 0.52,20: 1.00,21: 1.41,22: 1.73,23: 1.93,
// 24: 2.00,25: 1.93,26: 1.73,27: 1.41,28: 1.00,29: 0.52,30: 0.00,31: -0.52,32: -1.00,33: -1.41,34: -1.73,35: -1.93,36: -2.00,37: -1.93,38: -1.73,39: -1.41,40: -1.00,41: -0.52,42:  0.00,43: 0.52,44: 1.00,45: 1.41,46: 1.73,47: 1.93,
// 48: 2.00,49: 1.93,50: 1.73,51: 1.41,52: 1.00,53: 0.52,54: 0.00,55: -0.52,56: -1.00,57: -1.41,58: -1.73,59: -1.93,60: -2.00,61: -1.93,62: -1.73,63: -1.41,64: -1.00,65: -0.52,66: 0.00,67: 0.52,68: 1.00,69: 1.41,70: 1.73,71: 1.93,
// 72: 2.00,73: 1.93,74: 1.73,75: 1.41,76: 1.00,77: 0.52,78: 0.00,79: -0.52,80: -1.00,81: -1.41,82: -1.73,83: -1.93,84: -2.00,85: -1.93,86: -1.73,87: -1.41,88: -1.00,89: -0.52,90: 0.00,91: 0.52,92: 1.00,93: 1.41,94: 1.73,95: 1.93,
// 96: 2.00,97: 1.93,98: 1.73,99: 1.41,100: 1.00,101: 0.52,102: 0.00,103: -0.52,104: -1.00,105: -1.41,106: -1.73,107: -1.93,108: -2.00,109: -1.93,110: -1.73,111: -1.41,112: -1.00,113: -0.52,114:  0.00,115: 0.52,116: 1.00,117: 1.41,118: 1.73,119: 1.93


