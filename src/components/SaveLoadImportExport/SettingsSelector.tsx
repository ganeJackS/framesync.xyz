import React, { useState, useEffect, useRef, LegacyRef } from "react";
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
    updateSettingName,
    initializeSettings,
  ] = useSettingsStore((state) => [
    state.settings,
    state.factoryPresets,
    state.userPresets,
    state.updateSetting,
    state.updateSettingFromList,
    state.deleteSetting,
    state.updateSettingName,
    state.initializeSettings,
  ]);
  const [selectedSettingId, setSelectedSettingId] = useState(settings.saveId);
  const [showEdit, setShowEdit] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [editingSettingId, setEditingSettingId] = useState(null);
  const [newSettingName, setNewSettingName] = useState("");

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

  const handleFilterChange = (e: any) => {
    setFilterValue(e.target.value);
  };

  const handleRename = (settingId: number | string) => {
    if (editingSettingId && editingSettingId !== settingId) {
      handleSettingNameSave(editingSettingId);
    }
    setEditingSettingId(settingId as any);
    const currentSetting = userPresets.find(
      (setting) => setting.saveId === settingId
    );
    if (currentSetting) setNewSettingName(currentSetting.saveName);
  };

  const handleSettingNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSettingName(e.target.value);
  };

  const handleSettingNameSave = (settingId: number | string) => {
    updateSettingName(settingId, newSettingName);
    setEditingSettingId(null);
    setNewSettingName("");
  };

  const handleSettingNameCancel = (settingId: number | string) => {
    setEditingSettingId(null);
    setNewSettingName("");
  };

  const handleInputRef = (node: { focus: () => void }) => {
    if (node) node.focus();
  };

  const filteredFactoryPresets = factoryPresets.filter((preset) =>
    preset.saveName.toLowerCase().includes(filterValue.toLowerCase().trim())
  );
  const filteredUserPresets = userPresets.filter((preset) =>
    preset.saveName.toLowerCase().includes(filterValue.toLowerCase().trim())
  );

  return (
    <>
      <fieldset className="flex h-96 flex-col border border-dark-blue">
        <legend className="flex flex-row justify-between text-sm">
          Select Preset
          
          <button
            className={`ml-4 text-gray-500 ${showEdit ? "text-red-500" : ""}`}
            onClick={() => setShowEdit(!showEdit)}>
            Edit
          </button>
        </legend>
        <input
            className="w-full bg-darker-blue text-orange-500 border-y border-dark-blue pl-1 justify-center"
            type="text"
            placeholder="Type here to filter presets"
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
                  className="justify-right flex flex-row"
                  key={setting.saveId}>
                  {editingSettingId === setting.saveId ? (
                    <input
                      className="flex w-max flex-auto border-orange-500 bg-dark-blue pl-2 text-orange-600 shadow-inner"
                      type="text"
                      value={newSettingName}
                      onChange={handleSettingNameChange}
                      onBlur={() => handleSettingNameCancel(setting.saveId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSettingNameSave(setting.saveId);
                        }
                      }}
                      
                      ref={handleInputRef as any}
                    />
                  ) : (
                    <li
                      className={`flex flex-auto cursor-pointer  bg-darkest-blue pl-2 hover:bg-darker-blue ${
                        setting.saveId === selectedSettingId
                          ? "border-l-4 border-orange-500 bg-darker-blue text-orange-500"
                          : "bg-darkest-blue text-orange-600"
                      }`}
                      onClick={showEdit ? (() => handleRename(setting.saveId)) : (() => handleUserSettingClick(setting.saveId))}>                  
                      <span className="pr-2">{setting.saveName}</span>
                    </li>
                  )}
                  {showEdit && (
                    <>
                      
                      <button
                        className="border-dark-blue bg-red-500 px-2 hover:bg-red-900"
                        onClick={() => handleDelete(setting.saveId)}>
                        <img src={redxdelete} alt="Delete" width={20} />
                      </button>
                    </>
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
