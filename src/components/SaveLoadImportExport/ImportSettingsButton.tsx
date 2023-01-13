import React, { useCallback, useState } from "react";
import { useSettingsStore } from "../../stores/settingsStore";

const ImportSettingsButton: React.FC = () => {
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(
    null
  );
  const { settingsList, updateSettingFromList, saveSetting } = useSettingsStore(
    (state) => state
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const newSettingsList = JSON.parse(e.target.result as string);
            newSettingsList.forEach((setting: { saveId: string | number }) => {
              updateSettingFromList(setting.saveId);
              saveSetting();
            });
            localStorage.setItem(
              "settings_fs_list",
              JSON.stringify([...settingsList, ...newSettingsList])
            );
          }
        };
        reader.readAsText(selectedFile);
      }
    },
    [updateSettingFromList, saveSetting, settingsList]
  );

  const handleButtonClick = useCallback(() => {
    if (fileInputRef) {
      fileInputRef.click();
    }
  }, [fileInputRef]);

  return (
    <>
      <input
        type="file"
        ref={(input) => setFileInputRef(input)}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        className="ml-0 bg-gray-500 py-1 px-4 text-xs font-bold text-white hover:bg-gray-700"
        onClick={handleButtonClick}>
        Import Presets
      </button>
    </>
  );
};

export default ImportSettingsButton;
