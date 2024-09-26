import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GeoJsonGeometry } from "three-geojson-geometry";
import { bbox, feature } from "topojson-client";
import { topology } from "topojson-server";

// class CountryClass {
//   geoCoords: any;
//   properties: any
//   lineColor: any;
//   shapeColor:any;
//   constructor(geoCoords:any, properties:any, lineColor:any, shapeColor:any) {
//     this.geoCoords = geoCoords;
//     this.properties = properties;
//     this.lineColor = (!lineColor) ? 0xff0000 : lineColor;
//     this.shapeColor = (!shapeColor) ? 0x000000 : shapeColor;
//   }

//   createLine() {
//     const geometry = new THREE.BufferGeometry();
//     for (let P of this.geoCoords.coordinates) {
//         if(this.geoCoords.type === "MultiPolygon"){
//             P = P[0];
//         }

//         let p0 = new THREE.Vector3(P[0][0], P[0][1], 0);
//         for (let i = 1; i < P.length; ++ i) {

//             let p1 = new THREE.Vector3(P[i][0], P[i][1], 0);
//             geometry.vertices.push(p0, p1);
//             p0 = p1;

//         }
//     }
//     geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

//     let mat = new THREE.LineBasicMaterial({color: this.lineColor});
//     let lineSegments = new THREE.LineSegments(geometry, mat);
//     lineSegments.userData = this;
//     return lineSegments;
// }

// createShape() {
//     let vecs2 = [];
//     let shapearray = [];

//     for (let P of this.geoCoords.coordinates) {
//         if(this.geoCoords.type === "MultiPolygon") {
//             P = P[0];
//         }

//         let p0 = new THREE.Vector2(P[0][0], P[0][1]);
//         for (let i = 1; i < P.length; ++ i) {

//             let p1 = new THREE.Vector2(P[i][0], P[i][1]);
//             vecs2.push(p0, p1);
//             p0 = p1;
//         }

//         shapearray.push(new THREE.Shape(vecs2));
//         vecs2 = [];
//     }

//     let mat = new THREE.MeshBasicMaterial({color: this.shapeColor});
//     let shapeGeo = new THREE.ShapeBufferGeometry(shapearray);
//     let mesh = new THREE.Mesh( shapeGeo, mat ) ;
//     mesh.userData = this;

//     return mesh;
// }
// }

const Mesh = (geoCoords: any, properties: any) => {
  const createLine = () => {
    const geometry = new THREE.BufferGeometry();
    // const verticesValue = [];
    const vertices = [];
    console.log(geoCoords);
    // const vertices:Float32Array = new Float32Array()
    // for (let P of geoCoords.coordinates) {
    //   if (geoCoords.type === "MultiPolygon") {
    //     P = P[0];
    //   }

    //   // let p0 = [P[0][0], P[0][1], 0];
    //   console.log(P[0]);
    //   let p0 = new THREE.Vector3(P[0], P[1], 0);
    //   // let p0 = new Float32Array([P[0][0], P[0][1], 0]);
    //   for (let i = 1; i < P.length; ++i) {
    //     // let p1 = [P[i][0], P[i][1], 0];
    //     let p1 = new THREE.Vector3(P[i][0], P[i][1], 0);
    //     // let p1 = new Float32Array([P[i][0], P[i][1], 0]);

    //     // verticesValue.push(...p0, ...p1);
    //     vertices.push(p0, p1);
    //     p0 = p1;
    //   }
    // }
    // // const vertices: Float32Array = new Float32Array(verticesValue);

    // // geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    // // const attributes = new THREE.BufferAttribute(vertices, 3)
    // const position = vertices.map((v: THREE.Vector3) => {
    //   new Float32Array();
    //   return [v.x, v.y, v.z];
    // });
    return (
      <lineSegments>
        <bufferGeometry args={geoCoords.coordinates}>
          {/* <bufferAttribute attach="attributes-position" args={[position, 3]} /> */}
        </bufferGeometry>
        <lineBasicMaterial color={"#FF0000"} />
      </lineSegments>
    );
  };

  const createShape = () => {
    let vecs2 = [];
    let shapearray = [];

    for (let P of geoCoords.coordinates) {
      if (geoCoords.type === "MultiPolygon") {
        P = P[0];
      }

      let p0 = new THREE.Vector2(P[0][0], P[0][1]);
      for (let i = 1; i < P.length; ++i) {
        let p1 = new THREE.Vector2(P[i][0], P[i][1]);
        vecs2.push(p0, p1);
        p0 = p1;
      }

      shapearray.push(new THREE.Shape(vecs2));
      vecs2 = [];
    }

    return shapearray;
  };

  return { createLine, createShape };
};

const App = () => {
  const [featureData, setFeatureData] = useState<any>();
  useEffect(() => {
    fetch("/test.json")
      .then((data) => data.json())
      .then((data) => {
        console.log("data", data);
        const topoData = topology({ data });
        console.log(topoData);
        const features = feature(topoData, topoData.objects.world_map);
        console.log(features);
        console.log(bbox(topoData));
        setFeatureData(features);
        // const geoData = data.features.map((feature: any) => {
        //   if (feature.geometry) {
        //     console.log(feature.geometry);
        //     return new GeoJsonGeometry(feature.geometry, 2, 5);
        //   }
        // });
        // console.log(data);
        // setGeoJsonData(geoData);
      });
  }, []);

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <perspectiveCamera position={[5, 5, 5]} />
      {featureData &&
        featureData.features.map((d: any) => {
          if (d.geometry) {
            const mesh = Mesh(d.geometry, d.geometry);
            return [mesh.createLine(), mesh.createShape()];
          }
        })}
      {/* {geoJsonData &&
        geoJsonData.map((geo: any) => <GeoJsonMesh geoJson={geo} />)} */}
    </Canvas>
  );
};

export default App;
