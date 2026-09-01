import React from 'react';
import { CloudSun, Languages, Info, Globe } from 'lucide-react';
import { LANGUAGES } from '../services/aiEngine';

export default function Navbar({ currentLang, onLangChange, onOpenAbout, onResetGlobe }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={onResetGlobe}>
          <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center shadow-md shadow-sky-400/20 text-white font-bold">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Weather<span className="text-sky-500">GPT</span>
            </span>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block">
              Real-time Satellite Weather Forecasting
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          
          {/* Globe View Button */}
          <button
            onClick={onResetGlobe}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold transition-all"
          >
            <Globe className="w-4 h-4 text-sky-500" />
            <span className="hidden sm:inline">3D Globe</span>
          </button>

          {/* Multilingual Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-sky-300 transition-all">
            <Languages className="w-4 h-4 text-sky-500" />
            <select
              value={currentLang}
              onChange={(e) => onLangChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* About Developers Button */}
          <button
            onClick={onOpenAbout}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all active:scale-95"
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </button>

        </div>
      </div>
    </header>
  );
}
