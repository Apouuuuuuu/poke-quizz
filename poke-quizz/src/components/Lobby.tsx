import React from 'react';

interface LobbyProps {
  setMode: (mode: 'lobby' | 'photo' | 'sound' | 'stat') => void;
}

const Lobby: React.FC<LobbyProps> = ({ setMode }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Bienvenue au Quiz Pokémon</h2>
      <h3>Choisissez le mode de jeu</h3>
      <button onClick={() => setMode('photo')} style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}>
        Mode Flou (Image)
      </button>
      <button onClick={() => setMode('sound')} style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}>
        Mode Sonore (Audio)
      </button>
      <button onClick={() => setMode('stat')} style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}>
        Mode Stat Quiz
      </button>
    </div>
  );
};

export default Lobby;
