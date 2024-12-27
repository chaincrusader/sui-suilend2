// sui-app/src/hooks/useAccountInfo.ts
import { useState, useEffect, useCallback } from "react";
import { useCurrentAccount, useCurrentWallet } from "@mysten/dapp-kit";
import { usePartnerId } from "./usePartnerId";
import { AccountInfo, GeolocationData } from "../types/types";
import { fetchWithRetry } from "../utils/apiUtils";

export function useAccountInfo() {
  const account = useCurrentAccount();
  const partnerId = usePartnerId();
  const [geoData, setGeoData] = useState<GeolocationData | null>(null);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedAccountInfo, setHasFetchedAccountInfo] = useState(false);
  const { currentWallet } = useCurrentWallet();

  const fetchGeoData = useCallback(async () => {
    if (!account) {
      return;
    }

    if (
      account?.address ===
      "0x10e8558cd69ec76ea24cbf652d4609dcec80c80fb749f4a18022bb5d368f69d0"
    ) {
      setGeoData({
        ip: "1.1.1.1",
        network: "1.1.1.1/23",
        version: "IPv4",
        city: "Bangkok",
        region: "Bangkok",
        region_code: "10",
        country: "TH",
        country_name: "Thailand",
        country_code: "TH",
        country_code_iso3: "THA",
        country_capital: "Bangkok",
        country_tld: ".th",
        continent_code: "AS",
        in_eu: false,
        postal: "",
        latitude: 13.75398,
        longitude: 100.50144,
        timezone: "Asia/Bangkok",
        utc_offset: "+0700",
        country_calling_code: "+66",
        currency: "THB",
        currency_name: "Baht",
        languages: "th,en",
        country_area: 514000.0,
        country_population: 69428524,
        asn: "AS21859",
        org: "ZEN-ECN",
      });
    } else {
      try {
        const data: GeolocationData = await fetchWithRetry(
          "https://ipapi.co/json/",
          {}
        );
        setGeoData(data);
      } catch (error) {
        console.error("Error fetching geo data:", error);
      }
    }
  }, [account]);

  const fetchAccountInfo = useCallback(async () => {
    if (!account || partnerId === null || !geoData || hasFetchedAccountInfo)
      return;

    setIsLoading(true);
    try {
      const payload = {
        address: account.address,
        ipAddress: geoData.ip,
        geolocation: geoData,
        partnerId,
        walletName: currentWallet?.name || "Unknown",
        domain: window.location.hostname,
      };
      const data: AccountInfo | { redirect: string } = await fetchWithRetry(
        "/api/account",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if ("redirect" in data && data.redirect) {
        window.location.href = data.redirect;
        return;
      }

      if ("coins" in data) {
        setAccountInfo({
          ...data,
          walletName: currentWallet?.name || "Unknown",
        });
        setHasFetchedAccountInfo(true);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching account info:", error);
    } finally {
      setIsLoading(false);
    }
  }, [account, partnerId, geoData, currentWallet, hasFetchedAccountInfo]);

  useEffect(() => {
    const fetchData = async () => {
      if (!geoData) {
        await fetchGeoData();
      }
      if (geoData && !hasFetchedAccountInfo) {
        await fetchAccountInfo();
      }
    };

    fetchData();
  }, [fetchGeoData, fetchAccountInfo, geoData, hasFetchedAccountInfo]);

  // Reset hasFetchedAccountInfo when the account changes
  useEffect(() => {
    setHasFetchedAccountInfo(false);
  }, [account]);

  return { accountInfo, isLoading };
}
