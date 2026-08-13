// // src/components/sidebar/MagnetGeometrySection.tsx
// import { useSimulatorStore } from "../../store/simulatorStore";
// import { SelectInput } from "./inputs/SelectInput";
// import { NumberInput } from "./inputs/NumberInput";

// const SHAPE_OPTIONS = [
//   { label: "Bar", value: "bar" },
//   { label: "Diametric Cylinder", value: "diametric_cylinder" },
//   { label: "Axial Cylinder", value: "axial_cylinder" },
//   { label: "Diametric Ring", value: "ring"},
//   { label: "Axial Ring", value: "axial_ring" },
//   { label: "Sphere", value: "sphere" },
// ];

// export function MagnetGeometrySection() {
//   const { magnet, setMagnetShape, setMagnetParam } = useSimulatorStore();

//   return (
//     <div className="flex flex-col gap-4 p-2">
//       <SelectInput
//         label="Shape"
//         value={magnet.shape}
//         onChange={(v) => setMagnetShape(v as MagnetShape)}
//         options={SHAPE_OPTIONS}
//       />
//       <ShapeInputs />
//     </div>
//   );
// }

// function ShapeInputs() {
//   const { magnet, setMagnetParam } = useSimulatorStore();

//   switch (magnet.shape) {
//     case "bar":
//       return (
//         <>
//           <NumberInput
//             label="Length (mm)"
//             value={magnet.length}
//             onChange={(v) => setMagnetParam("length", v)}
//           />
//           <NumberInput
//             label="Width (mm)"
//             value={magnet.width}
//             onChange={(v) => setMagnetParam("width", v)}
//           />
//           <NumberInput
//             label="Height (mm)"
//             value={magnet.height}
//             onChange={(v) => setMagnetParam("height", v)}
//           />
//         </>
//       );
//     case "cylinder":
//       return (
//         <>
//           <NumberInput
//             label="Outer Diameter (mm)"
//             value={magnet.outerDiameter}
//             onChange={(v) => setMagnetParam("outerDiameter", v)}
//           />
//           <NumberInput
//             label="Height (mm)"
//             value={magnet.height}
//             onChange={(v) => setMagnetParam("height", v)}
//           />
//         </>
//       );
//     case "ring":
//       return (
//         <>
//           <NumberInput
//             label="Outer Diameter (mm)"
//             value={magnet.outerDiameter}
//             onChange={(v) => setMagnetParam("outerDiameter", v)}
//           />
//           <NumberInput
//             label="Inner Diameter (mm)"
//             value={magnet.innerDiameter}
//             onChange={(v) => setMagnetParam("innerDiameter", v)}
//           />
//           <NumberInput
//             label="Height (mm)"
//             value={magnet.height}
//             onChange={(v) => setMagnetParam("height", v)}
//           />
//         </>
//       );
//     case "sphere":
//       return (
//         <NumberInput
//           label="Diameter (mm)"
//           value={magnet.diameter}
//           onChange={(v) => setMagnetParam("diameter", v)}
//         />
//       );
//   }
// }