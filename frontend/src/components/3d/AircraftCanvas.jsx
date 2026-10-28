import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei';
import { AircraftModel } from './AircraftModel';
import { ComponentInfoPanel } from './ComponentInfoPanel';
import { StatusLegend } from './StatusLegend';
import { RotateCcw, Crosshair, ZoomIn, Info } from 'lucide-react';

export const AircraftCanvas = ({
  aircraft = null,
  components = [],
  onOpenCreateWorkOrder,
  height = 'h-[500px] lg:h-[600px]',
}) => {
  const controlsRef = useRef();
  const [selectedType, setSelectedType] = useState(null);

  // Available interactive target types
  const partTypes = [
    { id: 'engine', label: 'Engine' },
    { id: 'landing_gear', label: 'Landing Gear' },
    { id: 'wings', label: 'Wings' },
    { id: 'fuselage', label: 'Fuselage' },
    { id: 'cockpit', label: 'Cockpit' },
    { id: 'tail', label: 'Tail' },
    { id: 'brakes', label: 'Brakes' },
  ];

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleSelectComponent = (type) => {
    setSelectedType(selectedType === type ? null : type);
  };

  const selectedComponentData = components.find(
    (c) => c.component_type === selectedType
  ) || (selectedType ? {
    component_type: selectedType,
    component_id: `${selectedType.toUpperCase().slice(0, 3)}-${aircraft?.registration_number || '01'}`,
    name: `${partTypes.find(p => p.id === selectedType)?.label || selectedType} Assembly`,
    status: 'OPERATIONAL',
    condition_score: 95,
    aircraft_registration: aircraft?.registration_number || 'N737AA',
    last_inspection: '2026-09-10',
    next_inspection: '2026-10-15',
    assigned_technician_name: 'Marcus Vance',
    related_work_orders: []
  } : null);

  return (
    <div className={`relative w-full ${height} rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-b from-[#0d1627] via-[#090e1a] to-[#060a12] shadow-2xl`}>
      {/* Top Left Status Legend */}
      <StatusLegend />

      {/* Top Center Aircraft Tag */}
      {aircraft && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            {aircraft.registration_number}
          </span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-medium text-slate-300">
            {aircraft.model}
          </span>
        </div>
      )}

      {/* Camera & Control Actions Overlay */}
      <div className="absolute bottom-16 right-4 sm:bottom-4 sm:right-4 z-20 flex items-center gap-2">
        <button
          onClick={handleResetCamera}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 backdrop-blur-md text-xs font-medium transition shadow-lg"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
          <span>Reset Camera</span>
        </button>
      </div>

      {/* Bottom Component Quick Selection Bar */}
      <div className="absolute bottom-3 left-4 right-4 sm:right-44 z-20 overflow-x-auto flex items-center gap-1.5 py-1 scrollbar-none">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 pl-1 pr-2 hidden md:inline">
          Inspect:
        </span>
        {partTypes.map((pt) => {
          const comp = components.find((c) => c.component_type === pt.id);
          const isSelected = selectedType === pt.id;
          const statusDot =
            comp?.status === 'UNDER_MAINTENANCE'
              ? 'bg-rose-400 animate-pulse'
              : comp?.status === 'MAINTENANCE_DUE'
              ? 'bg-amber-400'
              : comp?.status === 'WARNING'
              ? 'bg-yellow-400'
              : 'bg-emerald-400';

          return (
            <button
              key={pt.id}
              onClick={() => handleSelectComponent(pt.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-md shadow-sky-500/20 scale-105'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/60'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              <span>{pt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Component Info Panel */}
      {selectedType && (
        <ComponentInfoPanel
          component={selectedComponentData}
          onClose={() => setSelectedType(null)}
          onOpenCreateWorkOrder={onOpenCreateWorkOrder}
        />
      )}

      {/* Three.js 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [9, 6, 9], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[12, 20, 15]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-10, 10, -10]} intensity={0.5} />
        <pointLight position={[0, -5, 0]} intensity={0.3} color="#38bdf8" />

        {/* 3D Aircraft Model */}
        <AircraftModel
          components={components}
          selectedComponentType={selectedType}
          onSelectComponent={handleSelectComponent}
        />

        {/* Ground Grid & Shadow */}
        <Grid
          position={[0, -1.05, 0]}
          args={[40, 40]}
          cellSize={1}
          cellThickness={0.6}
          cellColor="#1e293b"
          sectionSize={5}
          sectionThickness={1.2}
          sectionColor="#334155"
          fadeDistance={30}
          fadeStrength={1.5}
        />
        <ContactShadows
          position={[0, -1.04, 0]}
          opacity={0.6}
          scale={20}
          blur={1.5}
          far={5}
        />

        {/* Interactive Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={4}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2 + 0.05}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};
