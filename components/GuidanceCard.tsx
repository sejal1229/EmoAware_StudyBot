
import React from 'react';
import { AnalysisResult, EmotionType } from '../types';

interface GuidanceCardProps {
  analysis: AnalysisResult | null;
  loading: boolean;
}

const EmotionIcon: React.FC<{ type: EmotionType }> = ({ type }) => {
  switch (type) {
    case EmotionType.POSITIVE: return <span className="text-4xl">🚀</span>;
    case EmotionType.NEUTRAL: return <span className="text-4xl">🎯</span>;
    case EmotionType.CONFUSED: return <span className="text-4xl">🤔</span>;
    case EmotionType.STRESSED: return <span className="text-4xl">😫</span>;
    case EmotionType.SAD: return <span className="text-4xl">☁️</span>;
    case EmotionType.SURPRISED: return <span className="text-4xl">😲</span>;
    case EmotionType.CALM: return <span className="text-4xl">🧘</span>;
    default: return <span className="text-4xl">👤</span>;
  }
};

const GuidanceCard: React.FC<GuidanceCardProps> = ({ analysis, loading }) => {
  if (loading && !analysis) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-pulse flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 bg-slate-200 rounded-full mb-4"></div>
        <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
        <div className="h-3 w-64 bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Ready to Analyze</h2>
        <p className="text-slate-500 mt-2 max-w-xs">Start the camera to begin your intelligent study session.</p>
      </div>
    );
  }

  const getEmotionColor = (type: EmotionType) => {
    switch (type) {
      case EmotionType.POSITIVE: return 'text-emerald-600 bg-emerald-50';
      case EmotionType.CALM: return 'text-sky-600 bg-sky-50';
      case EmotionType.STRESSED: return 'text-rose-600 bg-rose-50';
      case EmotionType.CONFUSED: return 'text-amber-600 bg-amber-50';
      case EmotionType.SAD: return 'text-indigo-600 bg-indigo-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col min-h-[300px] transition-all duration-500 transform scale-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <EmotionIcon type={analysis.emotion} />
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getEmotionColor(analysis.emotion)}`}>
              {analysis.emotion}
            </span>
            <p className="text-xs text-slate-400 mt-1 italic">"{analysis.reasoning}"</p>
          </div>
        </div>
        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>}
      </div>

      <div className="flex-1 bg-indigo-50/30 rounded-xl p-6 border border-indigo-100/50">
        <h3 className="text-indigo-900 font-bold mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.657 15.657a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM16.464 14.95a1 1 0 10-1.414-1.414l.707-.707a1 1 0 001.414 1.414l-.707.707z" /></svg>
          Study Guidance
        </h3>
        <p className="text-slate-700 leading-relaxed text-lg italic">
          "{analysis.guidance}"
        </p>
      </div>

      <div className="mt-6 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest">
        <span>Confidence: {(analysis.confidence * 100).toFixed(0)}%</span>
        <span>Last Updated: {new Date(analysis.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default GuidanceCard;
