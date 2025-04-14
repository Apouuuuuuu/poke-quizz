import React, { useState, useEffect, useCallback } from 'react';
import Footer from './Footer';

interface PokemonData {
  nameEn: string;
  nameFr: string;
  sprite: string;
}

interface PhotoQuizProps {
  onReturn: () => void;
  enableTimer: boolean;
  selectedTime: number;
  selectedGenerations: number[];
}

const generationRanges: { [gen: number]: [number, number] } = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 898],
  9: [899, 1010],
};

const PhotoQuiz: React.FC<PhotoQuizProps> = ({
  onReturn,
  enableTimer,
  selectedTime,
  selectedGenerations,
}) => {
  const [localDifficulty, setLocalDifficulty] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && enableTimer) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, enableTimer]);

  useEffect(() => {
    if (gameStarted && enableTimer && timeLeft === 0) {
      setFeedback('Temps écoulé !');
      setIsRevealed(true);
    }
  }, [timeLeft, gameStarted, enableTimer]);

  const fetchRandomPokemon = useCallback(async () => {
    try {
      setFeedback('');
      setIsRevealed(false);
      setGuess('');
      let randomId = 0;
      if (selectedGenerations.length === 0) {
        randomId = Math.floor(Math.random() * 151) + 1;
      } else {
        const randomGen =
          selectedGenerations[Math.floor(Math.random() * selectedGenerations.length)];
        const [min, max] = generationRanges[randomGen];
        randomId = Math.floor(Math.random() * (max - min + 1)) + min;
      }
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await response.json();
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`);
      const speciesData = await speciesResponse.json();
      setPokemon({
        nameEn:
          speciesData.names.find((n: any) => n.language.name === 'en')?.name || data.name,
        nameFr:
          speciesData.names.find((n: any) => n.language.name === 'fr')?.name || data.name,
        sprite: data.sprites.front_default,
      });
    } catch (error) {
      console.error(error);
      setFeedback('Impossible de charger un Pokémon. Réessaie plus tard.');
    }
  }, [selectedGenerations]);

  useEffect(() => {
    if (gameStarted) {
      fetchRandomPokemon();
      if (enableTimer) setTimeLeft(selectedTime);
    }
  }, [gameStarted, fetchRandomPokemon, enableTimer, selectedTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealed || !pokemon || (enableTimer && timeLeft === 0)) return;
    const userGuess = guess.trim().toLowerCase();
    const possibleAnswers = [pokemon.nameEn.toLowerCase(), pokemon.nameFr.toLowerCase()];
    if (possibleAnswers.includes(userGuess)) {
      setPoints((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setFeedback('Bravo, bonne réponse !');
      setIsRevealed(true);
    } else {
      setStreak(0);
      setFeedback('Mauvaise réponse, réessaie !');
    }
  };

  const handleGiveUp = () => {
    if (!pokemon || (enableTimer && timeLeft === 0)) return;
    setPoints((prev) => Math.max(prev - 1, 0));
    setStreak(0);
    setFeedback(`La réponse était : ${pokemon.nameFr}. (-1 point)`);
    setIsRevealed(true);
  };

  const handleNext = () => {
    if (enableTimer && timeLeft === 0) return;
    fetchRandomPokemon();
  };

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center relative">
      <button
        onClick={onReturn}
        className="absolute top-4 left-4 p-2 border-2 border-white text-white rounded hover:scale-105 transition-transform"
      >
        Retour à l'accueil
      </button>

      {enableTimer && timeLeft > 0 && (
        <p className="absolute top-4 right-20 bg-white/80 px-3 py-1 rounded shadow">
          Temps restant : {timeLeft} seconde(s)
        </p>
      )}

      {!gameStarted || localDifficulty === '' ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-white/80 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <img
              src="/images/PokeQuizLogo.png"
              alt="PokeQuiz Logo"
              className="mx-auto mb-4 w-3/4 hover:scale-110 transition-transform duration-300"
            />
            <h2 className="text-xl font-bold mb-4">Devine le Pokémon !</h2>
            <p className="mb-4">Choisissez la difficulté :</p>
            <select
              value={localDifficulty}
              onChange={(e) => setLocalDifficulty(e.target.value)}
              className="p-2 border-2 border-blue-800 rounded mb-4"
            >
              <option value="">-- Sélectionnez --</option>
              <option value="débutant">Sans flou</option>
              <option value="facile">Un peu flou</option>
              <option value="moyen">Flou sans couleur</option>
              <option value="difficile">Très flou sans couleur</option>
              <option value="expert">Extrêmement flou sans couleur</option>
            </select>
            <button
              onClick={() => setGameStarted(true)}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-800 font-bold py-3 rounded shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              Commencer le PhotoQuiz
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-white/80 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Devine le Pokémon !</h2>
            <p className="mb-4">Points : {points} | Streak : {streak}</p>
            {pokemon && (
              <div className="mb-4">
                <img
                  src={pokemon.sprite}
                  alt={pokemon.nameEn}
                  className="mx-auto"
                  style={{ width: '200px', filter: isRevealed ? 'none' : 'blur(8px)', transition: 'filter 0.3s ease' }}
                />
              </div>
            )}
            <form onSubmit={handleSubmit} className="mb-4">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Entrez le nom du Pokémon"
                className="p-2 border-2 border-blue-800 rounded"
                disabled={isRevealed || (enableTimer && timeLeft === 0)}
              />
              <button
                type="submit"
                className="ml-2 p-2 border-2 border-blue-800 rounded hover:scale-105 transition-transform"
                disabled={isRevealed || (enableTimer && timeLeft === 0)}
              >
                Valider
              </button>
            </form>
            <p className="mb-4">{feedback}</p>
            {!isRevealed && (!enableTimer || (enableTimer && timeLeft > 0)) && (
              <button
                onClick={handleGiveUp}
                className="mb-4 p-2 border-2 border-blue-800 rounded hover:scale-105 transition-transform"
              >
                Donner la réponse (-1 point)
              </button>
            )}
            {isRevealed && (!enableTimer || (enableTimer && timeLeft > 0)) && (
              <button
                onClick={handleNext}
                className="p-2 border-2 border-blue-800 rounded hover:scale-105 transition-transform"
              >
                Pokémon Suivant
              </button>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default PhotoQuiz;
