import React, { useState } from "react";
import { useSettingsStore } from "../../stores/settingsStore";

export const SaveSettings = () => {
  let [saveName, setSaveName] = useState("");
  const { settings, updateSetting, saveSetting } = useSettingsStore((state) => ({
    settings: state.settings,
    updateSetting: state.updateSetting,
    saveSetting: state.saveSetting,
  }));

  const {
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
  } = settings;

  const handleSave = () => {
    // throw error if saveName is empty
    if (saveName === "") {
      saveName = `${waveType}-${tempo}bpm-${frameRate}fps-${amplitude}amp`
    }
    // save the current settings
    setSaveName("");
    updateSetting("saveName", saveName);
    saveSetting(saveName);
  };

  return (
    <div className="mb-2 w-full">
      <input
        className="bg-gray-800 py-1 px-2 text-xs text-white outline-none"
        placeholder="Save new preset as..."
        type="text"
        value={saveName}
        onChange={(event) => setSaveName(event.target.value)}
      />
      <button
        className="border-slate-500 bg-gray-900 px-5 py-1 text-xs text-white"
        onClick={handleSave}>
        Save Preset
      </button>
    </div>
  );
};
