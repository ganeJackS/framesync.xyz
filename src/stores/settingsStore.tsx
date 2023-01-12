import create from "zustand";
import { produce } from "immer";
import { immer } from "zustand/middleware/immer";

export interface Settings {
  state: {
    [key: string]: any,
    saveName: string;
    saveId: number | string;
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
  settingsList: Settings["state"][];
  settings: Settings["state"];
};

export type Actions = {
  updateSetting: (name: keyof Settings["state"], value: any) => void;
  saveSetting: () => void;
  updateSettingFromList: (id: number | string) => void;
};

export const useSettingsStore = create(
  immer<State & Actions>((set, get) => ({
    settings: {
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
    settingsList: [],
    updateSetting: (name: keyof Settings["state"], value: any) => {
      set(
        produce((draft) => {
          draft.settings[name] = value;
        })
      );
    },
    saveSetting: () => {
      const id = Date.now().toString();
      set(
        produce((draft) => {
          draft.settings.saveId = id;
          draft.settingsList.push(draft.settings);
        })
      );
      get().settings.saveId;
      localStorage.setItem(
        `settings_fs_list`,
        JSON.stringify(get().settingsList)
      );
    },
    updateSettingFromList: (id: number | string) => {
      const settings = get().settingsList.find(
        (setting) => setting.saveId === id
      );
      if (settings) {
        Object.keys(settings).forEach(key => {
          if (get().settings[key] !== settings[key]) {
            set(
              produce((draft) => {
                draft.settings[key] = settings[key];
              })
            );
          }
        });
      }
    },
  }))
);
