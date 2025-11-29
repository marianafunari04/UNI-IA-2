
import React, { useState, useEffect, useRef } from 'react';
import Chatbot from './Chatbot';
import { 
    ChatbotIcon, LightbulbIcon, ChevronDownIcon, TranslateIcon, 
    HistoryIcon, TrashIcon, XIcon, AccessibilityIcon,
    ZoomInIcon, ZoomOutIcon, SunIcon, RefreshIcon, CursorClickIcon,
    MicrophoneIcon, CogIcon, LogoutIcon, PencilIcon, UserCircleIcon, CameraIcon, ChartBarIcon,
    FaceSmileIcon, FaceMehIcon, FaceFrownIcon
} from './icons/Icons';
import { Screen, UserProfile } from '../types';

// Speech Recognition Interfaces
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionEvent {
    results: {
        [index: number]: {
            [index: number]: {
                transcript: string;
            };
        };
        length: number;
    };
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
        vlibrasWidget: any;
    }
}

interface TextToLibrasProps {
    selectedInputLanguage: string;
    onInputLanguageChange: (lang: string) => void;
    inputLanguageOptions: string[];
    selectedOutputSignLanguage: string;
    onOutputSignLanguageChange: (lang: string) => void;
    outputSignLanguageOptions: string[];
    isHistoryOpen: boolean;
    closeHistory: () => void;
}

const TextToLibras: React.FC<TextToLibrasProps> = ({
    selectedInputLanguage,
    onInputLanguageChange,
    inputLanguageOptions,
    selectedOutputSignLanguage,
    onOutputSignLanguageChange,
    outputSignLanguageOptions,
    isHistoryOpen,
    closeHistory
}) => {
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState(''); 
    const [history, setHistory] = useState<{original: string, translated: string}[]>([]);
    
    // Microphone State
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Auto-translate State
    const [lastProcessedFullText, setLastProcessedFullText] = useState('');

    // Trigger VLibras via DOM simulation (most robust method)
    const triggerVLibras = (text: string) => {
        const hiddenDiv = document.createElement('div');
        hiddenDiv.style.position = 'fixed';
        hiddenDiv.style.left = '-9999px';
        hiddenDiv.style.top = '0';
        hiddenDiv.style.width = '1px';
        hiddenDiv.style.height = '1px';
        hiddenDiv.style.opacity = '0';
        hiddenDiv.style.pointerEvents = 'none';
        hiddenDiv.style.zIndex = '9999';
        hiddenDiv.innerText = text;
        document.body.appendChild(hiddenDiv);

        const range = document.createRange();
        range.selectNode(hiddenDiv);
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Simulate mouse events to trigger the widget
            const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
            const mouseUp = new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
            
            hiddenDiv.dispatchEvent(mouseDown);
            hiddenDiv.dispatchEvent(mouseUp);
            
            // Clean up
            setTimeout(() => {
                if (document.body.contains(hiddenDiv)) {
                    document.body.removeChild(hiddenDiv);
                }
                selection.removeAllRanges();
            }, 500);
        }
    };

    const tocarNoAvatar = async (frases: string[]) => {
        for (const frase of frases) {
            triggerVLibras(frase);
            
            // Calculate delay based on word count (approx 300ms per word + base delay)
            // This prevents the avatar from skipping sentences if they are sent too fast
            const wordCount = frase.split(' ').length;
            const delay = Math.max(2000, wordCount * 300); 
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    };

    const handleTranslate = () => {
        if (!inputText.trim()) return;
        
        const chunks = dividirEmFrasesCurtas(inputText);
        tocarNoAvatar(chunks);
        setLastProcessedFullText(inputText);
        
        setTranslatedText(inputText);
        setHistory(prev => {
             const newItem = {original: inputText, translated: inputText};
             if (prev.length > 0 && prev[0].original === inputText) return prev;
             return [newItem, ...prev.slice(0, 9)];
        });
    };

    // Auto-translation effect (Debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (inputText.trim() && inputText !== lastProcessedFullText) {
                handleTranslate();
            }
        }, 2000); // Wait 2 seconds after typing/speaking stops

        return () => clearTimeout(timeoutId);
    }, [inputText, lastProcessedFullText]);


    // Microphone Logic
    const handleMicrophoneToggle = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Seu navegador não suporta reconhecimento de voz.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR'; 
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setInputText(prev => {
                const newText = prev ? `${prev} ${transcript}` : transcript;
                return newText;
            });
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    const handleDeleteHistory = (index: number) => {
        setHistory(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col h-full gap-4 relative">
             {/* History Panel Overlay */}
             {isHistoryOpen && (
                <div className="absolute inset-0 z-20 bg-slate-800 bg-opacity-95 p-4 rounded-xl overflow-y-auto border border-slate-700 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <HistoryIcon className="text-cyan-400" />
                            Histórico
                        </h3>
                        <button onClick={closeHistory} className="text-slate-400 hover:text-white">
                            <XIcon />
                        </button>
                    </div>
                    {history.length === 0 ? (
                        <p className="text-slate-500 text-center mt-10">Nenhuma tradução recente.</p>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item, index) => (
                                <div key={index} className="bg-slate-700 p-3 rounded-lg relative group">
                                    <p className="text-white text-sm font-medium line-clamp-2">{item.original}</p>
                                    <p className="text-cyan-400 text-xs mt-1">{new Date().toLocaleDateString()}</p>
                                    <button 
                                        onClick={() => handleDeleteHistory(index)}
                                        className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Input Section */}
            <div className="flex-1 bg-slate-800 rounded-xl p-4 flex flex-col gap-2 border border-slate-700 shadow-sm relative">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <div className="flex items-center gap-2">
                         <TranslateIcon className="w-5 h-5 text-slate-400" />
                         <select 
                            value={selectedInputLanguage}
                            onChange={(e) => onInputLanguageChange(e.target.value)}
                            className="bg-transparent text-slate-200 text-sm font-semibold focus:outline-none cursor-pointer"
                         >
                            {inputLanguageOptions.map(lang => <option key={lang} value={lang} className="bg-slate-800">{lang}</option>)}
                         </select>
                    </div>
                    <button 
                        onClick={handleMicrophoneToggle}
                        className={`text-slate-400 hover:text-cyan-400 p-1 rounded-full transition-all ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : ''}`} 
                        title="Usar microfone"
                    >
                         <MicrophoneIcon className="w-5 h-5" />
                    </button>
                </div>
                <textarea
                    id="texto-para-libras"
                    className="w-full h-full bg-transparent text-white resize-none focus:outline-none text-lg p-2 placeholder-slate-500"
                    placeholder="Digite seu texto aqui..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    aria-label="Caixa de texto para tradução"
                    aria-busy={isListening}
                />
            </div>

            {/* Output Section (Video Placeholder) */}
            <div className="flex-1 bg-slate-800 rounded-xl p-0 flex flex-col border border-slate-700 shadow-sm overflow-hidden relative">
                 <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                         <select 
                            value={selectedOutputSignLanguage}
                            onChange={(e) => onOutputSignLanguageChange(e.target.value)}
                            className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer drop-shadow-md"
                         >
                            {outputSignLanguageOptions.map(lang => <option key={lang} value={lang} className="bg-slate-800">{lang}</option>)}
                         </select>
                    </div>
                 </div>
                 
                 <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                    {/* Placeholder for Avatar/Video */}
                    {translatedText ? (
                        <div className="text-center p-8">
                             <p className="text-cyan-400 font-mono text-sm animate-pulse">Enviando para o avatar VLibras...</p>
                             <p className="text-white mt-4 text-lg font-bold">"{translatedText}"</p>
                        </div>
                    ) : (
                        <div className="text-center w-full h-full flex items-center justify-center p-4">
                            <button 
                                onClick={handleTranslate}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-3 transition-transform transform active:scale-95 break-words max-w-[80%] text-center text-base"
                                aria-label="Botão para traduzir texto"
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <TranslateIcon className="w-6 h-6 flex-shrink-0" />
                                <span className="line-clamp-2">
                                    {inputText ? `"${inputText}"` : 'Traduzir'}
                                </span>
                            </button>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

interface MainScreenProps {
  onNavigate: (screen: Screen) => void;
  userProfile: UserProfile;
  onUpdateProfile: (data: Partial<UserProfile>) => void;
}

// Theme definitions for accessibility
const themeDefinitions: Record<string, { bg: string; text: string; name: string }> = {
    'yellow-black': { bg: '#000000', text: '#FFFF00', name: 'Amarelo sobre Preto' },
    'white-black': { bg: '#000000', text: '#FFFFFF', name: 'Branco sobre Preto' },
    'green-black': { bg: '#000000', text: '#00FF00', name: 'Verde sobre Preto' },
    'black-white': { bg: '#FFFFFF', text: '#000000', name: 'Preto sobre Branco' },
    'black-yellow': { bg: '#FFFF00', text: '#000000', name: 'Preto sobre Amarelo' },
};

const MainScreen: React.FC<MainScreenProps> = ({ onNavigate, userProfile, onUpdateProfile }) => {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);

    // Language state for TextToLibras
    const [inputLanguage, setInputLanguage] = useState<string>('Português');
    const [outputSignLanguage, setOutputSignLanguage] = useState<string>('Libras (Brasil)');

    const textLanguages = ["Português", "Inglês", "Espanhol"];
    const signLanguages = ["Libras (Brasil)", "ASL (Americana)", "LSE (Espanhola)"];

    // Accessibility State
    const [accessibilitySettings, setAccessibilitySettings] = useState({
        fontSize: 100, // percentage
        theme: 'default', // 'default' | 'yellow-black' | 'white-black' | etc.
        grayscale: false,
        largeCursor: false
    });

    const resetAccessibility = () => {
        setAccessibilitySettings({
            fontSize: 100,
            theme: 'default',
            grayscale: false,
            largeCursor: false
        });
    };

    // Apply Accessibility Settings Globally
    useEffect(() => {
        const html = document.documentElement;
        
        // Font Size
        html.style.fontSize = `${accessibilitySettings.fontSize}%`;

        // Grayscale
        html.style.filter = accessibilitySettings.grayscale ? 'grayscale(100%)' : 'none';

        // Theme Classes (for dynamic styling)
        if (accessibilitySettings.theme !== 'default') {
            html.classList.add('accessibility-theme-mode');
        } else {
            html.classList.remove('accessibility-theme-mode');
        }

        // Large Cursor
        if (accessibilitySettings.largeCursor) {
            html.classList.add('large-cursor-mode');
        } else {
            html.classList.remove('large-cursor-mode');
        }

    }, [accessibilitySettings]);

    // Generate dynamic CSS for the selected theme
    const getThemeCSS = () => {
        if (accessibilitySettings.theme === 'default') return '';
        const theme = themeDefinitions[accessibilitySettings.theme];
        if (!theme) return '';

        return `
            .accessibility-theme-mode {
                background-color: ${theme.bg} !important;
            }
            .accessibility-theme-mode * {
                background-color: ${theme.bg} !important;
                color: ${theme.text} !important;
                border-color: ${theme.text} !important;
                fill: ${theme.text} !important;
                stroke: ${theme.text} !important;
                box-shadow: none !important;
            }
            .accessibility-theme-mode button, 
            .accessibility-theme-mode input, 
            .accessibility-theme-mode textarea,
            .accessibility-theme-mode select {
                border: 1px solid ${theme.text} !important;
            }
            .accessibility-theme-mode ::placeholder {
                color: ${theme.text} !important;
                opacity: 0.7;
            }
            /* Preserve transparency for specific overlay elements if needed, or force solid */
        `;
    };

    const handleLogout = () => {
        // Here you would clear auth tokens if they existed
        onNavigate(Screen.LOGIN);
    };

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateProfile({ photo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-900 relative">
            {/* Styles for Accessibility Modes */}
            <style>{`
                ${getThemeCSS()}
                .large-cursor-mode, .large-cursor-mode * {
                    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='black' stroke='white' stroke-width='2'%3E%3Cpath d='M5.5 3.21l10.8 15.6-5.4.8-2.6 4.3-3.2-2.1 2.8-4.5-5.2-.8z'/%3E%3C/svg%3E"), auto !important;
                }
            `}</style>

            <header className="p-4 bg-slate-800 shadow-md flex items-center justify-between z-10 relative">
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
                        className="text-slate-300 hover:text-cyan-400 p-2 rounded-full hover:bg-slate-700 transition-colors"
                        aria-label="Ver histórico de traduções"
                    >
                        <HistoryIcon />
                    </button>
                    <div className="relative">
                        <button 
                            onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
                            className={`text-slate-300 hover:text-cyan-400 p-2 rounded-full hover:bg-slate-700 transition-colors ${isAccessibilityOpen ? 'bg-slate-700 text-cyan-400' : ''}`}
                            aria-label="Opções de acessibilidade"
                        >
                            <AccessibilityIcon />
                        </button>
                        
                        {/* Accessibility Menu Dropdown */}
                        {isAccessibilityOpen && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4 z-50 animate-fadeIn">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
                                    <h3 className="font-bold text-white">Acessibilidade</h3>
                                    <button onClick={resetAccessibility} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                                        <RefreshIcon className="w-3 h-3" /> Resetar
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {/* Font Size */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-300">Tamanho da Fonte</span>
                                        <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1">
                                            <button 
                                                onClick={() => setAccessibilitySettings(s => ({...s, fontSize: Math.max(70, s.fontSize - 10)}))}
                                                className="p-1 hover:text-cyan-400"
                                            >
                                                <ZoomOutIcon className="w-4 h-4" />
                                            </button>
                                            <span className="text-xs w-8 text-center">{accessibilitySettings.fontSize}%</span>
                                            <button 
                                                onClick={() => setAccessibilitySettings(s => ({...s, fontSize: Math.min(150, s.fontSize + 10)}))}
                                                className="p-1 hover:text-cyan-400"
                                            >
                                                <ZoomInIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* High Contrast Toggle */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <SunIcon className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-300">Alto Contraste</span>
                                        </div>
                                        <button 
                                            onClick={() => setAccessibilitySettings(s => ({...s, theme: s.theme === 'default' ? 'yellow-black' : 'default'}))}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${accessibilitySettings.theme !== 'default' ? 'bg-yellow-400' : 'bg-slate-600'}`}
                                        >
                                            <div className={`absolute w-3 h-3 bg-white rounded-full top-1 transition-all ${accessibilitySettings.theme !== 'default' ? 'left-6 bg-black' : 'left-1'}`}></div>
                                        </button>
                                    </div>

                                    {/* Color Theme Selector */}
                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs text-slate-400">Cores do Tema</span>
                                        <div className="flex flex-wrap gap-2">
                                            {/* Default */}
                                            <button 
                                                onClick={() => setAccessibilitySettings(s => ({...s, theme: 'default'}))}
                                                className={`w-6 h-6 rounded-full border-2 ${accessibilitySettings.theme === 'default' ? 'border-cyan-400 scale-110' : 'border-slate-500'}`}
                                                style={{ background: 'linear-gradient(135deg, #0f172a 50%, #06b6d4 50%)' }}
                                                title="Padrão"
                                            />
                                            {/* Yellow on Black */}
                                            <button 
                                                onClick={() => setAccessibilitySettings(s => ({...s, theme: 'yellow-black'}))}
                                                className={`w-6 h-6 rounded-full border-2 ${accessibilitySettings.theme === 'yellow-black' ? 'border-white scale-110' : 'border-slate-600'}`}
                                                style={{ backgroundColor: '#000000', border: '2px solid #FFFF00' }}
                                                title="Amarelo sobre Preto"
                                            >
                                                <div className="w-full h-full rounded-full bg-yellow-400 scale-50"></div>
                                            </button>
                                            {/* White on Black */}
                                            <button 
                                                onClick={() => setAccessibilitySettings(s => ({...s, theme: 'white-black'}))}
                                                className={`w-6 h-6 rounded-full border-2 ${accessibilitySettings.theme === 'white-black' ? 'border-cyan-400 scale-110' : 'border-slate-600'}`}
                                                style={{ backgroundColor: '#000000', border: '2px solid #FFFFFF' }}
                                                title="Branco sobre Preto"
                                            >
                                                 <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                            </button>
                                            {/* Green on Black */}
                                            <button 
                                                onClick={() => setAccessibilitySettings(s => ({...s, theme: 'green-black'}))}
                                                className={`w-6 h-6 rounded-full border-2 ${accessibilitySettings.theme === 'green-black' ? 'border-white scale-110' : 'border-slate-600'}`}
                                                style={{ backgroundColor: '#000000', border: '2px solid #00FF00' }}
                                                title="Verde sobre Preto"
                                            >
                                                 <div className="w-full h-full rounded-full bg-green-500 scale-50"></div>
                                            </button>
                                             {/* Black on White */}
                                             <button 
                                                onClick={() => setAccessibilitySettings(s => ({...s, theme: 'black-white'}))}
                                                className={`w-6 h-6 rounded-full border-2 ${accessibilitySettings.theme === 'black-white' ? 'border-cyan-400 scale-110' : 'border-slate-600'}`}
                                                style={{ backgroundColor: '#FFFFFF', border: '2px solid #000000' }}
                                                title="Preto sobre Branco"
                                            >
                                                 <div className="w-full h-full rounded-full bg-black scale-50"></div>
                                            </button>
                                             {/* Black on Yellow */}
                                             <button 
                                                onClick={() => setAccessibilitySettings(s => ({...s, theme: 'black-yellow'}))}
                                                className={`w-6 h-6 rounded-full border-2 ${accessibilitySettings.theme === 'black-yellow' ? 'border-white scale-110' : 'border-slate-600'}`}
                                                style={{ backgroundColor: '#FFFF00', border: '2px solid #000000' }}
                                                title="Preto sobre Amarelo"
                                            >
                                                 <div className="w-full h-full rounded-full bg-black scale-50"></div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Grayscale */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-gray-500 to-white border border-slate-500"></div>
                                            <span className="text-sm text-slate-300">Monocromático</span>
                                        </div>
                                        <button 
                                            onClick={() => setAccessibilitySettings(s => ({...s, grayscale: !s.grayscale}))}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${accessibilitySettings.grayscale ? 'bg-cyan-600' : 'bg-slate-600'}`}
                                        >
                                            <div className={`absolute w-3 h-3 bg-white rounded-full top-1 transition-all ${accessibilitySettings.grayscale ? 'left-6' : 'left-1'}`}></div>
                                        </button>
                                    </div>

                                    {/* Large Cursor */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CursorClickIcon className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-300">Cursor Grande</span>
                                        </div>
                                        <button 
                                            onClick={() => setAccessibilitySettings(s => ({...s, largeCursor: !s.largeCursor}))}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${accessibilitySettings.largeCursor ? 'bg-cyan-600' : 'bg-slate-600'}`}
                                        >
                                            <div className={`absolute w-3 h-3 bg-white rounded-full top-1 transition-all ${accessibilitySettings.largeCursor ? 'left-6' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Dashboard Button */}
                     <button 
                        onClick={() => setIsDashboardOpen(true)}
                        className="text-slate-300 hover:text-cyan-400 p-2 rounded-full hover:bg-slate-700 transition-colors ml-2"
                        aria-label="Ver métricas do aplicativo"
                    >
                        <ChartBarIcon />
                    </button>
                 </div> 
                 <div className="flex-grow text-center">
                    <h1 className="text-xl font-bold text-white inline-block">Texto para Libras</h1>
                 </div>
                 <button 
                    onClick={() => onNavigate(Screen.CURIOSITIES)} 
                    className="text-slate-300 hover:text-cyan-400 p-2 rounded-full hover:bg-slate-700 transition-colors"
                    aria-label="Ver curiosidades sobre Libras"
                 >
                    <LightbulbIcon />
                </button>
            </header>

            <div className="flex-grow flex flex-col p-4 overflow-hidden relative">
                <TextToLibras 
                    selectedInputLanguage={inputLanguage}
                    onInputLanguageChange={setInputLanguage}
                    inputLanguageOptions={textLanguages}
                    selectedOutputSignLanguage={outputSignLanguage}
                    onOutputSignLanguageChange={setOutputSignLanguage}
                    outputSignLanguageOptions={signLanguages}
                    isHistoryOpen={isHistoryOpen}
                    closeHistory={() => setIsHistoryOpen(false)}
                />
            </div>

            {/* Config/Settings Button (Left) */}
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="fixed bottom-6 left-6 bg-slate-700 text-white p-4 rounded-full shadow-lg hover:bg-slate-600 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 z-40"
                aria-label="Abrir configurações de usuário"
            >
                <CogIcon />
            </button>

            {/* Chatbot Button (Right) */}
            <button
                onClick={() => setIsChatbotOpen(true)}
                className="fixed bottom-6 right-6 bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 z-40"
                aria-label="Abrir assistente de IA"
            >
                <ChatbotIcon />
            </button>

            {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} />}

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn m-4">
                        <div className="p-4 bg-slate-700 flex justify-between items-center border-b border-slate-600">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <CogIcon className="w-6 h-6 text-cyan-400" />
                                Configurações
                            </h2>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white">
                                <XIcon />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Profile Header */}
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden border-2 border-cyan-500 relative">
                                        {userProfile.photo ? (
                                            <img src={userProfile.photo} alt="Perfil" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircleIcon className="w-20 h-20 text-slate-400" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-1.5 bg-cyan-600 rounded-full text-white hover:bg-cyan-700 shadow-sm border border-slate-800 cursor-pointer">
                                        <CameraIcon className="w-4 h-4" />
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handlePhotoChange} 
                                        />
                                    </label>
                                </div>
                                <h3 className="mt-3 text-xl font-semibold text-white">{userProfile.name}</h3>
                                <p className="text-sm text-slate-400">Gerencie seus dados pessoais</p>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="text-xs text-slate-400 uppercase font-semibold">E-mail</label>
                                    <div className="flex items-center border-b border-slate-600 py-2">
                                        <input 
                                            type="email" 
                                            value={userProfile.email}
                                            onChange={(e) => onUpdateProfile({ email: e.target.value })}
                                            placeholder="seu.email@exemplo.com"
                                            className="appearance-none bg-transparent border-none w-full text-white mr-3 py-1 px-2 leading-tight focus:outline-none"
                                        />
                                        <PencilIcon className="text-slate-500 w-4 h-4 cursor-pointer hover:text-cyan-400" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Senha</label>
                                    <div className="flex items-center border-b border-slate-600 py-2">
                                        <input 
                                            type="password" 
                                            value={userProfile.password}
                                            onChange={(e) => onUpdateProfile({ password: e.target.value })}
                                            placeholder="••••••••"
                                            className="appearance-none bg-transparent border-none w-full text-white mr-3 py-1 px-2 leading-tight focus:outline-none"
                                        />
                                        <PencilIcon className="text-slate-500 w-4 h-4 cursor-pointer hover:text-cyan-400" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Gênero</label>
                                    <div className="flex items-center border-b border-slate-600 py-2">
                                        <select 
                                            value={userProfile.gender}
                                            onChange={(e) => onUpdateProfile({ gender: e.target.value })}
                                            className="appearance-none bg-transparent border-none w-full text-white mr-3 py-1 px-2 leading-tight focus:outline-none bg-slate-800"
                                        >
                                            <option value="" className="bg-slate-800 text-white">Selecione...</option>
                                            <option value="MASCULINO" className="bg-slate-800 text-white">MASCULINO</option>
                                            <option value="FEMININO" className="bg-slate-800 text-white">FEMININO</option>
                                            <option value="OUTRO" className="bg-slate-800 text-white">OUTRO</option>
                                            <option value="PREFIRO NÃO DIZER" className="bg-slate-800 text-white">PREFIRO NÃO DIZER</option>
                                        </select>
                                        <ChevronDownIcon className="text-slate-500 w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button 
                                onClick={handleLogout}
                                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-lg transition-colors border border-red-500/20"
                            >
                                <LogoutIcon className="w-5 h-5" />
                                Sair da Conta
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Dashboard Modal */}
            {isDashboardOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-slate-800 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden animate-fadeIn m-4 flex flex-col">
                        <div className="p-4 bg-slate-700 flex justify-between items-center border-b border-slate-600">
                             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <ChartBarIcon className="w-6 h-6 text-cyan-400" />
                                Dashboard
                            </h2>
                            <button onClick={() => setIsDashboardOpen(false)} className="text-slate-400 hover:text-white">
                                <XIcon />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-slate-700 p-6 rounded-xl border border-slate-600">
                                    <h3 className="text-slate-400 text-sm font-semibold uppercase">Traduções Hoje</h3>
                                    <p className="text-4xl font-bold text-white mt-2">124</p>
                                    <p className="text-green-400 text-sm mt-1 flex items-center">
                                        <span className="text-lg mr-1">↑</span> 12% vs ontem
                                    </p>
                                </div>
                                <div className="bg-slate-700 p-6 rounded-xl border border-slate-600">
                                    <h3 className="text-slate-400 text-sm font-semibold uppercase">Tempo de Uso</h3>
                                    <p className="text-4xl font-bold text-white mt-2">45m</p>
                                    <p className="text-slate-400 text-sm mt-1">Média por sessão</p>
                                </div>
                                <div className="bg-slate-700 p-6 rounded-xl border border-slate-600">
                                    <h3 className="text-slate-400 text-sm font-semibold uppercase">Precisão IA</h3>
                                    <p className="text-4xl font-bold text-white mt-2">98.5%</p>
                                    <p className="text-green-400 text-sm mt-1">Feedback positivo</p>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Weekly Usage Chart */}
                                <div className="bg-slate-700 p-6 rounded-xl border border-slate-600 h-80 flex flex-col justify-center items-center">
                                    <h3 className="text-white font-bold mb-4 self-start">Uso Semanal</h3>
                                    {/* Mock Chart Visualization */}
                                    <div className="flex items-end space-x-2 sm:space-x-4 h-48 w-full px-2">
                                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                            <div key={i} className="flex-1 bg-cyan-600/30 hover:bg-cyan-500 rounded-t-md relative group transition-all" style={{height: `${h}%`}}>
                                                 <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {h * 10}
                                                 </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between w-full px-2 mt-2 text-xs text-slate-400">
                                        <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
                                    </div>
                                </div>

                                {/* Sentiment Analysis (New) */}
                                <div className="bg-slate-700 p-6 rounded-xl border border-slate-600 h-80 flex flex-col">
                                    <h3 className="text-white font-bold mb-4">Análise de Sentimentos</h3>
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className="relative w-32 h-32 mb-4">
                                             {/* CSS Donut Chart */}
                                            <div 
                                                className="absolute inset-0 rounded-full"
                                                style={{
                                                    background: 'conic-gradient(#4ade80 0% 65%, #facc15 65% 85%, #f87171 85% 100%)',
                                                    maskImage: 'radial-gradient(transparent 60%, black 61%)',
                                                    WebkitMaskImage: 'radial-gradient(transparent 60%, black 61%)'
                                                }}
                                            ></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <FaceSmileIcon className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                        <div className="w-full space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                                    <span className="text-slate-300">Positivo</span>
                                                </div>
                                                <span className="font-bold text-white">65%</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                    <span className="text-slate-300">Neutro</span>
                                                </div>
                                                <span className="font-bold text-white">20%</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                    <span className="text-slate-300">Negativo</span>
                                                </div>
                                                <span className="font-bold text-white">15%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-slate-700 p-6 rounded-xl border border-slate-600 h-80 overflow-hidden flex flex-col">
                                     <h3 className="text-white font-bold mb-4">Atividades Recentes</h3>
                                     <ul className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                        <li className="flex justify-between items-center text-sm border-b border-slate-600 pb-2">
                                            <span className="text-slate-300">Tradução de Voz</span>
                                            <span className="text-slate-500">2 min atrás</span>
                                        </li>
                                        <li className="flex justify-between items-center text-sm border-b border-slate-600 pb-2">
                                            <span className="text-slate-300">Chatbot: Dúvida Gramática</span>
                                            <span className="text-slate-500">15 min atrás</span>
                                        </li>
                                        <li className="flex justify-between items-center text-sm border-b border-slate-600 pb-2">
                                            <span className="text-slate-300">Alteração de Tema</span>
                                            <span className="text-slate-500">1 hora atrás</span>
                                        </li>
                                        <li className="flex justify-between items-center text-sm border-b border-slate-600 pb-2">
                                            <span className="text-slate-300">Login realizado</span>
                                            <span className="text-slate-500">3 horas atrás</span>
                                        </li>
                                         <li className="flex justify-between items-center text-sm border-b border-slate-600 pb-2">
                                            <span className="text-slate-300">Tradução de Texto</span>
                                            <span className="text-slate-500">5 horas atrás</span>
                                        </li>
                                     </ul>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================================================================================
// FUNÇÃO PURA: LÓGICA DE QUEBRA DE TEXTO
// ==================================================================================
function dividirEmFrasesCurtas(texto: string, maxChars: number = 2000): string[] {
    if (!texto) return [];

    // Substituição específica solicitada: "LIR" -> "lindo"
    // Isso garante que se o input (ex: microfone) captar "LIR", o avatar interpretará como "lindo"
    const textoCorrigido = texto.replace(/\bLIR\b/gi, 'lindo');

    // Remove sinais matemáticos (+, *, /, =, %, <, >, ^) substituindo por espaço
    // Mantém o hífen (-) para preservar palavras compostas e pontuação gramatical
    const textoSemMatematica = textoCorrigido.replace(/[+*=/%<>^]/g, ' ');

    const textoLimpo = textoSemMatematica.replace(/\s+/g, ' ').trim();

    const sentencasBrutas = textoLimpo.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [textoLimpo];
    
    const chunks: string[] = [];
    let blocoAtual = '';

    for (const sentenca of sentencasBrutas) {
        const s = sentenca.trim();
        if (!s) continue;

        if ((blocoAtual + ' ' + s).trim().length <= maxChars) {
            blocoAtual = (blocoAtual + ' ' + s).trim();
        } else {
            if (blocoAtual) {
                chunks.push(blocoAtual);
            }
            
            if (s.length > maxChars) {
                chunks.push(s); 
                blocoAtual = '';
            } else {
                blocoAtual = s;
            }
        }
    }

    if (blocoAtual) {
        chunks.push(blocoAtual);
    }

    return chunks;
}

export default MainScreen;
