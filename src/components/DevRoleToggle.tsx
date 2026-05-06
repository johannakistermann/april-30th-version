import { Stethoscope } from "lucide-react";
import { usePractitionerRole } from "@/hooks/usePractitionerRole";

const DevRoleToggle = () => {
  if (!import.meta.env.DEV && localStorage.getItem("dev-bypass-auth") !== "true") return null;

  const { isPractitioner, togglePractitioner } = usePractitionerRole();

  return (
    <button
      onClick={() => togglePractitioner()}
      title="Toggle practitioner role (dev)"
      className={`fixed bottom-24 right-16 z-50 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-colors flex items-center gap-1.5 ${
        isPractitioner ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
      }`}
    >
      <Stethoscope className="w-3.5 h-3.5" />
      {isPractitioner ? "Practitioner" : "Consumer"}
    </button>
  );
};

export default DevRoleToggle;
