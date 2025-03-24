import React, { useState, useEffect, useRef } from 'react';

interface PokemonData {
  nameEn: string;
  nameFr: string;
}

interface StatQuizProps {
  onReturn: () => void;
}

const StatQuiz: React.FC<StatQuizProps> = ({ onReturn }) => {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [clues, setClues] = useState<string[]>([]);
  const [clueCount, setClueCount] = useState<number>(1);
  const [guess, setGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameStarted, timeLeft]);

  useEffect(() => {
    if (gameStarted && timeLeft === 0) {
      setFeedback(`Temps écoulé ! Vous avez accumulé ${points} points.`);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [timeLeft, gameStarted, points]);

  const fetchRandomPokemon = async () => {
    try {
      setFeedback('');
      setIsRevealed(false);
      setGuess('');
      setClueCount(1);
      const totalPokemon = 3; 
      const randomId = Math.floor(Math.random() * totalPokemon) + 1;
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
      const nameEn = speciesData.names.find((n: any) => n.language.name === 'en')?.name || data.name;
      const nameFr = speciesData.names.find((n: any) => n.language.name === 'fr')?.name || data.name;
      setPokemon({ nameEn, nameFr });
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
    if (isRevealed || !pokemon || timeLeft === 0) return;
    const userGuess = guess.trim().toLowerCase();
    const correctAnswers = [pokemon.nameEn.toLowerCase(), pokemon.nameFr.toLowerCase()];
    if (correctAnswers.includes(userGuess)) {
      const additionalCluesUsed = clueCount - 1;
      const earnedPoints = Math.max(10 - additionalCluesUsed, 1);
      setPoints(points + earnedPoints);
      setFeedback(`Bravo, bonne réponse ! Vous gagnez ${earnedPoints} points.`);
      setIsRevealed(true);
    } else {
      setFeedback('Mauvaise réponse, réessaie !');
    }
  };

  const handleGiveUp = () => {
    if (!pokemon || timeLeft === 0) return;
    setPoints(Math.max(points - 3, 0));
    setFeedback(`La réponse était : ${pokemon.nameFr} / ${pokemon.nameEn}. (-3 points)`);
    setIsRevealed(true);
  };

  const handleNext = () => {
    if (timeLeft === 0) return;
    fetchRandomPokemon();
  };

  const revealAdditionalClue = () => {
    if (clueCount < clues.length) {
      setClueCount(clueCount + 1);
    }
  };

  if (!gameStarted) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>Mode Stat Quiz avec Chrono</h2>
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
        <button
          onClick={() => {
            setGameStarted(true);
            setTimeLeft(selectedTime);
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
      <h2>Mode Stat Quiz avec Chrono</h2>
      <p>Temps restant : {timeLeft} secondes</p>
      <p>Points : {points}</p>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Indices révélés :</strong>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {clues.slice(0, clueCount).map((clue, index) => (
            <li key={index}>{clue}</li>
          ))}
        </ul>
      </div>
      {!isRevealed && timeLeft > 0 && clueCount < clues.length && (
        <button onClick={revealAdditionalClue} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}>
          Obtenir un indice supplémentaire
        </button>
      )}
      {timeLeft > 0 && (
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
      )}
      <p>{feedback}</p>
      {!isRevealed && timeLeft > 0 && (
        <button onClick={handleGiveUp} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}>
          Donner la réponse (-3 points)
        </button>
      )}
      {isRevealed && timeLeft > 0 && (
        <button onClick={handleNext} style={{ padding: '0.5rem 1rem' }}>
          Pokémon Suivant
        </button>
      )}
    </div>
  );
};

export default StatQuiz;
