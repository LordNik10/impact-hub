"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export function GithubField({ user_id }: { user_id: string }) {
  const [githubToken, setGithubToken] = useState<string>("");

  const updategithubToken = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/update-user-token/${user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ githubToken }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update GitHub token");
      }

      const data = await response.json();
      console.log("GitHub token updated successfully:", data);
    } catch (error) {
      console.error("Error updating GitHub token:", error);
    }
  };

  useEffect(() => {
    const fetchGithubToken = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/user-token/${user_id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch GitHub token");
        }

        const data = await response.json();
        console.log(data);

        setGithubToken(data.github_token || "");
      } catch (error) {
        console.error("Error fetching GitHub token:", error);
      }
    };

    fetchGithubToken();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="score-threshold">Github Token</Label>
        <Input
          id="score-threshold"
          type="text"
          value={githubToken}
          onChange={(e) => setGithubToken(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Inserisci il tuo token GitHub per accedere alle API
        </p>
      </div>
      <Button variant="default" onClick={updategithubToken}>
        Salva
      </Button>
      <div className="pt-4">
        <Button variant="destructive">Elimina Progetto</Button>
      </div>
    </div>
  );
}
