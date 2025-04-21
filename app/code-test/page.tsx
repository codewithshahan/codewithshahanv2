"use client";

import React from "react";
import CodeBlock from "@/components/code/CodeBlock";

export default function CodeTestPage() {
  const jsCode = `// Example JavaScript code
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate and log the first 10 Fibonacci numbers
for (let i = 0; i < 10; i++) {
  console.log(fibonacci(i));
}`;

  const cssCode = `/* Fancy CSS styles */
.container {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  gap: 1.5rem;
}

.card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}`;

  const typescriptCode = `// TypeScript example with interfaces
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

class UserService {
  private users: User[] = [];
  
  constructor() {
    // Initialize with a default user
    this.users.push({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      isActive: true
    });
  }
  
  getUser(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
  
  addUser(user: Omit<User, 'id'>): User {
    const newUser = {
      ...user,
      id: this.users.length + 1
    };
    
    this.users.push(newUser);
    return newUser;
  }
}`;

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-6">Code Block Test Page</h1>
      <p className="mb-8 text-gray-700 dark:text-gray-300">
        This page demonstrates our new macOS-style code blocks with syntax
        highlighting.
      </p>

      <div className="space-y-10">
        <div>
          <h2 className="text-xl font-semibold mb-4">JavaScript Example</h2>
          <CodeBlock
            code={jsCode}
            language="javascript"
            fileName="fibonacci.js"
            highlightLines={[2, 3]}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">CSS Example</h2>
          <CodeBlock code={cssCode} language="css" fileName="styles.css" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">TypeScript Example</h2>
          <CodeBlock
            code={typescriptCode}
            language="typescript"
            fileName="UserService.ts"
            highlightLines={[8, 9, 10, 11, 12, 13, 14, 15, 16]}
          />
        </div>
      </div>
    </div>
  );
}
