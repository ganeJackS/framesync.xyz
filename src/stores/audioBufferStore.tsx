import create from 'zustand';

type State =  {
  audioBuffer: AudioBuffer | null;
}

type Actions = {
  setAudioBuffer: (buffer: AudioBuffer | null) => void;
}

const useAudioBufferStore = create<State & Actions>()(set => ({
  audioBuffer: null as AudioBuffer | null,
  setAudioBuffer: (audioBuffer: AudioBuffer | null) => { set(() => ( { audioBuffer: audioBuffer }))},

}));


export default useAudioBufferStore;