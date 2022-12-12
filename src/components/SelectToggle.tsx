import React, { useState } from 'react';

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
      className={`focus:outline-none rounded-full h-10 w-10 transition-colors duration-200 ease-in-out ${isToggledOn ? 'bg-orange-500' : 'bg-gray-300'}`}
      onClick={handleToggle}
    />
  );
};

export default ToggleButton;
