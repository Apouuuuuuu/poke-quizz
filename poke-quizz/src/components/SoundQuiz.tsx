import React, { useState, useEffect } from 'react';

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
  const [guess, setGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(selectedTime);

  const generationRanges: { [gen: number]: [number, number] } = {
    1: [1, 151],
    2: [152, 251],
    3: [252, 386],
    4: [387, 493],
    5: [494, 649],
    6: [650, 721],
    7: [722, 809],
    8: [810, 898],
  };

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (enableTimer && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [enableTimer, timeLeft]);

  useEffect(() => {
    if (enableTimer && timeLeft === 0) {
      setFeedback("Temps écoulé !");
    }
  }, [timeLeft, enableTimer]);

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
      setPokemonId(randomId);
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await response.json();
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`);
      const speciesData = await speciesResponse.json();
      const nameEn =
        speciesData.names.find((n: any) => n.language.name === 'en')?.name || data.name;
      const nameFr =
        speciesData.names.find((n: any) => n.language.name === 'fr')?.name || data.name;
      setPokemon({ nameEn, nameFr });
    } catch (error) {
      console.error(error);
      setFeedback("Impossible de charger un Pokémon. Réessaie plus tard.");
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
      setFeedback("Bravo, bonne réponse !");
      setIsRevealed(true);
    } else {
      setPoints(Math.max(points - 1, 0));
      setStreak(0);
      setFeedback("Mauvaise réponse, réessaie !");
    }
  };

  const handleGiveUp = () => {
    if (!pokemon || (enableTimer && timeLeft === 0)) return;
    setPoints(Math.max(points - 1, 0));
    setFeedback(`La réponse était : ${pokemon.nameFr} / ${pokemon.nameEn}. (-1 point)`);
    setIsRevealed(true);
  };

  const handleNext = () => {
    if (enableTimer && timeLeft === 0) return;
    fetchRandomPokemon();
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem', position: 'relative' }}>
      <button
        onClick={onReturn}
        style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.5rem 1rem' }}
      >
        Retour à l'accueil
      </button>
      <h2>Devine le Pokémon (Mode Sonore)!</h2>
      {enableTimer && <p>Temps restant : {timeLeft} secondes</p>}
      <p>Points : {points} | Streak : {streak}</p>
      <audio controls src={cryUrl} style={{ margin: '1rem' }} />
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Entrez le nom du Pokémon (FR ou EN)"
          style={{ padding: '0.5rem' }}
          disabled={isRevealed || (enableTimer && timeLeft === 0)}
        />
        <button
          type="submit"
          style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem' }}
          disabled={isRevealed || (enableTimer && timeLeft === 0)}
        >
          Valider
        </button>
      </form>
      <p>{feedback}</p>
      {!isRevealed && (
        <button
          onClick={handleGiveUp}
          style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}
        >
          Donner la réponse (-1 point)
        </button>
      )}
      {isRevealed && (
        <button onClick={handleNext} style={{ padding: '0.5rem 1rem' }}>
          Pokémon Suivant
        </button>
      )}
    </div>
  );
};

export default SoundQuiz;
