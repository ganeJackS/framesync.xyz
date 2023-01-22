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

  const { waveType, modEnabled } = settings;

  const decimalPrecision = settings.decimalPrecision;

  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [prevDelta, setPrevDelta] = useState(0);
  const inputValue = settings[name as keyof typeof settings];

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!isDragging) {
        return;
      }

      const delta = (event.clientY - startY) / 20;
      const tempVal =
        (inputValue as number) - delta * step * (event.shiftKey ? 10 : 1);
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
        ? updateSetting(name as keyof typeof settings, newValue.toFixed(0))
        : updateSetting(
            name as keyof typeof settings,
            newValue.toFixed(decimalPrecision)
          );
    },

    [isDragging, startY, settings, step, min, max, updateSetting, name]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      setIsDragging(false);
      setPrevDelta(startY);
      onChange(inputValue);
    },
    [isDragging, prevDelta, startY, settings, onChange, name]
  );

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const handlePointerDown = (event: React.PointerEvent<HTMLInputElement>) => {
    setIsDragging(true);
    setStartY(event.clientY);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value === "" ? "" : event.target.value;
    onChange(newValue);
    updateSetting(name as keyof typeof settings, newValue);
  };

  return (
    <input
      type="number"
      value={inputValue as number}
      onChange={handleChange}
      onPointerDown={handlePointerDown}
      min={min}
      max={max}
      step={step}
      disabled={
        (waveType === "audio" && name === "tempo") ||
        (!modEnabled && name.startsWith("mod"))
          ? true
          : false
      }
      className={`border-1 w-full border-dark-blue bg-darker-blue px-2 py-2 pt-1 text-xl text-orange-400 focus:outline-none ${
        waveType === "audio" && name === "tempo" ? "opacity-50" : ""
      }`}
    />
  );
};

export default NumberInput;
