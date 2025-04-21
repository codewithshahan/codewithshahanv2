import { GumroadProduct } from "./gumroad";

// Extend the GumroadProduct type with additional properties
type ExtendedGumroadProduct = GumroadProduct & {
  reviews?: number;
};

export const mockProducts: ExtendedGumroadProduct[] = [
  {
    id: "featured-clean-code",
    name: "From Messy Code to Masterpiece",
    description:
      "The ultimate guide to transform your chaotic codebase into elegant, maintainable software that stands the test of time. Perfect for developers at any level.",
    formatted_price: "$29.99",
    price: 29.99,
    currency: "USD",
    thumbnail_url: "/images/clean-code-ebook.jpg",
    preview_url: "/images/clean-code-preview.jpg",
    published: true,
    url: "https://gumroad.com/l/cleancode",
    permalink: "cleancode",
    sales_count: 152,
    rating: 4.9,
    reviews: 126,
    popular: true,
    product_type: "ebook",
    level: "Intermediate",
    categories: ["Programming", "Clean Code"],
    tags: ["clean-code", "programming", "software-development"],
  },
  {
    id: "javascript-basics",
    name: "JavaScript Fundamentals",
    description:
      "Master the core principles of JavaScript with practical examples and exercises. Perfect for beginners looking to build a solid foundation.",
    formatted_price: "$19.99",
    price: 19.99,
    currency: "USD",
    thumbnail_url: "/images/javascript-basics.jpg",
    published: true,
    url: "https://gumroad.com/l/javascriptbasics",
    permalink: "javascriptbasics",
    sales_count: 89,
    rating: 4.7,
    product_type: "ebook",
    level: "Beginner",
    categories: ["Programming", "JavaScript", "Web Development"],
    tags: ["javascript", "web-development", "programming"],
  },
  {
    id: "react-patterns",
    name: "React Design Patterns",
    description:
      "Learn advanced React patterns to build scalable, maintainable web applications. Includes code samples and real-world examples.",
    formatted_price: "$24.99",
    price: 24.99,
    currency: "USD",
    thumbnail_url: "/images/react-patterns.jpg",
    published: true,
    url: "https://gumroad.com/l/reactpatterns",
    permalink: "reactpatterns",
    sales_count: 65,
    rating: 4.8,
    product_type: "ebook",
    level: "Advanced",
    categories: ["Programming", "JavaScript", "Web Development"],
    tags: ["react", "javascript", "web-development"],
  },
];
