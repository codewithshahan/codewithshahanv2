"use client";

import React from "react";
import { DockProvider } from "./DockContext";
import Dock from "./Dock";
import { DockItem } from "./DockItem";
import DockDivider from "./DockDivider";
import DockSettings from "./DockSettings";
import { cn } from "@/lib/utils";

export interface DockApplication {
  id: string;
  name: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  notification?: boolean | number;
}

interface UnifiedDockProps {
  /** Array of applications to display in the dock */
  apps: DockApplication[];

  /** Position of the dock */
  position?: "bottom" | "top" | "left" | "right";

  /** Whether to include settings button */
  showSettings?: boolean;

  /** Whether the dock should auto-hide */
  autoHide?: boolean;

  /** Whether to enable magnification effect */
  magnify?: boolean;

  /** Custom dock size */
  dockSize?: number;

  /** Initial active app ID */
  activeApp?: string;

  /** Custom class name */
  className?: string;

  /** Semantic HTML element to use for the dock */
  semanticElement?: "nav" | "div" | "aside" | "footer";

  /** Accessibility label */
  ariaLabel?: string;
}

/**
 * UnifiedDock - A macOS-style dock component with animations and settings
 */
export const UnifiedDock: React.FC<UnifiedDockProps> = ({
  apps,
  position = "bottom",
  showSettings = true,
  autoHide = false,
  magnify = true,
  dockSize = 56,
  activeApp,
  className,
  semanticElement,
  ariaLabel,
}) => {
  // Group apps by section (if needed in the future)
  const mainApps = apps.filter((app) => !app.id.startsWith("settings"));

  return (
    <DockProvider
      initialPosition={position}
      initialDockSize={dockSize}
      initialMagnificationEnabled={magnify}
      initialActiveItemId={activeApp}
      initialAutohide={autoHide}
    >
      <Dock
        position={position}
        autoHide={autoHide}
        className={cn("transition-all duration-300", className)}
        background={
          position === "bottom" ? "bg-background/50" : "bg-background/50"
        }
        borderRadius={
          position === "bottom" ? "rounded-t-2xl rounded-b-2xl" : "rounded-2xl"
        }
        shadow="lg"
        bordered
        semanticElement={semanticElement}
        aria-label={ariaLabel}
      >
        {/* Main applications */}
        {mainApps.map((app) => (
          <DockItem
            key={app.id}
            id={app.id}
            icon={app.icon}
            label={app.name}
            href={app.href}
            onClick={app.onClick}
            isActive={app.isActive}
            notification={app.notification}
          />
        ))}

        {/* Settings divider and button */}
        {showSettings && (
          <>
            <DockDivider />
            <DockSettings
              customTrigger={
                <DockItem
                  id="settings"
                  icon="/icons/settings.svg"
                  label="Settings"
                />
              }
            />
          </>
        )}
      </Dock>
    </DockProvider>
  );
};

export default UnifiedDock;
