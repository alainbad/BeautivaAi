import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./login";

export const Route = createFileRoute("/forgot")({
  component: () => <AuthShell mode="forgot" />,
});
