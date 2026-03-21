import { useRef, useState, useMemo, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

interface ThemeNode {
  id: string;
  name: string;
  count: number;
  val: number; // For node size
  color: string;
}

interface GalaxyThemesProps {
  themes: Array<{ theme: string; count: number }>;
}

export function GalaxyThemes({ themes }: GalaxyThemesProps) {
  const fgRef = useRef<any>();
  const nodeObjectsRef = useRef<Map<string, any>>(new Map());
  const userInteractingRef = useRef(false);
  const interactionTimeoutRef = useRef<number | null>(null);
  const autoRotateAngleRef = useRef(0);
  const lastFrameTsRef = useRef<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<ThemeNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { graphData } = useMemo(() => {
    const nodes: ThemeNode[] = themes.map((t) => {
      const warm = 235 + Math.floor(Math.random() * 20); // 235-254
      const blue = 210 + Math.floor(Math.random() * 35); // 210-244
      const color = `rgb(255,${warm},${blue})`;

      const base = Math.max(t.count * 1.6, 2);

      return {
        id: t.theme,
        name: t.theme,
        count: t.count,
        val: base,
        color,
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 20,
      } as any;
    });

    // No links for true galaxy feel, just stars
    return { graphData: { nodes, links: [] } };
  }, [themes]);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    
    // Aim at node from outside it
    const distance = 40;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    if (fgRef.current) {
        fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
        );
    }
  };

  const handleBackgroundClick = () => {
      setSelectedNode(null);
  };

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    const dom = fg.renderer?.().domElement;
    if (!dom) return;

    const start = () => {
      userInteractingRef.current = true;
      if (interactionTimeoutRef.current) {
        window.clearTimeout(interactionTimeoutRef.current);
        interactionTimeoutRef.current = null;
      }
    };

    const end = () => {
      if (interactionTimeoutRef.current) {
        window.clearTimeout(interactionTimeoutRef.current);
      }
      interactionTimeoutRef.current = window.setTimeout(() => {
        userInteractingRef.current = false;
      }, 1500);
    };

    dom.addEventListener('pointerdown', start);
    dom.addEventListener('wheel', start, { passive: true } as any);
    dom.addEventListener('pointerup', end);
    dom.addEventListener('pointercancel', end);
    dom.addEventListener('pointerleave', end);

    return () => {
      dom.removeEventListener('pointerdown', start);
      dom.removeEventListener('wheel', start as any);
      dom.removeEventListener('pointerup', end);
      dom.removeEventListener('pointercancel', end);
      dom.removeEventListener('pointerleave', end);
      if (interactionTimeoutRef.current) {
        window.clearTimeout(interactionTimeoutRef.current);
        interactionTimeoutRef.current = null;
      }
    };
  }, [dimensions.width, dimensions.height]);

  // Custom node object generator
  const nodeThreeObject = (node: any) => {
    const group = new THREE.Group();
    
    const initialPhase = Math.random() * Math.PI * 2;
    const pulseSpeed = 0.006 + Math.random() * 0.012;
    const wobbleSpeed = 0.003 + Math.random() * 0.008;
    const wobbleAmp = 0.003 + Math.random() * 0.01;
    const baseGlowOpacity = 0.35 + Math.random() * 0.35;
    
    // Core Sphere (统一白黄，低发光；“未发光”靠低亮度 + 轻微辉光营造星体感觉)
    const geometry = new THREE.SphereGeometry(node.val * 0.45, 24, 24);
    const material = new THREE.MeshBasicMaterial({
      color: node.color,
      transparent: true,
      opacity: 0.85
    });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    // Glow Sprite
    const spriteMaterial = new THREE.SpriteMaterial({
      color: node.color,
      transparent: true,
      opacity: baseGlowOpacity,
      blending: THREE.AdditiveBlending
    });
    
    // Procedural glow texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.2, 'rgba(255,255,240,0.6)'); // Yellowish tint
      gradient.addColorStop(0.5, 'rgba(255,255,224,0.1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
      spriteMaterial.map = new THREE.CanvasTexture(canvas);
    }

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(node.val * 5.5, node.val * 5.5, 1);
    group.add(sprite);
    
    // Store animation data on the group user data
    group.userData = {
      phase: initialPhase,
      speed: pulseSpeed,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed,
      wobbleAmp,
      baseOpacity: baseGlowOpacity,
      baseScale: node.val * 5.5,
      sprite: sprite,
      sphere: sphere
    };

    nodeObjectsRef.current.set(String(node.id), group);
    
    return group;
  };

  useEffect(() => {
    return () => {
      nodeObjectsRef.current.clear();
    };
  }, []);

  // Tune forces for higher density once graph is ready
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    const charge = fg.d3Force('charge');
    if (charge?.strength) {
      charge.strength(-6);
      if (charge.distanceMax) charge.distanceMax(80);
    }

    const center = fg.d3Force('center');
    if (center?.x && center?.y && center?.z) {
      center.x(0);
      center.y(0);
      center.z(0);
    }
  }, [graphData]);

  // Animation tick function (opacity pulse + subtle wobble)
  useEffect(() => {
    let animationFrameId: number;

    const animate = (ts?: number) => {
      const now = typeof ts === 'number' ? ts : performance.now();
      const last = lastFrameTsRef.current ?? now;
      const deltaMs = Math.min(50, Math.max(0, now - last));
      lastFrameTsRef.current = now;

      if (fgRef.current && !selectedNode && !userInteractingRef.current) {
        const speed = 0.00012;
        autoRotateAngleRef.current += deltaMs * speed;

        const angle = autoRotateAngleRef.current;
        const radius = 75;
        const y = 18;

        fgRef.current.cameraPosition(
          { x: radius * Math.sin(angle), y, z: radius * Math.cos(angle) },
          { x: 0, y: 0, z: 0 },
          0
        );
      }
      // ForceGraph exposes the scene via ref, but accessing individual node objects 
      // is tricky without traversing the scene.
      // However, react-force-graph handles the render loop.
      // To animate nodes, we can rely on the fact that Three.js objects persist.
      // But we need a way to update them.
      // A common trick is to use d3-timer or requestAnimationFrame and update the scene graph.
      
      for (const group of nodeObjectsRef.current.values()) {
        if (!group.userData?.sprite) continue;

        group.userData.phase += group.userData.speed;
        group.userData.wobblePhase += group.userData.wobbleSpeed;

        const pulse = Math.sin(group.userData.phase);
        const wobble = Math.sin(group.userData.wobblePhase);

        const opacity = Math.min(0.9, Math.max(0.15, group.userData.baseOpacity + pulse * 0.15));
        const scale = group.userData.baseScale * (0.92 + (pulse + 1) * 0.06);
        const rot = wobble * group.userData.wobbleAmp;

        const sprite = group.userData.sprite as any;
        sprite.material.opacity = opacity;
        sprite.scale.set(scale, scale, 1);

        group.rotation.y = rot;
        group.rotation.x = rot * 0.7;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedNode]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      {/* Galaxy Background Gradient - Handled by parent now for full coverage */}
      
      {dimensions.width > 0 && (
        <ForceGraph3D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="name"
            nodeColor="color"
            nodeRelSize={3.2}
            nodeResolution={32}
            
            nodeThreeObject={nodeThreeObject}

            backgroundColor="rgba(0,0,0,0)"
            showNavInfo={false}
            onNodeClick={handleNodeClick}
            onBackgroundClick={handleBackgroundClick}
            enableNodeDrag={false}
            d3VelocityDecay={0.22}
            cooldownTicks={120}
        />
      )}

      {/* Selected Theme Overlay */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 px-8 text-center shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <h3 className="text-2xl font-bold text-white mb-1" style={{ textShadow: `0 0 10px ${selectedNode.color}` }}>
                {selectedNode.name}
              </h3>
              <p className="text-purple-200/60 text-sm">
                出现了 {selectedNode.count} 次
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hint Text */}
      <div className="absolute top-4 right-4 text-xs text-white/20 pointer-events-none select-none">
        拖动旋转 · 点击星体
      </div>
    </div>
  );
}
