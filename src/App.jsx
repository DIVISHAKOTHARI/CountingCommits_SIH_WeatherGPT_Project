import React, { useState, useEffect } from 'react';
import GlobeIntro from './components/GlobeIntro';
import Navbar from './components/Navbar';
import HomeScreen from './components/HomeScreen';
import SplitViewLayout from './components/SplitViewLayout';
import AboutModal from './components/AboutModal';
import WeatherBackgroundEffects from './components/WeatherBackgroundEffects';
import { DEFAULT_LOCATION, detectLocationFromQuery, fetchRealtimeWeather } from './services/weatherService';
import { generateWeatherAIResponse } from './services/aiEngine';

export default function App() {
  const [screenState, setScreenState] = useState('intro'); // 'intro', 'home', 'split'
  const [currentLang, setCurrentLang] = useState('en');
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState(null);
  const [messages, setMessages] = useState([]);

  // Fetch initial weather for default region (Gujarat)
  useEffect(() => {
    async function initWeather() {
      const data = await fetchRealtimeWeather(currentLocation.lat, currentLocation.lng);
      setWeatherData(data);
    }
    initWeather();
  }, [currentLocation]);

  // Handle Query Submission
  const handleQuerySubmit = async (queryText) => {
    if (!queryText.trim()) return;

    const targetLoc = await detectLocationFromQuery(queryText);
    setCurrentLocation(targetLoc);

    const freshWeather = await fetchRealtimeWeather(targetLoc.lat, targetLoc.lng);
    setWeatherData(freshWeather);

    const aiResp = await generateWeatherAIResponse(queryText, targetLoc, freshWeather, currentLang);

    const userMsg = { sender: 'user', content: queryText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const aiMsg = { sender: 'ai', content: aiResp.content, telemetry: aiResp.satelliteTelemetry, timestamp: aiResp.timestamp };

    setMessages(prev => [...prev, userMsg, aiMsg]);

    if (screenState !== 'split') {
      setScreenState('split');
    }
  };

  const handleResetGlobe = () => {
    setScreenState('intro');
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-50 font-sans text-slate-900 select-none overflow-x-hidden">
      
      {/* 1. 3D Globe & Authentication Intro Screen */}
      {screenState === 'intro' && (
        <GlobeIntro onEnterPlatform={() => setScreenState('home')} />
      )}

      {/* 2. Platform Navigation Bar, Real-Time Weather Animations & Screens */}
      {screenState !== 'intro' && (
        <>
          {/* Dynamic Real-Time Weather Background Overlay (Raindrops, Floating Clouds, Sunshine Beams) */}
          <WeatherBackgroundEffects weatherData={weatherData} />

          <Navbar
            currentLang={currentLang}
            onLangChange={setCurrentLang}
            onOpenAbout={() => setIsAboutOpen(true)}
            onResetGlobe={handleResetGlobe}
            isSplitView={screenState === 'split'}
          />

          <main className="relative z-10 w-full">
            {screenState === 'home' && (
              <HomeScreen
                weatherData={weatherData}
                onQuerySubmit={handleQuerySubmit}
              />
            )}

            {screenState === 'split' && (
              <SplitViewLayout
                locationInfo={currentLocation}
                weatherData={weatherData}
                messages={messages}
                onSendMessage={handleQuerySubmit}
                currentLang={currentLang}
              />
            )}
          </main>
        </>
      )}

      {/* 3. About Developers Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

    </div>
  );
}
