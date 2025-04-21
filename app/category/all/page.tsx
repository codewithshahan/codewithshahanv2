"use client";

import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AllCategories() {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="container px-4 mx-auto">
            <h1 className="text-4xl font-bold mb-8">Categories</h1>
            <p className="text-lg mb-6">
              This is a placeholder for the all categories page. It will be
              implemented soon.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </Providers>
  );
}
