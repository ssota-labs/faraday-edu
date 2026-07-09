// <Model> — load a .glb/.gltf asset (Tier 2: detailed/organic shapes that aren't
// practical to code-generate). Wraps drei's useGLTF + useAnimations with a
// Suspense boundary. Drop the file in public/models/ and pass its URL.
// Curated open-license sources: NASA 3D, Smithsonian 3D, NIH 3D, Poly Haven (CC0),
// Khronos glTF sample assets (CC0), CC-licensed Sketchfab.
import { Suspense, useEffect, useRef } from "react";
import { Center, useAnimations, useGLTF } from "@react-three/drei";
import type { Group } from "three";

function GLTFModel({ url, scale = 1, animation }: { url: string; scale?: number; animation?: string }) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    const name = animation ?? names[0];
    const action = name ? actions[name] : undefined;
    if (!action) return;
    action.reset().fadeIn(0.3).play();
    return () => {
      action.fadeOut(0.3);
    };
  }, [animation, actions, names]);

  return (
    <group ref={group} scale={scale} dispose={null}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

export function Model(props: { url: string; scale?: number; animation?: string }) {
  return (
    <Suspense fallback={null}>
      <GLTFModel {...props} />
    </Suspense>
  );
}
