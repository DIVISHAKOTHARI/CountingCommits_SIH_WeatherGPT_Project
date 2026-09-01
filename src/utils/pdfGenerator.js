import jsPDF from 'jspdf';

export async function downloadWeatherPDFReport(locationName, weatherData, aiResponse, developerNames) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header Background
    doc.setFillColor(2, 132, 199); // Sky blue
    doc.rect(0, 0, 210, 35, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("WeatherGPT — Meteorological Report", 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Real-time Weather & Satellite Forecasting`, 14, 25);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Location Overview
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(`Region Overview: ${locationName.toUpperCase()}`, 14, 46);

    // Metrics Box
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(186, 230, 253);
    doc.roundedRect(14, 50, 182, 42, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setTextColor(7, 89, 133);
    doc.setFont('helvetica', 'bold');
    doc.text(`Temperature: ${weatherData.temperature}°C (Feels like ${weatherData.feelsLike}°C)`, 20, 60);
    doc.text(`Weather Status: ${weatherData.weatherDesc}`, 20, 68);
    doc.text(`Relative Humidity: ${weatherData.humidity}%`, 20, 76);
    doc.text(`Wind Speed: ${weatherData.windSpeed} km/h`, 20, 84);

    doc.text(`Air Quality Index (AQI): ${weatherData.aqi} (${weatherData.aqiCategory.label})`, 110, 60);
    doc.text(`Precipitation Risk: ${weatherData.rainProb}%`, 110, 68);
    doc.text(`Atmospheric Pressure: ${weatherData.pressure} hPa`, 110, 76);
    doc.text(`Cloud Cover: ${weatherData.cloudCover}%`, 110, 84);

    // AI & Satellite Insights
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text("Satellite & AI Forecast Analysis", 14, 104);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 108, 182, 45, 2, 2, 'FD');

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    
    const cleanContent = aiResponse.content.replace(/[*#🛰️🌾🚨🛡️☀️•]/g, '').trim();
    const lines = doc.splitTextToSize(cleanContent, 174);
    doc.text(lines.slice(0, 7), 18, 116);

    // 7-Day Forecast Table
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text("7-Day Forecast Summary", 14, 164);

    let startY = 170;
    doc.setFillColor(2, 132, 199);
    doc.rect(14, startY, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("Day / Date", 20, startY + 5.5);
    doc.text("Condition", 65, startY + 5.5);
    doc.text("Max Temp", 115, startY + 5.5);
    doc.text("Min Temp", 145, startY + 5.5);
    doc.text("Rain Risk", 172, startY + 5.5);

    startY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    if (weatherData.dailyForecast) {
      weatherData.dailyForecast.slice(0, 5).forEach((day, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(241, 245, 249);
          doc.rect(14, startY, 182, 7, 'F');
        }
        doc.text(day.date, 20, startY + 5);
        doc.text(day.weatherDesc, 65, startY + 5);
        doc.text(`${day.maxTemp}°C`, 115, startY + 5);
        doc.text(`${day.minTemp}°C`, 145, startY + 5);
        doc.text(`${day.precipProb}%`, 172, startY + 5);
        startY += 7;
      });
    }

    // Developer Credits Footer
    doc.setFillColor(224, 242, 254);
    doc.rect(14, 245, 182, 32, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 105, 161);
    doc.text("WeatherGPT Developer Team:", 18, 253);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(14, 116, 144);
    doc.text("Divisha Kothari | Vanshik Lakkad | Krishal Shah | Manav Motirami | Aman Raj | Meet Kathiriya", 18, 260);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Data Sources: INSAT-3D, Sentinel-5P TROPOMI, Open-Meteo & RainViewer Radar API.", 18, 268);

    doc.save(`WeatherGPT_Report_${locationName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    return true;
  } catch (err) {
    console.error("PDF generation error:", err);
    alert("Could not generate PDF report. Please try again.");
    return false;
  }
}
