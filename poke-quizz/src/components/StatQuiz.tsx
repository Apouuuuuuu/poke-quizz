import React, { useState, useEffect } from 'react';

interface PokemonData {
  nameEn: string;
  nameFr: string;
}

interface StatQuizProps {
  onReturn: () => void;
  selectedGenerations: number[];
}

const StatQuiz: React.FC<StatQuizProps> = ({ onReturn, selectedGenerations }) => {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [clues, setClues] = useState<string[]>([]);
  const [clueIndex, setClueIndex] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

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

  const fetchRandomPokemon = async () => {
    try {
      setFeedback('');
      setIsRevealed(false);
      setGuess('');
      setClueIndex(0);
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

      const newClues: string[] = [];
      const hp = data.stats.find((s: any) => s.stat.name === 'hp')?.base_stat;
      if (hp !== undefined) newClues.push(`HP: ${hp}`);
      if (data.height !== undefined) newClues.push(`Taille: ${data.height}`);
      if (data.weight !== undefined) newClues.push(`Poids: ${data.weight}`);
      if (speciesData.habitat && speciesData.habitat.name) {
        newClues.push(`Habitat: ${speciesData.habitat.name}`);
      } else {
        newClues.push(`Habitat: inconnu`);
      }
      if (speciesData.generation && speciesData.generation.name) {
        newClues.push(`Génération: ${speciesData.generation.name}`);
      } else {
        newClues.push(`Génération: inconnu`);
      }
      const attack = data.stats.find((s: any) => s.stat.name === 'attack')?.base_stat;
      if (attack !== undefined) newClues.push(`Attaque: ${attack}`);
      const spAttack = data.stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat;
      if (spAttack !== undefined) newClues.push(`Attaque Spéciale: ${spAttack}`);
      const defense = data.stats.find((s: any) => s.stat.name === 'defense')?.base_stat;
      if (defense !== undefined) newClues.push(`Défense: ${defense}`);
      const spDefense = data.stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat;
      if (spDefense !== undefined) newClues.push(`Défense Spéciale: ${spDefense}`);
      const speed = data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat;
      if (speed !== undefined) newClues.push(`Vitesse: ${speed}`);
      if (speciesData.color && speciesData.color.name) {
        newClues.push(`Couleur: ${speciesData.color.name}`);
      } else {
        newClues.push(`Couleur: inconnu`);
      }
      setClues(newClues);
      const nameEn =
        speciesData.names.find((n: any) => n.language.name === 'en')?.name || data.name;
      const nameFr =
        speciesData.names.find((n: any) => n.language.name === 'fr')?.name || data.name;
      setPokemon({ nameEn, nameFr });
    } catch (error) {
      console.error(error);
      setFeedback('Impossible de charger un Pokémon. Réessaie plus tard.');
    }
  };

  useEffect(() => {
    fetchRandomPokemon();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealed || !pokemon) return;
    const userGuess = guess.trim().toLowerCase();
    const correctAnswers = [pokemon.nameEn.toLowerCase(), pokemon.nameFr.toLowerCase()];
    if (correctAnswers.includes(userGuess)) {
      const additionalCluesUsed = clueIndex;
      const earnedPoints = Math.max(10 - additionalCluesUsed, 1);
      setPoints(points + earnedPoints);
      setFeedback(`Bravo, bonne réponse ! (+${earnedPoints} points)`);
      setIsRevealed(true);
      setCorrectCount(correctCount + 1);
    } else {
      setFeedback('Mauvaise réponse, réessaie !');
    }
  };

  const handleGiveUp = () => {
    if (!pokemon) return;
    setPoints(Math.max(points - 3, 0));
    setFeedback(`La réponse était : ${pokemon.nameFr} / ${pokemon.nameEn}. (-3 points)`);
    setIsRevealed(true);
  };

  const handleNext = () => {
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
      <h2>Mode Stat Quiz</h2>
      <p>Points : {points} | Pokémon trouvés : {correctCount}</p>
      {clues.length > 0 && <p>Indice : {clues[clueIndex]}</p>}
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
      {!isRevealed && (
        <button
          onClick={() => setClueIndex(Math.min(clueIndex + 1, clues.length - 1))}
          style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}
        >
          Obtenir un indice supplémentaire
        </button>
      )}
      {!isRevealed && (
        <button onClick={handleGiveUp} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}>
          Donner la réponse (-3 points)
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

export default StatQuiz;
