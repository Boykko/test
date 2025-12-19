import React from "react";

interface TargetingArrowProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export const TargetingArrow: React.FC<{ start: { x: number; y: number } }> = ({ start }) => {
  const [mousePos, setMousePos] = React.useState({ x: start.x, y: start.y });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const end = mousePos;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  const cx = (start.x + end.x) / 2 - (dy * 0.2); 
  const cy = (start.y + end.y) / 2 + (Math.abs(dx) * 0.2);

  const path = `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;

  return (
    <svg className="fixed inset-0 pointer-events-none z-[100] w-full h-full overflow-visible">
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
        </marker>
        <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>
      
      <path d={path} stroke="rgba(239, 68, 68, 0.4)" strokeWidth="8" fill="none" filter="url(#glow)" strokeLinecap="round" />
      
      <path 
        d={path} 
        stroke="#ef4444" 
        strokeWidth="4" 
        fill="none" 
        strokeDasharray="10 5"
        markerEnd="url(#arrowhead)"
        className="animate-[dash_1s_linear_infinite]" 
      >
        <animate attributeName="stroke-dashoffset" from="15" to="0" dur="0.5s" repeatCount="indefinite" />
      </path>

      <circle cx={end.x} cy={end.y} r="20" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" className="animate-ping" />
      <circle cx={end.x} cy={end.y} r="10" fill="#ef4444" />
    </svg>
  );
};