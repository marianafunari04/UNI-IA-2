import React from 'react';
import { Screen } from '../types';
import { ChevronLeftIcon } from './icons/Icons';

interface CuriositiesScreenProps {
  onNavigate: (screen: Screen) => void;
}

const curiosities = [
  {
    title: "Libras não é universal",
    content: "Ao contrário do que muitos pensam, cada país possui sua própria língua de sinais, com estruturas e vocabulários distintos. A Língua Americana de Sinais (ASL), por exemplo, é completamente diferente da Libras."
  },
  {
    title: "É uma língua oficial no Brasil",
    content: "Libras foi oficialmente reconhecida como meio legal de comunicação e expressão da comunidade surda no Brasil pela Lei Nº 10.436, de 24 de abril de 2002."
  },
  {
    title: "Possui gramática própria e complexa",
    content: "Libras não é apenas um conjunto de gestos. Ela tem sua própria estrutura gramatical, com regras para formação de frases, conjugação de verbos e sintaxe, que independem da língua portuguesa."
  },
  {
    title: "Variações regionais (sotaques)",
    content: "Assim como o português, a Libras também possui 'sotaques' e variações regionais. Um mesmo conceito pode ser sinalizado de maneiras diferentes dependendo da região do Brasil."
  },
  {
    title: "Expressões faciais são parte da gramática",
    content: "As expressões faciais e corporais são fundamentais em Libras. Elas não servem apenas para expressar emoções, mas também para indicar o tipo de frase (afirmativa, interrogativa, exclamativa) e a intensidade da ação."
  },
  {
    title: "Alfabeto manual é um recurso, não a língua",
    content: "O alfabeto manual (datilologia) é usado para soletrar nomes de pessoas, lugares ou palavras que ainda não possuem um sinal específico. A comunicação fluida em Libras é feita através dos sinais, não da soletração."
  }
];

const CuriositiesScreen: React.FC<CuriositiesScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <header className="p-4 bg-slate-800 shadow-md flex items-center">
        <button 
          onClick={() => onNavigate(Screen.MAIN)} 
          className="text-slate-300 hover:text-cyan-400 p-2 rounded-full hover:bg-slate-700 transition-colors mr-2"
          aria-label="Voltar para a tela principal"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-xl font-bold text-white">Curiosidades sobre Libras</h1>
      </header>

      <main className="flex-grow p-4 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {curiosities.map((item, index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-5 border border-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-lg font-bold text-cyan-400 mb-2">{item.title}</h3>
              <p className="text-slate-300 text-sm">{item.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CuriositiesScreen;
