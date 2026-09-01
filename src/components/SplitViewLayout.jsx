import React from 'react';
import { motion } from 'framer-motion';
import MapPane from './MapPane';
import ChatPane from './ChatPane';

export default function SplitViewLayout({ locationInfo, weatherData, messages, onSendMessage, currentLang }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full h-[calc(100vh-4rem)] p-3 sm:p-4 bg-gradient-to-br from-sky-50 via-sky-100/50 to-slate-100 flex flex-col md:flex-row gap-4 overflow-hidden"
    >
      {/* Left Pane: Interactive Map with RainViewer Live Radar Overlay */}
      <motion.div
        layout
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full md:w-3/5 h-1/2 md:h-full relative shrink-0"
      >
        <MapPane locationInfo={locationInfo} weatherData={weatherData} />
      </motion.div>

      {/* Right Pane: WeatherGPT AI Assistant & Insights */}
      <motion.div
        layout
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full md:w-2/5 h-1/2 md:h-full relative flex flex-col min-w-0"
      >
        <ChatPane
          messages={messages}
          onSendMessage={onSendMessage}
          currentLocation={locationInfo}
          weatherData={weatherData}
          currentLang={currentLang}
        />
      </motion.div>
    </motion.div>
  );
}
