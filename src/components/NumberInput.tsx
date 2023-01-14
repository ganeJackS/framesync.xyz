import React, { useEffect, useState, useCallback } from "react";
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
  const [settings, updateSetting] = useSettingsStore((state) => [
    state.settings,
    state.updateSetting,
  ]);
  const decimalPrecision = settings.decimalPrecision;

  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [prevDelta, setPrevDelta] = useState(0);
  const inputValue = settings[name as keyof typeof settings];

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) {
        return;
      }

      const delta = (event.clientY - startY) / 20;
      const tempVal = inputValue - delta * step * (event.shiftKey ? 10 : 1);
      const newValue = Math.max(min, Math.min(max, tempVal));
      setPrevDelta(delta);

      if (
        step != 1 &&
        (newValue % step) + -1 != 0 &&
        Number.isInteger(step) === true
      ) {
        return prevDelta;
      }

      Number.isInteger(step)
        ? updateSetting(name, newValue.toFixed(0))
        : updateSetting(name, newValue.toFixed(decimalPrecision));
    },

    [isDragging, startY, settings, step, min, max, updateSetting, name]
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      setIsDragging(false);
      setPrevDelta(startY);
      onChange(inputValue);
    },
    [isDragging, prevDelta, startY, settings, onChange, name]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleMouseDown = (event: React.MouseEvent<HTMLInputElement>) => {
    setIsDragging(true);
    setStartY(event.clientY);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value === "" ? "" : event.target.value;
    onChange(newValue);
    updateSetting(name, newValue);
  };
  return (
    <input
      type="number"
      value={inputValue}
      onChange={handleChange}
      onMouseDown={handleMouseDown}
      min={min}
      max={max}
      step={step}
      className="border-1 flex border-dark-blue bg-darker-blue px-2 py-2 pt-1 text-xl text-orange-400 focus:outline-none"
    />
  );
};

export default NumberInput;
