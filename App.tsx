
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzeFacialExpression } from './services/geminiService';
import { AnalysisResult, SessionStats } from './types';
import GuidanceCard from './components/GuidanceCard';
import EmotionChart from './components/EmotionChart';

const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<SessionStats[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: Use ReturnType<typeof setInterval> instead of NodeJS.Timeout to avoid namespace errors in browser environment
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied. Please check your permissions.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      try {
        const result = await analyzeFacialExpression(base64Image);
        setAnalysis(result);
        setHistory(prev => [...prev, { timestamp: result.timestamp, emotion: result.emotion }].slice(-50));
      } catch (err) {
        console.error("Analysis failed", err);
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [isAnalyzing]);

  useEffect(() => {
    if (isActive) {
      // Analyze every 10 seconds to balance real-time feel with API limits
      timerRef.current = setInterval(captureAndAnalyze, 10000);
      // Run first analysis immediately
      captureAndAnalyze();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, captureAndAnalyze]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">MindFlow</h1>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter font-semibold">Intelligent Study Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isActive ? (
              <button 
                onClick={stopCamera}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center"
              >
                <span className="w-2 h-2 bg-rose-600 rounded-full mr-2 animate-pulse"></span>
                End Session
              </button>
            ) : (
              <button 
                onClick={startCamera}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Start Session
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Camera and Stats */}
        <div className="lg:col-span-7 space-y-8">
          {/* Camera View */}
          <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl aspect-video border-4 border-white">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
            />
            
            {!isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/50 backdrop-blur-sm">
                <div className="w-20 h-20 border-4 border-indigo-400 border-dashed rounded-full animate-spin-slow mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-lg font-medium opacity-80">Camera Inactive</p>
                <p className="text-sm opacity-50 mt-1 italic">Click "Start Session" to begin</p>
              </div>
            )}

            {isActive && isAnalyzing && (
              <div className="absolute top-4 right-4 bg-indigo-600/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center space-x-2 animate-bounce">
                <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
                <span>ANALYZING EMOTION...</span>
              </div>
            )}
            
            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-rose-600 text-white p-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}
          </div>

          {/* History Chart */}
          <EmotionChart data={history} />
        </div>

        {/* Right Column: AI Guidance */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-28">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Live Awareness
            </h2>
            
            <GuidanceCard analysis={analysis} loading={isAnalyzing} />

            <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center">
                <svg className="w-4 h-4 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" /></svg>
                Session Tips
              </h4>
              <ul className="space-y-4">
                {[
                  { icon: '💧', text: 'Stay hydrated to maintain cognitive performance.' },
                  { icon: '🪑', text: 'Check your posture. A straight back improves focus.' },
                  { icon: '⏲️', text: 'Try the Pomodoro technique for sustained energy.' }
                ].map((tip, idx) => (
                  <li key={idx} className="flex items-start text-sm text-slate-600">
                    <span className="mr-3 text-lg leading-none">{tip.icon}</span>
                    <span>{tip.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-400 text-xs gap-4">
          <p>© 2024 MindFlow AI • Personal Emotion-Aware Study Assistant</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
