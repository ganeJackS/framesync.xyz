import React, { useState } from 'react';

type Props = {
  // The content to be hidden/shown by the toggle button
  children: React.ReactNode;
  label: string;
};

const ToggleContent: React.FC<Props> = ({ children, label }) => {
  // `hidden` is the state that tracks whether the content is currently hidden or not
  const [hidden, setHidden] = useState(false);



  return (
    <>
      {/* The button that toggles the hidden state of the content */}
      <button 
      className="flex flex-auto justify-start text-orange-500 hover:text-orange-700"
      onClick={() => setHidden(!hidden)}>
        {hidden ? `Show ${label}`  : `Hide ${label}`}
      </button>
      {/* The content that is hidden/shown by the toggle button */}
      {!hidden && <div>{children}</div>}
    </>
  );
};

export default ToggleContent;