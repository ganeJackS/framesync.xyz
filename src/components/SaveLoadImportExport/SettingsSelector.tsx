import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../stores/settingsStore";
import redxdeletesvg from "../../assets/redxdelete.svg";
import ShowHideToggle from "../ShowHideToggle";

const SettingsSelector = () => {
  const [
    settings,
    factoryPresets,
    userPresets,
    updateSetting,
    updateSettingFromList,
    deleteSetting,
    initializeSettings,
  ] = useSettingsStore((state) => [
    state.settings,
    state.factoryPresets,
    state.userPresets,
    state.updateSetting,
    state.updateSettingFromList,
    state.deleteSetting,
    state.initializeSettings,
  ]);
  const [selectedSettingId, setSelectedSettingId] = useState(settings.saveId);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    initializeSettings();
  }, []);

  const handleFactorySettingClick = (id: number | string) => {
    setSelectedSettingId(id);
    updateSettingFromList(id, true);
  };

  const handleUserSettingClick = (id: number | string) => {
    setSelectedSettingId(id);
    updateSettingFromList(id, false);
  };

  const handleDelete = (id: number | string) => {
    deleteSetting(id);
  };

  return (
    <>
      <fieldset className="w-240px flex flex-col border border-dark-blue">
        <legend className="flex flex-row justify-between text-sm">
          Select Preset
          <button
            className={`ml-4 text-gray-500 ${showDelete ? "text-red-500" : ""}`}
            onClick={() => setShowDelete(!showDelete)}>
            Edit
          </button>
        </legend>
        <div className="h-450 pt-2">
          <div className="flex flex-auto justify-end"></div>
          <ul className="text-md flex h-full flex-col justify-between">
            {/* Factory Presets */}
            <ShowHideToggle label="Factory Presets">
              {factoryPresets.map((preset) => (
                <li
                  className={`flex flex-auto cursor-pointer justify-between  bg-darkest-blue pl-2 hover:bg-darker-blue ${
                    preset.saveId === selectedSettingId
                      ? "border-l-4 border-orange-500 bg-darker-blue text-orange-500"
                      : "bg-darkest-blue text-orange-600"
                  }`}
                  key={preset.saveId}
                  onClick={() => handleFactorySettingClick(preset.saveId)}>
                  <span className="pr-2">{preset.saveName}</span>
                </li>
              ))}
            </ShowHideToggle>
            {/* Custom Presets */}
            <ShowHideToggle label="User Presets">
              {userPresets.map((setting) => (
                <div 
                className="flex flex-row justify-between"
                key={setting.saveId}>
                  <li
                    className={`flex flex-auto cursor-pointer justify-between  bg-darkest-blue pl-2 hover:bg-darker-blue ${
                      setting.saveId === selectedSettingId
                        ? "border-l-4 border-orange-500 bg-darker-blue text-orange-500"
                        : "bg-darkest-blue text-orange-600"
                    }`}
                    onClick={() => handleUserSettingClick(setting.saveId)}>
                    <span className="pr-2">{setting.saveName}</span>
                  </li>
                  {showDelete && (
                    <button
                      className="border-dark-blue bg-red-500 px-2 hover:bg-red-900"
                      onClick={() => handleDelete(setting.saveId)}>
                      <img src={redxdeletesvg} alt="delete" width={20} />
                    </button>
                  )}
                </div>
              ))}
            </ShowHideToggle>
          </ul>
        </div>
      </fieldset>
    </>
  );
};

export default SettingsSelector;
