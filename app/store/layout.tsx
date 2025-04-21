import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Programming eBooks & Courses | CodeWithShahan Store",
  description:
    "Explore our collection of premium programming eBooks and courses designed to help you master clean code and advanced software engineering principles",
  openGraph: {
    title: "Premium Programming eBooks & Courses | CodeWithShahan Store",
    description:
      "Explore our collection of premium programming eBooks and courses designed to help you master clean code and advanced software engineering principles",
    type: "website",
    images: ["/images/og-image.jpg"],
  },
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
