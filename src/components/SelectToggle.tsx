import React, { useState } from "react";

type Props = {
  onToggle: (value: boolean) => void;
};

const ToggleButton: React.FC<Props> = ({ onToggle }) => {
  const [isToggledOn, setIsToggledOn] = useState(false);

  const handleToggle = () => {
    setIsToggledOn(!isToggledOn);
    onToggle(!isToggledOn);
  };

  return (
    <button
      className={`h-10 w-10 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
        isToggledOn ? "bg-orange-500" : "bg-gray-300"
      }`}
      onClick={handleToggle}
    />
  );
};

export default ToggleButton;
