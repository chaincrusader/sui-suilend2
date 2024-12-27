import React from "react";

const TopBar: React.FC = () => {
  return (
    <div className="w-full bg-[#91dcf4] py-2 px-4 flex justify-center items-center fixed top-0 left-0 z-50">
      <div className="text-black text-xs sm:text-sm flex flex-col sm:flex-row items-center text-center sm:text-left">
        <span className="mb-1 sm:mb-0">
          Spring Staked SUI (sSUI) is now live on Suilend!
        </span>
        <span className="sm:ml-1">Deposit your sSUI now to earn rewards!</span>
        <a
          href="#"
          className="mt-2 sm:mt-0 sm:ml-4 font-bold relative inline-block"
        >
          <span className="relative">
            STAKE NOW
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black"></span>
          </span>
        </a>
      </div>
    </div>
  );
};

export default TopBar;
