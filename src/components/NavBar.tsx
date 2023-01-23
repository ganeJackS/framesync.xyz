import framesync from "../assets/framesync.svg";

const NavBar = () => {
  return (
    <>
    <span className="flex flex-row text-2xl font-mono text-white bg-gray-800 justify-center">Latest version now live on {" "}<a
    className="text-orange-500 pl-3"
    href="https://framesync.xyz" target={"_blank"}>{" "}https://framesync.xyz</a></span>
    
    <div className="flex flex-col justify-center  bg-darkest-blue pt-4 pl-6 pb-2">
      <div className="flex flex-row self-stretch bg-darkest-blue">
        <a href="#" className="mr-6 self-stretch text-4xl">
          <img src={framesync} alt="framesync logo" /> 
        </a>
        <div>
          <ul className="flex flex-row space-x-4">
            {/* <li className="text-orange-400 pt-1.5"><a href="#">Docs</a></li> */}
          </ul>
        </div>
      </div>
    </div>
    </>
  );
};

export default NavBar;
