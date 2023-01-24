import { useEffect, useState } from "react";

function useAudio2Keyframes(audioBuffer: AudioBuffer, frameRate: number) {
  const [keyframes, setKeyframes] = useState<number[]>([]);

  useEffect(() => {
    if (!audioBuffer || !frameRate) return;

    const duration = audioBuffer.duration;
    const numFrames = duration * frameRate;
    const chunkSize = Math.floor(audioBuffer.length / numFrames);
    const chunkValues = Array.from({ length: numFrames }, (_, i) =>
    audioBuffer
        .getChannelData(0)
        .slice(i * chunkSize, (i + 1) * chunkSize)
        .map(Math.abs)
        .reduce((acc, value) => acc + value, 0)
);


    const normalizedChunkValues = chunkValues.map(
      (value) => value / Math.max(...chunkValues)
    );

    setKeyframes(normalizedChunkValues);
  }, [audioBuffer, frameRate]);

  return keyframes;
}

export default useAudio2Keyframes;
