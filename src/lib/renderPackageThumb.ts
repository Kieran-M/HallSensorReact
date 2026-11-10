import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { alignPackageScene } from "./alignPackageScene";
import type { PackageModelSpec } from "./packageModels";

const SIZE = 192;
const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

let sharedRenderer: WebGLRenderer | null = null;

function getRenderer(): WebGLRenderer | null {
  if (typeof document === "undefined") return null;
  if (sharedRenderer) return sharedRenderer;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "low-power",
    });
    renderer.setSize(SIZE, SIZE, false);
    renderer.setClearColor(new Color(0x000000), 0);
    sharedRenderer = renderer;
    return renderer;
  } catch {
    return null;
  }
}

/**
 * Render an official package GLB to a PNG data-URL (cached by model id).
 * One shared WebGL context — safe for long catalog lists.
 */
export function renderPackageThumb(model: PackageModelSpec): Promise<string> {
  const hit = cache.get(model.id);
  if (hit) return Promise.resolve(hit);

  const pending = inflight.get(model.id);
  if (pending) return pending;

  const job = (async () => {
    const renderer = getRenderer();
    if (!renderer) throw new Error("WebGL unavailable");

    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(model.url);
    const root = alignPackageScene(gltf.scene.clone(true), model.rotation, {
      centerMeshNameIncludes: model.centerMeshNameIncludes,
      omitMeshNameIncludes: model.omitMeshNameIncludes,
    });

    const scene = new Scene();
    scene.add(root);
    scene.add(new AmbientLight(0xffffff, 1.15));
    const key = new DirectionalLight(0xffffff, 2.2);
    key.position.set(1.2, 1.4, 2.2);
    scene.add(key);
    const fill = new DirectionalLight(0xc7d2fe, 0.85);
    fill.position.set(-1.5, -0.6, 1.0);
    scene.add(fill);

    const box = new Box3().setFromObject(root);
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 1e-6);

    // Oblique view of marking face (+Z) — matches Magpylib “top” of package.
    const camera = new PerspectiveCamera(32, 1, maxDim * 0.01, maxDim * 40);
    const dist = maxDim * 2.35;
    camera.position.set(dist * 0.72, dist * -0.85, dist * 0.95);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL("image/png");
    cache.set(model.id, dataUrl);

    // Drop GPU resources from this one-shot scene (keep shared renderer).
    root.traverse((obj) => {
      const mesh = obj as { geometry?: { dispose: () => void }; material?: unknown };
      mesh.geometry?.dispose();
      const mat = mesh.material as
        | { dispose?: () => void }
        | Array<{ dispose?: () => void }>
        | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose?.());
      else mat?.dispose?.();
    });

    return dataUrl;
  })().finally(() => {
    inflight.delete(model.id);
  });

  inflight.set(model.id, job);
  return job;
}

export function peekPackageThumb(modelId: string): string | undefined {
  return cache.get(modelId);
}

/** Kick off renders for every official package (catalog open). */
export function warmPackageThumbs(
  models: PackageModelSpec[],
): void {
  for (const model of models) {
    void renderPackageThumb(model).catch(() => {
      /* SVG fallback handles failures per-thumb */
    });
  }
}
