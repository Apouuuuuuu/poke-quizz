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

  const handleGenerationChange = (gen: number) => {
    if (selectedGenerations.includes(gen)) {
      setSelectedGenerations(selectedGenerations.filter((g) => g !== gen));
    } else {
      setSelectedGenerations([...selectedGenerations, gen]);
    }
  };

  const handleStart = (mode: 'photo' | 'sound' | 'stat') => {
    setGameOptions({ enableTimer, selectedTime, selectedGenerations });
    setMode(mode);
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
         style={{ backgroundImage: "url('/images/background/psyduck.jpg')" }}>
      <div className="bg-white/80 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <img
          src="/images/PokeQuizLogo.png"
          alt="PokeQuiz Logo"
          className="mx-auto mb-4 hover:scale-110 transition-transform duration-300"
        />

        <div className="mb-6 flex items-center justify-center">
          <span className="mr-4 text-lg text-gray-700">Activer le chrono :</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={enableTimer}
              onChange={(e) => setEnableTimer(e.target.checked)}
            />
            <div className="peer ring-0 bg-rose-400 rounded-full outline-none duration-300 after:duration-500 w-12 h-12 shadow-md peer-checked:bg-emerald-500 peer-focus:outline-none after:content-['✖️'] after:rounded-full after:absolute after:outline-none after:h-10 after:w-10 after:bg-gray-50 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-hover:after:scale-75 peer-checked:after:content-['✔️'] after:-rotate-180 peer-checked:after:rotate-0"></div>
          </label>
        </div>

        {enableTimer && (
          <div className="mb-6">
            <label className="text-lg text-gray-700">
              Temps de jeu :
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(Number(e.target.value))}
                className="ml-2 p-2 border-2 border-blue-800 rounded"
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

        {/* Générations */}
        <div className="mb-6">
          <p className="text-lg mb-2 text-gray-700">Sélectionnez les générations :</p>
          <div className="flex flex-wrap justify-center gap-2">
            {generationOptions.map((gen) => (
              <button
                key={gen}
                onClick={() => handleGenerationChange(gen)}
                className={`px-4 py-2 border-2 border-blue-800 rounded text-sm font-bold transition-transform duration-300 hover:scale-105 ${
                  selectedGenerations.includes(gen) ? 'bg-yellow-400' : 'bg-gray-200'
                }`}
              >
                Gen {gen}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <button onClick={() => handleStart('photo')} className="button">
            PhotoQuiz
          </button>
          <button onClick={() => handleStart('sound')} className="button">
            SoundQuiz
          </button>
          <button onClick={() => handleStart('stat')} className="button">
            StatQuiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
