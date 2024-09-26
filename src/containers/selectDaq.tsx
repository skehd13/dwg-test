import { useNavigate } from "react-router-dom";

const SelectDaq = () => {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <section
        style={{ background: "#FFF", color: "black", overflow: "scroll" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-around",
          }}
        >
          <div
            className="borderBox"
            onClick={() => {
              navigate("/modbusWindow");
            }}
          >
            MODBUS DAQ
          </div>
          <div
            className="borderBox"
            onClick={() => {
              navigate("/bacnetWindow");
            }}
          >
            BACNET DAQ
          </div>
        </div>
      </section>
    </div>
  );
};

export default SelectDaq;
