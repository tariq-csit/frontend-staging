import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "@/contexts/ThemeContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="h-9 w-9 rounded-md"
          >
            {theme === "light" ? (
              <Sun className="h-5 w-5 text-indigo-600 transition-all" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-400 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle {theme === "light" ? "dark" : "light"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 