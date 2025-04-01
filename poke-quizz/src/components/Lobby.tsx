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
    <div
      className="min-h-screen w-full bg-no-repeat bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/psyduck.jpg')" }}
    >
      {/* Fond légèrement opaque pour rendre le texte lisible */}
      <div className="bg-white/80 p-8 rounded-lg shadow-lg max-w-md w-full flex flex-col items-center">
        <h1 className="text-3xl text-blue-800 font-bold mb-4">PokeQuizz</h1>
        <p className="text-gray-700 mb-6">Devine le Pokémon !</p>

        {/* Chrono */}
        <div className="mb-6 w-full flex flex-col items-center">
          <div className="flex items-center mb-2">
            <span className="text-gray-700 mr-2">Activer le chrono :</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={enableTimer}
                onChange={(e) => setEnableTimer(e.target.checked)}
              />
              {/* Le switch on/off */}
              <div className="peer ring-0 bg-rose-400 rounded-full outline-none duration-300 after:duration-500 w-12 h-12 shadow-md peer-checked:bg-emerald-500 peer-focus:outline-none after:content-['✖️'] after:rounded-full after:absolute after:outline-none after:h-10 after:w-10 after:bg-gray-50 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-hover:after:scale-75 peer-checked:after:content-['✔️'] after:-rotate-180 peer-checked:after:rotate-0"></div>
            </label>
          </div>
          {enableTimer && (
            <label className="text-gray-700">
              Temps de jeu :
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(Number(e.target.value))}
                className="ml-2 p-1 border-2 border-blue-800 rounded"
              >
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={900}>15 minutes</option>
                <option value={1800}>30 minutes</option>
                <option value={3600}>1 heure</option>
              </select>
            </label>
          )}
        </div>

        {/* Sélection des générations */}
        <div className="mb-6 w-full flex flex-col items-center">
          <p className="text-gray-700 mb-2">Sélectionnez les générations :</p>
          <div className="flex flex-wrap justify-center gap-3">
            {generationOptions.map((gen) => (
              <label key={gen} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  value={gen}
                  checked={selectedGenerations.includes(gen)}
                  onChange={handleGenerationChange}
                />
                <span className="text-gray-700 text-sm">Gen {gen}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Liste verticale des modes de jeu */}
        <div className="flex flex-col space-y-4 w-full">
          <button
            onClick={() => handleStart('photo')}
            className="bg-yellow-400 border-2 border-blue-800 rounded-lg px-4 py-2 font-bold text-blue-800 transition-transform duration-300 hover:bg-yellow-500 hover:scale-105"
          >
            PhotoQuiz
          </button>
          <button
            onClick={() => handleStart('sound')}
            className="bg-yellow-400 border-2 border-blue-800 rounded-lg px-4 py-2 font-bold text-blue-800 transition-transform duration-300 hover:bg-yellow-500 hover:scale-105"
          >
            SoundQuiz
          </button>
          <button
            onClick={() => handleStart('stat')}
            className="bg-yellow-400 border-2 border-blue-800 rounded-lg px-4 py-2 font-bold text-blue-800 transition-transform duration-300 hover:bg-yellow-500 hover:scale-105"
          >
            StatQuiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
