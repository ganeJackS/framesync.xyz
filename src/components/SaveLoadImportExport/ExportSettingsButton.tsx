import React, { useCallback } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

const ExportSettingsButton: React.FC = () => {
  const [ settingsList ] = useSettingsStore((state) => [state.settingsList]);

  const handleClick = useCallback(() => {
    const data = new Blob([JSON.stringify(settingsList, null, 3)], { type: 'text/plain' });
    const file = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = file;
    a.download = 'settingsList.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(file);
  }, [settingsList]);

  return <button
  className="bg-gray-500 hover:bg-gray-700 text-white text-xs font-bold py-1 px-4"
  onClick={handleClick}>Export Presets</button>;
}

export default ExportSettingsButton;
