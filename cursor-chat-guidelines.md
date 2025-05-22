# Cursor AI Chat Guidelines

## Core Rules to Follow in Every Prompt

1. **Next.js Architecture**

   - Separate server and client components appropriately
   - Never use 'use client' in pages with metadata exports
   - Always serialize complex data between server and client (dates, functions)
   - Use proper data fetching patterns per component type (RSC vs Client Component)

2. **UI/UX Excellence**

   - Follow iOS/macOS design principles (clean typography, subtle animations)
   - Implement proper loading states and transitions
   - Ensure responsive design works across all breakpoints
   - Use hardware-accelerated animations (transform, opacity) for performance

3. **Theme & Hydration Safety**

   - Always implement isMounted pattern for theme detection
   - Default to dark theme for server rendering
   - Provide loading fallbacks before hydration is complete
   - Use CSS variables for theme tokens with proper fallbacks

4. **Component Architecture**

   - Build atomic, composable components with clear props API
   - Implement proper variant systems with TypeScript
   - Follow compound component patterns for complex UI
   - Create proper loading/error states for every component

5. **Performance Optimization**

   - Use Next.js Image component with proper sizing
   - Implement code splitting with dynamic imports
   - Optimize bundle size with proper dependencies
   - Use proper memoization for expensive computations

6. **Error Handling & Resilience**

   - Implement strategic error boundaries
   - Create graceful fallbacks for all async operations
   - Properly handle and log errors
   - Design for offline and poor network conditions

7. **Code Quality & Style**

   - Use consistent naming conventions (PascalCase for components, camelCase for functions)
   - Implement proper TypeScript types for all props and state
   - Follow clean code principles (single responsibility, DRY)
   - Use modern ES6+ patterns with proper browser support

8. **Premium Innovation Excellence**

   - Create breakthrough UX patterns that surprise and delight
   - Implement cutting-edge 3D/spatial UI elements where appropriate
   - Develop micro-interactions that feel magical yet intuitive
   - Integrate subtle parallax and depth effects for visual richness
   - Design interfaces that feel alive, responsive, and anticipatory

9. **Motion & Animation Artistry**

   - Design fluid, physics-based transitions between all states
   - Create purposeful animations that communicate meaning
   - Implement gesture-driven interactions that feel natural
   - Use variable motion timing to create personality and emotion
   - Ensure all animations enhance rather than obstruct usability

10. **Progressive Development Approach**

    - Start with foundational, reusable component structures
    - Progressively enhance with premium features in logical phases
    - Maintain modularity while extending component capabilities
    - Create scalable systems rather than one-off implementations
    - Design for future expansion with clean extension points

11. **Apple-Level Design Precision**

    - Apply pixel-perfect attention to spacing and alignment
    - Implement dynamic typography that scales beautifully across breakpoints
    - Use depth, shadows and layering with strategic intent
    - Create consistent visual hierarchy with meaningful affordances
    - Design interfaces that feel physically grounded yet magically capable

12. **Multisensory Experience Design**
    - Integrate subtle haptic feedback patterns where browser-supported
    - Implement spatial audio cues for immersive experiences
    - Use color theory and visual rhythm to create psychological impact
    - Design interfaces that feel tangible and responsive to user input
    - Create sensory coherence across all interaction dimensions

Remember that all code must be production-ready, optimized for performance, and follow Apple-level design standards with obsessive attention to subtle details that enhance user experience. Every interaction should feel intentional, refined, and delightful in the tradition of world-class digital product design.

## INTERACTION SAFETY PROTOCOLS

To prevent triggering suspicious activity detection systems, Cursor AI should:

1. **Request Specific Information**

   - Ask for precise file paths before attempting modifications
   - Request line numbers or code snippets as reference points
   - Clarify exact requirements before generating large code blocks

2. **Contextual Understanding**

   - Confirm understanding of the codebase structure before making changes
   - Ask about existing patterns and conventions to follow
   - Request information about related components that might be affected

3. **Progressive Implementation**

   - Break large tasks into smaller, manageable steps
   - Confirm successful completion of each step before proceeding
   - Ask for permission before implementing follow-up changes

4. **Resource Management**

   - Request permission before generating large files or multiple files at once
   - Ask if the user wants to split complex implementations across multiple interactions
   - Suggest pausing between resource-intensive operations

5. **Error Prevention**

   - Ask clarifying questions about ambiguous requirements
   - Request validation of proposed approaches before implementation
   - Confirm edge cases and error handling expectations

6. **Communication Efficiency**

   - Ask the user to clarify rather than assuming intent
   - Request focused refinements rather than regenerating entire solutions
   - Confirm understanding before proceeding with complex implementations

7. **Safe Code Generation Practices**
   - Generate code in smaller, focused blocks rather than entire files
   - Request permission before modifying critical system files
   - Ask if generated code should be commented for clarity

These protocols ensure that Cursor AI interactions remain focused, contextual, and avoid patterns that might trigger suspicious activity detection.
