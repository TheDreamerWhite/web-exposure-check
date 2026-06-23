"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type MonitoredDomain,
  readStoredDomains,
  writeStoredDomains,
} from "./domain-storage";

export function useStoredDomains() {
  const [domains, setDomains] = useState<MonitoredDomain[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDomains(readStoredDomains());
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const replaceDomains = useCallback((nextDomains: MonitoredDomain[]) => {
    setDomains(nextDomains);
    writeStoredDomains(nextDomains);
  }, []);

  const refreshDomains = useCallback(() => {
    setDomains(readStoredDomains());
  }, []);

  return {
    domains,
    loaded,
    replaceDomains,
    refreshDomains,
  };
}
