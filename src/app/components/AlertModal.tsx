// src/components/AlertModal.tsx
import { Fragment, useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";

export interface AlertModalProps {
  message: string;
  type: "success" | "error" | "info";
  isOpen: boolean;
  onClose: () => void;
}

export function AlertModal({
  message,
  type,
  isOpen,
  onClose,
}: AlertModalProps) {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    setShow(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-500/20"
      : type === "error"
      ? "bg-red-500/20"
      : "bg-blue-500/20";

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 flex items-end justify-center px-4 py-6 sm:items-start sm:p-6 z-50">
        <div
          className={`max-w-sm w-full shadow-lg rounded-[4px] pointer-events-auto ring-1 ring-white/15 overflow-hidden ${bgColor}`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-white">{message}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-transparent rounded-md inline-flex text-white/60 hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/50"
                  onClick={() => {
                    setShow(false);
                    onClose();
                  }}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
