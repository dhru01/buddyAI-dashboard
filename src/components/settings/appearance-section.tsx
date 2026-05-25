"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AppearanceSection() {
  const { theme, setTheme, mounted } = useTheme();

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-semibold">Appearance</h3>
        <p className="mt-1 text-sm text-foreground/65">
          Choose how the BuddyAI dashboard looks on this device.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={theme === "light" ? "secondary" : "outline"}
          className={cn("gap-2", !mounted && "opacity-70")}
          onClick={() => setTheme("light")}
          disabled={!mounted}
        >
          <Sun className="h-4 w-4" />
          Light mode
        </Button>
        <Button
          type="button"
          variant={theme === "dark" ? "secondary" : "outline"}
          className={cn("gap-2", !mounted && "opacity-70")}
          onClick={() => setTheme("dark")}
          disabled={!mounted}
        >
          <Moon className="h-4 w-4" />
          Dark mode
        </Button>
      </div>
    </Card>
  );
}
