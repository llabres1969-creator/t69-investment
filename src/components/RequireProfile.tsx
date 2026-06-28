"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileScore } from "@/lib/useProfileScore";

export function RequireProfile({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { score, loaded } = useProfileScore();

  useEffect(() => {
    if (loaded && score === null) {
      router.replace("/test");
    }
  }, [loaded, score, router]);

  if (!loaded || score === null) {
    return null;
  }

  return <>{children}</>;
}
