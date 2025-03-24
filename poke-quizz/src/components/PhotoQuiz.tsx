import React, { useState, useEffect, useRef } from 'react';

interface PokemonData {
  nameEn: string;
  nameFr: string;
  sprite: string;
}

interface PhotoQuizProps {
  onReturn: () => void;
}

const PhotoQuiz: React.FC<PhotoQuizProps> = ({ onReturn }) => {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [points, setPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<string>('débutant');
  const [enableTimer, setEnableTimer] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remaining = seconds % 60;
      return remaining === 0 ? `${minutes} minute(s)` : `${minutes} minute(s) ${remaining} second(s)`;
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
      setFeedback(`Temps écoulé !`);
    }
  }, [timeLeft, gameStarted, enableTimer]);

  const fetchRandomPokemon = async () => {
    try {
      setFeedback('');
      setIsRevealed(false);
      setGuess('');
      const totalPokemon = 151;
      const randomId = Math.floor(Math.random() * totalPokemon) + 1;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await response.json();
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`);
      const speciesData = await speciesResponse.json();
      setPokemon({
        nameEn: speciesData.names.find((n: any) => n.language.name === 'en')?.name || data.name,
        nameFr: speciesData.names.find((n: any) => n.language.name === 'fr')?.name || data.name,
        sprite: data.sprites.front_default
      });
    } catch (error) {
      console.error(error);
      setFeedback('Impossible de charger un Pokémon. Réessaie plus tard.');
    }
  };

  useEffect(() => {
    if (gameStarted) fetchRandomPokemon();
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
      setPoints(Math.max(points - 1, 0));
      setStreak(0);
      setFeedback('Mauvaise réponse, réessaie !');
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

  const getFilterStyle = () => {
    if (isRevealed) return 'none';
    if (difficulty === 'débutant') return 'none';
    if (difficulty === 'facile') return 'blur(4px)';
    if (difficulty === 'moyen') return 'blur(8px)';
    if (difficulty === 'difficile') return 'blur(12px) grayscale(100%)';
    if (difficulty === 'expert') return 'blur(16px) grayscale(100%)';
    return 'blur(8px)';
  };

  if (!gameStarted) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>Choisissez vos options pour commencer</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="difficulty" style={{ marginRight: '0.5rem' }}>Difficulté :</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{ padding: '0.3rem' }}
          >
            <option value="débutant">Débutant (sans flou)</option>
            <option value="facile">Facile (un peu flou)</option>
            <option value="moyen">Moyen (flou modéré)</option>
            <option value="difficile">Difficile (très flou, sans couleur)</option>
            <option value="expert">Expert (extrêmement flou, sans couleur)</option>
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="enableTimer" style={{ marginRight: '0.5rem' }}>Activer le chrono :</label>
          <input
            id="enableTimer"
            type="checkbox"
            checked={enableTimer}
            onChange={(e) => setEnableTimer(e.target.checked)}
          />
        </div>
        {enableTimer && (
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="time" style={{ marginRight: '0.5rem' }}>Temps de jeu :</label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(Number(e.target.value))}
              style={{ padding: '0.3rem' }}
            >
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={900}>15 minutes</option>
              <option value={1800}>30 minutes</option>
              <option value={3600}>1 heure</option>
            </select>
          </div>
        )}
        <button
          onClick={() => {
            setGameStarted(true);
            if (enableTimer) setTimeLeft(selectedTime);
          }}
          style={{ padding: '0.5rem 1rem' }}
        >
          Démarrer
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
        <button type="submit" style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem' }} disabled={isRevealed || (enableTimer && timeLeft === 0)}>
          Valider
        </button>
      </form>
      <p>{feedback}</p>
      {!isRevealed && enableTimer && timeLeft > 0 && (
        <button onClick={handleGiveUp} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}>
          Donner la réponse (-1 point)
        </button>
      )}
      {!isRevealed && !enableTimer && (
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
