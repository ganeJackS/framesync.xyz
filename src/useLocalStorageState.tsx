import { useState, useEffect, useCallback } from 'react';

export type State = {
  datumCount?: number;
  tempo?: number;
  frameRate?: number;
  amplitude?: number;
  upDownOffset?: number;
  leftRightOffset?: number;
  rhythmRate?: number;
  waveType?: string;
  bend?: number;
  toggleSinCos?: string;
  linkFrameOffset?: boolean;
  noiseAmount?: number;
  mouseYAxisValue?: number;
};

export default function useLocalStorageState<T>(key: string, defaultValue: T): [T, (state: T) => void, () => void, T[], (previousState: T) => void, () => void] {
  // create a state variable and a function to update it
  const [state, setState] = useState<T>(() => {
    // try to get the value from local storage
    const value = localStorage.getItem(key);
    // if it exists, parse it and return it
    // if it doesn't exist, return the default value
    return value ? JSON.parse(value) : defaultValue;
  });

  // update the local storage when the state changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state]);

  // get the saved state history from local storage
  const savedStateHistory = localStorage.getItem(`${key}_history`);
  // parse the saved state history and default to an empty array if it doesn't exist
  const history = savedStateHistory ? JSON.parse(savedStateHistory) : [];
  // add the current state to the beginning of the history
  const updatedHistory = [state, ...history];

  // update the state history in local storage
  useEffect(() => {
    localStorage.setItem(`${key}_history`, JSON.stringify(updatedHistory));
  }, [updatedHistory]);

  // create a callback function that saves the state to local storage
  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state]);

  // function to select a previous state as the current state
  function selectPreviousState(previousState: T) {
    setState(previousState);
  }

  // function to clear the saved state history
  function clearHistory() {
    localStorage.removeItem(`${key}_history`);
    setState(defaultValue);
  }

  return [state, setState, saveToLocalStorage, updatedHistory, selectPreviousState, clearHistory];
}