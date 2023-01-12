import React, { useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";

const SettingsSelector = () => {
  const [selectedSettingId, setSelectedSettingId] = useState<string | number>();
  const [ settingsList, updateSetting, updateSettingFromList] = useSettingsStore(
    (state) => [ state.settingsList, state.updateSetting, state.updateSettingFromList]
  );

  //const settingsList = Object.values(settings);


  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSettingId(event.target.value);
  };

  const handleApplyClick = () => {
    if (selectedSettingId) {
      updateSettingFromList(selectedSettingId);
  }
  };

  return (
    <div>
      <select 
      className="bg-darkest-blue text-white"
      onChange={handleSelectChange}>
        {settingsList.map((setting) => (
          <option key={setting.saveId} value={setting.saveId}>
            {setting.saveName}
          </option>
        ))}
      </select>
      <button onClick={handleApplyClick}>Apply</button>
    </div>
  );
};

export default SettingsSelector;
