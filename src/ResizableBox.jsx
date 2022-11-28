import React from "react";
import { ResizableBox as ReactResizableBox } from "react-resizable";

import "react-resizable/css/styles.css";

export default function ResizableBox({
  children,
  width = "auto",
  height = "auto",
  resizable = true,
  style = {},
  className = "",
}) {
  return (
    <div style={{ marginLeft: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          justifyItems: "center",
          width: "100%",
          background: "rgba(0, 27, 45, 0.9)",
          overflow: "visible",
          // padding: ".5rem",
          // borderRadius: "0.5rem",
          // boxShadow: "0 30px 40px rgba(0,0,0,.1)",
          ...style,
        }}
      >
        {resizable ? (
          <ReactResizableBox width={width} height={height}>
            <div
              style={{
                width: "auto",
                height: "100%",
              }}
              className={className}
            >
              {children}
            </div>
          </ReactResizableBox>
        ) : (
          <div
            style={{
              width: `${width}px`,
              height: `${height}px`,
            }}
            className={className}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
