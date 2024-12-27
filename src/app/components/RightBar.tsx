import Link from "next/link";
import Image from "next/image";
import { CustomConnectButton } from "./ConnectButton";

export default function RightBar() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow flex flex-col gap-4 mt-12 rounded-lg border border-secondary p-3 items-end justify-between">
        <CustomConnectButton />

        <h2 className="font-supply-regular text-xl uppercase text-2xl text-[hsl(194,82%,76%)]">
          Money market built on the best chain for developers.
        </h2>
        <div className="flex w-full flex-row justify-end gap-4">
          <a
            href="https://suilend.fi/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden"
          >
            <button className="inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#2469ff] hover:bg-[#1e54cc] h-10 rounded-md px-4 py-1">
              <p className="font-supply-regular uppercase text-[#91dcf4] text-sm">
                LAUNCH APP
              </p>
            </button>
          </a>
          <div className="flex flex-row gap-3">
            <a
              href="https://x.com/suilendprotocol"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary hover:bg-secondary/80 h-8 w-8 rounded-sm">
                <Image src="/x.png" alt="X" width={30} height={30} />
                <span className="sr-only">X</span>
              </button>
            </a>
            <a
              href="https://discord.com/invite/suilend"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary hover:bg-secondary/80 h-8 w-8 rounded-sm">
                <Image
                  src="/discord.png"
                  alt="Discord"
                  width={30}
                  height={30}
                />
                <span className="sr-only">Discord</span>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
