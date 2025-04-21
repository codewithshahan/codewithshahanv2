# Next.js Application Architecture Guidelines

## Core Hydration Rules

1. **Theme Handling**: Always implement proper server/client handling with an isMounted state:

   - Default to a specific theme for server-side rendering
   - Use a mounted state to detect client-side rendering
   - Return a simple loading state before hydration is complete

2. **Date & Times**: Never format dates directly during render; instead:

   - Format dates on the server before passing to components
   - Use a client-side effect for any date formatting logic
   - Consider using ISO strings and formatting only after mount

3. **Random Values**: Never use Math.random() or Date.now() directly in render:

   - Generate random values server-side and pass as props
   - Use refs to store random values after initial render
   - Move randomization to effects that run after mount

4. **Component Structure**: Respect Next.js component boundaries:

   - Never use 'use client' in files with server component exports like generateMetadata
   - Split components into separate files based on client/server needs
   - Use proper data serialization between server and client components

5. **Browser APIs**: Never access browser-only APIs during render:

   - Check for window/document with useEffect hooks
   - Use proper SafeHydration patterns with isMounted state
   - Create fallback UI for server-rendering

6. **Style Properties**: Always use consistent CSS property naming:

   - Use camelCase style properties in JSX (backgroundColor vs background-color)
   - Be consistent with styled-components and CSS Modules
   - Avoid dynamic style properties that might differ between server/client

7. **Conditional Rendering**: Be careful with:
   - Server-side vs client-side conditions (like screen size checks)
   - Always provide the same initial structure on server and client
   - Use opacity or visibility for content that should be hidden initially rather than conditional rendering

## API Integration & Data Fetching

8. **API Service Architecture**:

   - Create dedicated service classes for each API domain
   - Implement proper error handling with standardized responses
   - Use React Query or SWR for client-side data fetching with caching

9. **Server Actions Pattern**:

   - Prefer server components and server actions for data mutations
   - Implement proper zod validation for all form inputs
   - Use optimistic UI updates with proper fallback states

10. **Data Serialization**:

    - Always properly serialize dates and complex objects before passing to client components
    - Use TypeScript interfaces to ensure proper data shapes across boundaries
    - Handle null/undefined gracefully with fallback values

11. **Authentication Flow**:
    - Implement proper token refresh mechanisms with interceptors
    - Use React Context for auth state with proper hydration handling
    - Create protected route wrappers with skeleton loading states

## Performance Optimization

12. **Image Optimization**:

    - Always use Next.js Image component with proper sizing
    - Implement responsive image strategies with art direction
    - Use modern formats (WebP, AVIF) with proper fallbacks

13. **Bundle Management**:

    - Implement proper code-splitting with dynamic imports
    - Use React.lazy and Suspense for component-level code splitting
    - Monitor and optimize bundle sizes with proper tree shaking

14. **Resource Loading**:

    - Implement proper font loading strategy with size-adjust and swap
    - Use resource hints (preload, prefetch) for critical resources
    - Optimize third-party script loading with proper strategies

15. **Rendering Strategies**:
    - Choose appropriate rendering method (SSR, SSG, ISR) per route
    - Implement streaming SSR for improved TTFB and interactivity
    - Use React Server Components for data-heavy UI sections

## State Management & Effects

16. **Client State Architecture**:

    - Implement atomic state design with proper composition
    - Use context selectors to prevent unnecessary re-renders
    - Implement proper state persistence with hydration safety

17. **Effect Management**:

    - Use proper cleanup functions in all useEffect hooks
    - Implement stale-closure prevention with refs
    - Avoid unnecessary effect dependencies and use custom hooks

18. **Form Handling**:
    - Use controlled components with proper state management
    - Implement proper validation with error state synchronization
    - Use batch updates for complex form state changes

## Animation & Interaction Design

19. **Animation Implementation**:

    - Use hardware-accelerated properties (transform, opacity)
    - Implement proper animation orchestration with sequence control
    - Use IntersectionObserver for scroll-based animations

20. **Interaction Patterns**:
    - Implement proper focus management for accessibility
    - Use proper touch/pointer event handling with fallbacks
    - Create consistent micro-interactions based on design system

## Design System Implementation

21. **Component Architecture**:

    - Create atomic design structure with proper composition
    - Implement variant-based components with proper type safety
    - Use compound components for complex UI patterns

22. **Theme Implementation**:

    - Create a token-based system with semantic naming
    - Implement proper color system with accessibility considerations
    - Use CSS variables for dynamic theming with proper fallbacks

23. **Responsive Design**:
    - Use mobile-first approach with proper breakpoint system
    - Implement container queries for component-level responsiveness
    - Create adaptive layouts with proper content priority

## Error Handling & Resilience

24. **Error Boundaries**:

    - Implement strategic error boundaries at different levels
    - Create graceful fallback UIs with retry mechanisms
    - Use proper logging and monitoring for production errors

25. **Network Resilience**:
    - Implement proper offline detection and handling
    - Create retry mechanisms with exponential backoff
    - Use proper loading and error states for all async operations

By following these comprehensive guidelines, you'll create a resilient, performant, and maintainable Next.js application that delivers an exceptional user experience while minimizing development issues.
