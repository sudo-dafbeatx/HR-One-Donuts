import { useEffect, useState, memo, useMemo } from 'react';

const COLORS = ['#FFC700', '#FF0000', '#2E3192', '#00ADEF', '#7AC943', '#F26522'];

interface ParticleData {
  id: number;
  color: string;
  angle: number;
  velocity: number;
  rotation: number;
  duration: number;
  size: number;
  shape: string;
}

const ConfettiParticle = ({ data }: { data: ParticleData }) => {
  const style = useMemo(() => {
    const radians = (data.angle * Math.PI) / 180;
    const vx = Math.cos(radians) * data.velocity;
    const vy = -Math.sin(radians) * data.velocity;

    return {
      '--vx': `${vx}vw`,
      '--vy': `${vy}vh`,
      '--rot': `${data.rotation}deg`,
      '--duration': `${data.duration}s`,
      backgroundColor: data.color,
      width: `${data.size}px`,
      height: `${data.size}px`,
    } as React.CSSProperties;
  }, [data]);

  return (
    <div
      className={`absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none ${data.shape}`}
      style={{
        ...style,
        animation: `confetti-burst var(--duration) cubic-bezier(0.1, 0.8, 0.3, 1) forwards`,
      }}
    />
  );
};

const Confetti = () => {
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    requestAnimationFrame(() => {
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        angle: (i / 40) * 180 + (Math.random() * 20 - 10),
        velocity: 80 + Math.random() * 60,
        rotation: Math.random() * 360,
        duration: 2.5 + Math.random() * 1.5,
        size: 6 + Math.random() * 8,
        shape: Math.random() > 0.5 ? 'rounded-sm' : 'rounded-full',
      }));
      
      setParticles(newParticles);
      setActive(true);
    });

    const timer = setTimeout(() => {
      setActive(false);
      setParticles([]);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confetti-burst {
          0% {
            transform: translate(-50%, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--vx)), var(--vy)) rotate(var(--rot));
            opacity: 0;
          }
        }
      `}} />
      {particles.map((p) => (
        <ConfettiParticle key={p.id} data={p} />
      ))}
    </div>
  );
};

export default memo(Confetti);
