"use client";
import React from "react";
import Image from "next/image";
import styles from "./TickerBar.module.css";

interface Ticker {
  symbol: string;
  apr: string;
  image: string;
}

const tickers: Ticker[] = [
  { symbol: "AUSD", apr: "5.93%", image: "/tickers/ausd.svg" },
  { symbol: "ETH", apr: "0.10%", image: "/tickers/eth.png" },
  { symbol: "SOL", apr: "5.67%", image: "/tickers/sol.png" },
  { symbol: "SUI", apr: "3.51%", image: "/tickers/sui.png" },
  { symbol: "USDC", apr: "0.01%", image: "/tickers/usdc.png" },
  { symbol: "USDT", apr: "0.20%", image: "/tickers/usdt.png" },
];

const TickerBar: React.FC = () => {
  const repeatedTickers = [...tickers, ...tickers, ...tickers, ...tickers];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#020918] overflow-hidden whitespace-nowrap z-50 border-t border-[hsl(221,44%,15%)] hidden md:block">
      <div className={styles.tickerWrap}>
        <div className={styles.ticker}>
          {repeatedTickers.map((ticker, index) => (
            <div key={index} className="inline-flex items-center px-12 py-4">
              <div className="flex items-center">
                <Image
                  src={ticker.image}
                  alt={ticker.symbol}
                  width={28}
                  height={28}
                  className="mr-3"
                />
                <span className="text-[#feffff] font-supply-bold text-md mr-2">
                  {ticker.symbol}
                </span>
                <span className="text-[#879ac4] font-supply-regular text-md">
                  {ticker.apr}
                </span>
                <span className="text-[#879ac4] font-supply-regular text-md ml-1">
                  APR
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TickerBar;
