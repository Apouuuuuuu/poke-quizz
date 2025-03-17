import React, { useState, useEffect } from 'react';

interface PokemonData {
  nameEn: string;
  nameFr: string;
  sprite: string;
}

const PhotoQuiz: React.FC = () => {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [points, setPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    fetchRandomPokemon();
  }, []);

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
      setPokemon({
        nameEn,
        nameFr,
        sprite: data.sprites.front_default
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du Pokémon :', error);
      setFeedback('Impossible de charger un Pokémon. Réessaie plus tard.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealed || !pokemon) return;
    const userGuess = guess.trim().toLowerCase();
    const possibleAnswers = [pokemon.nameEn.toLowerCase(), pokemon.nameFr.toLowerCase()];
    if (possibleAnswers.includes(userGuess)) {
      const newStreak = streak + 1;
      let multiplier = 1;
      if (newStreak >= 10) multiplier = 3;
      else if (newStreak >= 5) multiplier = 2;
      setPoints(points + 1 * multiplier);
      setStreak(newStreak);
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
    setFeedback(`Dommage, la réponse était : ${pokemon.nameFr}.`);
    setIsRevealed(true);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Devine le Pokémon !</h2>
      {pokemon && (
        <div style={{ margin: '1rem' }}>
          <img
            src={pokemon.sprite}
            alt={pokemon.nameEn}
            style={{
              width: '200px',
              filter: isRevealed ? 'none' : 'blur(8px) grayscale(100%)',
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
          placeholder="Entrez le nom du Pokémon"
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
