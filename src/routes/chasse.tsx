import { createFileRoute } from "@tanstack/react-router";
import { TruffeStudio } from "@/components/truffe/App";

export const Route = createFileRoute("/chasse")({
  head: () => ({
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Unbounded:wght@600;700&display=swap",
      },
    ],
  }),
  component: TruffeStudio,
});
