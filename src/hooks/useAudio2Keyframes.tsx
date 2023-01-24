import { useEffect, useState } from "react";

function useAudio2Keyframes(audioBuffer: AudioBuffer, frameRate: number) {
  const [keyframes, setKeyframes] = useState<number[]>([]);

  useEffect(() => {
    if (!audioBuffer || !frameRate) return;

      console.log(audioBuffer);
      console.log(frameRate);

    const duration = audioBuffer.duration;
    const numFrames = duration * frameRate;
    const chunkSize = Math.floor(audioBuffer.length / numFrames);
    const chunkValues: number[] = [];

    // for (let i = 0; i < numFrames; i++) {
    //   let chunkValue = 0;
    //   for (let j = i * chunkSize; j < (i + 1) * chunkSize; j++) {
    //     chunkValue += Math.abs(audioBuffer.getChannelData(0)[j]);
    //   }
    //   if (!chunkValue) {
    //     chunkValue = 0;
    //   }
    //   chunkValues.push(chunkValue);
    // }
    console.log("chunkValues", chunkValues)
    // const normalizedChunkValues = chunkValues.map(
    //   (value) => value / Math.max(...chunkValues)
    // );
    // console.log("normalizedChunkValues", normalizedChunkValues)

    setKeyframes(chunkValues);
  }, [audioBuffer, frameRate]);
  
  console.log("audio2keyframes", keyframes)
  return keyframes;
  
}

export default useAudio2Keyframes;
