"use client";

import { useTheme } from "next-themes";

export function AppearanceTab() {
  const { theme: resolvedTheme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Appearance Settings</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(["light", "dark", "system"] as const).map((theme) => {
          const isSelected =
            (resolvedTheme === "system" && theme === "system") ||
            (resolvedTheme !== "system" && theme === resolvedTheme);
          return (
            <button
              key={theme}
              type="button"
              onClick={() => setTheme(theme)}
              className={`rounded-lg border p-4 text-left transition-shadow ${isSelected ? "border-primary ring-1 ring-primary" : "border-border hover:bg-muted/50"}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{theme}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {theme === "light" && "Use light theme"}
                    {theme === "dark" && "Use dark theme"}
                    {theme === "system" && "Match system preference"}
                  </p>
                </div>
                <span
                  className={`h-4 w-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
