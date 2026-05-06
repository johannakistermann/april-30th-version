import { useParams } from "react-router-dom";
import Placeholder from "./Placeholder";

const RecDetail = () => {
  const { recId } = useParams();
  const name = (recId ?? "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Placeholder
      title={name || "Recommendation"}
      description="Witness evidence, rationale, dosing guidance, and links to related pillars / past recommendations."
    />
  );
};
export default RecDetail;
