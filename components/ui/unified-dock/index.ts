// Core components
export { default as DockCore } from "./DockCore";
export { default as DockItem } from "./DockItem";
export { default as DockPreview } from "./DockPreview";

// Specialized implementations
export { default as MacOSDock } from "./MacOSDock";
export { default as MacOSNavDock } from "./MacOSNavDock";
export { default as CategoryDock } from "./CategoryDock";

// Types
export type { DockPosition, DockCoreProps } from "./DockCore";
export type { DockItemProps } from "./DockItem";
export type { DockPreviewProps } from "./DockPreview";
