import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const AircraftModel = ({
  components = [],
  selectedComponentType = null,
  onSelectComponent,
}) => {
  const [hoveredPart, setHoveredPart] = useState(null);
  const fanRefLeft = useRef();
  const fanRefRight = useRef();

  // Rotate turbofan blades continuously for realistic operational feel
  useFrame((_, delta) => {
    if (fanRefLeft.current) fanRefLeft.current.rotation.z += delta * 6;
    if (fanRefRight.current) fanRefRight.current.rotation.z += delta * 6;
  });

  // Get status of a component type from aircraft components data
  const getComponentData = (type) => {
    return components.find((c) => c.component_type === type);
  };

  const getPartColor = (type, defaultColor) => {
    const comp = getComponentData(type);
    const isSelected = selectedComponentType === type;
    const isHovered = hoveredPart === type;

    if (isSelected) return '#38bdf8'; // Sky blue highlight

    if (comp) {
      if (comp.status === 'UNDER_MAINTENANCE') return '#f43f5e'; // Rose / Red
      if (comp.status === 'MAINTENANCE_DUE') return '#f59e0b'; // Amber
      if (comp.status === 'WARNING') return '#eab308'; // Yellow
      if (isHovered) return '#34d399'; // Emerald hover
    }

    if (isHovered) return '#93c5fd';
    return defaultColor;
  };

  const getEmissive = (type) => {
    const comp = getComponentData(type);
    const isSelected = selectedComponentType === type;
    const isHovered = hoveredPart === type;

    if (isSelected) return '#0284c7';
    if (comp?.status === 'UNDER_MAINTENANCE') return '#e11d48';
    if (comp?.status === 'MAINTENANCE_DUE') return '#d97706';
    if (comp?.status === 'WARNING') return '#ca8a04';
    if (isHovered) return '#10b981';
    return '#000000';
  };

  const handlePointerOver = (e, type) => {
    e.stopPropagation();
    setHoveredPart(type);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHoveredPart(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e, type) => {
    e.stopPropagation();
    onSelectComponent(type);
  };

  return (
    <group position={[0, 0, 0]} rotation={[0, -Math.PI / 4, 0]}>
      {/* 1. FUSELAGE (Clickable) */}
      <group
        onClick={(e) => handleClick(e, 'fuselage')}
        onPointerOver={(e) => handlePointerOver(e, 'fuselage')}
        onPointerOut={handlePointerOut}
      >
        {/* Main Body Cylinder */}
        <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 0.9, 7.8, 32]} />
          <meshStandardMaterial
            color={getPartColor('fuselage', '#f1f5f9')}
            emissive={getEmissive('fuselage')}
            emissiveIntensity={selectedComponentType === 'fuselage' ? 0.6 : 0.25}
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>

        {/* Nose Cone */}
        <mesh position={[0, 0.35, 4.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.9, 1.4, 32]} />
          <meshStandardMaterial
            color={getPartColor('fuselage', '#e2e8f0')}
            emissive={getEmissive('fuselage')}
            emissiveIntensity={0.2}
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>

        {/* Tail Cone */}
        <mesh position={[0, 0.55, -4.5]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.9, 1.8, 32]} />
          <meshStandardMaterial
            color={getPartColor('fuselage', '#e2e8f0')}
            emissive={getEmissive('fuselage')}
            emissiveIntensity={0.2}
            roughness={0.25}
          />
        </mesh>
      </group>

      {/* 2. COCKPIT (Clickable) */}
      <group
        position={[0, 0.82, 3.5]}
        onClick={(e) => handleClick(e, 'cockpit')}
        onPointerOver={(e) => handlePointerOver(e, 'cockpit')}
        onPointerOut={handlePointerOut}
      >
        {/* Windshield Panels */}
        <mesh rotation={[-0.45, 0, 0]} castShadow>
          <boxGeometry args={[0.95, 0.42, 0.8]} />
          <meshStandardMaterial
            color={getPartColor('cockpit', '#0284c7')}
            emissive={getEmissive('cockpit')}
            emissiveIntensity={selectedComponentType === 'cockpit' ? 0.8 : 0.4}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* 3. WINGS (Clickable) */}
      <group
        onClick={(e) => handleClick(e, 'wings')}
        onPointerOver={(e) => handlePointerOver(e, 'wings')}
        onPointerOut={handlePointerOut}
      >
        {/* Left Wing (Port) */}
        <mesh position={[-3.3, 0.25, -0.4]} rotation={[0, 0.28, -0.06]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 0.14, 1.9]} />
          <meshStandardMaterial
            color={getPartColor('wings', '#cbd5e1')}
            emissive={getEmissive('wings')}
            emissiveIntensity={selectedComponentType === 'wings' ? 0.6 : 0.2}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        {/* Left Winglet */}
        <mesh position={[-5.85, 0.6, -1.2]} rotation={[0, 0.2, 0.45]} castShadow>
          <boxGeometry args={[0.1, 0.8, 0.6]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>

        {/* Right Wing (Starboard) */}
        <mesh position={[3.3, 0.25, -0.4]} rotation={[0, -0.28, 0.06]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 0.14, 1.9]} />
          <meshStandardMaterial
            color={getPartColor('wings', '#cbd5e1')}
            emissive={getEmissive('wings')}
            emissiveIntensity={selectedComponentType === 'wings' ? 0.6 : 0.2}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        {/* Right Winglet */}
        <mesh position={[5.85, 0.6, -1.2]} rotation={[0, -0.2, -0.45]} castShadow>
          <boxGeometry args={[0.1, 0.8, 0.6]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* 4. ENGINES (Clickable) */}
      <group
        onClick={(e) => handleClick(e, 'engine')}
        onPointerOver={(e) => handlePointerOver(e, 'engine')}
        onPointerOut={handlePointerOut}
      >
        {/* Port Engine Nacelle */}
        <group position={[-2.3, -0.35, 0.6]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.52, 2.1, 24]} />
            <meshStandardMaterial
              color={getPartColor('engine', '#94a3b8')}
              emissive={getEmissive('engine')}
              emissiveIntensity={selectedComponentType === 'engine' ? 0.7 : 0.3}
              metalness={0.6}
              roughness={0.2}
            />
          </mesh>
          {/* Pylon mount */}
          <mesh position={[0, 0.45, -0.1]} castShadow>
            <boxGeometry args={[0.12, 0.45, 0.8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Spinning Turbofan Disk */}
          <group ref={fanRefLeft} position={[0, 0, 1.05]}>
            <mesh>
              <cylinderGeometry args={[0.48, 0.48, 0.05, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0, 0.1]}>
              <coneGeometry args={[0.15, 0.3, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#38bdf8" />
            </mesh>
          </group>
        </group>

        {/* Starboard Engine Nacelle */}
        <group position={[2.3, -0.35, 0.6]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.52, 2.1, 24]} />
            <meshStandardMaterial
              color={getPartColor('engine', '#94a3b8')}
              emissive={getEmissive('engine')}
              emissiveIntensity={selectedComponentType === 'engine' ? 0.7 : 0.3}
              metalness={0.6}
              roughness={0.2}
            />
          </mesh>
          {/* Pylon mount */}
          <mesh position={[0, 0.45, -0.1]} castShadow>
            <boxGeometry args={[0.12, 0.45, 0.8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Spinning Turbofan Disk */}
          <group ref={fanRefRight} position={[0, 0, 1.05]}>
            <mesh>
              <cylinderGeometry args={[0.48, 0.48, 0.05, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0, 0.1]}>
              <coneGeometry args={[0.15, 0.3, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#38bdf8" />
            </mesh>
          </group>
        </group>
      </group>

      {/* 5. TAIL (Clickable) */}
      <group
        position={[0, 1.6, -4.2]}
        onClick={(e) => handleClick(e, 'tail')}
        onPointerOver={(e) => handlePointerOver(e, 'tail')}
        onPointerOut={handlePointerOut}
      >
        {/* Vertical Stabilizer Fin */}
        <mesh position={[0, 0.6, 0.3]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.16, 2.4, 1.4]} />
          <meshStandardMaterial
            color={getPartColor('tail', '#0369a1')}
            emissive={getEmissive('tail')}
            emissiveIntensity={selectedComponentType === 'tail' ? 0.6 : 0.2}
            roughness={0.3}
          />
        </mesh>

        {/* Horizontal Tailplanes */}
        <mesh position={[-1.4, -0.3, -0.5]} rotation={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[2.5, 0.1, 0.9]} />
          <meshStandardMaterial
            color={getPartColor('tail', '#cbd5e1')}
            emissive={getEmissive('tail')}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[1.4, -0.3, -0.5]} rotation={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[2.5, 0.1, 0.9]} />
          <meshStandardMaterial
            color={getPartColor('tail', '#cbd5e1')}
            emissive={getEmissive('tail')}
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>

      {/* 6. LANDING GEAR & 7. BRAKES (Clickable) */}
      {/* Nose Landing Gear */}
      <group
        position={[0, -0.7, 2.9]}
        onClick={(e) => handleClick(e, 'landing_gear')}
        onPointerOver={(e) => handlePointerOver(e, 'landing_gear')}
        onPointerOut={handlePointerOut}
      >
        {/* Oleo Strut */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.7, 16]} />
          <meshStandardMaterial
            color={getPartColor('landing_gear', '#94a3b8')}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Dual Nose Wheels */}
        <mesh position={[-0.14, -0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        <mesh position={[0.14, -0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      </group>

      {/* Port Main Gear Assembly & Brakes */}
      <group position={[-1.7, -0.65, -0.4]}>
        {/* Main Strut (Landing Gear target) */}
        <group
          onClick={(e) => handleClick(e, 'landing_gear')}
          onPointerOver={(e) => handlePointerOver(e, 'landing_gear')}
          onPointerOut={handlePointerOut}
        >
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
            <meshStandardMaterial
              color={getPartColor('landing_gear', '#64748b')}
              emissive={getEmissive('landing_gear')}
              metalness={0.8}
            />
          </mesh>
          {/* Dual Wheels */}
          <mesh position={[-0.2, -0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.14, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0.2, -0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.14, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>

        {/* Carbon Brakes Disc Pack (Clickable Brakes!) */}
        <group
          position={[0, -0.3, 0]}
          onClick={(e) => handleClick(e, 'brakes')}
          onPointerOver={(e) => handlePointerOver(e, 'brakes')}
          onPointerOut={handlePointerOut}
        >
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.24, 16]} />
            <meshStandardMaterial
              color={getPartColor('brakes', '#e11d48')}
              emissive={getEmissive('brakes')}
              emissiveIntensity={selectedComponentType === 'brakes' ? 0.9 : 0.4}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        </group>
      </group>

      {/* Starboard Main Gear Assembly & Brakes */}
      <group position={[1.7, -0.65, -0.4]}>
        {/* Main Strut (Landing Gear target) */}
        <group
          onClick={(e) => handleClick(e, 'landing_gear')}
          onPointerOver={(e) => handlePointerOver(e, 'landing_gear')}
          onPointerOut={handlePointerOut}
        >
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
            <meshStandardMaterial
              color={getPartColor('landing_gear', '#64748b')}
              emissive={getEmissive('landing_gear')}
              metalness={0.8}
            />
          </mesh>
          {/* Dual Wheels */}
          <mesh position={[-0.2, -0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.14, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0.2, -0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.14, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>

        {/* Carbon Brakes Disc Pack (Clickable Brakes!) */}
        <group
          position={[0, -0.3, 0]}
          onClick={(e) => handleClick(e, 'brakes')}
          onPointerOver={(e) => handlePointerOver(e, 'brakes')}
          onPointerOut={handlePointerOut}
        >
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.24, 16]} />
            <meshStandardMaterial
              color={getPartColor('brakes', '#e11d48')}
              emissive={getEmissive('brakes')}
              emissiveIntensity={selectedComponentType === 'brakes' ? 0.9 : 0.4}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
