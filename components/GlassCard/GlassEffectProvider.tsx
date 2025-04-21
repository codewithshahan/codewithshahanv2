"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface GlassEffectContextType {
  rotateX: number;
  rotateY: number;
  scale: number;
  isInteracting: boolean;
  setRotateX: (value: number) => void;
  setRotateY: (value: number) => void;
  setScale: (value: number) => void;
  setIsInteracting: (value: boolean) => void;
  intensity: number;
  textOptimizationLevel: "standard" | "high" | "maximum";
}

const defaultContext: GlassEffectContextType = {
  rotateX: 0,
  rotateY: 0,
  scale: 1,
  isInteracting: false,
  setRotateX: () => {},
  setRotateY: () => {},
  setScale: () => {},
  setIsInteracting: () => {},
  intensity: 0.7,
  textOptimizationLevel: "high",
};

const GlassEffectContext =
  createContext<GlassEffectContextType>(defaultContext);

export const useGlassEffect = () => useContext(GlassEffectContext);

interface GlassEffectProviderProps {
  children: ReactNode;
  intensity?: number;
  textOptimizationLevel?: "standard" | "high" | "maximum";
}

export const GlassEffectProvider: React.FC<GlassEffectProviderProps> = ({
  children,
  intensity = 0.7,
  textOptimizationLevel = "high",
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isInteracting, setIsInteracting] = useState(false);

  return (
    <GlassEffectContext.Provider
      value={{
        rotateX,
        rotateY,
        scale,
        isInteracting,
        setRotateX,
        setRotateY,
        setScale,
        setIsInteracting,
        intensity,
        textOptimizationLevel,
      }}
    >
      {children}
    </GlassEffectContext.Provider>
  );
};

export default GlassEffectProvider;
