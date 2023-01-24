import React, { useState } from "react";

type Props = {
  // The content to be hidden/shown by the toggle button
  children: React.ReactNode;
  label?: string;
  showLabel?: string;
  hideLabel?: string;
  hide?: boolean;
};

const ShowHideToggle: React.FC<Props> = ({
  children,
  label,
  showLabel,
  hideLabel,
  hide,
}) => {
  // `hidden` is the state that tracks whether the content is currently hidden or not
  
  const [hidden, setHidden] = useState(false);
  

  

  return (
    <>
      {/* The button that toggles the hidden state of the content */}
      <button
        className={`pl-1 flex flex-auto w-full justify-start bg-darker-blue text-gray-500 hover:text-gray-300 ${!hidden ? 'text-gray-300 hover:text-gray-500' : 'text-gray-500 hover:text-gray-300'}`}
        onClick={() => setHidden(!hidden)}>
        {hidden
          ? `⯈ ${showLabel ? showLabel : ""} ${label ? label : ""}`
          : `▼ ${hideLabel ? hideLabel : ""} ${label ? label : ""}`}
      </button>
      {/* The content that is hidden/shown by the toggle button */}
      {!hidden && <div className="">{children}</div>}
    </>
  );
};

export default ShowHideToggle;
