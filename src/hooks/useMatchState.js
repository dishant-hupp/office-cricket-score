import { useState, useEffect } from 'react';
import { 
  loadMatchConfig, 
  saveMatchConfig, 
  loadInningsState, 
  saveInningsState,
  clearMatchConfig,
  clearInningsState
} from '../utils/storage.js';
import { createEmptyMatchConfig, createEmptyInningsState } from '../utils/dataModel.js';

/**
 * Custom hook for managing match state with separate config and innings storage
 */
export function useMatchState() {
  const [matchConfig, setMatchConfig] = useState(null);
  const [inningsState, setInningsState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load match config and innings state on mount
  useEffect(() => {
    const savedConfig = loadMatchConfig();
    const savedInnings = loadInningsState();
    
    setMatchConfig(savedConfig || createEmptyMatchConfig());
    setInningsState(savedInnings || createEmptyInningsState());
    setLoading(false);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (matchConfig && !loading) {
      saveMatchConfig(matchConfig);
    }
  }, [matchConfig, loading]);

  useEffect(() => {
    if (inningsState && !loading) {
      saveInningsState(inningsState);
    }
  }, [inningsState, loading]);

  const updateMatchConfig = (updater) => {
    setMatchConfig(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return updater;
    });
  };

  const updateInningsState = (updater) => {
    setInningsState(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return updater;
    });
  };

  const resetMatch = () => {
    const newConfig = createEmptyMatchConfig();
    const newInnings = createEmptyInningsState();
    setMatchConfig(newConfig);
    setInningsState(newInnings);
    saveMatchConfig(newConfig);
    saveInningsState(newInnings);
  };

  // Helper to get combined state (for backward compatibility)
  const getCombinedState = () => {
    if (!matchConfig || !inningsState) return null;
    return {
      ...matchConfig,
      ...inningsState
    };
  };

  // Innings management functions
  const addInnings = (innings) => {
    updateInningsState(prev => ({
      ...prev,
      innings: [...prev.innings, innings],
      currentInningsIndex: prev.innings.length
    }));
  };

  const deleteInnings = (index) => {
    updateInningsState(prev => {
      const newInnings = prev.innings.filter((_, i) => i !== index);
      let newIndex = prev.currentInningsIndex;
      
      // Adjust current index if needed
      if (index === prev.currentInningsIndex) {
        newIndex = newInnings.length > 0 ? Math.min(index, newInnings.length - 1) : -1;
      } else if (index < prev.currentInningsIndex) {
        newIndex = prev.currentInningsIndex - 1;
      }
      
      return {
        innings: newInnings,
        currentInningsIndex: newIndex
      };
    });
  };

  const setCurrentInnings = (index) => {
    updateInningsState(prev => ({
      ...prev,
      currentInningsIndex: index
    }));
  };

  const updateInnings = (index, updatedInnings) => {
    updateInningsState(prev => {
      const newInnings = [...prev.innings];
      newInnings[index] = updatedInnings;
      return {
        ...prev,
        innings: newInnings
      };
    });
  };

  return {
    matchConfig,
    inningsState,
    updateMatchConfig,
    updateInningsState,
    resetMatch,
    getCombinedState,
    // Innings management
    addInnings,
    deleteInnings,
    setCurrentInnings,
    updateInnings,
    loading
  };
}
