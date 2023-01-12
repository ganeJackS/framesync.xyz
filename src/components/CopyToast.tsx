import React, { useState } from "react";

type CopyToastProps = {
  children: React.ReactNode;
};

const CopyToast = ({ children }: CopyToastProps) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = () => {
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div onClick={handleCopy}>
      {children}
      {showCopied ? " 🗸" : null}
    </div>
  );
};

export default CopyToast;
