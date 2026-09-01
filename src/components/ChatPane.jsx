import React, { useState } from 'react';
import { Send, Volume2, Satellite, Bot, User, Download } from 'lucide-react';
import { downloadWeatherPDFReport } from '../utils/pdfGenerator';

export default function ChatPane({ messages, onSendMessage, currentLocation, weatherData, currentLang }) {
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleDownloadPDF = async () => {
    if (!weatherData) return;
    setIsDownloadingPDF(true);
    const latestResponse = messages.slice().reverse().find(m => m.sender === 'ai');
    const aiContent = latestResponse ? latestResponse : { content: "Official Weather Intelligence Report" };
    
    await downloadWeatherPDFReport(
      currentLocation.name || 'Gujarat',
      weatherData,
      aiContent,
      ['Divisha Kothari', 'Vanshik Lakkad', 'Krishal Shah', 'Manav Motirami', 'Aman Raj', 'Meet Kathiriya']
    );
    setIsDownloadingPDF(false);
  };

  const handleSpeakText = (text) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const cleanText = text.replace(/[*#🛰️🌾🚨🛡️☀️•]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-3xl shadow-xl border border-sky-100 flex flex-col overflow-hidden">
      
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-500 p-4 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">WeatherGPT Assistant</h3>
            <p className="text-[11px] text-sky-100">
              Region: <strong className="text-white">{currentLocation.name || 'Gujarat'}</strong>
            </p>
          </div>
        </div>

        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloadingPDF}
          title="Download PDF Weather Report"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-4 h-4 text-sky-600" />
          <span className="hidden sm:inline">{isDownloadingPDF ? 'Generating...' : 'PDF Report'}</span>
        </button>
      </div>

      {/* Satellite Telemetry Note */}
      <div className="bg-sky-50 border-b border-sky-100 px-4 py-2 flex items-center justify-between text-xs text-sky-800">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-sky-600" />
          <span>Live Feeds: <strong>INSAT-3DR</strong>, <strong>Sentinel-5P</strong> & <strong>RainViewer</strong></span>
        </div>
        <span className="font-bold text-sky-600">Active</span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-sky-600 to-cyan-500'
                  : 'bg-slate-900'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-sky-400" />}
            </div>

            <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
              msg.sender === 'user'
                ? 'bg-sky-500 text-white font-medium rounded-tr-none'
                : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-line">
                {msg.content}
              </div>

              {msg.sender === 'ai' && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{msg.timestamp || 'Just now'}</span>
                  <button
                    onClick={() => handleSpeakText(msg.content)}
                    className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask about rainfall, crops, or weather in ${currentLocation.name}...`}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="p-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
