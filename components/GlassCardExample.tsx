"use client";

import React from "react";
import GlassCard, { GlassCardText } from "./GlassCard";

const GlassCardExample = () => {
  return (
    <div className="flex flex-col space-y-8 p-8">
      {/* Example with standard text optimization - text may appear slightly blurry during animation */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-100">
          Standard Text Optimization
        </h3>
        <GlassCard
          className="p-6 max-w-lg"
          textOptimizationLevel="standard"
          intensity={1.0}
        >
          <h2 className="text-xl font-bold mb-4 text-white">
            Standard Card Example
          </h2>
          <p className="text-gray-300">
            This card uses standard text optimization settings. The 3D effect is
            most pronounced, but text may appear slightly blurry during
            animation.
          </p>
        </GlassCard>
      </div>

      {/* Example with high text optimization - better balance between effect and clarity */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-100">
          High Text Optimization
        </h3>
        <GlassCard
          className="p-6 max-w-lg"
          textOptimizationLevel="high"
          intensity={0.7}
        >
          <h2 className="text-xl font-bold mb-4 text-white">
            High Optimization Card
          </h2>
          <p className="text-gray-300">
            This card uses high text optimization settings, which balances the
            3D effect with better text clarity during animations.
          </p>
        </GlassCard>
      </div>

      {/* Example with maximum text optimization - text stays completely sharp */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-100">
          Maximum Text Optimization
        </h3>
        <GlassCard
          className="p-6 max-w-lg"
          textOptimizationLevel="maximum"
          intensity={0.5}
        >
          <h2 className="text-xl font-bold mb-4 text-white">
            Maximum Text Clarity
          </h2>
          <p className="text-gray-300">
            This card uses maximum text optimization settings, ensuring text
            always remains completely sharp during animations, with reduced 3D
            effect.
          </p>
        </GlassCard>
      </div>

      {/* Example using GlassCardText component for specific text elements */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-100">
          Using GlassCardText Component
        </h3>
        <GlassCard
          className="p-6 max-w-lg"
          textOptimizationLevel="high"
          intensity={0.7}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">Mixed Optimization</h2>
            <p className="text-gray-300 mt-2">
              This paragraph uses the default card optimization settings.
            </p>
          </div>

          <GlassCardText
            as="div"
            className="mb-4 p-3 border border-indigo-500/20 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-white">
              Ultra-Clear Text
            </h3>
            <p className="text-gray-300 mt-1">
              This text is wrapped in the GlassCardText component, which ensures
              it remains perfectly crisp during all animations, regardless of
              the card's optimization level.
            </p>
          </GlassCardText>

          <p className="text-sm text-gray-400 mt-4">
            Use GlassCardText for critical content like pricing, details, or any
            text that absolutely must remain readable during animations.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default GlassCardExample;
