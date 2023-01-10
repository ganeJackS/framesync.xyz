
import React from "react";
import { useSettingsStore } from "../stores/settingsStore";

export type KeyframeData = { [index: number]: number };

type Props = {
  keyframes: KeyframeData;
  frameRate: number;
};

const KeyframeTable: React.FC<Props> = ({ keyframes }) => {
  
  const { frameRate } = useSettingsStore(state => state.settingsState);
  
  const rows: number[] = [];
  for (let i = 0; i < Object.keys(keyframes).length; i++) {
    if (i % frameRate === 0) {
      rows.push(i);
    } 
  }
  

  const minValue = Math.min(...Object.values(keyframes));
  const maxValue = Math.max(...Object.values(keyframes));

  return (
    <div className="flex flex-row grow justify-center items-center mt-1 mb-20">
    <div className="flex flex-row justify-left items-center h-96 w-980px resize font-mono bg-darkest-blue border-2 border-dark-blue overflow-x-scroll">
    <table className="text-xs font-mono text-right overflow-x-auto">
      <tbody>
        {rows.map((row) => (
          <tr key={row} className={`whitespace-nowrap`}>
            {[...Array(frameRate)].map((_, i) => {
              const index = row + i;
              const value = keyframes[index];
              //const color = {`background: rgba(255, 255, 255, ${calculateColor(value, minValue, maxValue)})`}
              //console.log("color", color)
              return (
                <td key={index} style={{
                  opacity: calculateColor(value, minValue, maxValue),
                  backgroundColor: "white",
                }}>{`${value}`}</td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    </div>
  );
};

const calculateColor = (value: number, minValue: number, maxValue: number) => {
  const percentage = 1 * (value - minValue) / (maxValue - minValue);
  //console.log("percentage", percentage)
  return percentage;
};

export default KeyframeTable;

