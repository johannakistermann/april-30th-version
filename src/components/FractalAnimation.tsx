import { useEffect, useRef } from "react";

interface FractalAnimationProps {
  isPlaying: boolean;
  color?: string;
}

const FractalAnimation = ({ isPlaying, color = "hsl(40, 88%, 61%)" }: FractalAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isPlaying) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;
    let time = 0;

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, 300, 300);

      const cx = 150;
      const cy = 150;
      const maxRadius = 120;

      for (let i = 0; i < 360; i += 2) {
        const angle = (i * Math.PI) / 180;
        const r1 = maxRadius * (0.5 + 0.5 * Math.sin(time * 0.02 + i * 0.05));
        const r2 = maxRadius * 0.3 * Math.sin(time * 0.03 + i * 0.08);
        const r = r1 + r2;

        const x = cx + r * Math.cos(angle + time * 0.005);
        const y = cy + r * Math.sin(angle + time * 0.005);

        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.01 + i * 0.02));
        ctx.fillStyle = color.replace(")", ` / ${alpha})`).replace("hsl(", "hsl(");
        ctx.beginPath();
        ctx.arc(x, y, 1.5 + Math.sin(time * 0.05 + i) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let ring = 0; ring < 3; ring++) {
        const sides = 6 + ring * 2;
        const ringRadius = 30 + ring * 25 + Math.sin(time * 0.02) * 10;
        ctx.strokeStyle = color.replace(")", " / 0.2)").replace("hsl(", "hsl(");
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let j = 0; j <= sides; j++) {
          const a = (j / sides) * Math.PI * 2 + time * 0.01 * (ring + 1);
          const px = cx + ringRadius * Math.cos(a);
          const py = cy + ringRadius * Math.sin(a);
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      time++;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, color]);

  if (!isPlaying) return null;

  return (
    <div className="relative w-[300px] h-[300px] mx-auto">
      <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl animate-pulse" />
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-full"
        style={{ filter: "blur(0.5px)" }}
      />
      <p className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-muted-foreground font-display mt-2">
        Biosignature transmitting...
      </p>
    </div>
  );
};

export default FractalAnimation;