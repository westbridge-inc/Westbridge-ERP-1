"use client";

import { useTheme } from "next-themes";

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Appearance Settings</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(["light", "dark", "system"] as const).map((option) => {
          const isSelected = theme === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              className={`rounded-lg border p-4 text-left transition-shadow ${isSelected ? "border-primary ring-1 ring-primary" : "border-border hover:bg-muted/50"}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{option}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option === "light" && "Use light theme"}
                    {option === "dark" && "Use dark theme"}
                    {option === "system" && "Match system preference"}
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
