import { parseDWG } from "addon-test";
import { useEffect } from "react";

function Test() {
  useEffect(() => {
    const result = parseDWG();
    console.log(result);
  }, []);
  return (
    <>
      <div>테스트</div>
    </>
  );
}

export default Test;
