import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GeoJsonGeometry } from "three-geojson-geometry";
import TopoJSON from "topojson-client";
import { topology } from "topojson-server";
function Box(props: any) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef<any>();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (meshRef.current.rotation.x += delta));
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

// A component to render GeoJSON data as Three.js geometry
const GeoJsonMesh = ({ geoJson }: { geoJson: any }) => {
  const [geometrys, setGeometrys] = useState<any[]>([]);
  const [hover, setHover] = useState<boolean>(false);
  const shape = new THREE.Shape();

  const materials = [
    new THREE.LineBasicMaterial({ color: "blue" }), // outer ring
    new THREE.LineBasicMaterial({ color: "green" }), // inner holes
  ];
  // useEffect(() => {
  //   if (geoJson) {
  //     console.log(geoJson);
  //     const data = geoJson.features.map((feature: any) => {
  //       if (feature.geometry) {
  //         console.log(feature.geometry);
  //         return new GeoJsonGeometry(feature.geometry, 2, 5);
  //       }
  //     });
  //     console.log(data);
  //     setGeometrys(data);
  //     // const geometry = new GeoJsonGeometry(geoJson);
  //     // console.log(geometry);
  //     // const coordinates = geometry.parameters.geoJson.coordinates;
  //     // coordinates.map((coordinate) => {
  //     //   if (typeof coordinate !== "number") {
  //     //     console.log(coordinate);
  //     //   }
  //     // });
  //     // [0].map((a, idx) => {
  //     //   if(idx === 0){
  //     //     shape.moveTo(a)
  //     //   } else{
  //     //     shape.bezierCurveTo(a)
  //     //   }
  //     // });
  //     // setGeometry(geometry);
  //     // meshRef.current.geometry = geometry;
  //   }
  // }, [geoJson]);

  // return geometrys.map((geometry) => {
  //   console.log(geometry);
  if (geoJson) {
    if (geoJson.parameters.geoJson.type === "Point") {
      return (
        <points
          scale={[2, 2, 2]}
          geometry={geoJson}
          material={new THREE.MeshBasicMaterial({ color: "#FF0000" })}
        ></points>
      );
    } else if (geoJson.parameters.geoJson.type === "Polygon") {
      console.log(geoJson);
      // return (
      //   <lineSegments
      //     scale={[2, 2, 2]}
      //     geometry={geometry}
      //     material={new THREE.MeshBasicMaterial({ color: "#FF0000" })}
      //   ></lineSegments>
      // );
      return (
        <mesh
          onPointerEnter={() => {
            setHover(true);
          }}
          onPointerLeave={() => {
            setHover(false);
          }}
        >
          <shapeGeometry toJSON={geoJson} />
          <meshPhongMaterial color={hover ? "#0000FF" : "#00FF00"} />
        </mesh>
      );
    } else {
      return (
        <lineSegments
          scale={[2, 2, 2]}
          geometry={geoJson}
          material={new THREE.MeshBasicMaterial({ color: "#FF0000" })}
        ></lineSegments>
      );
    }
  } else {
    return (
      <lineSegments
        scale={[2, 2, 2]}
        geometry={geoJson}
        material={new THREE.MeshBasicMaterial({ color: "#FF0000" })}
      ></lineSegments>
    );
  }
  // });
};

const App = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // useEffect(() => {
  //   // Replace this with your actual GeoJSON data
  //   const data = {
  //     type: "Polygon",
  //     coordinates: [
  //       [
  //         [102.0, 2.0],
  //         [103.0, 2.0],
  //         [103.0, 3.0],
  //         [102.0, 3.0],
  //         [102.0, 2.0],
  //       ],
  //     ],
  //   };
  //   setGeoJsonData(data);
  // }, []);

  useEffect(() => {
    fetch("/geoJSONTest.json")
      .then((data) => data.json())
      .then((data) => {
        console.log("data", data);
        const topoData = topology({ data });
        console.log(topoData);
        const geoData = data.features.map((feature: any) => {
          if (feature.geometry) {
            console.log(feature.geometry);
            return new GeoJsonGeometry(feature.geometry, 2, 5);
          }
        });
        console.log(data);
        setGeoJsonData(geoData);
      });
  }, []);

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <perspectiveCamera position={[5, 5, 5]} />
      <Box position={[1.2, 0, 0]} />
      {geoJsonData &&
        geoJsonData.map((geo: any) => <GeoJsonMesh geoJson={geo} />)}
    </Canvas>
  );
};

export default App;
