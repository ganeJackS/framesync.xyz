import framesync from "../assets/framesync.svg";

const NavBar = () => {
  return (
    <>
   
    
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
