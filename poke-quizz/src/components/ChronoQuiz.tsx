import React, { useState, useEffect, useRef } from 'react';

interface PokemonData {
  nameEn: string;
  nameFr: string;
  sprite: string;
}

interface ChronoQuizProps {
  onReturn: () => void;
}

const ChronoQuiz: React.FC<ChronoQuizProps> = ({ onReturn }) => {
  const [selectedTime, setSelectedTime] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [guess, setGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameActive, timeLeft]);

  useEffect(() => {
    if (gameActive && timeLeft === 0) {
      setFeedback(`Temps écoulé ! Vous avez trouvé ${correctCount} Pokémon.`);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [timeLeft, gameActive, correctCount]);

  const startGame = () => {
    setCorrectCount(0);
    setTimeLeft(selectedTime);
    setGameActive(true);
    fetchRandomPokemon();
  };

  const fetchRandomPokemon = async () => {
    try {
      setFeedback('');
      setIsRevealed(false);
      setGuess('');
      const totalPokemon = 3; // Remplacer par le total désiré
      const randomId = Math.floor(Math.random() * totalPokemon) + 1;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await response.json();
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`);
      const speciesData = await speciesResponse.json();
      const nameEn =
        speciesData.names.find((n: any) => n.language.name === 'en')?.name || data.name;
      const nameFr =
        speciesData.names.find((n: any) => n.language.name === 'fr')?.name || data.name;
      setPokemon({ nameEn, nameFr, sprite: data.sprites.front_default });
    } catch (error) {
      console.error(error);
      setFeedback('Impossible de charger un Pokémon. Réessaie plus tard.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealed || !pokemon) return;
    const userGuess = guess.trim().toLowerCase();
    const possibleAnswers = [pokemon.nameEn.toLowerCase(), pokemon.nameFr.toLowerCase()];
    if (possibleAnswers.includes(userGuess)) {
      setCorrectCount(correctCount + 1);
      setFeedback('Bravo, bonne réponse !');
      setIsRevealed(true);
    } else {
      setFeedback('Mauvaise réponse, réessaie !');
    }
  };

  const handleGiveUp = () => {
    if (!pokemon) return;
    setFeedback(`La réponse était : ${pokemon.nameFr} / ${pokemon.nameEn}.`);
    setIsRevealed(true);
  };

  const handleNext = () => {
    if (!gameActive || timeLeft === 0) return;
    fetchRandomPokemon();
  };

  if (!gameActive) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>Mode Chrono - Trouvez le maximum de Pokémon</h2>
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
        <button onClick={startGame} style={{ padding: '0.5rem 1rem' }}>
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
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          padding: '0.5rem 1rem'
        }}
      >
        Retour à l'accueil
      </button>
      <h2>Mode Chrono - Trouvez le maximum de Pokémon</h2>
      <p>Temps restant : {timeLeft} secondes</p>
      <p>Pokémon trouvés : {correctCount}</p>
      {pokemon && timeLeft > 0 && (
        <div style={{ margin: '1rem' }}>
          <img src={pokemon.sprite} alt={pokemon.nameEn} style={{ width: '200px' }} />
        </div>
      )}
      {timeLeft > 0 && (
        <>
          <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Entrez le nom du Pokémon (FR ou EN)"
              style={{ padding: '0.5rem' }}
              disabled={isRevealed}
            />
            <button
              type="submit"
              style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem' }}
              disabled={isRevealed}
            >
              Valider
            </button>
          </form>
          {!isRevealed && (
            <button
              onClick={handleGiveUp}
              style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}
            >
              Donner la réponse
            </button>
          )}
          {isRevealed && (
            <button onClick={handleNext} style={{ padding: '0.5rem 1rem' }}>
              Pokémon Suivant
            </button>
          )}
          <p>{feedback}</p>
        </>
      )}
      {timeLeft === 0 && (
        <div>
          <h3>Temps écoulé !</h3>
          <p>Vous avez trouvé {correctCount} Pokémon.</p>
          <button onClick={onReturn} style={{ padding: '0.5rem 1rem' }}>
            Retour à l'accueil
          </button>
        </div>
      )}
    </div>
  );
};

export default ChronoQuiz;
