import { useState, useRef } from "react";

// La ruleta tiene 8 segmentos y esta es su configuración
// se mezclan colores y tipos de recompensa
const SEGMENTS = [
  { value: 50, label: "+50", type: "points", bgColor: "#B8A88A" },
  { value: 5, label: "+5", type: "time", bgColor: "#F5EDE0" },
  { value: 20, label: "+20", type: "points", bgColor: "#B8A88A" },
  { value: 5, label: "+5", type: "points", bgColor: "#F5EDE0" },
  { value: 5, label: "+5", type: "time", bgColor: "#B8A88A" },
  { value: 20, label: "+20", type: "points", bgColor: "#F5EDE0" },
  { value: 5, label: "+5", type: "points", bgColor: "#B8A88A" },
  { value: 5, label: "+5", type: "time", bgColor: "#F5EDE0" },
];

export default function ShopWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  const spin = async () => {
    if (isSpinning) return;

    const token = localStorage.getItem("focus_token");
    if (!token) return;

    setIsSpinning(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/gamification/spin", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Error al girar");
        setIsSpinning(false);
        return;
      }

      // Gira la ruleta mínimo 5 veces y con ángulo aleatorio
      const spins = 5 + Math.random() * 3;
      const newRotation = rotation + spins * 360 + Math.random() * 360;
      setRotation(newRotation);

      // Espera a que termine la animación
      setTimeout(() => {
        setIsSpinning(false);
        alert(`🎉 ${data.message}`);

        if (window.updatePointsDisplay) {
          window.updatePointsDisplay(data.new_balance);
        }
      }, 4000);
    } catch (error) {
      console.error(error);
      setIsSpinning(false);
    }
  };

  // Crear los paths SVG para cada segmento
  const createSegmentPath = (index, total) => {
    const angle = 360 / total;
    const startAngle = index * angle - 90;
    const endAngle = startAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const radius = 140;
    const centerX = 150;
    const centerY = 150;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };

  // Calcular posición del contenido de cada segmento
  const getSegmentContentPosition = (index, total) => {
    const angle = 360 / total;
    const midAngle = index * angle + angle / 2 - 90;
    const rad = (midAngle * Math.PI) / 180;
    const radius = 95;

    return {
      x: 150 + radius * Math.cos(rad),
      y: 150 + radius * Math.sin(rad),
      rotation: midAngle + 90,
    };
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      {/* Contenedor de la ruleta */}
      <div
        style={{
          position: "relative",
          width: "280px",
          height: "280px",
        }}
      >
        {/* Borde exterior café oscuro */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            backgroundColor: "#3C2A20",
            padding: "10px",
          }}
        >
          {/* Borde blanco interior */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: "#F5EDE0",
              padding: "3px",
            }}
          >
            {/* La ruleta que gira */}
            <div
              ref={wheelRef}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                overflow: "hidden",
                transition: isSpinning
                  ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                  : "none",
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <svg
                viewBox="0 0 300 300"
                style={{ width: "100%", height: "100%" }}
              >
                {/* Segmentos */}
                {SEGMENTS.map((seg, i) => (
                  <path
                    key={i}
                    d={createSegmentPath(i, SEGMENTS.length)}
                    fill={seg.bgColor}
                    stroke="#3C2A20"
                    strokeWidth="2"
                  />
                ))}

                {/* Líneas divisorias */}
                {SEGMENTS.map((_, i) => {
                  const angle = ((i * 45 - 90) * Math.PI) / 180;
                  const x2 = 150 + 140 * Math.cos(angle);
                  const y2 = 150 + 140 * Math.sin(angle);
                  return (
                    <line
                      key={`line-${i}`}
                      x1="150"
                      y1="150"
                      x2={x2}
                      y2={y2}
                      stroke="#3C2A20"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Contenido de cada segmento */}
                {SEGMENTS.map((seg, i) => {
                  const pos = getSegmentContentPosition(i, SEGMENTS.length);
                  const isTime = seg.type === "time";
                  const iconSrc = isTime
                    ? seg.bgColor === "#B8A88A"
                      ? "/assets/clock_white.png"
                      : "/assets/clock_black.png"
                    : "/assets/coffee_bean.png";

                  return (
                    <g
                      key={`content-${i}`}
                      transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation})`}
                    >
                      {/* Icono */}
                      <image
                        href={iconSrc}
                        x="-10"
                        y="-22"
                        width="20"
                        height="20"
                      />
                      {/* Texto */}
                      <text
                        x="0"
                        y="10"
                        textAnchor="middle"
                        fill="#38491E"
                        fontSize="14"
                        fontWeight="bold"
                        fontFamily="'Omnes', system-ui, sans-serif"
                      >
                        {seg.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Centro - Botón GIRAR estilo taza de café */}
        <button
          onClick={spin}
          disabled={isSpinning}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            border: "4px solid #F5EDE0",
            backgroundColor: "#3C2A20",
            color: "#F5EDE0",
            fontWeight: "800",
            fontSize: "0.8rem",
            cursor: isSpinning ? "not-allowed" : "pointer",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.3), inset 0 -4px 8px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Omnes', system-ui, sans-serif",
            zIndex: 10,
            transition: "transform 0.2s",
            backgroundImage:
              "radial-gradient(circle at 40% 30%, #5C4033 0%, #3C2A20 70%)",
          }}
          onMouseOver={(e) =>
            !isSpinning &&
            (e.currentTarget.style.transform =
              "translate(-50%, -50%) scale(1.05)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.transform = "translate(-50%, -50%)")
          }
        >
          {isSpinning ? "..." : "GIRAR"}
        </button>

        {/* Indicador/Flecha arriba */}
        <div
          style={{
            position: "absolute",
            top: "-5px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "0",
            height: "0",
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "18px solid #3C2A20",
            zIndex: 20,
          }}
        />
      </div>

      {/* Texto de costo */}
      <p
        style={{
          fontSize: "0.875rem",
          color: "#7F5539",
          fontWeight: "500",
          margin: 0,
          fontFamily: "'Omnes', system-ui, sans-serif",
        }}
      >
        Costo: 10 granos de café
      </p>
    </div>
  );
}
