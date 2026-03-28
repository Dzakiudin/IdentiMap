"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Basic Map Component
export default function MapComponent({ phoneInfo }: { phoneInfo: any }) {
  const [mounted, setMounted] = useState(false);
  const position: [number, number] = [-0.789275, 113.921327]; // Center of Indonesia as default fallback

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[300px] w-full bg-black/80 flex items-center justify-center border border-cyan-900/50">Loading Map...</div>;

  return (
    <div className="h-[300px] w-full border border-cyan-900/50 relative overflow-hidden group">
      <MapContainer center={position} zoom={4} style={{ height: "100%", width: "100%", background: "#050505" }}>
        {/* Hacker style dark map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {/* Radar Ping effect */}
        <Circle center={position} radius={500000} pathOptions={{ color: '#00f3ff', fillColor: '#00f3ff', fillOpacity: 0.1, weight: 1 }} />
        <CircleMarker center={position} radius={8} pathOptions={{ color: '#00ff41', fillColor: '#00ff41', fillOpacity: 0.8 }}>
           <Popup className="font-mono text-xs">
              <div className="bg-black text-cyan-400 p-2">
                 {phoneInfo?.country || "Target Origin Estimate"}
              </div>
           </Popup>
        </CircleMarker>
      </MapContainer>
      
      {/* HUD Elements */}
      <div className="absolute top-2 right-2 bg-black/80 border border-cyan-800 p-2 text-[10px] text-cyan-400 z-[400] font-mono shadow-[0_0_10px_rgba(0,243,255,0.2)]">
        <span className="animate-pulse mr-2 text-neon-green">●</span> SIGNAL ACTIVE
      </div>
      <div className="absolute bottom-2 left-2 text-[10px] text-gray-500 z-[400] font-mono">
        GEO-LOC {position[0].toFixed(4)}, {position[1].toFixed(4)}
      </div>
    </div>
  );
}
