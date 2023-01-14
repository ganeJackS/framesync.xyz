import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../stores/settingsStore";
import redxdeletesvg from "../../assets/redxdelete.svg";
import ShowHideToggle from "../ShowHideToggle";
import basics from "../../presets/basics.json"

const SettingsSelector = () => {
  const [
    settings,
    settingsList,
    updateSetting,
    updateSettingFromList,
    refreshSettingsList,
    deleteSetting,
    initializeSettings,

  ] = useSettingsStore((state) => [
    state.settings,
    state.settingsList,
    state.updateSetting,
    state.updateSettingFromList,
    state.refreshSettingsList,
    state.deleteSetting,
    state.initializeSettings,

  ]);
  const [selectedSettingId, setSelectedSettingId] = useState(settings.saveId);
  const [showDelete, setShowDelete] = useState(false);

  
  const factoryPresets = [ ...basics ];

  // userPresets is a list of all the user presets, excluding the factory presets
  const userPresets = settingsList.filter(
    (setting) => !factoryPresets.some((preset) => preset.saveId === setting.saveId)
  );


  if(settingsList.length === 0) {
    initializeSettings();
  }

  useEffect(() => {
    refreshSettingsList();
  }, []);

  const handleSettingClick = (settingId: string | number) => {
    
    setSelectedSettingId(settingId);
    updateSettingFromList(settingId);
  };

  useEffect(() => {
    setSelectedSettingId(settings.saveId);
  }, [settingsList]);

  return (
    <>
      <fieldset className="w-240px flex flex-col border border-dark-blue">
        <legend className="flex flex-row justify-between text-sm">
          Select Preset
          <button
            className="ml-4 text-gray-500 hover:text-gray-800"
            onClick={() => setShowDelete(!showDelete)}>
            Edit
          </button>
        </legend>
        <div className="h-450 pt-2">
          <div className="flex flex-auto justify-end"></div>
          <ul className="pl-2 flex h-full flex-col justify-between text-md">
            {/* Built-in Presets */}
            <ShowHideToggle label="Built-in Presets">
            {factoryPresets.map((preset) => (
              <li
                className={`flex flex-auto cursor-pointer justify-between  bg-darkest-blue pl-2 hover:bg-darker-blue ${
                  preset.saveId === selectedSettingId
                    ? "border-l-4 border-orange-500 bg-darker-blue text-orange-500"
                    : "bg-darkest-blue text-orange-600"
                }`}
                key={preset.saveId}
                onClick={() => handleSettingClick(preset.saveId)}>
                <span className="pr-2">{preset.saveName}</span>
              </li>
            ))}
            </ShowHideToggle>
            {/* Custom Presets */}
            {userPresets.map((setting) => (
              <li
                className={`flex flex-auto cursor-pointer justify-between  bg-darkest-blue pl-2 hover:bg-darker-blue ${
                  setting.saveId === selectedSettingId
                    ? "border-l-4 border-orange-500 bg-darker-blue text-orange-500"
                    : "bg-darkest-blue text-orange-600"
                }`}
                key={setting.saveId}
                onClick={() => handleSettingClick(setting.saveId)}>
                <span className="pr-2">{setting.saveName}</span>
                {showDelete && (
                  <button
                    className="border-dark-blue bg-red-500 px-2 hover:bg-red-900"
                    onClick={() => deleteSetting(setting.saveId)}>
                    <img src={redxdeletesvg} alt="delete" width={20} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </fieldset>
    </>
  );
};

export default SettingsSelector;
