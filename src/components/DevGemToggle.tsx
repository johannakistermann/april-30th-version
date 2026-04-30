import { useGemConnection } from "@/contexts/GemConnectionContext";

const DevGemToggle = () => {
  if (!import.meta.env.DEV && localStorage.getItem("dev-bypass-auth") !== "true") return null;

  const { isGemConnected, toggleGemConnection } = useGemConnection();

  return (
    <button
      onClick={toggleGemConnection}
      className={`fixed bottom-28 right-4 z-50 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-colors ${
        isGemConnected
          ? "bg-green-500/90 text-white"
          : "bg-red-500/90 text-white"
      }`}
    >
      GEM: {isGemConnected ? "ON" : "OFF"}
    </button>
  );
};

export default DevGemToggle;
