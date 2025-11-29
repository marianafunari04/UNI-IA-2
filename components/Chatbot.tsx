
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { XIcon, SendIcon, SparklesIcon } from './icons/Icons';

interface ChatbotProps {
  onClose: () => void;
}

type Message = {
  role: 'user' | 'model';
  text: string;
};

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Initial message from the bot
    setMessages([
        {
            role: 'model',
            text: 'Olá! Sou o assistente da UNI-IA. Como posso ajudar você com suas dúvidas sobre Libras hoje?'
        }
    ]);
  }, []);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || userInput;
    if (!textToSend.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: textToSend,
            config: {
                systemInstruction: `Você é o assistente virtual oficial do aplicativo UNI-IA.
O UNI-IA é uma plataforma inovadora de acessibilidade e tradução para Libras (Língua Brasileira de Sinais).

**Sobre o Aplicativo UNI-IA:**
- **Função Principal:** Traduzir texto e voz (Português) para Libras usando um avatar 3D (plugin VLibras).
- **Funcionalidades:**
  - **Tradução:** Digite ou fale (ícone microfone) para ver o avatar sinalizar.
  - **Histórico:** Salva suas traduções recentes (ícone relógio).
  - **Acessibilidade:** Botão dedicado com opções de: Tamanho da fonte, Alto Contraste, Temas de cores (Amarelo/Preto, etc.), Modo Monocromático e Cursor Grande.
  - **Dashboard:** Métricas de uso e análise de sentimentos (ícone gráfico).
  - **Perfil:** Gerenciamento de conta, foto e gênero.
  - **Curiosidades:** Tela educativa sobre a cultura surda.

**Suas Diretrizes:**
1. **Precisão:** Forneça informações reais, atuais e gramaticalmente corretas sobre Libras e a comunidade surda.
2. **Contexto do App:** Responda dúvidas sobre o funcionamento do app com base nas funcionalidades listadas acima.
3. **Tom:** Seja sempre educado, inclusivo, claro e objetivo.
4. **Limitação:** Você é um assistente de texto. Para ver os sinais, instrua o usuário a usar a função de tradução na tela principal.
5. **Identidade:** Você é uma IA prestativa focada em inclusão.

Responda sempre em Português do Brasil.`,
            }
        });
      
      const botResponse: Message = { role: 'model', text: response.text };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: Message = { role: 'model', text: 'Desculpe, não consegui processar sua pergunta. Tente novamente.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const quickQuestions = [
    "O que é Libras?",
    "Libras é universal?",
    "Como digo 'obrigado' em Libras?"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end sm:items-center z-50">
      <div className="bg-slate-800 w-full max-w-lg h-[90vh] sm:h-[70vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl animate-slide-up">
        <header className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Assistente UNI-IA</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
            <XIcon />
          </button>
        </header>

        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="max-w-xs md:max-w-md px-4 py-2 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                 <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>
        
        <div className="p-4 border-t border-slate-700">
            <div className="flex flex-wrap gap-2 mb-2">
                {messages.length <= 1 && quickQuestions.map(q => (
                    <button key={q} onClick={() => handleSendMessage(q)} className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded-full transition-colors">
                        {q}
                    </button>
                ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Pergunte sobre Libras..."
                    className="flex-1 px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button type="submit" disabled={isLoading} className="p-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:bg-slate-600 transition-colors">
                    <SendIcon />
                </button>
            </form>
        </div>
      </div>
      <style>{`
        @keyframes slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 640px) {
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        }
        @media (min-width: 641px) {
            .animate-slide-up { 
                animation-name: slide-up;
                animation-duration: 0.3s;
                animation-timing-function: ease-out;
                animation-fill-mode: forwards;
             }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
