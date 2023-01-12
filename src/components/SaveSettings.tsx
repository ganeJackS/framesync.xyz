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
    <div>
      <input
        className="bg-darkest-blue text-white"
        type="text"
        value={saveName}
        onChange={(event) => setSaveName(event.target.value)}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};