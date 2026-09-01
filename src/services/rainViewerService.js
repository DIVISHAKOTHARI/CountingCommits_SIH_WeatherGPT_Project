// RainViewer API Service for Live Weather Radar and Cloud Satellite Overlay Tiles

const RAINVIEWER_API_URL = 'https://api.rainviewer.com/public/weather-maps.json';

export async function fetchRainViewerLayers() {
  try {
    const response = await fetch(RAINVIEWER_API_URL);
    if (!response.ok) throw new Error('Failed to fetch RainViewer metadata');
    const data = await response.json();
    
    const host = data.host || 'https://tilecache.rainviewer.com';
    const pastRadar = data.radar?.past || [];
    const nowcastRadar = data.radar?.nowcast || [];
    const frames = [...pastRadar, ...nowcastRadar];

    if (frames.length === 0) {
      return getFallbackRainViewerData();
    }

    return {
      host,
      frames: frames.map(f => ({
        time: f.time,
        path: f.path,
        formattedTime: new Date(f.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tileUrl: `${host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`
      })),
      latestFrame: frames[frames.length - 1]
    };
  } catch (err) {
    console.warn("Using fallback RainViewer tile config:", err);
    return getFallbackRainViewerData();
  }
}

function getFallbackRainViewerData() {
  const host = 'https://tilecache.rainviewer.com';
  const now = Math.floor(Date.now() / 1000);
  const mockFrames = [
    { time: now - 3600, path: '/v2/radar/1725000000', formattedTime: '1 hr ago' },
    { time: now - 1800, path: '/v2/radar/1725001800', formattedTime: '30 mins ago' },
    { time: now, path: '/v2/radar/1725003600', formattedTime: 'Live (Now)' },
  ];

  return {
    host,
    frames: mockFrames.map(f => ({
      ...f,
      tileUrl: `${host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`
    })),
    latestFrame: mockFrames[2]
  };
}
