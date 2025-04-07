import React, { useState, useEffect, useRef } from 'react';

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

const PhotoQuiz: React.FC<PhotoQuizProps> = ({
  onReturn,
  enableTimer,
  selectedTime,
  selectedGenerations,
}) => {
  const [localDifficulty, setLocalDifficulty] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [points, setPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const formatTime = (seconds: number): string => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remaining = seconds % 60;
      return remaining === 0
        ? `${minutes} minute(s)`
        : `${minutes} minute(s) ${remaining} second(s)`;
    }
    return `${seconds} second(s)`;
  };

  useEffect(() => {
    if (gameStarted && enableTimer && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameStarted, enableTimer, timeLeft]);

  useEffect(() => {
    if (gameStarted && enableTimer && timeLeft === 0) {
      setFeedback('Temps écoulé !');
    }
  }, [timeLeft, gameStarted, enableTimer]);

  const fetchRandomPokemon = async () => {
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
        nameEn: speciesData.names.find((n: any) => n.language.name === 'en')?.name || data.name,
        nameFr: speciesData.names.find((n: any) => n.language.name === 'fr')?.name || data.name,
        sprite: data.sprites.front_default,
      });
    } catch (error) {
      console.error(error);
      setFeedback('Impossible de charger un Pokémon. Réessaie plus tard.');
    }
  };

  useEffect(() => {
    if (gameStarted) {
      fetchRandomPokemon();
      if (enableTimer) setTimeLeft(selectedTime);
    }
  }, [gameStarted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealed || !pokemon || (enableTimer && timeLeft === 0)) return;
    const userGuess = guess.trim().toLowerCase();
    const possibleAnswers = [pokemon.nameEn.toLowerCase(), pokemon.nameFr.toLowerCase()];
    if (possibleAnswers.includes(userGuess)) {
      setPoints(points + 1);
      setStreak(streak + 1);
      setFeedback('Bravo, bonne réponse !');
      setIsRevealed(true);
    } else {
      setStreak(0);
      setFeedback('Mauvaise réponse, réessaie !');
    }
  };

  const handleGiveUp = () => {
    if (!pokemon || (enableTimer && timeLeft === 0)) return;
    setPoints(Math.max(points - 1, 0));
    setStreak(0);
    setFeedback(`La réponse était : ${pokemon.nameFr} / ${pokemon.nameEn}. (-1 point)`);
    setIsRevealed(true);
  };

  const handleNext = () => {
    if (enableTimer && timeLeft === 0) return;
    fetchRandomPokemon();
  };

  const getFilterStyle = () => {
    if (isRevealed) return 'none';
    if (localDifficulty === 'débutant') return 'none';
    if (localDifficulty === 'facile') return 'blur(4px)';
    if (localDifficulty === 'moyen') return 'blur(8px)';
    if (localDifficulty === 'difficile') return 'blur(10px) grayscale(100%)';
    if (localDifficulty === 'expert') return 'blur(12px) grayscale(100%)';
    return 'blur(8px)';
  };

  if (!gameStarted || localDifficulty === '') {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
           style={{ backgroundImage: "url('/images/background/psyduck.jpg')" }}>
        <button
          onClick={onReturn}
          className="absolute top-4 left-4 p-2 border-2 border-white text-white rounded hover:scale-105 transition-transform"
        >
          Retour à l'accueil
        </button>
        <div className="bg-white/80 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <img
            src="/images/PokeQuizLogo.png"
            alt="PokeQuiz Logo"
            className="mx-auto mb-4 w-1/3 hover:scale-110 transition-transform duration-300"
          />
          <h2 className="text-xl font-bold mb-4">PhotoQuiz</h2>
          <span className="text-xs font-normal mb-4 block">
            Devine le Pokémon à partir d'une image floue
          </span>
          <p className="mb-4">Choisissez la difficulté :</p>
          <select
            value={localDifficulty}
            onChange={(e) => setLocalDifficulty(e.target.value)}
            className="p-2 border-2 border-blue-800 rounded mb-4"
          >
            <option value="">-- Sélectionnez --</option>
            <option value="débutant">Débutant (sans flou)</option>
            <option value="facile">Facile (un peu flou)</option>
            <option value="moyen">Moyen (flou modéré)</option>
            <option value="difficile">Difficile (très flou, sans couleur)</option>
            <option value="expert">Expert (extrêmement flou, sans couleur)</option>
          </select>
          <br />
          <button
            onClick={() => setGameStarted(true)}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-800 font-bold py-3 rounded shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg mb-4"
          >
            Commencer le PhotoQuiz
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
         style={{ backgroundImage: "url('/images/background/psyduck.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <button
        onClick={onReturn}
        className="absolute top-4 left-4 p-2 border-2 border-white text-white rounded hover:scale-105 transition-transform"
      >
        Retour à l'accueil
      </button>
      <div className="bg-white/80 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-2">Devine le Pokémon !</h2>
        {enableTimer && <p className="mb-2">{formatTime(timeLeft)}</p>}
        <p className="mb-4">Points : {points} | Streak : {streak}</p>
        {pokemon && (
          <div className="mb-4">
            <img
              src={pokemon.sprite}
              alt={pokemon.nameEn}
              className="mx-auto"
              style={{ width: '200px', filter: getFilterStyle(), transition: 'filter 0.3s ease' }}
            />
          </div>
        )}
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Entrez le nom du Pokémon (FR ou EN)"
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
        {!isRevealed && (enableTimer && timeLeft > 0 || !enableTimer) && (
          <button
            onClick={handleGiveUp}
            className="mb-4 p-2 border-2 border-blue-800 rounded hover:scale-105 transition-transform"
          >
            Donner la réponse (-1 point)
          </button>
        )}
        {isRevealed && ((!enableTimer) || (enableTimer && timeLeft > 0)) && (
          <button
            onClick={handleNext}
            className="p-2 border-2 border-blue-800 rounded hover:scale-105 transition-transform"
          >
            Pokémon Suivant
          </button>
        )}
      </div>
    </div>
  );
};

export default PhotoQuiz;
