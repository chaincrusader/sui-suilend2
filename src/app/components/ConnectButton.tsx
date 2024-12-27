"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import { useEffect } from "react";

export function CustomConnectButton() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      [data-dapp-kit].Button_buttonVariants__x1s81q0 {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: background-color 0.15s !important;
        height: 2.5rem !important;
        border-radius: 0.375rem !important;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
        padding-top: 0.25rem !important;
        padding-bottom: 0.25rem !important;
        background-color: #2469ff !important;
        color: #91dcf4 !important;
        font-family: 'Supply', sans-serif !important;
        font-size: 0.875rem !important;
        font-weight: normal !important;
        text-transform: uppercase !important;
      }

      [data-dapp-kit].Button_buttonVariants__x1s81q0:hover {
        background-color: #1e54cc !important;
      }

      [data-dapp-kit].Button_buttonVariants__x1s81q0:focus-visible {
        outline: none !important;
        ring: 2px solid white !important;
        ring-offset: 2px !important;
      }

      [data-dapp-kit].Button_buttonVariants__x1s81q0:disabled {
        pointer-events: none !important;
        opacity: 0.5 !important;
      }

      [data-dapp-kit].Button_buttonVariants__x1s81q0 > .Text__2bv1ur0.Text_textVariants_weight_bold__2bv1ur4 {
        color: #91dcf4 !important;
        font-weight: normal !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <ConnectButton className="inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#2469ff] hover:bg-[#1e54cc] h-10 rounded-md px-4 py-1 font-supply-regular uppercase text-[#91dcf4] text-sm" />
  );
}
