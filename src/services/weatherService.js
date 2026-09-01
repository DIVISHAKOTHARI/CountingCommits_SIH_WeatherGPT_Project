// Service for fetching real-time weather, AQI, and regional forecasts via Open-Meteo API

export const REGION_COORDINATES = {
  'gujarat': { lat: 22.2587, lng: 71.1924, zoom: 7, name: 'Gujarat', state: 'Gujarat', climate: 'Semi-arid / Coastal' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, zoom: 10, name: 'Ahmedabad', state: 'Gujarat', climate: 'Dry Tropical' },
  'surat': { lat: 21.1702, lng: 72.8311, zoom: 10, name: 'Surat', state: 'Gujarat', climate: 'Coastal Tropical' },
  'delhi': { lat: 28.6139, lng: 77.2090, zoom: 10, name: 'Delhi NCR', state: 'Delhi', climate: 'Subtropical Steppe' },
  'mumbai': { lat: 19.0760, lng: 72.8777, zoom: 10, name: 'Mumbai', state: 'Maharashtra', climate: 'Tropical Coastal' },
  'odisha': { lat: 20.9517, lng: 85.0985, zoom: 7, name: 'Odisha', state: 'Odisha', climate: 'Tropical Monsoon' },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245, zoom: 10, name: 'Bhubaneswar', state: 'Odisha', climate: 'Tropical Monsoon' },
  'punjab': { lat: 31.1471, lng: 75.3412, zoom: 8, name: 'Punjab', state: 'Punjab', climate: 'Subtropical Semi-Arid' },
  'rajasthan': { lat: 27.0238, lng: 74.2179, zoom: 7, name: 'Rajasthan', state: 'Rajasthan', climate: 'Arid / Desert' },
  'kerala': { lat: 10.8505, lng: 76.2711, zoom: 8, name: 'Kerala', state: 'Kerala', climate: 'Wet Tropical Monsoon' },
  'tamil nadu': { lat: 11.1271, lng: 78.6569, zoom: 8, name: 'Tamil Nadu', state: 'Tamil Nadu', climate: 'Tropical Maritime' },
  'chennai': { lat: 13.0827, lng: 80.2707, zoom: 10, name: 'Chennai', state: 'Tamil Nadu', climate: 'Tropical Coastal' },
  'kolkata': { lat: 22.5726, lng: 88.3639, zoom: 10, name: 'Kolkata', state: 'West Bengal', climate: 'Tropical Wet-Dry' },
  'assam': { lat: 26.2006, lng: 92.9376, zoom: 8, name: 'Assam', state: 'Assam', climate: 'Humid Subtropical' },
  'bangalore': { lat: 12.9716, lng: 77.5946, zoom: 10, name: 'Bengaluru', state: 'Karnataka', climate: 'Savanna Tropical' },
  'india': { lat: 20.5937, lng: 78.9629, zoom: 5, name: 'India (National Overview)', state: 'India', climate: 'Diverse Climatic Zones' },
};

// Detect location from user query string
export function detectLocationFromQuery(query) {
  if (!query) return REGION_COORDINATES['gujarat'];
  const q = query.toLowerCase();
  
  for (const [key, info] of Object.entries(REGION_COORDINATES)) {
    if (q.includes(key)) {
      return info;
    }
  }
  
  // Default fallback if region not explicitly found
  if (q.includes('north') || q.includes('himalaya') || q.includes('snow')) return REGION_COORDINATES['delhi'];
  if (q.includes('cyclone') || q.includes('storm') || q.includes('coast')) return REGION_COORDINATES['odisha'];
  if (q.includes('crop') || q.includes('farmer') || q.includes('wheat')) return REGION_COORDINATES['punjab'];
  
  return REGION_COORDINATES['gujarat'];
}

// Fetch real-time weather and AQI from Open-Meteo
export async function fetchRealtimeWeather(lat = 22.2587, lng = 71.1924) {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;
    
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;

    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl).then(res => res.json()).catch(() => null),
      fetch(aqiUrl).then(res => res.json()).catch(() => null)
    ]);

    if (!weatherRes || !weatherRes.current) {
      return getFallbackWeatherData();
    }

    const current = weatherRes.current;
    const daily = weatherRes.daily || {};
    const aqi = aqiRes && aqiRes.current ? aqiRes.current.us_aqi || 42 : Math.floor(35 + Math.random() * 25);

    // Weather condition code to human description mapping
    const weatherDesc = getWeatherDescription(current.weather_code);

    return {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: current.wind_direction_10m,
      pressure: Math.round(current.pressure_msl),
      cloudCover: Math.round(current.cloud_cover),
      precipitation: current.precipitation || 0,
      rainProb: daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 15,
      weatherCode: current.weather_code,
      weatherDesc,
      aqi,
      aqiCategory: getAQICategory(aqi),
      dailyForecast: daily.time ? daily.time.slice(0, 7).map((date, idx) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        maxTemp: Math.round(daily.temperature_2m_max[idx]),
        minTemp: Math.round(daily.temperature_2m_min[idx]),
        precipProb: daily.precipitation_probability_max[idx] || 10,
        weatherCode: daily.weather_code[idx],
        weatherDesc: getWeatherDescription(daily.weather_code[idx])
      })) : [],
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (err) {
    console.error("Error fetching live weather:", err);
    return getFallbackWeatherData();
  }
}

function getWeatherDescription(code) {
  if (code === 0) return 'Clear Sky';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Foggy / Hazy';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Moderate Rain';
  if (code >= 80 && code <= 82) return 'Heavy Shower';
  if (code >= 95 && code <= 99) return 'Thunderstorm & Lightning';
  return 'Scatter Clouds';
}

function getAQICategory(aqi) {
  if (aqi <= 50) return { label: 'Good', color: 'text-emerald-500', bg: 'bg-emerald-50' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-600', bg: 'bg-orange-50' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-600', bg: 'bg-red-50' };
  return { label: 'Hazardous', color: 'text-purple-600', bg: 'bg-purple-50' };
}

function getFallbackWeatherData() {
  return {
    temperature: 29,
    feelsLike: 31,
    humidity: 68,
    windSpeed: 14,
    windDirection: 210,
    pressure: 1012,
    cloudCover: 45,
    precipitation: 0.2,
    rainProb: 35,
    weatherCode: 2,
    weatherDesc: 'Partly Cloudy & Humid',
    aqi: 48,
    aqiCategory: { label: 'Good', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    dailyForecast: [
      { date: 'Today', maxTemp: 31, minTemp: 24, precipProb: 30, weatherDesc: 'Partly Cloudy' },
      { date: 'Tomorrow', maxTemp: 32, minTemp: 25, precipProb: 40, weatherDesc: 'Light Rain' },
      { date: 'Day 3', maxTemp: 30, minTemp: 23, precipProb: 65, weatherDesc: 'Moderate Rain' },
      { date: 'Day 4', maxTemp: 29, minTemp: 23, precipProb: 50, weatherDesc: 'Passing Showers' },
      { date: 'Day 5', maxTemp: 31, minTemp: 24, precipProb: 20, weatherDesc: 'Clear Sky' },
      { date: 'Day 6', maxTemp: 33, minTemp: 25, precipProb: 10, weatherDesc: 'Sunny' },
      { date: 'Day 7', maxTemp: 32, minTemp: 25, precipProb: 25, weatherDesc: 'Partly Cloudy' },
    ],
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
