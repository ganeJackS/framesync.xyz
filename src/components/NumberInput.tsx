import React, { useEffect, useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";

type NumberInputProps = {
  name: string;
  onChange: (event: any) => void;
  min?: number;
  max?: number;
  step: number;
};

const NumberInput: React.FC<NumberInputProps> = ({
  name,
  onChange,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step,
}) => {

  const [settings, updateSetting] = useSettingsStore(state => [state.settings, state.updateSetting]);

  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [prevDelta, setPrevDelta] = useState(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || event.target === window) {
        return;
      }

      const delta = (event.clientY - startY) / 50 ;
      const newValue = Math.max(
        min,
        Math.min(max, (settings[name] as number) - (delta * step) * (event.shiftKey ? 10 : 1))
        // Math.min(max, (settings[name] as number) - (delta * step))
      );

      setPrevDelta(delta);
      
      if (step != 1 && newValue % step +- 1 != 0 && Number.isInteger(step) === true) {
        return prevDelta
      }
      Number.isInteger(step) ? updateSetting(name, newValue.toFixed(0)) : updateSetting(name, newValue.toFixed(2));
    };

    const handleMouseUp = (event: MouseEvent) => {
      setIsDragging(false);
      setPrevDelta(0);
      onChange(settings[name as keyof typeof settings]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, prevDelta, startY, settings]);

  const handleMouseDown = (event: React.MouseEvent<HTMLInputElement>) => {
    setIsDragging(true);
    setStartY(event.clientY);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value === "" ? "" : event.target.value;
    updateSetting(name, Number(newValue))
    onChange(settings[name as keyof typeof settings]);
  };
  return (
    <input
      type="number"
      value={settings[name as keyof typeof settings]}
      onChange={handleChange}
      onMouseDown={handleMouseDown}
      min={min}
      max={max}
      step={step}
      className="bg-darker-blue text-orange-400 px-2 py-2 text-xl pt-1 border-1 border-dark-blue focus:outline-none"
      />
    );
  };
  
  export default NumberInput;
  
