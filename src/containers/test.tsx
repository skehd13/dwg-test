import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const lines1 = [
  {
    start: [-10, 0, 0],
    end: [0, 10, 0],
  },
  {
    start: [15, 10, 0],
    end: [0, 0, 0],
  },
  {
    start: [16, 19, 0],
    end: [37, 19, 0],
  },
];
const lines = [
  {
    start: [1621.7717957691366, 1884.6166080943667, 0],
    end: [3707.9126202878742, 1884.6166080943667, 0],
  },
  {
    start: [1552.6725017908448, 2318.793504619258, 0],
    end: [2905.044551900113, 2318.793504619258, 0],
  },
  {
    start: [1648.09534695225, 2118.1767455244, 0],
    end: [2934.658538781887, 2118.1767455244, 0],
  },
];

function CameraController() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [position, setPosition] = useState<number[]>([0, 0, 100]);

  // 카메라의 위치를 매 프레임마다 업데이트
  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(position[0], position[1], position[2]);
      cameraRef.current.lookAt(0, 0, 0); // 카메라가 항상 원점을 바라보게 설정
    }
  });

  // 키보드 입력에 따라 카메라 이동
  const handleKeyDown = (event: any) => {
    const speed = 0.1;
    switch (event.key) {
      case "ArrowUp":
        setPosition((prev) => [prev[0], prev[1], prev[2] - speed]);
        break;
      case "ArrowDown":
        setPosition((prev) => [prev[0], prev[1], prev[2] + speed]);
        break;
      case "ArrowLeft":
        setPosition((prev) => [prev[0] - speed, prev[1], prev[2]]);
        break;
      case "ArrowRight":
        setPosition((prev) => [prev[0] + speed, prev[1], prev[2]]);
        break;
      default:
        break;
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={75}
      near={0.1}
      far={1000}
    />
  );
}

function Test() {
  return (
    <>
      <div>테스트</div>
      <Canvas style={{ width: "100vw", height: "100vh" }}>
        {/* <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshPhongMaterial />
        </mesh> */}
        <ambientLight intensity={0.1} />
        <CameraController />
        {/* <directionalLight position={[0, 0, 5]} color="red" /> */}
        {/* 조명 추가 */}
        {/* <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} /> */}
        <line>
          <bufferGeometry></bufferGeometry>
          <lineBasicMaterial color={"#FF0000"} />
        </line>
        {lines.map((line) => {
          const start = new THREE.Vector3(
            line.start[0] / 100,
            line.start[1] / 100,
            line.start[2] / 100
          );
          const end = new THREE.Vector3(
            line.end[0] / 100,
            line.end[1] / 100,
            line.end[2] / 100
          );
          const points = [];
          points.push(start);
          points.push(end);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);

          return (
            <Line
              points={[
                [
                  Math.ceil(line.start[0] / 100),
                  Math.ceil(line.start[1] / 100),
                  Math.ceil(line.start[2] / 100),
                ],
                [
                  Math.ceil(line.end[0] / 100),
                  Math.ceil(line.end[1] / 100),
                  Math.ceil(line.end[2] / 100),
                ],
              ]}
              color={"#FF0000"}
              lineWidth={2}
            ></Line>
          );
        })}
        {lines1.map((line) => {
          const start = new THREE.Vector3(
            line.start[0],
            line.start[1],
            line.start[2]
          );
          const end = new THREE.Vector3(line.end[0], line.end[1], line.end[2]);
          const points = [];
          points.push(start);
          points.push(end);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);

          return (
            <Line
              points={[
                [line.start[0], line.start[1], line.start[2]],
                [line.end[0], line.end[1], line.end[2]],
              ]}
              color={"#FF0000"}
              lineWidth={2}
            ></Line>
          );
        })}

        {/* 카메라 컨트롤 */}
        {/* <OrbitControls /> */}
      </Canvas>
    </>
  );
}

export default Test;
