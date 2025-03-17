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

  useEffect(() => {
    fetchRandomPokemon();
  }, []);

  const fetchRandomPokemon = async () => {
    try {
      setFeedback('');
      setIsRevealed(false);
      setGuess('');

      const totalPokemon = 3;  // 1010
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
    if (!pokemon) return;

    const userGuess = guess.trim().toLowerCase();
    const possibleAnswers = [
      pokemon.nameEn.toLowerCase(),
      pokemon.nameFr.toLowerCase()
    ];

    if (possibleAnswers.includes(userGuess)) {
      setFeedback('Bravo, bonne réponse !');
    } else {
      setFeedback(`Dommage, la réponse était : ${pokemon.nameFr} / ${pokemon.nameEn}.`);
    }
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
          placeholder="Entrez le nom du Pokémon (FR ou EN)"
          style={{ padding: '0.5rem' }}
        />
        <button type="submit" style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem' }}>
          Valider
        </button>
      </form>

      <p>{feedback}</p>

      <button onClick={fetchRandomPokemon} style={{ padding: '0.5rem 1rem' }}>
        Pokémon Suivant
      </button>
    </div>
  );
};

export default PhotoQuiz;
