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
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
    >
      <div className="bg-white/80 p-4 rounded-lg shadow-lg max-w-md w-full text-center">
        <img
          src="/images/PokeQuizLogo.png"
          alt="PokeQuiz Logo"
          className="mx-auto mb-4 w-3/4 hover:scale-110 transition-transform duration-300"
        />

        <div className="mb-6 flex items-center justify-center">
          <span className="mr-2 text-lg text-gray-700">Activer le chrono</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={enableTimer}
              onChange={(e) => setEnableTimer(e.target.checked)}
            />
            <div className="peer ring-0 bg-rose-400 rounded-full outline-none duration-300 after:duration-500 w-10 h-10 shadow-md peer-checked:bg-emerald-500 peer-focus:outline-none after:content-['✖️'] after:rounded-full after:absolute after:outline-none after:h-8 after:w-8 after:bg-gray-50 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-hover:after:scale-75 peer-checked:after:content-['✔️'] after:-rotate-180 peer-checked:after:rotate-0"></div>
          </label>
        </div>

        {enableTimer && (
          <div className="mb-4">
            <label className="text-gray-700">
              Temps de jeu :
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(Number(e.target.value))}
                className="ml-1 p-1 border-2 border-blue-800 rounded"
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
                className={`px-4 py-2 border-2 border-blue-800 rounded text-sm font-bold transition-transform duration-300 hover:scale-105 ${selectedGenerations.includes(gen) ? 'bg-yellow-400' : 'bg-gray-200'
                  }`}
              >
                Gen {gen}
              </button>
            ))}
          </div>
        </div>

        {/* Boutons des modes de jeu avec description à l'intérieur */}
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => handleStart('photo')}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-800 font-bold py-3 rounded shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="flex flex-col">
              <span>PhotoQuiz</span>
              <span className="text-xs font-normal">
                Devine le Pokémon à partir d'une image
              </span>
            </div>
          </button>

          <button
            onClick={() => handleStart('sound')}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-800 font-bold py-3 rounded shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="flex flex-col">
              <span>SoundQuiz</span>
              <span className="text-xs font-normal">
                Devine le Pokémon à partir de son cri
              </span>
            </div>
          </button>

          <button
            onClick={() => handleStart('stat')}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-800 font-bold py-3 rounded shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="flex flex-col">
              <span>StatQuiz</span>
              <span className="text-xs font-normal">
                Devine le Pokémon à partir de ses statistiques
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
