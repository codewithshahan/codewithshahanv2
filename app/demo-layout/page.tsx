"use client"; // Convert to client component for DOM interactions

import { Metadata } from "next";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

export const metadata: Metadata = {
  title: "Three-Panel Layout - CodewithShahan",
  description:
    "Demonstration of the premium Spotify-inspired Apple-design three-panel layout",
  keywords: [
    "layout",
    "design",
    "UI",
    "UX",
    "three-panel",
    "Apple design",
    "responsive",
  ],
  openGraph: {
    title: "Premium Three-Panel Layout",
    description: "Spotify-inspired layout with Apple's design aesthetics",
    images: ["/images/og-layout.jpg"],
  },
};

export default function DemoLayoutPage() {
  const [windowWidth, setWindowWidth] = useState<number>(0);

  // Update window width on client
  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth);

    // Update width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4">Three-Panel Layout</h1>
            <p className="text-lg max-w-2xl opacity-90">
              A premium Apple-inspired layout with Spotify-style panels,
              responsive design and beautiful animations.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-medium hover:bg-blue-50 transition-colors">
                Explore Features
              </button>
              <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-colors">
                View Documentation
              </button>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-32 -mb-32" />
        </section>

        {/* Tabs for showcasing different aspects */}
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="features">Key Features</TabsTrigger>
            <TabsTrigger value="panels">Panel System</TabsTrigger>
            <TabsTrigger value="responsive">Responsive Design</TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Apple-Inspired Design",
                  description:
                    "Clean, minimal aesthetics with premium glassmorphism and animations.",
                },
                {
                  title: "Responsive Layout",
                  description:
                    "Adapts seamlessly from mobile to desktop with optimized interactions.",
                },
                {
                  title: "Global Search",
                  description:
                    "Smart autosuggest search that works across all content types.",
                },
                {
                  title: "Dynamic Content",
                  description:
                    "Content sections that update based on user interaction and preferences.",
                },
                {
                  title: "Smooth Transitions",
                  description:
                    "Page transitions and motion effects for a premium experience.",
                },
                {
                  title: "Auto-Generated SEO",
                  description:
                    "Automatic SEO metadata generation for optimal search engine visibility.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="border border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/20 backdrop-blur-sm rounded-xl p-5 hover:shadow-md transition-all duration-300"
                >
                  <h3 className="text-lg font-medium">{feature.title}</h3>
                  <p className="text-sm opacity-70 mt-2">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Panels Tab */}
          <TabsContent value="panels" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Panel */}
              <div className="border border-white/10 dark:border-white/5 rounded-xl p-5 bg-gradient-to-b from-blue-500/10 to-blue-500/5">
                <h3 className="text-lg font-medium mb-3">Left Sidebar</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Site branding & identity</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Primary navigation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>User preferences</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Theme toggle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Social media links</span>
                  </li>
                </ul>
              </div>

              {/* Middle Panel */}
              <div className="border border-white/10 dark:border-white/5 rounded-xl p-5 bg-gradient-to-b from-purple-500/10 to-purple-500/5">
                <h3 className="text-lg font-medium mb-3">Main Content</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Global search bar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Dynamic page content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Page transitions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Beautiful typography</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Responsive layouts</span>
                  </li>
                </ul>
              </div>

              {/* Right Panel */}
              <div className="border border-white/10 dark:border-white/5 rounded-xl p-5 bg-gradient-to-b from-green-500/10 to-green-500/5">
                <h3 className="text-lg font-medium mb-3">Right Sidebar</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Trending articles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Latest content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Category filtering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Gumroad products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Activity indicators</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Responsive Tab */}
          <TabsContent value="responsive" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-white/10 dark:border-white/5 rounded-xl p-5 bg-white/5 dark:bg-black/20">
                <h3 className="text-lg font-medium mb-3">Desktop Layout</h3>
                <p className="text-sm opacity-70 mb-4">
                  Optimized for large screens with all three panels visible
                  simultaneously.
                </p>
                <div className="aspect-video relative bg-gray-800 rounded-lg overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1/6 bg-blue-500/20 border-r border-white/10" />
                  <div className="absolute right-0 top-0 bottom-0 w-1/5 bg-green-500/20 border-l border-white/10" />
                  <div className="absolute left-1/6 right-1/5 top-0 bottom-0 bg-purple-500/20" />
                </div>
              </div>

              <div className="border border-white/10 dark:border-white/5 rounded-xl p-5 bg-white/5 dark:bg-black/20">
                <h3 className="text-lg font-medium mb-3">Mobile Layout</h3>
                <p className="text-sm opacity-70 mb-4">
                  Reflows to a single column with bottom navigation and stacked
                  content.
                </p>
                <div className="aspect-[9/16] w-1/3 mx-auto relative bg-gray-800 rounded-lg overflow-hidden">
                  <div className="absolute left-0 right-0 bottom-0 h-12 bg-blue-500/20 border-t border-white/10" />
                  <div className="absolute left-0 right-0 top-0 h-14 bg-purple-500/20 border-b border-white/10" />
                  <div className="absolute inset-0 mt-14 mb-12 bg-purple-500/10" />
                  <div className="absolute left-0 right-0 bottom-[3.5rem] h-24 bg-green-500/20 border-t border-white/10" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Implementation Example */}
        <section className="py-6">
          <h2 className="text-2xl font-bold mb-6">Interactive Demo</h2>
          <div className="border border-white/10 dark:border-white/5 rounded-xl p-6 bg-white/5 dark:bg-black/20">
            <p className="text-sm opacity-70 mb-6">
              This page itself demonstrates the three-panel layout. Try resizing
              your browser window to see how it responds to different screen
              sizes.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current layout:</span>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                  <span className="hidden md:inline">Three-Panel Desktop</span>
                  <span className="inline md:hidden">Mobile Single Column</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Screen width:</span>
                <span className="text-xs font-mono px-3 py-1 bg-gray-800/40 rounded-md">
                  {windowWidth > 0 ? `${windowWidth}px` : "Loading..."}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Features active:</span>
                <span className="text-xs">
                  <span className="hidden md:inline">
                    Left sidebar, Right sidebar, Search
                  </span>
                  <span className="inline md:hidden">
                    Mobile dock, Stacked layout
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
