import React, { useState } from 'react';
import Lobby from './components/Lobby';
import PhotoQuiz from './components/PhotoQuiz';
import SoundQuiz from './components/SoundQuiz';

const App: React.FC = () => {
  const [mode, setMode] = useState<'lobby' | 'photo' | 'sound'>('lobby');

  return (
    <div>
      {mode === 'lobby' && <Lobby setMode={setMode} />}
      {mode === 'photo' && <PhotoQuiz onReturn={() => setMode('lobby')} />}
      {mode === 'sound' && <SoundQuiz onReturn={() => setMode('lobby')} />}
    </div>
  );
};

export default App;
