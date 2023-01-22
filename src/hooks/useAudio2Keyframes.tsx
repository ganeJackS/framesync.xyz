import { useEffect, useState } from "react";

function useAudio2Keyframes(
  audioBuffer: AudioBuffer,
  frameRate: number,
  channelProcess: "mono" | "stereo" | "stereoNegative"
) {
  const [keyframes, setKeyframes] = useState<number[]>([]);

  useEffect(() => {
    if (!audioBuffer || !frameRate) return;

    const duration = audioBuffer.duration;
    const numFrames = duration * frameRate;
    const chunkSize = Math.floor(audioBuffer.length / numFrames);
    const chunkValues: number[] = [];

    for (let i = 0; i < numFrames; i++) {
      let chunkValue = 0;
      if (audioBuffer.numberOfChannels > 1) {
        if (channelProcess === "stereo") {
          for (let j = i * chunkSize; j < (i + 1) * chunkSize; j++) {
            chunkValue +=
              Math.abs(audioBuffer.getChannelData(0)[j]) +
              Math.abs(audioBuffer.getChannelData(1)[j]);
          }
        } else if (channelProcess === "stereoNegative") {
          for (let j = i * chunkSize; j < (i + 1) * chunkSize; j++) {
            const channel1Val = Math.abs(audioBuffer.getChannelData(0)[j]);
            const channel2Val = Math.abs(audioBuffer.getChannelData(1)[j]);
            if (channel1Val >= channel2Val) {
              chunkValue += channel1Val;
            } else {
              chunkValue -= channel2Val;
            }
          }
        }
      } else {
        for (let j = i * chunkSize; j < (i + 1) * chunkSize; j++) {
          chunkValue += Math.abs(audioBuffer.getChannelData(0)[j]);
        }
      }
      if (!chunkValue) {
        chunkValue = 0;
      }
      chunkValues.push(chunkValue);
    }

    const normalizedChunkValues = chunkValues.map(
      (value) => value / Math.max(...chunkValues.map(Math.abs))
    );

    setKeyframes(normalizedChunkValues);
  }, [audioBuffer, frameRate, channelProcess]);

  return keyframes;
}

export default useAudio2Keyframes;

// import { useEffect, useState } from "react";

// function useAudio2Keyframes(audioBuffer: AudioBuffer, frameRate: number) {
//   const [keyframes, setKeyframes] = useState<number[]>([]);

//   useEffect(() => {
//     if (!audioBuffer || !frameRate) return;

//     const duration = audioBuffer.duration;
//     const numFrames = duration * frameRate;
//     const chunkSize = Math.floor(audioBuffer.length / numFrames);
//     const chunkValues: number[] = [];

//     for (let i = 0; i < numFrames; i++) {
//       let chunkValue = 0;
//       for (let j = i * chunkSize; j < (i + 1) * chunkSize; j++) {
//         chunkValue += Math.abs(audioBuffer.getChannelData(0)[j]);
//       }
//       if (!chunkValue) {
//         chunkValue = 0;
//       }
//       chunkValues.push(chunkValue);
//     }

//     const normalizedChunkValues = chunkValues.map(
//       (value) => value / Math.max(...chunkValues)
//     );

//     setKeyframes(normalizedChunkValues);
//   }, [audioBuffer, frameRate]);

//   return keyframes;
// }

// export default useAudio2Keyframes;
