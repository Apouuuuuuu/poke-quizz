import React, { useState, useEffect } from 'react';
import Footer from './Footer';

const generationRanges: { [gen: number]: [number, number] } = {
  1: [1, 2],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 898],
  9: [899, 1010],
};

interface PokemonData {
  nameEn: string;
  nameFr: string;
}

interface SoundQuizProps {
  onReturn: () => void;
  selectedGenerations: number[];
  enableTimer: boolean;
  selectedTime: number;
}

const SoundQuiz: React.FC<SoundQuizProps> = ({
  onReturn,
  selectedGenerations,
  enableTimer,
  selectedTime,
}) => {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [pokemonId, setPokemonId] = useState<number>(0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(selectedTime);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (enableTimer && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [enableTimer, timeLeft]);

  useEffect(() => {
    if (enableTimer && timeLeft === 0) {
      setFeedback('Temps écoulé !');
      setIsRevealed(true);
    }
  }, [enableTimer, timeLeft]);

  const fetchRandomPokemon = async () => {
    try {
      setFeedback('');
      setIsRevealed(false);
      setGuess('');
      let randomId = 0;
      if (selectedGenerations.length === 0) {
        randomId = Math.floor(Math.random() * 151) + 1;
      } else {
        const randomGen = selectedGenerations[Math.floor(Math.random() * selectedGenerations.length)];
        const [min, max] = generationRanges[randomGen];
        randomId = Math.floor(Math.random() * (max - min + 1)) + min;
      }
      setPokemonId(randomId);
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await response.json();
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`);
      const speciesData = await speciesResponse.json();
      const nameEn = speciesData.names.find((n: any) => n.language.name === 'en')?.name || data.name;
      const nameFr = speciesData.names.find((n: any) => n.language.name === 'fr')?.name || data.name;
      setPokemon({ nameEn, nameFr });
    } catch (error) {
      console.error(error);
      setFeedback('Impossible de charger un Pokémon. Réessaie plus tard.');
    }
  };

  useEffect(() => {
    fetchRandomPokemon();
  }, []);

  const cryUrl = `https://pokemoncries.com/cries/${pokemonId}.mp3`;

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
    setPoints((prev) => Math.max(prev - 1, 0));
    setStreak(0);
    setFeedback(`La réponse était : ${pokemon?.nameFr}. (-1 point)`);
    setIsRevealed(true);
  };

  const handleNext = () => {
    if (enableTimer && timeLeft === 0) return;
    fetchRandomPokemon();
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-cover bg-center">
      {enableTimer && timeLeft > 0 && (
        <p className="absolute top-4 right-4 bg-white/80 px-3 py-1 rounded shadow">
          Temps restant : {timeLeft} seconde(s)
        </p>
      )}
      <button
        onClick={onReturn}
        className="absolute top-4 left-4 p-2 border-2 border-white text-white rounded hover:scale-105 transition-transform"
      >
        Retour à l'accueil
      </button>
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white/80 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <img
            src="/images/PokeQuizLogo.png"
            alt="PokeQuiz Logo"
            className="mx-auto mb-4 w-3/4 hover:scale-110 transition-transform duration-300"
          />
          <h2 className="text-xl font-bold mb-2">Devine le Pokémon !</h2>
          <p className="mb-2">Points : {points} | Streak : {streak}</p>
          <audio controls src={cryUrl} className="mx-auto mb-4" />
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
          {!isRevealed && (
            <button
              onClick={handleGiveUp}
              className="mr-2 p-2 border-2 border-blue-800 rounded hover:scale-105 transition-transform"
            >
              Donner la réponse (-1 point)
            </button>
          )}
          {isRevealed && (
            <button
              onClick={handleNext}
              className="p-2 border-2 border-blue-800 rounded hover:scale-105 transition-transform"
            >
              Pokémon Suivant
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SoundQuiz;
