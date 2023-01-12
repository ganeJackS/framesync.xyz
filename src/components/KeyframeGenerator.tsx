import React, { useRef } from "react";

import useAudioBufferStore from "../stores/audioBufferStore";
import useAudio2Keyframes from "../hooks/useAudio2Keyframes";

function KeyframeGenerator() {
  const fileInput = useRef<HTMLInputElement>(null);
  const audioElement = useRef<HTMLAudioElement>(null);
  const [audioBuffer, setAudioBuffer] = useAudioBufferStore((state) => [
    state.audioBuffer,
    state.setAudioBuffer,
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const arrayBuffer = fileReader.result as ArrayBuffer;
      const audioContext = new AudioContext();
      audioContext.decodeAudioData(
        arrayBuffer,
        (buffer: React.SetStateAction<AudioBuffer | null>) => {
          setAudioBuffer(buffer as AudioBuffer);
          audioElement.current!.src = URL.createObjectURL(file);
        }
      );
    };
    fileReader.readAsArrayBuffer(file);
  };

  //const keyframesString = keyframes.map((value, index) => ` ${index}: (${value.toFixed(2)})`);

  return (
    <div>
      <input type="file" ref={fileInput} onChange={handleFileUpload} />
      {/* <audio ref={audioElement} controls /> */}
    </div>
  );
}

export default KeyframeGenerator;
