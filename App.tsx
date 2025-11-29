
import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';
import OnboardingScreen from './components/OnboardingScreen';
import MainScreen from './components/MainScreen';
import CuriositiesScreen from './components/CuriositiesScreen';
import { Screen, UserProfile } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.SPLASH);
  
  // Global User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Visitante',
    email: '',
    isVisitor: true,
    photo: null,
    gender: '',
    password: ''
  });

  useEffect(() => {
    if (currentScreen === Screen.SPLASH) {
      const timer = setTimeout(() => {
        setCurrentScreen(Screen.LOGIN);
      }, 4000); // Splash screen duration
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleLogin = (username: string) => {
    setUserProfile(prev => ({
        ...prev,
        name: username || 'Usuário',
        isVisitor: false
    }));
    setCurrentScreen(Screen.ONBOARDING);
  };

  const handleSignUp = (data: Partial<UserProfile>) => {
    setUserProfile(prev => ({
        ...prev,
        ...data,
        isVisitor: false
    }));
    setCurrentScreen(Screen.ONBOARDING);
  };

  const handleVisitor = () => {
      setUserProfile({
          name: 'Visitante',
          email: '',
          isVisitor: true,
          photo: null,
          gender: '',
          password: ''
      });
      setCurrentScreen(Screen.ONBOARDING);
  }

  const handleUpdateProfile = (data: Partial<UserProfile>) => {
    setUserProfile(prev => ({
        ...prev,
        ...data
    }));
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.SPLASH:
        return <SplashScreen />;
      case Screen.LOGIN:
        return <LoginScreen onNavigate={setCurrentScreen} onLogin={handleLogin} onVisitor={handleVisitor} />;
      case Screen.SIGNUP:
        return <SignUpScreen onNavigate={setCurrentScreen} onSignUp={handleSignUp} />;
      case Screen.ONBOARDING:
        return <OnboardingScreen onNavigate={setCurrentScreen} />;
      case Screen.MAIN:
        return (
            <MainScreen 
                onNavigate={setCurrentScreen} 
                userProfile={userProfile} 
                onUpdateProfile={handleUpdateProfile} 
            />
        );
      case Screen.CURIOSITIES:
        return <CuriositiesScreen onNavigate={setCurrentScreen} />;
      default:
        return <LoginScreen onNavigate={setCurrentScreen} onLogin={handleLogin} onVisitor={handleVisitor} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 font-sans">
      {renderScreen()}
    </div>
  );
};

export default App;
