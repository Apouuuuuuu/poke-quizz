import React from 'react';
import { FaGithub } from 'react-icons/fa';

const GitHubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const Icon = FaGithub as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
  return <Icon {...props} />;
};

const Footer: React.FC = () => {
  return (
    <footer className="text-white p-2 flex items-center justify-center">
      <a
        href="https://github.com/Apouuuuuuu/poke-quizz"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
      >
        <span className="text-sm sm:text-base">
          Made by <strong>Apou</strong>
        </span>
        <GitHubIcon className="w-5 h-5 fill-current" />
      </a>
    </footer>
  );
};

export default Footer;
