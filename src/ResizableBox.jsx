import React from "react";
import { ResizableBox as ReactResizableBox } from "react-resizable";


import "react-resizable/css/styles.css";



function ResizableBox({
  children,
  width = 1920,
  height = {height: "100%"},
  resizable = true,
  style = {minWidth: "100vw"},
  className = "chartConatiner",
}) {


  return (
    <div style={{ minWidth: "100vw" }}>
      <div
        style={{
          display: "block",
          width: "100%",
          background: "rgba(0, 27, 45, 0.9)",
          overflowX: "scroll",
         
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
                width: width,
                minWidth: "100vw",
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
              width: "auto",
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

export default ResizableBox