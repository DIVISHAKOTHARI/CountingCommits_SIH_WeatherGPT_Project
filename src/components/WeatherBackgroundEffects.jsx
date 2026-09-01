import React, { useMemo } from 'react';

export default function WeatherBackgroundEffects({ weatherData }) {
  const desc = (weatherData?.weatherDesc || '').toLowerCase();
  const code = weatherData?.weatherCode || 0;

  // Determine active weather type
  const isRainy = desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower') || desc.includes('thunderstorm') || code >= 50;
  const isCloudy = desc.includes('cloud') || desc.includes('fog') || desc.includes('hazy') || (code >= 1 && code <= 48);
  const isSunny = !isRainy && (!isCloudy || desc.includes('clear') || desc.includes('sunny') || code === 0);

  // Generate random positions for raindrops
  const raindrops = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1.5}s`,
      duration: `${0.8 + Math.random() * 0.7}s`,
    }));
  }, []);

  // Generate random positions for clouds
  const clouds = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      top: `${10 + i * 14}%`,
      width: `${280 + Math.random() * 220}px`,
      height: `${120 + Math.random() * 100}px`,
      delay: `${i * -4}s`,
      duration: `${22 + Math.random() * 12}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

      {/* 1. Rain Drops Animation */}
      {isRainy && (
        <div className="absolute inset-0 w-full h-full">
          {raindrops.map((drop) => (
            <div
              key={drop.id}
              className="raindrop"
              style={{
                left: drop.left,
                animationDelay: drop.delay,
                animationDuration: drop.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* 2. Floating Clouds Animation */}
      {isCloudy && (
        <div className="absolute inset-0 w-full h-full">
          {clouds.map((c) => (
            <div
              key={c.id}
              className="cloud-shape"
              style={{
                top: c.top,
                width: c.width,
                height: c.height,
                animationDelay: c.delay,
                animationDuration: c.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* 3. Sunshine Rays Animation */}
      {isSunny && (
        <div className="absolute inset-0 w-full h-full">
          <div className="sunbeam" />
        </div>
      )}

    </div>
  );
}
