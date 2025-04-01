import React, { useState } from 'react';
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

  return (
    <div>
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
        />
      )}
    </div>
  );
};

export default App;
