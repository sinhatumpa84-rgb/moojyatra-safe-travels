import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Stars } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.2}>
      <Sphere ref={ref} args={[1.6, 96, 96]}>
        <MeshDistortMaterial
          color="#FF6B81"
          attach="material"
          distort={0.35}
          speed={1.6}
          roughness={0.2}
          metalness={0.6}
          emissive="#9D4EDD"
          emissiveIntensity={0.25}
        />
      </Sphere>
    </Float>
  );
}

function Orbiter({ color, radius, speed, size }: { color: string; radius: number; speed: number; size: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime * speed;
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 0.7) * 0.4;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 55 }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.4} color="#FF6B81" />
        <pointLight position={[-5, -3, -2]} intensity={0.8} color="#4D96FF" />
        <Stars radius={50} depth={50} count={1500} factor={3} fade speed={1} />
        <Globe />
        <Orbiter color="#6BCB77" radius={2.3} speed={0.6} size={0.13} />
        <Orbiter color="#FFD93D" radius={2.7} speed={-0.4} size={0.1} />
        <Orbiter color="#4D96FF" radius={3.1} speed={0.3} size={0.16} />
        <Orbiter color="#FF8E3C" radius={2.5} speed={-0.7} size={0.09} />
      </Suspense>
    </Canvas>
  );
}
