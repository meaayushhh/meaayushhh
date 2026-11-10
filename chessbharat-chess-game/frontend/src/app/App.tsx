import { useCallback, useState } from 'react';
import { Logo } from '../components/Logo';
import { Intro } from '../pages/Intro';
import { Roster } from '../pages/Roster';
import { Versus } from '../pages/Versus';
import { GameScreen } from '../pages/GameScreen';
import { getConfig } from './config';
import type { GameSetup, Screen } from './types';
import type { Opponent } from '../opponents/types';
import './App.css';

export function App() {
  const config = getConfig();
  const [screen, setScreen] = useState<Screen>('intro');
  const [chosen, setChosen] = useState<Opponent | null>(null);
  const [setup, setSetup] = useState<GameSetup | null>(null);

  const toRoster = useCallback(() => {
    setSetup(null);
    setScreen('roster');
  }, []);

  const toIntro = useCallback(() => {
    setSetup(null);
    setChosen(null);
    setScreen('intro');
  }, []);

  const onFoeChosen = useCallback((o: Opponent) => {
    setChosen(o);
    setScreen('versus');
  }, []);

  const onFight = useCallback((next: GameSetup) => {
    setSetup(next);
    setScreen('game');
  }, []);

  return (
    <div className="cb-app">
      <a className="cb-skip" href="#cb-main">Skip to game</a>
      <header className="cb-topbar">
        <button
          type="button"
          className="cb-topbar__brand"
          onClick={toIntro}
          aria-label="ChessBharat, back to the title screen"
        >
          <Logo size={34} />
        </button>
        <span className="cb-topbar__tag">Play Chess Online vs Computer</span>
      </header>

      <main id="cb-main">
        {screen === 'intro' && <Intro onContinue={() => setScreen('roster')} />}

        {screen === 'roster' && (
          <Roster portraitsBase={config.portraitsBase} onSelect={onFoeChosen} />
        )}

        {screen === 'versus' && chosen && (
          <Versus
            opponent={chosen}
            portraitsBase={config.portraitsBase}
            onBack={toRoster}
            onFight={onFight}
          />
        )}

        {screen === 'game' && setup && (
          <GameScreen
            setup={setup}
            portraitsBase={config.portraitsBase}
            engineBase={config.engineBase}
            showCoordinatesDefault={config.showCoordinates}
            onExit={toRoster}
          />
        )}
      </main>
    </div>
  );
}
