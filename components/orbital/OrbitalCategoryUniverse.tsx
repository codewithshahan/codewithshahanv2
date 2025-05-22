"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Category {
  name: string;
  slug: string;
  count: number;
  color: string;
  icon?: React.ReactNode;
}

interface OrbitalCategoryUniverseProps {
  categories: Category[];
  type: "articles" | "products";
  className?: string;
  particleCount?: number;
  radius?: number;
  rotationSpeed?: number;
  particleSize?: number;
  showLabels?: boolean;
  onCategoryClick?: (category: Category) => void;
}

export function OrbitalCategoryUniverse({
  categories,
  type,
  className,
  particleCount = 20,
  radius = 3,
  rotationSpeed = 0.05,
  particleSize = 12,
  showLabels = true,
  onCategoryClick,
}: OrbitalCategoryUniverseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [hoveredParticle, setHoveredParticle] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      containerRef.current.appendChild(renderer.domElement);

      // Create particles
      const particlesGeometry = new THREE.BufferGeometry();
      const count = Math.min(categories.length, particleCount);
      const posArray = new Float32Array(count * 3);

      for (let i = 0; i < count * 3; i += 3) {
        const theta = ((i / 3) * (Math.PI * 2)) / count;
        posArray[i] = Math.cos(theta) * radius;
        posArray[i + 1] = Math.sin(theta) * radius;
        posArray[i + 2] = 0;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3)
      );

      // Create material with custom shader
      const particlesMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          uniform float uTime;
          varying vec3 vPosition;
          
          void main() {
            vPosition = position;
            vec3 pos = position;
            pos.y += sin(pos.x * 2.0 + uTime) * 0.1;
            pos.x += cos(pos.y * 2.0 + uTime) * 0.1;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = ${particleSize}.0 * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          varying vec3 vPosition;
          
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            
            vec3 color = mix(uColor1, uColor2, vPosition.y * 0.5 + 0.5);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        uniforms: {
          uTime: { value: 0 },
          uColor1: {
            value: new THREE.Color(
              resolvedTheme === "dark" ? "#4F46E5" : "#818CF8"
            ),
          },
          uColor2: {
            value: new THREE.Color(
              resolvedTheme === "dark" ? "#818CF8" : "#4F46E5"
            ),
          },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      // Add connecting lines
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = [];
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          linePositions.push(
            posArray[i * 3],
            posArray[i * 3 + 1],
            posArray[i * 3 + 2],
            posArray[j * 3],
            posArray[j * 3 + 1],
            posArray[j * 3 + 2]
          );
        }
      }
      lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3)
      );

      const lineMaterial = new THREE.LineBasicMaterial({
        color: resolvedTheme === "dark" ? "#4F46E5" : "#818CF8",
        transparent: true,
        opacity: 0.2,
      });

      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);

      // Mouse interaction
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onMouseMove = (event: MouseEvent) => {
        if (!isDragging) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(particles);

        if (intersects.length > 0) {
          const index = intersects[0].index;
          if (index !== undefined) {
            setHoveredParticle(index);
          }
        } else {
          setHoveredParticle(null);
        }
      };

      const onMouseDown = () => setIsDragging(true);
      const onMouseUp = () => setIsDragging(false);

      const onClick = (event: MouseEvent) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(particles);

        if (intersects.length > 0) {
          const index = intersects[0].index;
          if (index !== undefined) {
            const category = categories[index];
            if (onCategoryClick) {
              onCategoryClick(category);
            } else {
              router.push(`/${type}/${category.slug}`);
            }
          }
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("click", onClick);

      // Animation
      const clock = new THREE.Clock();
      let animationFrameId: number;

      const animate = () => {
        const elapsedTime = clock.getElapsedTime();

        particles.rotation.y = elapsedTime * rotationSpeed;
        lines.rotation.y = elapsedTime * rotationSpeed;
        particles.material.uniforms.uTime.value = elapsedTime;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("click", onClick);
        cancelAnimationFrame(animationFrameId);
        if (containerRef.current && renderer.domElement) {
          containerRef.current.removeChild(renderer.domElement);
        }
        scene.clear();
        renderer.dispose();
      };
    } catch (error) {
      console.error("Error initializing Three.js scene:", error);
    }
  }, [
    resolvedTheme,
    rotationSpeed,
    isDragging,
    categories,
    particleCount,
    radius,
    particleSize,
    type,
    onCategoryClick,
    router,
  ]);

  return (
    <motion.div
      ref={containerRef}
      className={cn("absolute inset-0 w-full h-full", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {hoveredParticle !== null && (
          <motion.div
            className="absolute z-20 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              left: mousePosition.x,
              top: mousePosition.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="glass-card px-4 py-2 rounded-lg whitespace-nowrap">
              <div className="flex items-center gap-2">
                {categories[hoveredParticle]?.icon}
                <span className="font-medium">
                  {categories[hoveredParticle]?.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({categories[hoveredParticle]?.count} articles)
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
