import { permanentRedirect } from "next/navigation";

export default function LegacySixDofRoute() {
  permanentRedirect("/games/failsafe");
}
