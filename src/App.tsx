import StressTest from "./components/StressTest";
import NavBar from "./components/NavBar";
import "./index.css";

// const components = [["Stress Test", StressTest]];

export default function App() {
  
  return (
    <div>
      <NavBar />
      <StressTest />
      {/* {components.map(([label, Comp]) => {
        return (
          <div key={label + ""}>
            <div>
              <Comp />
            </div>
          </div>
        );
      })} */}
      
    </div>
  );
}
