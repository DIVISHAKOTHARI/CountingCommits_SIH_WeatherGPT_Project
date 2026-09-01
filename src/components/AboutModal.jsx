import React from 'react';
import { X, Users, Globe, Satellite, FileText, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const developers = [
    { name: "Divisha Kothari", role: "Team Lead & AI/ML Architecture", avatar: "DK" },
    { name: "Vanshik Lakkad", role: "Frontend & 3D WebGL Developer", avatar: "VL" },
    { name: "Krishal Shah", role: "Full-Stack & Satellite API Integration", avatar: "KS" },
    { name: "Manav Motirami", role: "Meteorological Data Engineer", avatar: "MM" },
    { name: "Aman Raj", role: "NLP & Multilingual Engine Specialist", avatar: "AR" },
    { name: "Meet Kathiriya", role: "UI/UX Designer & PDF Systems", avatar: "MK" },
  ];

  const features = [
    { title: "3D Globe & Regional Fly-To", desc: "Interactive Globe camera navigation zooming down into India and targeted states.", icon: Globe },
    { title: "Live RainViewer Radar Tiles", desc: "Real-time 10-minute satellite radar cloud & precipitation overlay maps.", icon: Satellite },
    { title: "Conversational Intelligence", desc: "Multilingual query processing providing crop, rainfall, and storm advisories.", icon: Cpu },
    { title: "High Model Accuracy", desc: "Trained on ensemble datasets combining INSAT-3D, Sentinel-5P, and ERA5 reanalysis.", icon: ShieldCheck },
    { title: "Official PDF Report Export", desc: "One-click compiled weather report download formatted for disaster & agricultural planning.", icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-black tracking-tight text-white mb-1">
            WeatherGPT Development Team
          </h2>
          <p className="text-sky-100 text-xs sm:text-sm">
            Real-time Satellite Weather Forecasting & Disaster Intelligence Platform
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          
          {/* Developers Grid */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-slate-900 text-base">Core Developers</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {developers.map((dev, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-sky-50/70 border border-sky-100/80 hover:border-sky-300 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 text-white font-black text-xs flex items-center justify-center shadow-md shadow-sky-400/20">
                    {dev.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{dev.name}</h4>
                    <p className="text-[11px] text-sky-700 font-medium">{dev.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-slate-900 text-base">Platform Capabilities</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feat, idx) => {
                const IconComponent = feat.icon;
                return (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-600 shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{feat.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
}
