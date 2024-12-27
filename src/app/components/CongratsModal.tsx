// sui-app/src/components/CongratsModal.tsx
import React from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useDisconnectWallet } from "@mysten/dapp-kit";
import Image from "next/image";

interface CongratsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  coinTicker: string;
}

export function CongratsModal({
  isOpen,
  onClose,
  totalAmount,
  coinTicker,
}: CongratsModalProps) {
  const { mutate: disconnect } = useDisconnectWallet();

  const handleDisconnectAndReconnect = () => {
    disconnect();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <div
                      className="absolute inset-0 border-4 border-green-500 rounded-full animate-pulse"
                      style={{ animationDuration: "2s" }}
                    ></div>
                    <div className="absolute inset-4">
                      <Image
                        src="/sui-logo.png"
                        alt="SUI Logo"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </div>

                  <DialogTitle
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900 mb-2"
                  >
                    Congratulations!
                  </DialogTitle>

                  <div className="mt-2 text-center">
                    <p className="text-lg text-gray-600 mb-4">
                      You have successfully claimed:
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4 mt-4">
                      <div className="flex items-center justify-center mt-2">
                        <Image
                          src="/coinlogo.png"
                          alt={`${coinTicker} Logo`}
                          width={32}
                          height={32}
                        />
                        <span className="text-3xl font-bold text-green-600 ml-2">
                          {totalAmount} {coinTicker}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 w-full">
                    {" "}
                    {/* Added w-full for full width */}
                    <p className="text-md text-gray-600 mb-4 text-center">
                      {" "}
                      {/* Added text-center */}
                      Would you like to check eligibility on other wallets?
                    </p>
                    <div className="flex justify-center">
                      {" "}
                      {/* New div for centering */}
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out transform hover:scale-105"
                        onClick={handleDisconnectAndReconnect}
                      >
                        Check Another Wallet
                      </button>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
