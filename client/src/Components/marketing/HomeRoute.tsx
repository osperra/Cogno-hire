import { useNavigate } from "react-router-dom";
import { LandingPage } from "./LandingPage";

export function HomeRoute() {
  const navigate = useNavigate();

  return (
    <LandingPage
      onGetStarted={() => navigate("/login")}
      onOpenDesignSystem={() => navigate("/design-system")}
    />
  );
}
