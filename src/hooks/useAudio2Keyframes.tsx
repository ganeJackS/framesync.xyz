import { useEffect, useState } from "react";

function useAudio2Keyframes(audioBuffer: AudioBuffer, frameRate: number, channelProcess: 'mono' | 'stereo' | 'stereoNegative' = 'mono') {
  const [keyframes, setKeyframes] = useState<number[]>([]);

  useEffect(() => {
    if (!audioBuffer || !frameRate) return;

    const duration = audioBuffer.duration;
    const numFrames = duration * frameRate;
    const chunkSize = Math.floor(audioBuffer.length / numFrames);
    let chunkValues: number[] = [];

    if (audioBuffer.numberOfChannels > 1) {
        if (channelProcess === 'stereo') {
            chunkValues = Array.from({ length: numFrames }, (_, i) => {
                const start = i * chunkSize;
                const end = start + chunkSize;
                return audioBuffer.getChannelData(0).slice(start, end).map(x => Math.abs(x)).reduce((acc, val) => acc + val) + audioBuffer.getChannelData(1).slice(start, end).map(x => Math.abs(x)).reduce((acc, val) => acc + val);
            });
        } else if (channelProcess === 'stereoNegative') {
          chunkValues = Array.from({ length: numFrames }, (_, i) => {
            const start = i * chunkSize;
            const end = start + chunkSize;
            const channel1Val = audioBuffer.getChannelData(0).slice(start, end).map(x => Math.abs(x)).reduce((acc, val) => acc + val);
            const channel2Val = audioBuffer.getChannelData(1).slice(start, end).map(x => Math.abs(x)).reduce((acc, val) => acc + val);
            return (channel1Val >= channel2Val) ? channel1Val : -channel2Val;
        });
    }
  } else {
      chunkValues = Array.from({ length: numFrames }, (_, i) => {
        const start = i * chunkSize;
        const end = start + chunkSize;
        return audioBuffer.getChannelData(0).slice(start, end).map(x => Math.abs(x)).reduce((acc, val) => acc + val);
      });
    }
    const normalizedChunkValues = chunkValues.map((value) => value / Math.max(...chunkValues.map(Math.abs)));
    setKeyframes(normalizedChunkValues);

    console.log('useAudio2Keyframes', normalizedChunkValues)
  }, [audioBuffer, frameRate, channelProcess]);

  return keyframes;
}

export default useAudio2Keyframes;