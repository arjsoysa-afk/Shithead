import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticleBurstProps {
  active: boolean;
  onDone: () => void;
}

const NEON_COLORS = ['#bf5af2', '#00f0ff', '#ff6bcb', '#00ff87', '#ffd60a'];
const PARTICLE_COUNT = 20;

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 60 + Math.random() * 90,
    size: 4 + Math.random() * 4,
    color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
    delay: Math.random() * 0.05,
  }));
}

export function ParticleBurst({ active, onDone }: ParticleBurstProps) {
  const particles = useRef<Particle[]>(generateParticles());
  const doneCountRef = useRef(0);

  useEffect(() => {
    if (active) {
      // Re-generate particles on each burst
      particles.current = generateParticles();
      doneCountRef.current = 0;
    }
  }, [active]);

  const handleParticleDone = () => {
    doneCountRef.current += 1;
    if (doneCountRef.current >= PARTICLE_COUNT) {
      onDone();
    }
  };

  return (
    <AnimatePresence>
      {active && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 200 }}
        >
          {particles.current.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = p.distance * Math.cos(rad);
            const ty = p.distance * Math.sin(rad);
            return (
              <motion.div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  backgroundColor: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                  marginLeft: -(p.size / 2),
                  marginTop: -(p.size / 2),
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
                transition={{ duration: 0.6, delay: p.delay, ease: 'easeOut' }}
                onAnimationComplete={handleParticleDone}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
