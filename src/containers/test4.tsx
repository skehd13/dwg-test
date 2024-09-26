import React, { useEffect, useState } from "react";
import parse, { DxfParser } from "dxf-parser";

const App = () => {
  const parseDXF = () => {
    const parser = new DxfParser();
    const dxf = parser.parseSync("../public/M-test.dxf");
    console.log(dxf);
  };
  useEffect(() => {
    parseDXF();
  }, []);

  return <div>TEST</div>;
};

export default App;
