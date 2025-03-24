import React, { useState } from 'react';
import Lobby from './components/Lobby';
import PhotoQuiz from './components/PhotoQuiz';
import SoundQuiz from './components/SoundQuiz';
import ChronoQuiz from './components/ChronoQuiz';
import StatQuiz from './components/StatQuiz';

const App: React.FC = () => {
  const [mode, setMode] = useState<'lobby' | 'photo' | 'sound' | 'chrono' | 'stat'>('lobby');

  return (
    <div>
      {mode === 'lobby' && <Lobby setMode={setMode} />}
      {mode === 'photo' && <PhotoQuiz onReturn={() => setMode('lobby')} />}
      {mode === 'sound' && <SoundQuiz onReturn={() => setMode('lobby')} />}
      {mode === 'chrono' && <ChronoQuiz onReturn={() => setMode('lobby')} />}
      {mode === 'stat' && <StatQuiz onReturn={() => setMode('lobby')} />}
    </div>
  );
};

export default App;
