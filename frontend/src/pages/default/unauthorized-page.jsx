import { usePageTitle } from "../../hooks/pageTitle";

export default function UnauthorizedPage() {
  usePageTitle("Unauthorized");

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#1A1A2E]">
      You are unauthorized!
    </div>
  );
}