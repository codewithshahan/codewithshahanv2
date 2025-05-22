"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  ChevronUp,
  AlignHorizontalJustifyCenter as SidebarLeft,
  AlignHorizontalJustifyEnd as SidebarRight,
  AlignJustify,
  ArrowDown as AlignBottom,
  MoveHorizontal,
  ZoomIn,
  PanelTop,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDock } from "./DockContext";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * DockSettings Props
 */
interface DockSettingsProps {
  /** Additional class name for the container */
  className?: string;

  /** Custom trigger button */
  customTrigger?: React.ReactNode;
}

/**
 * DockSettings Component for unified dock
 */
const DockSettings: React.FC<DockSettingsProps> = ({
  className,
  customTrigger,
}) => {
  // Get dock context
  const {
    position,
    setPosition,
    magnificationEnabled,
    setMagnificationEnabled,
    magnificationFactor,
    setMagnificationFactor,
    enableEffects,
    setEnableEffects,
    dockSize,
    setDockSize,
    autohide,
    setAutohide,
    isDark,
  } = useDock();

  // Local state
  const [open, setOpen] = useState(false);

  // Get position icon
  const getPositionIcon = () => {
    switch (position) {
      case "left":
        return <SidebarLeft className="w-4 h-4" />;
      case "right":
        return <SidebarRight className="w-4 h-4" />;
      case "top":
        return <PanelTop className="w-4 h-4" />;
      case "bottom":
      default:
        return <AlignBottom className="w-4 h-4" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {customTrigger || (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-10 h-10 rounded-xl relative flex items-center justify-center",
              "hover:bg-accent hover:text-accent-foreground transition-colors",
              className
            )}
            aria-label="Dock Settings"
            aria-haspopup="true"
            aria-expanded={open}
          >
            <Settings className="w-5 h-5" />
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-4 rounded-xl backdrop-blur-lg border"
        sideOffset={10}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-lg font-medium mb-4">Dock Settings</h3>

          {/* Position Setting */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Position</label>
              <div className="flex items-center">
                {getPositionIcon()}
                <span className="ml-2 text-sm capitalize">{position}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Button
                size="sm"
                variant={position === "bottom" ? "default" : "outline"}
                className="px-2 py-1 h-auto"
                onClick={() => setPosition("bottom")}
              >
                <AlignBottom className="w-4 h-4 mr-1" />
                <span className="text-xs">Bottom</span>
              </Button>
              <Button
                size="sm"
                variant={position === "left" ? "default" : "outline"}
                className="px-2 py-1 h-auto"
                onClick={() => setPosition("left")}
              >
                <SidebarLeft className="w-4 h-4 mr-1" />
                <span className="text-xs">Left</span>
              </Button>
              <Button
                size="sm"
                variant={position === "right" ? "default" : "outline"}
                className="px-2 py-1 h-auto"
                onClick={() => setPosition("right")}
              >
                <SidebarRight className="w-4 h-4 mr-1" />
                <span className="text-xs">Right</span>
              </Button>
              <Button
                size="sm"
                variant={position === "top" ? "default" : "outline"}
                className="px-2 py-1 h-auto"
                onClick={() => setPosition("top")}
              >
                <PanelTop className="w-4 h-4 mr-1" />
                <span className="text-xs">Top</span>
              </Button>
            </div>
          </div>

          {/* Size Setting */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Size</label>
              <span className="text-xs">{dockSize}px</span>
            </div>
            <Slider
              value={[dockSize]}
              min={32}
              max={96}
              step={4}
              onValueChange={(value) => setDockSize(value[0])}
              className="mt-1"
            />
          </div>

          {/* Magnification Settings */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <ZoomIn className="w-4 h-4 mr-2" />
                <label className="text-sm font-medium">Magnification</label>
              </div>
              <Switch
                checked={magnificationEnabled}
                onCheckedChange={setMagnificationEnabled}
              />
            </div>

            {magnificationEnabled && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex justify-between items-center mt-2 mb-1">
                    <label className="text-xs text-muted-foreground">
                      Intensity
                    </label>
                    <span className="text-xs">
                      {Math.round(magnificationFactor * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[magnificationFactor]}
                    min={0.1}
                    max={1.5}
                    step={0.1}
                    onValueChange={(value) => setMagnificationFactor(value[0])}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Special Effects */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <MoveHorizontal className="w-4 h-4 mr-2" />
                <label className="text-sm font-medium">Enable Animations</label>
              </div>
              <Switch
                checked={enableEffects}
                onCheckedChange={setEnableEffects}
              />
            </div>
          </div>

          {/* Autohide */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {autohide ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                <label className="text-sm font-medium">Autohide Dock</label>
              </div>
              <Switch checked={autohide} onCheckedChange={setAutohide} />
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => {
              setPosition("bottom");
              setMagnificationEnabled(true);
              setMagnificationFactor(0.5);
              setEnableEffects(true);
              setDockSize(64);
              setAutohide(false);
            }}
          >
            Reset to Defaults
          </Button>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};

export default DockSettings;
