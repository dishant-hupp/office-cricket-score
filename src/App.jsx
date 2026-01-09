import { useState } from 'react';
import { useMatchState } from './hooks/useMatchState.js';
import { MatchSetup } from './components/MatchSetup.jsx';
import { Toss } from './components/Toss.jsx';
import { Innings } from './components/Innings.jsx';
import { InningsManager } from './components/InningsManager.jsx';
import { Result } from './components/Result.jsx';
import { Footer } from './components/Footer.jsx';

function App() {
  const {
    matchConfig,
    inningsState,
    updateMatchConfig,
    updateInningsState,
    resetMatch,
    addInnings,
    deleteInnings,
    setCurrentInnings,
    updateInnings,
    loading
  } = useMatchState();

  const [view, setView] = useState('manager'); // 'manager', 'setup', 'toss', 'innings', 'result'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!matchConfig || !inningsState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Error loading match state</div>
      </div>
    );
  }

  // Get combined state for components that need it
  const getCombinedState = () => ({
    ...matchConfig,
    ...inningsState,
    status: view === 'setup' ? 'setup' : 
            view === 'toss' ? 'toss' :
            view === 'innings' ? 'team1_batting' : 'completed'
  });

  const updateMatchState = (updater) => {
    if (typeof updater === 'function') {
      const current = getCombinedState();
      const updated = updater(current);
      updateMatchConfig(prev => {
        const { teams, config, toss, matchId } = updated;
        return { teams, config, toss, matchId };
      });
      updateInningsState(prev => {
        const { innings, currentInningsIndex } = updated;
        return { innings, currentInningsIndex };
      });
    } else {
      updateMatchConfig(prev => {
        const { teams, config, toss, matchId } = updater;
        return { teams, config, toss, matchId };
      });
      updateInningsState(prev => {
        const { innings, currentInningsIndex } = updater;
        return { innings, currentInningsIndex };
      });
    }
  };

  // Route based on view
  if (view === 'manager') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Cricket Score Tracker</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView('setup')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Match Setup
            </button>
            <button
              onClick={() => setView('toss')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Toss
            </button>
          </div>
        </div>
        <InningsManager
          matchConfig={matchConfig}
          inningsState={inningsState}
          onAddInnings={addInnings}
          onDeleteInnings={deleteInnings}
          onSelectInnings={(index) => {
            setCurrentInnings(index);
            setView('innings');
          }}
        />
      </div>
    );
  }

  if (view === 'setup') {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <MatchSetup 
            matchState={getCombinedState()} 
            updateMatchState={updateMatchState}
            onBack={() => setView('manager')}
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (view === 'toss') {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Toss 
            matchState={getCombinedState()} 
            updateMatchState={updateMatchState}
            onBack={() => setView('manager')}
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (view === 'innings') {
    const currentInnings = inningsState.innings[inningsState.currentInningsIndex];
    if (!currentInnings) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-xl mb-4">No innings selected</p>
            <button
              onClick={() => setView('manager')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Manager
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col">
        <div className="container mx-auto px-4 py-2 bg-gray-100">
          <button
            onClick={() => setView('manager')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Back to Innings Manager
          </button>
        </div>
        <div className="flex-1">
          <Innings 
            matchConfig={matchConfig}
            inningsState={inningsState}
            updateInnings={updateInnings}
            currentInningsIndex={inningsState.currentInningsIndex}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return null;
}

export default App;
