
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 animate-fadeIn">
      <div className="relative flex items-center justify-center w-48 h-48">
        <div className="absolute w-full h-full border-2 rounded-full border-cyan-400 opacity-50 animate-pulse-slow"></div>
        <div className="absolute w-3/4 h-3/4 border-2 rounded-full border-cyan-500 opacity-75 animate-pulse-medium"></div>
        <div className="absolute w-1/2 h-1/2 border-2 rounded-full border-cyan-600 animate-pulse-fast"></div>
      </div>
      <h1 className="text-5xl font-bold mt-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-text-reveal">
        UNI-IA
      </h1>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.7; }
        }
        @keyframes pulse-medium {
          0%, 100% { transform: scale(1); opacity: 0.75; }
          50% { transform: scale(0.9); opacity: 0.5; }
        }
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes text-reveal {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 1s ease-in-out; }
        .animate-pulse-slow { animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-pulse-medium { animation: pulse-medium 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-pulse-fast { animation: pulse-fast 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-text-reveal { animation: text-reveal 2s ease-out 1s both; }
      `}</style>
    </div>
  );
};

export default SplashScreen;
