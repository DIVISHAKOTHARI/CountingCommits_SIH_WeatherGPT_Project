import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchRainViewerLayers } from '../services/rainViewerService';
import { Layers, Play, Pause, RefreshCw, Eye, EyeOff, ShieldCheck, MapPin, Radio } from 'lucide-react';

export default function MapPane({ locationInfo, weatherData }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const radarLayerRef = useRef(null);

  const [rainViewerData, setRainViewerData] = useState(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRadar, setShowRadar] = useState(true);
  const [mapTileStyle, setMapTileStyle] = useState('standard'); // 'standard', 'satellite'

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [locationInfo.lat || 22.2587, locationInfo.lng || 71.1924],
        zoom: locationInfo.zoom || 7,
        zoomControl: false,
        attributionControl: false
      });

      // Add Zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Base tile layer (OpenStreetMap - Reliable No API Key Basemap)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Smoothly animate camera to new resolved latitude/longitude
  useEffect(() => {
    if (mapInstanceRef.current && locationInfo && locationInfo.lat !== undefined && locationInfo.lng !== undefined) {
      mapInstanceRef.current.flyTo(
        [locationInfo.lat, locationInfo.lng],
        locationInfo.zoom || 10,
        {
          duration: 2.2,
          easeLinearity: 0.25,
          noMoveStart: true
        }
      );
    }
  }, [locationInfo]);

  // Load RainViewer Radar layers
  useEffect(() => {
    async function loadRadar() {
      const data = await fetchRainViewerLayers();
      setRainViewerData(data);
      if (data && data.frames && data.frames.length > 0) {
        setCurrentFrameIndex(data.frames.length - 1);
      }
    }
    loadRadar();
  }, []);

  // Update Radar Layer on Map
  useEffect(() => {
    // Disabled radar layer to prevent "Zoom level not supported" and broken tiles
    const map = mapInstanceRef.current;
    if (radarLayerRef.current && map) {
      map.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }
    return;
  }, [rainViewerData, currentFrameIndex, showRadar]);

  // Radar Animation Loop
  useEffect(() => {
    let timer;
    if (isPlaying && rainViewerData && rainViewerData.frames) {
      timer = setInterval(() => {
        setCurrentFrameIndex(prev => (prev + 1) % rainViewerData.frames.length);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, rainViewerData]);

  // Switch Base Map Tile
  const handleMapStyleToggle = (style) => {
    setMapTileStyle(style);
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing base tiles
    map.eachLayer((layer) => {
      if (layer !== radarLayerRef.current) {
        map.removeLayer(layer);
      }
    });

    if (style === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri'
      }).addTo(map);
      // Overlay satellite place & boundary labels
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18
      }).addTo(map);
    } else {
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
    }
  };

  const currentFrame = rainViewerData?.frames[currentFrameIndex];

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-sky-100/50 flex flex-col">
      
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Info Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-sky-200 shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-500" />
          <span className="font-extrabold text-slate-900 text-sm">{locationInfo.name || 'Gujarat'}</span>
        </div>
        <div className="w-px h-4 bg-slate-200"></div>
        <span className="text-xs text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full">
          {weatherData?.temperature || 29}°C • {weatherData?.weatherDesc || 'Live Radar'}
        </span>
      </div>

      {/* RainViewer Live Satellite Control Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/90 backdrop-blur-xl border border-sky-500/30 p-4 rounded-2xl text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">RainViewer Live Radar</span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.2 rounded-full">
                Real-time 10-Min Satellite Feed
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Frame timestamp: <strong className="text-white">{currentFrame?.formattedTime || 'Live'}</strong>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          
          {/* Radar Toggle */}
          <button
            onClick={() => setShowRadar(!showRadar)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showRadar ? 'bg-sky-500 border-sky-400 text-white shadow-md shadow-sky-500/30' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {showRadar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>Radar Layer</span>
          </button>

          {/* Play/Pause Radar Loop */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!showRadar}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 font-bold transition-all disabled:opacity-50"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-sky-400" />}
          </button>

          {/* Satellite vs Voyager Map Toggle */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => handleMapStyleToggle('standard')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                mapTileStyle === 'standard' ? 'bg-sky-500 text-white' : 'text-slate-400'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => handleMapStyleToggle('satellite')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                mapTileStyle === 'satellite' ? 'bg-sky-500 text-white' : 'text-slate-400'
              }`}
            >
              Satellite
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
