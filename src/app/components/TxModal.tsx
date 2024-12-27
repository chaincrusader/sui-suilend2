// src/components/TxModal.tsx
import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import Image from "next/image";

export interface TxModalProps {
  isOpen: boolean;
  onClose: () => void;
  humanReadableAmount: number;
  coinTicker: string;
  message: string;
}

export function TxModal({
  isOpen,
  onClose,
  humanReadableAmount,
  coinTicker,
  message,
}: TxModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
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
              as={Fragment}
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
                      className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin"
                      style={{ borderTopColor: "transparent" }}
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
                    className="text-lg font-semibold leading-6 text-gray-900 mb-2"
                  >
                    {message}
                  </DialogTitle>

                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Please confirm the transaction in your wallet
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4 mt-4">
                      <p className="text-lg font-bold text-gray-800">
                        You will receive:
                      </p>
                      <div className="flex items-center justify-center mt-2">
                        <Image
                          src="/coinlogo.png"
                          alt={`${coinTicker} Logo`}
                          width={24}
                          height={24}
                        />
                        <span className="text-2xl font-bold text-blue-600 ml-2">
                          {humanReadableAmount} {coinTicker}
                        </span>
                      </div>
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
