import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./login";

export const Route = createFileRoute("/forgot")({
  component: () => <AuthShell mode="forgot" />,
  head: () => ({
    meta: [
      { title: "Reset password — BeautyAI" },
      { name: "description", content: "Recover access to your BeautyAI account." },
      { property: "og:title", content: "Reset password — BeautyAI" },
      { property: "og:description", content: "Recover access to your BeautyAI account." },
      { name: "robots", content: "noindex" },
    ],
  }),
});
