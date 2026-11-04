import { useState } from 'react';
import { Logo } from '../components/Logo';
import { Lobby } from '../pages/Lobby';
import { GameScreen } from '../pages/GameScreen';
import { getConfig } from './config';
import type { GameSetup, Screen } from './types';
import './App.css';

export function App() {
  const config = getConfig();
  const [screen, setScreen] = useState<Screen>('lobby');
  const [setup, setSetup] = useState<GameSetup | null>(null);

  function startGame(next: GameSetup) {
    setSetup(next);
    setScreen('game');
  }
  function exitToLobby() {
    setSetup(null);
    setScreen('lobby');
  }

  return (
    <div className="cb-app">
      <a className="cb-skip" href="#cb-main">Skip to game</a>
      <header className="cb-topbar">
        <button
          type="button"
          className="cb-topbar__brand"
          onClick={exitToLobby}
          aria-label="ChessBharat — back to opponent selection"
        >
          <Logo size={34} />
        </button>
        <span className="cb-topbar__tag">Play Chess Online vs Computer</span>
      </header>

      <main id="cb-main">
        {screen === 'lobby' && (
          <Lobby portraitsBase={config.portraitsBase} onStart={startGame} />
        )}
        {screen === 'game' && setup && (
          <GameScreen
            setup={setup}
            portraitsBase={config.portraitsBase}
            engineBase={config.engineBase}
            showCoordinatesDefault={config.showCoordinates}
            onExit={exitToLobby}
          />
        )}
      </main>
    </div>
  );
}
