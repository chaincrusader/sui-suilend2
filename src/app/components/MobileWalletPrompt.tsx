// sui-app/src/components/MobileWalletPrompt.tsx
import React, { useState, useEffect } from "react";
import {
  FaCopy,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaTimes,
} from "react-icons/fa";

const MobileWalletPrompt: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white/10 backdrop-blur-md text-white p-6 shadow-lg z-[9999]">
      <div className="max-w-md mx-auto relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 p-2 text-white hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <FaTimes className="text-xl" />
        </button>
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <FaExternalLinkAlt className="mr-2" />
          Open in Sui Wallet
        </h3>
        <p className="text-sm mb-4 leading-relaxed opacity-80">
          Please open this website in your Sui wallet's in-app browser
        </p>
        <button
          onClick={copyUrl}
          className="w-full bg-white/20 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center transition duration-300 ease-in-out transform hover:bg-white/30 hover:scale-105 border border-white/30"
        >
          {copied ? (
            <>
              <FaCheckCircle className="mr-2" /> URL Copied!
            </>
          ) : (
            <>
              <FaCopy className="mr-2" /> Copy URL
            </>
          )}
        </button>
      </div>
    </div>
  );
};
//test
export default MobileWalletPrompt;
