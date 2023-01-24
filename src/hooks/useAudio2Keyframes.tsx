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

import { useEffect, useState } from "react";

function useAudio2Keyframes(
  audioBuffer: AudioBuffer,
  frameRate: number,
  channelProcess: "mono" | "stereo" | "stereoNegative" = "mono"
) {
  const [keyframes, setKeyframes] = useState<number[]>([]);

  useEffect(() => {
    if (!audioBuffer || !frameRate) return;

    const duration = audioBuffer.duration;
    const numFrames = duration * frameRate;
    const chunkSize = Math.floor(audioBuffer.length / numFrames);
    let chunkValues: number[] = [];

    if (audioBuffer.numberOfChannels > 1) {
      if (channelProcess === "stereo") {
        chunkValues = Array.from({ length: numFrames }, (_, i) => {
          const start = i * chunkSize;
          const end = start + chunkSize;

          let channel1Val = audioBuffer
            .getChannelData(0)
            .slice(start, end)
            .map((x) => Math.abs(x))
            .reduce((acc, val) => acc + val);

          let channel2Val = audioBuffer
            .getChannelData(1)
            .slice(start, end)
            .map((x) => Math.abs(x))
            .reduce((acc, val) => acc + val);

          console.log("sum: ", channel1Val + channel2Val);

          return channel1Val + channel2Val;
        });
      } else if (channelProcess === "stereoNegative") {
        chunkValues = Array.from({ length: numFrames }, (_, i) => {
          const start = i * chunkSize;
          const end = start + chunkSize;
          const channel1Val = audioBuffer
            .getChannelData(0)
            .slice(start, end)
            .map((x) => Math.abs(x))
            .reduce((acc, val) => acc + val);
          const channel2Val = audioBuffer
            .getChannelData(1)
            .slice(start, end)
            .map((x) => Math.abs(x))
            .reduce((acc, val) => acc + val);
          return channel1Val >= channel2Val ? channel1Val : -channel2Val;
        });
      }
    } else {
      chunkValues = Array.from({ length: numFrames }, (_, i) => {
        const start = i * chunkSize;
        const end = start + chunkSize;
        return audioBuffer
          .getChannelData(0)
          .slice(start, end)
          .map((x) => Math.abs(x))
          .reduce((acc, val) => acc + val);
      });
    }
    const normalizedChunkValues = chunkValues.map(
      (value) => value / Math.max(...chunkValues.map(Math.abs))
    );
    setKeyframes(normalizedChunkValues);
  }, [audioBuffer, frameRate, channelProcess]);

  return keyframes;
}

export default useAudio2Keyframes;
