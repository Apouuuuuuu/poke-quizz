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
    <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Bienvenue au Quiz Pokémon</h2>
      <h3>Configuration</h3>

      <div className="config-section" style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>Activer le chrono :</label>
        {/* Toggle intégré directement */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            checked={enableTimer}
            onChange={(e) => setEnableTimer(e.target.checked)}
          />
          <div className="peer ring-0 bg-rose-400 rounded-full outline-none duration-300 after:duration-500 w-12 h-12 shadow-md peer-checked:bg-emerald-500 peer-focus:outline-none after:content-['✖️'] after:rounded-full after:absolute after:outline-none after:h-10 after:w-10 after:bg-gray-50 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-hover:after:scale-75 peer-checked:after:content-['✔️'] after:-rotate-180 peer-checked:after:rotate-0"></div>
        </label>
      </div>

      {enableTimer && (
        <div className="config-section" style={{ marginBottom: '1rem' }}>
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

      <div className="config-section" style={{ marginBottom: '1rem' }}>
        <p>Sélectionnez les générations :</p>
        <div className="generation-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
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
      </div>

      <div className="config-section" style={{ marginTop: '1rem' }}>
        <button onClick={() => handleStart('photo')} className="button" style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}>
          PhotoQuiz
        </button>
        <button onClick={() => handleStart('sound')} className="button" style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}>
          SoundQuiz
        </button>
        <button onClick={() => handleStart('stat')} className="button" style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}>
          StatQuiz
        </button>
      </div>
    </div>
  );
};

export default Lobby;
