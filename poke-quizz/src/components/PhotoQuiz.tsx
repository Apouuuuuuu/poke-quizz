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
    if (localDifficulty === 'difficile') return 'blur(12px) grayscale(100%)';
    if (localDifficulty === 'expert') return 'blur(16px) grayscale(100%)';
    return 'blur(8px)';
  };

  if (!gameStarted || localDifficulty === '') {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>PhotoQuiz - Configuration</h2>
        <p>Choisissez la difficulté :</p>
        <select
          value={localDifficulty}
          onChange={(e) => setLocalDifficulty(e.target.value)}
          style={{ padding: '0.3rem', marginBottom: '1rem' }}
        >
          <option value="">-- Sélectionnez --</option>
          <option value="débutant">Débutant (sans flou)</option>
          <option value="facile">Facile (un peu flou)</option>
          <option value="moyen">Moyen (flou modéré)</option>
          <option value="difficile">Difficile (très flou, sans couleur)</option>
          <option value="expert">Expert (extrêmement flou, sans couleur)</option>
        </select>
        <br />
        <button onClick={() => setGameStarted(true)} style={{ padding: '0.5rem 1rem' }}>
          Commencer le PhotoQuiz
        </button>
        <button onClick={onReturn} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem', position: 'relative' }}>
      <button
        onClick={onReturn}
        style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.5rem 1rem' }}
      >
        Retour à l'accueil
      </button>
      <h2>Devine le Pokémon !</h2>
      {enableTimer && <p>Temps restant : {formatTime(timeLeft)}</p>}
      <p>Points : {points} | Streak : {streak}</p>
      {pokemon && (
        <div style={{ margin: '1rem' }}>
          <img
            src={pokemon.sprite}
            alt={pokemon.nameEn}
            style={{ width: '200px', filter: getFilterStyle(), transition: 'filter 0.3s ease' }}
          />
        </div>
      )}
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
      {!isRevealed && (enableTimer && timeLeft > 0 || !enableTimer) && (
        <button onClick={handleGiveUp} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}>
          Donner la réponse (-1 point)
        </button>
      )}
      {isRevealed && ((!enableTimer) || (enableTimer && timeLeft > 0)) && (
        <button onClick={handleNext} style={{ padding: '0.5rem 1rem' }}>
          Pokémon Suivant
        </button>
      )}
    </div>
  );
};

export default PhotoQuiz;
