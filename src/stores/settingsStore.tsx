import create from "zustand";
import { produce } from "immer";
import { immer } from "zustand/middleware/immer";
import factory from "../presets/factory.json";

export interface Settings {
  state: {
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
    decimalPrecision: number;
  };
}

export type State = {
  factoryPresets: Settings["state"][];
  userPresets: Settings["state"][];
  settings: Settings["state"];
};

export type Actions = {
  updateSetting: (name: keyof Settings["state"], value: any) => void;
  saveSetting: (saveName: string) => void;
  updateSettingFromList: ( id: number | string, isFactoryPreset: boolean) => void;
  deleteSetting: (id: number | string) => void;
  initializeSettings: () => void;
};

export const useSettingsStore = create(
  immer<State & Actions>((set, get) => ({
    settings: {
      saveName: "Cosine",
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
      modAmp: 1.0,
      modToggleSinCos: "cos",
      modTempo: 120,
      modRhythmRate: 1920,
      modFrameRate: 24,
      modRate: 60,
      modBend: 1,
      modMoveLeftRight: 0,
      modMoveUpDown: 0,
      keyframes: [],
      decimalPrecision: 2,
    },
    factoryPresets: factory as Settings["state"][],
    userPresets: JSON.parse(localStorage.getItem(`settings_fs_list`) || "[]"),
    // initialize settings from factory.json and localStorage
    initializeSettings: () => {
      set(
        produce((draft) => {
          draft.userPresets = JSON.parse(
            localStorage.getItem(`settings_fs_list`) || "[]"
          );
          draft.factoryPresets = factory as Settings["state"][];
        })
      );
    },
    // update current settings
    updateSetting: (name: keyof Settings["state"], value: any) => {
      set(
        produce((draft) => {
          draft.settings[name] = value;
        })
      );
    },
    // save current settings as a new preset with a unique id and user inputted name
    saveSetting: (saveName: string) => {
      const newId = Date.now();
      set(
        produce((draft) => {
          draft.settings.saveName = saveName;
          draft.settings.saveId = newId;
          draft.userPresets.push({ ...draft.settings, saveId: newId });
        })
      );
      localStorage.setItem(
        `settings_fs_list`,
        JSON.stringify(get().userPresets)
      );
    },
    // update current settings from factory or user presets
    updateSettingFromList: (id: number | string, isFactoryPreset: boolean) => {
      if (isFactoryPreset) {
        const selectedPreset = get().factoryPresets.find(
          (preset) => preset.saveId === id
        );
        set(
          produce((draft) => {
            draft.settings = selectedPreset;
          })
        );
      } else {
        const selectedPreset = get().userPresets.find(
          (preset) => preset.saveId === id
        );
        set(
          produce((draft) => {
            draft.settings = selectedPreset;
          })
        );
      }
    },
    // delete user preset from userPresets and localStorage
    deleteSetting: (id: number | string) => {
      set(
        produce((draft) => {
          const index = draft.userPresets.findIndex((setting: { saveId: string | number; }) => setting.saveId === id);
          draft.userPresets.splice(index, 1);
          if (draft.settings.saveId === id) {
            draft.settings = draft.factoryPresets[0];
          }
        })
      );
      // remove from local storage
      localStorage.setItem(`settings_fs_list`, JSON.stringify(get().userPresets));
    },
  }))
);
