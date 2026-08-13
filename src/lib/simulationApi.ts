export interface XYZ {
  x: number;
  y: number;
  z: number;
}

export interface SimulationRequest {
  movement: {
    type: "linear";

    startPosition: XYZ;
    endPosition: XYZ;

    startRotation: XYZ;
    endRotation: XYZ;
  };

  fps: number;
  duration: number;
}

// export async function runSimulation(
//   request: SimulationRequest
// ) {
//   const response = await fetch(
//     "http://localhost:8000/simulate",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(request),
//     }
//   );

//   if (!response.ok) {
//     const errorText = await response.text();
//     console.log(errorText)
//     throw new Error(
//       `Simulation failed: ${errorText}`
//     );
//   }

//   return await response.json();
// }

export async function runSimulation(
  request: SimulationRequest
) {
  const frameCount = request.fps * request.duration;

  const frames = Array.from({ length: frameCount }, (_, i) => {
    const t = i / Math.max(frameCount - 1, 1);

    return {
      position: [
        request.movement.startPosition.x +
          (request.movement.endPosition.x -
            request.movement.startPosition.x) *
            t,

        request.movement.startPosition.y +
          (request.movement.endPosition.y -
            request.movement.startPosition.y) *
            t,

        request.movement.startPosition.z +
          (request.movement.endPosition.z -
            request.movement.startPosition.z) *
            t,
      ],

      rotation: [
        request.movement.startRotation.x +
          (request.movement.endRotation.x -
            request.movement.startRotation.x) *
            t,

        request.movement.startRotation.y +
          (request.movement.endRotation.y -
            request.movement.startRotation.y) *
            t,

        request.movement.startRotation.z +
          (request.movement.endRotation.z -
            request.movement.startRotation.z) *
            t,
      ],

      bx: Math.sin(t * Math.PI * 2),
      by: Math.cos(t * Math.PI * 2),
      bz: Math.sin(t * Math.PI),
    };
  });

  return {
    frames,
    fps: request.fps,
    duration: request.duration,
  };
}