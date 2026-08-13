// import { useSimulatorStore } from "../store/simulatorStore";

// export class SimulationPlayer {
//   fps: number;

//   constructor(fps: number) {
//     this.fps = fps;
//   }

//   update(delta: number, frameCount: number) {
//     const store = useSimulatorStore.getState();

//     if (!store.playing) return;

//     const advance =
//       delta * this.fps;

//     const nextFrame =
//       store.currentFrame + advance;

//     if (nextFrame >= frameCount) {
//       store.pause();
//       store.setFrame(frameCount - 1);
//       return;
//     }

//     store.setFrame(nextFrame);
//   }
// }