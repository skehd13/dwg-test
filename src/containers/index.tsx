import { Route, Routes } from "react-router-dom";
// import SelectDaq from "./selectDaq";
// import ModbusWindow from "./modbusWindow";
// import BacnetWindow from "./bacnetWindow";
// import ModbusEdit from "./modbusEdit";
// import Test from "./test";
// import Test from "./test2";
// import Test from "./test3";
// import Test from "./test4";
import Test from "./test5";

const App = () => {
  // useEffect(() => {
  //   apiFetch("/modbus", "GET").then((data) => {
  //     console.log(data);
  //   });
  // }, []);
  return (
    <Routes>
      <Route path="/" element={<Test />} />
      {/* <Route path="/" element={<SelectDaq />} /> */}
      {/* <Route path="/modbusWindow" element={<ModbusWindow />} />
      <Route path="/bacnetWindow" element={<BacnetWindow />} />
      <Route path="/modbusEdit" element={<ModbusEdit />} /> */}
    </Routes>
  );
};
export default App;
