import React, { useState, useEffect } from "react";

type NumberInputProps = {
  value: number | string;
  onChange: (value: number | string) => void;
  min?: number;
  max?: number;
  step: number;
  isInt?: boolean;
  waveType?: string;
};

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step,
  waveType,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [prevDelta, setPrevDelta] = useState(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || event.target === window) {
        return;
      }

      const delta = (event.clientY - startY) / 5 ;
      const newValue = Math.max(
        min,
        Math.min(max, (value as number) - (delta * step) * (event.shiftKey ? 10 : 1))
      );

      
      if (step != 1 && newValue % step +- 1 != 0 && Number.isInteger(step) === true) {
        return prevDelta
      }
      Number.isInteger(step) === true
        ? setInputValue(newValue.toFixed(0))
        : setInputValue(newValue.toFixed(2));
        setPrevDelta(delta);
      
    };

    const handleMouseUp = (event: MouseEvent) => {
      setIsDragging(false);
      setPrevDelta(0);
      onChange(inputValue);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, prevDelta, startY, value]);

  const handleMouseDown = (event: React.MouseEvent<HTMLInputElement>) => {
    setIsDragging(true);
    setStartY(event.clientY);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value === "" ? "" : event.target.value;
    setInputValue(newValue);
    onChange(newValue);
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
      className="bg-darker-blue text-orange-400 px-2 py-2 text-xl pt-1 border-1 border-dark-blue focus:outline-none"
    />
  );
};

export default NumberInput;
