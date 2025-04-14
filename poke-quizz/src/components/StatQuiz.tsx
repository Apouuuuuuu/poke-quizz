import React, { useState, useEffect, useCallback } from 'react';
import Footer from './Footer';

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

interface PokemonData {
  nameEn: string;
  nameFr: string;
}

interface StatQuizProps {
  onReturn: () => void;
  selectedGenerations: number[];
  enableTimer: boolean;
  selectedTime: number;
}

const StatQuiz: React.FC<StatQuizProps> = ({
  onReturn,
  selectedGenerations,
  enableTimer,
  selectedTime,
}) => {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [clues, setClues] = useState<string[]>([]);
  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [points, setPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(selectedTime);

  // Timer via setInterval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (enableTimer) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [enableTimer]);

  useEffect(() => {
    if (enableTimer && timeLeft === 0) {
      setFeedback('Temps écoulé !');
      setIsRevealed(true);
    }
  }, [enableTimer, timeLeft]);

  const fetchRandomPokemon = useCallback(async () => {
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

      // Récupération des statistiques et indices
      const hp = data.stats.find((s: any) => s.stat.name === 'hp')?.base_stat;
      const attack = data.stats.find((s: any) => s.stat.name === 'attack')?.base_stat;
      const spAttack = data.stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat;
      const defense = data.stats.find((s: any) => s.stat.name === 'defense')?.base_stat;
      const spDefense = data.stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat;
      const speed = data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat;

      const newClues: string[] = [];
      if (hp !== undefined) newClues.push(`HP: ${hp}`);
      if (data.height !== undefined) newClues.push(`Taille: ${data.height}`);
      if (data.weight !== undefined) newClues.push(`Poids: ${data.weight}`);

      if (speciesData.habitat && speciesData.habitat.name) {
        newClues.push(`Habitat: ${speciesData.habitat.name}`);
      } else {
        newClues.push('Habitat: inconnu');
      }

      if (speciesData.generation && speciesData.generation.name) {
        newClues.push(`Génération: ${speciesData.generation.name}`);
      } else {
        newClues.push('Génération: inconnu');
      }

      if (attack !== undefined) newClues.push(`Attaque: ${attack}`);
      if (spAttack !== undefined) newClues.push(`Attaque Spéciale: ${spAttack}`);
      if (defense !== undefined) newClues.push(`Défense: ${defense}`);
      if (spDefense !== undefined) newClues.push(`Défense Spéciale: ${spDefense}`);
      if (speed !== undefined) newClues.push(`Vitesse: ${speed}`);

      if (speciesData.color && speciesData.color.name) {
        newClues.push(`Couleur: ${speciesData.color.name}`);
      } else {
        newClues.push('Couleur: inconnu');
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
  }, [selectedGenerations]);

  useEffect(() => {
    fetchRandomPokemon();
    setTimeLeft(selectedTime);
  }, [fetchRandomPokemon, selectedTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealed || !pokemon || (enableTimer && timeLeft === 0)) return;
    const userGuess = guess.trim().toLowerCase();
    const correctAnswers = [pokemon.nameEn.toLowerCase(), pokemon.nameFr.toLowerCase()];
    if (correctAnswers.includes(userGuess)) {
      const usedClues = clueIndex;
      const earnedPoints = Math.max(10 - usedClues, 1);
      setPoints((prev) => prev + earnedPoints);
      setFeedback(`Bravo, bonne réponse ! (+${earnedPoints} points)`);
      setIsRevealed(true);
      setCorrectCount((prev) => prev + 1);
    } else {
      setFeedback('Mauvaise réponse, réessaie !');
    }
  };

  const handleGiveUp = () => {
    if (!pokemon || (enableTimer && timeLeft === 0)) return;
    setPoints((prev) => Math.max(prev - 3, 0));
    setFeedback(`La réponse était : ${pokemon.nameFr}. (-3 points)`);
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
          <h2 className="text-2xl font-bold mb-2">Devine le Pokémon !</h2>
          <p className="mb-2">
            Points : {points} | Pokémon trouvés : {correctCount}
          </p>
          {clues.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Indices révélés :</h3>
              <ul className="list-none p-0">
                {clues.slice(0, clueIndex + 1).map((clue, index) => (
                  <li key={index}>{clue}</li>
                ))}
              </ul>
            </div>
          )}
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
          {!isRevealed && (!enableTimer || (enableTimer && timeLeft > 0)) && (
            <button
              onClick={handleGiveUp}
              className="mb-4 p-2 border-2 border-blue-800 rounded hover:scale-105 transition-transform"
              disabled={enableTimer && timeLeft === 0}
            >
              Donner la réponse (-1 point)
            </button>
          )}
          {isRevealed && (!enableTimer || (enableTimer && timeLeft > 0)) && (
            <button
              onClick={handleNext}
              className="p-2 border-2 border-blue-800 rounded hover:scale-105 transition-transform"
              disabled={enableTimer && timeLeft === 0}
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

export default StatQuiz;
