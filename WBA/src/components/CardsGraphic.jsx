import React, { useState } from 'react';

export default function CardsGraphic() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      className="cards-graphic-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="cards-graphic-container"
        style={{
          transform: `perspective(1000px) rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg)`,
        }}
      >
        {/* Card 1: Lavender / Muted Purple (Top Left) */}
        <div
          className="layered-card card-lavender"
          style={{
            transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
          }}
        >
          <div className="card-glass-shine"></div>
        </div>

        {/* Card 2: Deep Violet / Dark Purple (Top Right) */}
        <div
          className="layered-card card-violet"
          style={{
            transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)`,
          }}
        >
          <div className="card-glass-shine"></div>
        </div>

        {/* Card 3: Middle / Bottom Deep Purple (Front) */}
        <div
          className="layered-card card-purple-front"
          style={{
            transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)`,
          }}
        >
          <div className="card-glass-shine"></div>
        </div>
      </div>
    </div>
  );
}
