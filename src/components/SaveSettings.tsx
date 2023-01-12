import React, { useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";

export const SaveSettings = () => {
  const [saveName, setSaveName] = useState("");
  const { updateSetting, saveSetting } = useSettingsStore((state) => ({
    updateSetting: state.updateSetting,
    saveSetting: state.saveSetting,
  }));

  const handleSave = () => {
    setSaveName("");
    updateSetting("saveName", saveName);
    saveSetting();
  };

  return (
    <div className="mb-4">
      <input
        className="bg-gray-900 p-1 text-white"
        placeholder="Enter preset name"
        type="text"
        value={saveName}
        onChange={(event) => setSaveName(event.target.value)}
      />
      <button
        className="border-2 border-slate-500 bg-slate-500 p-1 text-xs text-white"
        onClick={handleSave}>
        Save Preset
      </button>
    </div>
  );
};
