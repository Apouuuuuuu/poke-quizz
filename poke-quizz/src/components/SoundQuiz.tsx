import React, { useState, useEffect } from 'react';

interface PokemonData {
  nameEn: string;
  nameFr: string;
}

interface SoundQuizProps {
  onReturn: () => void;
}

const SoundQuiz: React.FC<SoundQuizProps> = ({ onReturn }) => {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [pokemonId, setPokemonId] = useState<number>(0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [points, setPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [gameStarted] = useState<boolean>(true);

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

  const cryUrl = `https://pokemoncries.com/cries/${pokemonId}.mp3`;

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
      <h2>Devine le Pokémon (Mode Sonore)!</h2>
      <audio controls src={cryUrl} style={{ margin: '1rem' }} />
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

export default SoundQuiz;
