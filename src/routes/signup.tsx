import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./login";

export const Route = createFileRoute("/signup")({
  component: () => <AuthShell mode="signup" />,
  head: () => ({
    meta: [
      { title: "Create your account — BeautyAI" },
      { name: "description", content: "Join BeautyAI in seconds and start your personalized skincare journey." },
      { property: "og:title", content: "Create your account — BeautyAI" },
      { property: "og:description", content: "Join BeautyAI in seconds and start your personalized skincare journey." },
      { name: "robots", content: "noindex" },
    ],
  }),
});
