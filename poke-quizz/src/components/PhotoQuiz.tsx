import React, { useState, useEffect } from 'react';

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
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  useEffect(() => {
    if (gameStarted) fetchRandomPokemon();
  }, [gameStarted]);

  const fetchRandomPokemon = async () => {
    try {
      setFeedback('');
      setIsRevealed(false);
      setGuess('');
      const totalPokemon = 3; 
      const randomId = Math.floor(Math.random() * totalPokemon) + 1;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await response.json();
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`);
      const speciesData = await speciesResponse.json();
      const nameEn = speciesData.names.find((n: any) => n.language.name === 'en')?.name || data.name;
      const nameFr = speciesData.names.find((n: any) => n.language.name === 'fr')?.name || data.name;
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
    if (!pokemon) return;
    setPoints(Math.max(points - 2, 0));
    setStreak(0);
    setFeedback(`Dommage, la réponse était : ${pokemon.nameFr} / ${pokemon.nameEn}.`);
    setIsRevealed(true);
  };

  const getFilterStyle = () => {
    if (isRevealed) return 'none';
    if (difficulty === 'débutant') return 'none';
    if (difficulty === 'facile') return 'blur(4px)';
    if (difficulty === 'moyen') return 'blur(4px) grayscale(100%)';
    if (difficulty === 'difficile') return 'blur(8px) grayscale(100%)';
    if (difficulty === 'expert') return 'blur(12px) grayscale(100%)';
    return 'blur(8px) grayscale(100%)';
  };

  if (!gameStarted) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>Choisissez le niveau de difficulté pour commencer</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="difficulty" style={{ marginRight: '0.5rem' }}>Difficulté :</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{ padding: '0.3rem' }}
          >
            <option value="débutant">Débutant (sans flou, couleurs)</option>
            <option value="facile">Facile (couleur, un peu flou)</option>
            <option value="moyen">Moyen (pas de couleur, un peu flou)</option>
            <option value="difficile">Difficile (flou, sans couleur)</option>
            <option value="expert">Expert (très flou, sans couleur)</option>
          </select>
        </div>
        <button onClick={() => setGameStarted(true)} style={{ padding: '0.5rem 1rem' }}>
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
      <h2>Devine le Pokémon !</h2>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Difficulté : </strong>{difficulty}
      </div>
      {pokemon && (
        <div style={{ margin: '1rem' }}>
          <img
            src={pokemon.sprite}
            alt={pokemon.nameEn}
            style={{
              width: '200px',
              filter: getFilterStyle(),
              transition: 'filter 0.3s ease'
            }}
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
          disabled={isRevealed}
        />
        <button type="submit" style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem' }} disabled={isRevealed}>
          Valider
        </button>
      </form>
      <p>{feedback}</p>
      <p>Points: {points} | Streak: {streak}</p>
      {!isRevealed && (
        <button onClick={handleGiveUp} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}>
          Donner la réponse
        </button>
      )}
      <button onClick={fetchRandomPokemon} style={{ padding: '0.5rem 1rem' }} disabled={!isRevealed}>
        Pokémon Suivant
      </button>
    </div>
  );
};

export default PhotoQuiz;
