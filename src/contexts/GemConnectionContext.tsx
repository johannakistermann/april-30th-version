import React, { createContext, useContext, useState, useCallback } from "react";

interface GemConnectionContextType {
  isGemConnected: boolean;
  toggleGemConnection: () => void;
}

const GemConnectionContext = createContext<GemConnectionContextType>({
  isGemConnected: false,
  toggleGemConnection: () => {},
});

export const useGemConnection = () => useContext(GemConnectionContext);

export const GemConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isGemConnected, setIsGemConnected] = useState(() => {
    return localStorage.getItem("gemConnected") === "true";
  });

  const toggleGemConnection = useCallback(() => {
    setIsGemConnected((prev) => {
      const next = !prev;
      localStorage.setItem("gemConnected", String(next));
      return next;
    });
  }, []);

  return (
    <GemConnectionContext.Provider value={{ isGemConnected, toggleGemConnection }}>
      {children}
    </GemConnectionContext.Provider>
  );
};
