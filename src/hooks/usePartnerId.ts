import { useState, useEffect, useRef } from "react";

export function usePartnerId() {
  const [partnerId, setPartnerId] = useState<number | null>(null);
  const requestMadeRef = useRef(false);

  useEffect(() => {
    const fetchPartnerId = async () => {
      if (requestMadeRef.current) return;

      try {
        requestMadeRef.current = true;
        const host = window.location.hostname;
        console.log("host");
        console.log(host);
        const response = await fetch("/api/get-domain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ domain: host }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch partner ID");
        }
        const data = await response.json();
        console.log("partner id:");
        console.log(data.partnerId);
        setPartnerId(data.partnerId);
      } catch (error) {
        console.error("Error fetching partner ID:", error);
      }
    };

    fetchPartnerId();
  }, []);

  return partnerId;
}
