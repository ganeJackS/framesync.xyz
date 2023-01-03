import StressTest from "./components/StressTest";
import NavBar from "./components/NavBar";
import "./index.css";

//import Provider from 'zustand';
//import { useAudioBufferStore } from './audioBufferStore';

export default function App() {
  return (
    <>
      <NavBar />
      <StressTest />
    </>
  );
}
