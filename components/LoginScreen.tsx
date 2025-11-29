
import React, { useState } from 'react';
import { Screen } from '../types';
import { EyeIcon, EyeOffIcon } from './icons/Icons';

interface LoginScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogin: (username: string) => void;
  onVisitor: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onLogin, onVisitor }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-2xl shadow-lg">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                UNI-IA
            </h1>
            <p className="mt-2 text-slate-400">Seja bem-vindo(a) de volta!</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username" className="text-sm font-medium text-slate-300">Usuário</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="usuario"
            />
          </div>
          <div className="relative">
            <label htmlFor="password"className="text-sm font-medium text-slate-300">Senha</label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-6 px-3 flex items-center text-slate-400 hover:text-cyan-400"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-transform transform hover:scale-105"
            >
              Entrar
            </button>
          </div>
        </form>
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-400">
            Não tem uma conta?{' '}
            <button onClick={() => onNavigate(Screen.SIGNUP)} className="font-medium text-cyan-400 hover:underline">
              Criar Cadastro
            </button>
          </p>
          <p className="text-sm text-slate-400">
            Caso não queira se cadastrar,{' '}
            <button onClick={onVisitor} className="font-medium text-cyan-400 hover:underline">
              Entrar como Visitante
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
