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
    hardMax: number;
    hardMin: number;
    channelProcess: 'mono' | 'stereo' | 'stereoNegative';
  };
}

export type State = {
  factoryPresets: Settings["state"][];
  userPresets: Settings["state"][];
  settings: Settings["state"];
  locks: {
    lockDatumCount: boolean;
    lockTempo: boolean;
    lockFrameRate: boolean;
  };
};

export type Actions = {
  updateSetting: (name: keyof Settings["state"], value: any) => void;
  saveSetting: (saveName: string) => void;
  updateSettingFromList: ( id: number | string, isFactoryPreset: boolean) => void;
  deleteSetting: (id: number | string) => void;
  initializeSettings: () => void;
  updateLock: (name: keyof State["locks"], value: boolean) => void;
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
      hardMax: 100,
      hardMin: -100,
      channelProcess: "mono",
    },
    locks: {
      lockDatumCount: false,
      lockTempo: false,
      lockFrameRate: false,
    },
    factoryPresets: factory as unknown as Settings["state"][],
    userPresets: JSON.parse(localStorage.getItem(`settings_fs_list`) || "[]"),
    // initialize settings from factory.json and localStorage
    initializeSettings: () => {
      set(
        produce((draft) => {
          draft.userPresets = JSON.parse(
            localStorage.getItem(`settings_fs_list`) || "[]"
          );
          draft.factoryPresets = factory as unknown as Settings["state"][];
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

      // if lockDatumCount is true, keep the current datum count and don't update it from the preset, but update the rest of the settings
      // or if lockTempo is true, keep the current tempo and don't update it from the preset, but update the rest of the settings
      // or if lockFrameRate is true, keep the current frameRate and don't update it from the preset, but update the rest of the settings
      // if lockDatumCount, lockTempo, and lockFrameRate are all false, update all settings from the preset

      if (get().locks.lockDatumCount) {
        set(
          produce((draft) => {
            if (isFactoryPreset) {
              const selectedPreset = get().factoryPresets.find(
                (preset) => preset.saveId === id
              );
              draft.settings = {
                ...draft.settings,
                ...selectedPreset,
                datums: draft.settings.datums,
                tempo: draft.settings.tempo,
                frameRate: draft.settings.frameRate,
              };
            } else {
              const selectedPreset = get().userPresets.find(
                (preset) => preset.saveId === id
              );
              draft.settings = {
                ...draft.settings,
                ...selectedPreset,
                datums: draft.settings.datums,
                tempo: draft.settings.tempo,
                frameRate: draft.settings.frameRate,
              };
            }
          })
        );
      } else if (get().locks.lockTempo) {
        set(
          produce((draft) => {
            if (isFactoryPreset) {
              const selectedPreset = get().factoryPresets.find(
                (preset) => preset.saveId === id
              );
              draft.settings = {
                ...draft.settings,
                ...selectedPreset,
                datums: draft.settings.datums,
                tempo: draft.settings.tempo,
                frameRate: draft.settings.frameRate,
              };
            } else {
              const selectedPreset = get().userPresets.find(
                (preset) => preset.saveId === id
              );
              draft.settings = {
                ...draft.settings,
                ...selectedPreset,
                datums: draft.settings.datums,
                tempo: draft.settings.tempo,
                frameRate: draft.settings.frameRate,
              };
            }
          })
        );
      } else if (get().locks.lockFrameRate) {
        set(
          produce((draft) => {
            if (isFactoryPreset) {
              const selectedPreset = get().factoryPresets.find(
                (preset) => preset.saveId === id
              );
              draft.settings = {
                ...draft.settings,
                ...selectedPreset,
                datums: draft.settings.datums,
                tempo: draft.settings.tempo,
                frameRate: draft.settings.frameRate,
              };
            } else {
              const selectedPreset = get().userPresets.find(
                (preset) => preset.saveId === id
              );
              draft.settings = {
                ...draft.settings,
                ...selectedPreset,
                datums: draft.settings.datums,
                tempo: draft.settings.tempo,
                frameRate: draft.settings.frameRate,
              };
            }
          })
        );
      } else {
        set(
          produce((draft) => {
            if (isFactoryPreset) {
              const selectedPreset = get().factoryPresets.find(
                (preset) => preset.saveId === id
              );
              draft.settings = {
                ...draft.settings,
                ...selectedPreset,
              };
            }
            if (!isFactoryPreset) {
              const selectedPreset = get().userPresets.find(
                (preset) => preset.saveId === id
              );
              draft.settings = {
                ...draft.settings,
                ...selectedPreset,
              };
            }
          })
        );
      }
          


      // if (get().settings.lockDatumCount) {
      //   set(
      //     produce((draft) => {
      //       if (isFactoryPreset) {
      //         const selectedPreset = get().factoryPresets.find(
      //           (preset) => preset.saveId === id
      //         );
      //         draft.settings = {
      //           ...draft.settings,
      //           ...selectedPreset,
      //           datums: draft.settings.datums,
      //           tempo: draft.settings.tempo,
      //           frameRate: draft.settings.frameRate,
      //         };
      //       } else {
      //         const selectedPreset = get().userPresets.find(
      //           (preset) => preset.saveId === id
      //         );
      //         draft.settings = {
      //           ...draft.settings,
      //           ...selectedPreset,
      //           datums: draft.settings.datums,
      //           tempo: draft.settings.tempo,
      //           frameRate: draft.settings.frameRate,
      //         };
      //       }
      //     })
      //   );
      // } else if (get().settings.lockTempo) {
      //   set(
      //     produce((draft) => {
      //       if (isFactoryPreset) {
      //         const selectedPreset = get().factoryPresets.find(
      //           (preset) => preset.saveId === id
      //         );
      //         draft.settings = {
      //           ...draft.settings,
      //           ...selectedPreset,
      //           datums: draft.settings.datums,
      //           tempo: draft.settings.tempo,
      //           frameRate: draft.settings.frameRate,
      //         };
      //       } else {
      //         const selectedPreset = get().userPresets.find(
      //           (preset) => preset.saveId === id
      //         );
      //         draft.settings = {
      //           ...draft.settings,
      //           ...selectedPreset,
      //           datums: draft.settings.datums,
      //           tempo: draft.settings.tempo,
      //           frameRate: draft.settings.frameRate,
      //         };
      //       }
      //     })
      //   );
      // }
      // else if (get().settings.lockFrameRate) {
      //   set(
      //     produce((draft) => {
      //       if (isFactoryPreset) {
      //         const selectedPreset = get().factoryPresets.find(
      //           (preset) => preset.saveId === id
      //         );
      //         draft.settings = {
      //           ...draft.settings,
      //           ...selectedPreset,
      //           datums: draft.settings.datums,
      //           tempo: draft.settings.tempo,
      //           frameRate: draft.settings.frameRate,
      //         };
      //       } else {
      //         const selectedPreset = get().userPresets.find(
      //           (preset) => preset.saveId === id
      //         );
      //         draft.settings = {
      //           ...draft.settings,
      //           ...selectedPreset,
      //           datums: draft.settings.datums,
      //           tempo: draft.settings.tempo,
      //           frameRate: draft.settings.frameRate,
      //         };
      //       }
      //     })
      //   );
      // }
      // else {
      //   set(
      //     produce((draft) => {
      //       if (isFactoryPreset) {
      //         const selectedPreset = get().factoryPresets.find(
      //           (preset) => preset.saveId === id
      //         );
      //         draft.settings = {
      //           ...draft.settings,
      //           ...selectedPreset,
      //         };
      //       } else {
      //         const selectedPreset = get().userPresets.find(
      //           (preset) => preset.saveId === id
      //         );
      //         draft.settings = {
      //           ...draft.settings,
      //           ...selectedPreset,
      //         };
      //       }
      //     })
      //   );
      // }
    },
    // update lock
    updateLock: (lock: string) => {
      set(
        produce((draft) => {
          draft.locks[lock] = !draft.locks[lock];
        })
      );
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
