import React, { useState, useMemo } from 'react';
import Lobby from './components/Lobby';
import PhotoQuiz from './components/PhotoQuiz';
import SoundQuiz from './components/SoundQuiz';
import StatQuiz from './components/StatQuiz';
import './App.css';

type Mode = 'lobby' | 'photo' | 'sound' | 'stat';

interface GameOptions {
  enableTimer: boolean;
  selectedTime: number;
  selectedGenerations: number[];
}

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('lobby');
  const [gameOptions, setGameOptions] = useState<GameOptions>({
    enableTimer: false,
    selectedTime: 60,
    selectedGenerations: [1],
  });

  const backgrounds = [
    '/images/background/articodin.jpg',
    '/images/background/caninos.jpg',
    '/images/background/darkrai.jpg',
    '/images/background/fantominus.jpg',
    '/images/background/lugia.jpg',
    '/images/background/noctali.jpg',
    '/images/background/plante.jpg',
    '/images/background/spectrum.jpg',
    '/images/background/tenebre.jpg',
  ];

  const randomBg = useMemo(() => {
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }, [backgrounds]);

  return (
    <div className="flex flex-col min-h-screen">
      <div
        className="flex-1"
        style={{
          backgroundImage: `url(${randomBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {mode === 'lobby' && (
          <Lobby setMode={setMode} setGameOptions={setGameOptions} />
        )}
        {mode === 'photo' && (
          <PhotoQuiz
            onReturn={() => setMode('lobby')}
            enableTimer={gameOptions.enableTimer}
            selectedTime={gameOptions.selectedTime}
            selectedGenerations={gameOptions.selectedGenerations}
          />
        )}
        {mode === 'sound' && (
          <SoundQuiz
            onReturn={() => setMode('lobby')}
            selectedGenerations={gameOptions.selectedGenerations}
            enableTimer={gameOptions.enableTimer}
            selectedTime={gameOptions.selectedTime}
          />
        )}
        {mode === 'stat' && (
          <StatQuiz
            onReturn={() => setMode('lobby')}
            selectedGenerations={gameOptions.selectedGenerations}
            enableTimer={gameOptions.enableTimer}
            selectedTime={gameOptions.selectedTime}
          />
        )}
      </div>
    </div>
  );
};

export default App;
