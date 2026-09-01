import React, { useState } from 'react';
import { Search, Send, Wind, Droplets, Gauge, CloudRain, ShieldAlert, Sun, ArrowUpRight } from 'lucide-react';

export default function HomeScreen({ weatherData, onQuerySubmit }) {
  const [query, setQuery] = useState('');

  const samplePrompts = [
    { label: 'Gujarat Live Cloud & Rain Radar', icon: CloudRain, query: 'Show live cloud overlay & rainfall forecast for Gujarat state' },
    { label: 'Odisha Cyclone & Storm Alert', icon: ShieldAlert, query: 'Are there any cyclone or disaster warnings in coastal Odisha?' },
    { label: 'Punjab Wheat Crop Weather Advice', icon: Sun, query: 'Provide rainfall and temperature advisory for wheat crops in Punjab' },
    { label: 'Delhi NCR Live AQI & Cloud Cover', icon: Gauge, query: 'What is the current air quality index and cloud cover in Delhi?' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onQuerySubmit(query);
  };

  const handleChipClick = (promptQuery) => {
    setQuery(promptQuery);
    onQuerySubmit(promptQuery);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-b from-sky-500/10 via-sky-100/40 to-sky-50 flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden">
      
      {/* Atmosphere Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-400/20 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Weather Metrics Bar */}
      <div className="w-full max-w-4xl z-10 my-2">
        <div className="bg-white/90 backdrop-blur-md border border-sky-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/30">
              <Sun className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                Live Regional Weather
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">
                {weatherData ? `${weatherData.temperature}°C — ${weatherData.weatherDesc}` : '29°C — Partly Cloudy'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-500" />
              <span>Humidity: <strong className="text-slate-800">{weatherData?.humidity || 68}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-sky-500" />
              <span>AQI: <strong className="text-sky-700">{weatherData?.aqi || 48} ({weatherData?.aqiCategory?.label || 'Good'})</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-sky-500" />
              <span>Wind: <strong className="text-slate-800">{weatherData?.windSpeed || 14} km/h</strong></span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Search Section */}
      <div className="w-full max-w-3xl z-10 flex flex-col items-center text-center my-auto py-8">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
          Weather<span className="text-sky-500">GPT</span>
        </h1>

        <p className="text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
          Real-time weather forecasting, satellite cloud overlays, crop advisories, and disaster alerts.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="w-full relative group">
          <div className="relative flex items-center bg-white border-2 border-sky-300 group-hover:border-sky-500 rounded-3xl shadow-xl shadow-sky-500/10 transition-all p-2 pl-5">
            <Search className="w-6 h-6 text-sky-500 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a location or ask about weather (e.g. 'Gujarat live cloud forecast')..."
              className="w-full px-3 py-3 text-slate-800 text-sm sm:text-base placeholder-slate-400 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm shadow-md shadow-sky-500/30 transition-all flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer"
            >
              <span>Search</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Suggestion Chips */}
        <div className="w-full mt-6">
          <div className="flex flex-wrap justify-center gap-2">
            {samplePrompts.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleChipClick(item.query)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 hover:bg-sky-50 border border-sky-200 text-slate-700 hover:text-sky-700 text-xs font-semibold shadow-sm hover:shadow-sky-500/10 transition-all group cursor-pointer"
                >
                  <IconComp className="w-3.5 h-3.5 text-sky-500 group-hover:scale-110 transition-transform" />
                  <span>{item.label}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-sky-500" />
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <div className="z-10 text-center text-xs text-slate-400 py-2">
        <span>Real-time Satellite & Weather Analytics</span>
      </div>

    </div>
  );
}
