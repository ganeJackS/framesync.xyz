import { current } from "immer";
import React, { Children, useEffect, useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";

type Props = {
  name: string;
  isOrange: boolean;
  onToggle: (value: boolean) => void;
};

const ToggleButton: React.FC<Props> = ( { name, isOrange, onToggle } ) => {
  
  const [settings, locks] = useSettingsStore((state) => [state.settings, state.locks]);
  const { modEnabled } = settings;
  const { lockDatumCount, lockTempo, lockFrameRate } = locks;

  const [isToggledOn, setIsToggledOn] = useState(false);

  // if modEnabled is true, set isToggledOn to true, but don't 


  
  const handleToggle = () => {
    setIsToggledOn(!isToggledOn);
    onToggle(!isToggledOn);
  };


  return (
    <label className="flex items-center text-sm cursor-pointer">
      
    <button
      className={`mr-1 h-4 w-4 rounded-full transition-colors duration-200 ease-in-out border-2 border-orange-500 shadow-inner focus:outline-none  
      ${isOrange ? "bg-orange-500" : "bg-darker-blue hover:bg-dark-blue"}
      }`}
      onClick={handleToggle}
   />
   {name}
    </label>

  );
};

export default ToggleButton;
