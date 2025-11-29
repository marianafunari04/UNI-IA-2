import React, { useState } from 'react';
import { Screen } from '../types';
import { HandRaisedIcon, LightbulbIcon } from './icons/Icons';

interface OnboardingScreenProps {
  onNavigate: (screen: Screen) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);

  const stepsContent = [
    {
      icon: <HandRaisedIcon />,
      title: "O que é a UNI-IA?",
      description: "Seu app tem como objetivo principal traduzir sinais da Libras (Língua Brasileira de Sinais) para texto ou voz, utilizando captura e análise de vídeos por meio do reconhecimento de gestos e inteligência artificial. A ferramenta visa promover inclusão social e acessibilidade, facilitando a comunicação entre pessoas surdas ou com deficiência auditiva e quem não conhece a Libras. Além disso, o app terá a capacidade de gerar vídeos com sinais em Libras a partir do texto, ajudando o entendimento de todos."
    },
    {
      icon: <LightbulbIcon className="w-12 h-12" />,
      title: "Curiosidade sobre Libras",
      description: "A Língua Brasileira de Sinais é uma língua natural, completa e independente, que possui estrutura própria diferente do português, sendo a principal forma de comunicação para a comunidade surda brasileira. Libras valoriza elementos visuais e gestuais, como expressões faciais e movimentos corporais, que são essenciais para a construção do significado, tornando a língua rica e expressiva, mesmo sem o uso de sons."
    }
  ];

  const currentStepContent = stepsContent[step - 1];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-900">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-8 bg-slate-800 rounded-full text-cyan-400">
          {currentStepContent.icon}
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">{currentStepContent.title}</h2>
        <p className="text-slate-300 mb-12">{currentStepContent.description}</p>
        
        <div className="flex justify-center space-x-3 mb-12">
          {stepsContent.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${step === index + 1 ? 'bg-cyan-400 scale-125' : 'bg-slate-600'}`}
            ></div>
          ))}
        </div>

        <div className="flex items-center justify-between">
            {step > 1 ? (
                 <button 
                    onClick={() => setStep(s => s - 1)}
                    className="px-6 py-3 font-semibold text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                 >
                     Voltar
                 </button>
            ) : <div className="w-[98px]"></div>}
           <div className="flex-grow"></div>
          {step < 2 && (
            <button 
                onClick={() => setStep(s => s + 1)}
                className="w-full max-w-xs mx-auto px-6 py-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition"
            >
                Próximo
            </button>
          )}
          {step === 2 && (
            <button 
                onClick={() => onNavigate(Screen.MAIN)}
                className="w-full max-w-xs mx-auto px-6 py-3 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition"
            >
                Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;