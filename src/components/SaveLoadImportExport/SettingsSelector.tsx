import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../stores/settingsStore";
import redxdelete from "../../assets/redxdelete.svg";
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
  const [filterValue, setFilterValue] = useState("");

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

  const handleFilterChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setFilterValue(e.target.value);
  };

  const filteredFactoryPresets = factoryPresets.filter((preset) =>
    preset.saveName.toLowerCase().includes(filterValue.toLowerCase())
  );
  const filteredUserPresets = userPresets.filter((preset) =>
    preset.saveName.toLowerCase().includes(filterValue.toLowerCase())
  );

  return (
    <>
      <fieldset className="flex h-96 flex-col border border-dark-blue">
        <legend className="flex flex-row justify-between text-sm">
          Select Preset
          <button
            className={`ml-4 text-gray-500 ${showDelete ? "text-red-500" : ""}`}
            onClick={() => setShowDelete(!showDelete)}>
            Edit
          </button>
        </legend>
        <input
          className="ml-1 w-10/12 border border-dark-blue bg-darkest-blue pl-1 pt-1 text-sm text-orange-600 outline-none"
          type="text"
          placeholder="Filter Presets"
          onChange={handleFilterChange}
        />
        <div className="overflow-y-auto pt-2">
          <div className="flex flex-auto justify-end"></div>
          <ul className="text-md flex h-full flex-col justify-between">
            {/* Factory Presets */}
            <ShowHideToggle label="Factory Presets">
              {filteredFactoryPresets.map((preset) => (
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
              {filteredUserPresets.map((setting) => (
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
                      <img src={redxdelete} alt="delete" />
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
