import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Retour basé sur l'historique réel de navigation,
 * avec repli sur une route explicite si l'historique est vide.
 */
export function BackButton({
  label = "Retour",
  fallback = "/",
}: {
  label?: string;
  fallback?: string;
}) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 text-muted-foreground hover:text-foreground"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.history.back();
        } else {
          void router.navigate({ to: fallback });
        }
      }}
    >
      <ArrowLeft className="size-4" /> {label}
    </Button>
  );
}
