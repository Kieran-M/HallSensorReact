import { Box3, Group, Vector3, type Object3D } from "three";

export type AlignPackageOptions = {
  /**
   * When set, AABB-centre using only meshes whose names include one of these
   * substrings (e.g. SIP-3 body nodes NAUO3/NAUO4, excluding long leads).
   */
  centerMeshNameIncludes?: string[];
  /** Remove meshes whose names match before centering (e.g. stock leadframe). */
  omitMeshNameIncludes?: string[];
};

function objectNameChain(obj: Object3D): string {
  const parts: string[] = [];
  let cur: Object3D | null = obj;
  while (cur) {
    if (cur.name) parts.push(cur.name.toLowerCase());
    cur = cur.parent;
  }
  return parts.join(" ");
}

function nameMatches(obj: Object3D, filters: string[]): boolean {
  const chain = objectNameChain(obj);
  return filters.some((f) => chain.includes(f.toLowerCase()));
}

/** Apply Magpylib orientation + AABB-centre a cloned STEP/GLB scene graph. */
export function alignPackageScene(
  scene: Object3D,
  rotation: [number, number, number],
  options?: AlignPackageOptions,
): Group {
  const omit = options?.omitMeshNameIncludes;
  if (omit && omit.length > 0) {
    const toRemove: Object3D[] = [];
    scene.traverse((obj) => {
      const mesh = obj as Object3D & { isMesh?: boolean };
      if (!mesh.isMesh) return;
      if (nameMatches(mesh, omit)) toRemove.push(mesh);
    });
    for (const mesh of toRemove) {
      mesh.parent?.remove(mesh);
    }
  }

  const aligned = new Group();
  aligned.rotation.set(rotation[0], rotation[1], rotation[2]);
  aligned.add(scene);
  aligned.updateMatrixWorld(true);

  const box = new Box3();
  const filters = options?.centerMeshNameIncludes;
  if (filters && filters.length > 0) {
    aligned.traverse((obj) => {
      const mesh = obj as Object3D & { isMesh?: boolean };
      if (!mesh.isMesh) return;
      if (!nameMatches(mesh, filters)) return;
      box.expandByObject(mesh);
    });
  } else {
    box.setFromObject(aligned);
  }

  // If name filters matched nothing, fall back to full AABB so we never leave
  // the STEP sitting at its raw CAD offset.
  if (box.isEmpty()) {
    box.setFromObject(aligned);
  }

  if (!box.isEmpty()) {
    const center = box.getCenter(new Vector3());
    aligned.position.set(-center.x, -center.y, -center.z);
    aligned.updateMatrixWorld(true);
  }
  return aligned;
}
