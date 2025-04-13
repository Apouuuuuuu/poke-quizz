import React from 'react';
import { FaGithub } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white p-4 flex items-center justify-center">
      <a
        href="https://github.com/Apouuuuuuu/poke-quizz"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
      >
        <span className="text-sm sm:text-base">
          Réalisé par <strong>Théo Gagelin</strong>
        </span>

        {React.createElement(FaGithub as any, {
          className: 'w-5 h-5 fill-current',
        })}
      </a>
    </footer>
  );
};

export default Footer;
