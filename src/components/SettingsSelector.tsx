import React, { useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";

const SettingsSelector = () => {
  const [settings, settingsList, updateSetting, updateSettingFromList] =
    useSettingsStore((state) => [
      state.settings,
      state.settingsList,
      state.updateSetting,
      state.updateSettingFromList,
    ]);

  const handleSettingClick = (settingId: string | number) => {
    updateSettingFromList(settingId);
  };

  return (
    <>
      <div className="pl-2">
        <h2>Presets</h2>
        <ul>
          {settingsList.map((setting) => (
            <li
              className="cursor-pointer bg-darker-blue pl-2 hover:bg-slate-600"
              key={setting.saveId}
              onClick={() => handleSettingClick(setting.saveId)}>
              {setting.saveName}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SettingsSelector;
