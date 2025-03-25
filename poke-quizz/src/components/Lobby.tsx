import React, { useState } from 'react';

interface LobbyProps {
  setMode: (mode: 'lobby' | 'photo' | 'sound' | 'stat') => void;
  setGameOptions: (options: {
    enableTimer: boolean;
    selectedTime: number;
    selectedGenerations: number[];
  }) => void;
}

const Lobby: React.FC<LobbyProps> = ({ setMode, setGameOptions }) => {
  const [enableTimer, setEnableTimer] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<number>(60);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([1]);

  const generationOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleGenerationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const gen = Number(e.target.value);
    if (e.target.checked) {
      setSelectedGenerations((prev) => [...prev, gen]);
    } else {
      setSelectedGenerations((prev) => prev.filter((g) => g !== gen));
    }
  };

  const handleStart = (mode: 'photo' | 'sound' | 'stat') => {
    setGameOptions({ enableTimer, selectedTime, selectedGenerations });
    setMode(mode);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Bienvenue au Quiz Pokémon</h2>
      <h3>Configuration</h3>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Activer le chrono :
          <input
            type="checkbox"
            checked={enableTimer}
            onChange={(e) => setEnableTimer(e.target.checked)}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>
      </div>
      {enableTimer && (
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Temps de jeu :
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(Number(e.target.value))}
              style={{ marginLeft: '0.5rem', padding: '0.3rem' }}
            >
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={900}>15 minutes</option>
              <option value={1800}>30 minutes</option>
              <option value={3600}>1 heure</option>
            </select>
          </label>
        </div>
      )}
      <div style={{ marginBottom: '1rem' }}>
        <p>Sélectionnez les générations :</p>
        {generationOptions.map((gen) => (
          <label key={gen} style={{ marginRight: '1rem' }}>
            <input
              type="checkbox"
              value={gen}
              checked={selectedGenerations.includes(gen)}
              onChange={handleGenerationChange}
            />
            Génération {gen}
          </label>
        ))}
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => handleStart('photo')} style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}>
          PhotoQuiz
        </button>
        <button onClick={() => handleStart('sound')} style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}>
          SoundQuiz
        </button>
        <button onClick={() => handleStart('stat')} style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}>
          StatQuiz
        </button>
      </div>
    </div>
  );
};

export default Lobby;
