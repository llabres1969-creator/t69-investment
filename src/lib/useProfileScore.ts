"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "t69_profile_score";

export function saveProfileScore(score: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(score));
    window.dispatchEvent(new Event("t69-profile-updated"));
  } catch {
    // localStorage unavailable, ignore
  }
}

export function clearProfileScore() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("t69-profile-updated"));
  } catch {
    // ignore
  }
}

export function useProfileScore() {
  const [score, setScore] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setScore(raw === null ? null : Number(raw));
      } catch {
        setScore(null);
      }
      setLoaded(true);
    }
    read();
    window.addEventListener("t69-profile-updated", read);
    return () => window.removeEventListener("t69-profile-updated", read);
  }, []);

  return { score, loaded };
}
