import create from "zustand";
import { produce } from "immer";
import { immer } from "zustand/middleware/immer";

export interface Settings {
  state: {
    saveName?: string;
    saveId?: number;
    datums: number;
    tempo: number;
    rhythmRate: number;
    frameRate: number;
    amplitude: number;
    upDownOffset: number;
    leftRightOffset: number;
    waveType: string;
    bend: number;
    toggleSinCos: string;
    linkFrameOffset: boolean;
    noiseAmount: number;
    modEnabled: boolean;
    modAmp: number;
    modToggleSinCos: string;
    modTempo: number;
    modRhythmRate: number;
    modFrameRate: number;
    modRate: number;
    modBend: number;
    modMoveLeftRight: number;
    modMoveUpDown: number;
    keyframes: any[];
  };
}


export type State = {
  settingsState: Settings["state"];
};

export type Actions = {
  updateSetting: (name: string, value: any) => void;
};

export const useSettingsStore = create(
  immer<State & Actions>((set, get) => ({
    settingsState: {
      saveName: "default",
      saveId: 0,
      datums: 120,
      tempo: 120,
      rhythmRate: 60,
      frameRate: 24,
      amplitude: 1,
      upDownOffset: 0,
      leftRightOffset: 0,
      waveType: "sinusoid",
      bend: 1,
      toggleSinCos: "cos",
      linkFrameOffset: false,
      noiseAmount: 0,
      modEnabled: false,
      modAmp: 1,
      modToggleSinCos: "cos",
      modTempo: 120,
      modRhythmRate: 60,
      modFrameRate: 24,
      modRate: 60,
      modBend: 1,
      modMoveLeftRight: 0,
      modMoveUpDown: 0,
      keyframes: [],
    },
    updateSetting: (name, value) => {
      set(
        produce((draft) => {
          draft.settingsState[name] = value;
        }),
      );
    },
  }))
);





