import StressTest from "./components/StressTest";
import "./index.css";



const components = [["Stress Test", StressTest]];



export default function App() {
  return (
    <div>
      {/* <NavigationBar /> */}
      {components.map(([label, Comp]) => {
        return (
          <div key={label + ""}>
            <div>
              <Comp />
            </div>
          </div>
        );
      })}
      <div style={{ height: "50rem" }} />
    </div>
  );
}

