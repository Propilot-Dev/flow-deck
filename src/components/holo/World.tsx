import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { TOOLS } from "@/data/tools";
import { useHolo } from "@/lib/holo-store";
import { openCount, useFlux } from "@/lib/flux-store";

const RING = 9.2;

function Terrain() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 } }),
    [],
  );

  useFrame((_, delta) => {
    if (mat.current) mat.current.uniforms.uTime.value += Math.min(delta, 0.1);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <planeGeometry args={[90, 90, 96, 96]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          varying float vH;
          void main() {
            vUv = uv;
            vec3 p = position;
            float n = sin(p.x * 0.18) * cos(p.y * 0.16) * 1.4
                    + sin(p.x * 0.07 + p.y * 0.05) * 2.2;
            p.z += n;
            vH = n;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          varying float vH;
          uniform float uTime;
          void main() {
            vec2 g = vUv * 48.0;
            vec2 f = abs(fract(g) - 0.5);
            float grid = 1.0 - smoothstep(0.42, 0.5, max(f.x, f.y));
            float dist = length((vUv - 0.5) * 2.0);
            float rings = abs(fract(dist * 8.0 - uTime * 0.07) - 0.06);
            rings = 1.0 - smoothstep(0.0, 0.03, rings);
            vec3 amber = vec3(1.0, 0.42, 0.0);
            vec3 base = vec3(0.035, 0.034, 0.05) + vec3(0.05, 0.06, 0.1) * clamp(vH * 0.2 + 0.35, 0.0, 1.0);
            vec3 col = base + amber * grid * 0.55 + amber * rings * 0.85;
            float fade = smoothstep(1.02, 0.2, dist);
            gl_FragColor = vec4(col, fade * 0.95);
          }
        `}
      />
    </mesh>
  );
}

function Core() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1);
    if (group.current) group.current.rotation.y += d * 0.35;
  });
  return (
    <group ref={group} position={[0, 0.4, 0]}>
      <mesh>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshBasicMaterial color="#ff6a00" wireframe transparent opacity={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.018, 12, 80]} />
        <meshBasicMaterial color="#ff8c42" />
      </mesh>
      <mesh rotation={[Math.PI / 2.6, 0.4, 0]}>
        <torusGeometry args={[1.7, 0.01, 8, 64]} />
        <meshBasicMaterial color="#4b7bff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const count = 4200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const amber = new THREE.Color("#ff6a00");
    const blue = new THREE.Color("#4b7bff");
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.35) * 8;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;
      const c = Math.random() > 0.82 ? blue : amber;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += Math.min(delta, 0.1) * 0.04;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.09}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function labelTexture(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const g = canvas.getContext("2d");
  if (!g) return null;
  g.clearRect(0, 0, 512, 128);
  g.font = "600 54px Inter, sans-serif";
  g.fillStyle = "#f4f4f5";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function Sparks() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += Math.min(delta, 0.1) * 0.45;
  });
  return (
    <group ref={group} position={[0, 0.5, 0]}>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.35, (i % 2) * 0.45, Math.sin(a) * 2.35]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#ff6a00" : "#4b7bff"} />
          </mesh>
        );
      })}
    </group>
  );
}

function Focus() {
  const selectedId = useHolo((s) => s.selectedId);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as { target: THREE.Vector3; update: () => void } | null;
  const desired = useRef(new THREE.Vector3(0, 6.2, 14.2));
  const look = useRef(new THREE.Vector3(0, 0.8, 0));
  const until = useRef(0);
  const prev = useRef<string | null>(null);

  useFrame((state, delta) => {
    if (!controls?.target) return;
    if (prev.current !== selectedId) {
      prev.current = selectedId;
      until.current = state.clock.elapsedTime + 1.5;
    }
    if (state.clock.elapsedTime > until.current) return;
    const index = Math.max(0, TOOLS.findIndex((t) => t.id === selectedId));
    const angle = (index / TOOLS.length) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * RING;
    const z = Math.sin(angle) * RING;
    desired.current.set(x + Math.cos(angle) * 3.4, 2.6, z + Math.sin(angle) * 3.4);
    look.current.set(x, 1.15, z);
    const k = 1 - Math.exp(-3.1 * Math.min(delta, 0.1));
    camera.position.lerp(desired.current, k);
    controls.target.lerp(look.current, k);
    controls.update();
  });
  return null;
}

function Beacon({
  index,
  id,
  name,
  active,
  dim,
  pending,
}: {
  index: number;
  id: string;
  name: string;
  active: boolean;
  dim: boolean;
  pending: number;
}) {
  const select = useHolo((s) => s.select);
  const angle = (index / TOOLS.length) * Math.PI * 2 - Math.PI / 2;
  const x = Math.cos(angle) * RING;
  const z = Math.sin(angle) * RING;
  const ring = useRef<THREE.Mesh>(null);
  const map = useMemo(() => labelTexture(name), [name]);

  useFrame((_, delta) => {
    if (ring.current) ring.current.rotation.z += Math.min(delta, 0.1) * (active ? 1.2 : 0.4);
  });

  return (
    <group position={[x, 0.15, z]} onClick={(e) => { e.stopPropagation(); select(id); }}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1, 8]} />
        <meshBasicMaterial color={active ? "#ff6a00" : "#4b7bff"} transparent opacity={dim ? 0.2 : 0.85} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.42, 0.55, 0.08, 6]} />
        <meshBasicMaterial color={active ? "#ff6a00" : "#22222a"} />
      </mesh>
      <mesh ref={ring} position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.015, 8, 40]} />
        <meshBasicMaterial color={active ? "#ff8c42" : "#4b7bff"} transparent opacity={dim ? 0.25 : 0.9} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <octahedronGeometry args={[active ? 0.24 : 0.18, 0]} />
        <meshBasicMaterial color={active ? "#ff6a00" : "#f4f4f5"} transparent opacity={dim ? 0.28 : 1} />
      </mesh>
      {pending > 0 ? (
        <mesh position={[0.38, 1.55, 0]}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshBasicMaterial color="#ff6a00" />
        </mesh>
      ) : null}
      {map ? (
        <sprite position={[0, 1.95, 0]} scale={[2.1, 0.52, 1]}>
          <spriteMaterial map={map} transparent depthWrite={false} opacity={dim ? 0.25 : 1} />
        </sprite>
      ) : null}
    </group>
  );
}

function Burst() {
  const selectedId = useHolo((s) => s.selectedId);
  const ref = useRef<THREE.Points>(null);
  const life = useRef(0);
  const prev = useRef(selectedId);
  const count = 42;
  const positions = useMemo(() => new Float32Array(count * 3), []);
  const velocities = useMemo(() => new Float32Array(count * 3), []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (prev.current !== selectedId) {
      prev.current = selectedId;
      const index = Math.max(0, TOOLS.findIndex((t) => t.id === selectedId));
      const angle = (index / TOOLS.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * RING;
      const z = Math.sin(angle) * RING;
      for (let i = 0; i < count; i++) {
        positions[i * 3] = x;
        positions[i * 3 + 1] = 1.15;
        positions[i * 3 + 2] = z;
        const a = Math.random() * Math.PI * 2;
        const speed = 0.7 + Math.random() * 1.6;
        velocities[i * 3] = Math.cos(a) * speed;
        velocities[i * 3 + 1] = 0.6 + Math.random() * 1.8;
        velocities[i * 3 + 2] = Math.sin(a) * speed;
      }
      life.current = 0.85;
    }
    const mat = ref.current?.material as THREE.PointsMaterial | undefined;
    if (!mat) return;
    if (life.current <= 0) {
      mat.opacity = 0;
      return;
    }
    life.current -= dt;
    for (let i = 0; i < count; i++) {
      positions[i * 3] += velocities[i * 3] * dt;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
      velocities[i * 3 + 1] -= dt * 1.4;
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = Math.max(0, life.current);
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.14}
        color="#ff6a00"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function Rig() {
  const selectedId = useHolo((s) => s.selectedId);
  const query = useHolo((s) => s.query);
  const verdict = useFlux((s) => s.verdict);
  const q = query.trim().toLowerCase();

  return (
    <>
      <Terrain />
      <Core />
      <Sparks />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[RING - 0.18, RING + 0.18, 96]} />
        <meshBasicMaterial color="#ff6a00" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      <Particles />
      <Burst />
      {TOOLS.map((tool, index) => {
        const match =
          !q ||
          tool.name.toLowerCase().includes(q) ||
          tool.group.toLowerCase().includes(q) ||
          tool.line.toLowerCase().includes(q);
        return (
          <Beacon
            key={tool.id}
            index={index}
            id={tool.id}
            name={tool.name}
            active={tool.id === selectedId}
            dim={!match}
            pending={openCount(verdict, tool.id)}
          />
        );
      })}
      <Focus />
    </>
  );
}

export default function World() {
  return (
    <Canvas
      camera={{ position: [0, 6.2, 14.2], fov: 46, near: 0.1, far: 120 }}
      dpr={[1, 1.6]}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
      onPointerMissed={() => undefined}
    >
      <color attach="background" args={["#050507"]} />
      <fog attach="fog" args={["#050507", 16, 42]} />
      <Rig />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={28}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.8, 0]}
      />
    </Canvas>
  );
}
