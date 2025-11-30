import { useEffect, useState } from "react";

export default function StreakView() {
  const [streak, setStreak] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("focus_token");
    if (token) {
      fetch("http://127.0.0.1:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((u) => {
          setStreak(u.current_streak_days);
          setTimeout(() => setIsLoaded(true), 100);
        });
    } else {
      setIsLoaded(true);
    }
  }, []);

  // Los dias de la semana para la barra de progreso
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const jsDay = new Date().getDay();
  const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1;

  // Determina el mensaje motivacional según la racha
  const getMessage = () => {
    if (streak === 0) return "¡Empieza tu racha hoy!";
    if (streak === 1) return "¡Primer día! El café está calentando";
    if (streak < 7) return "¡Buena racha! No dejes que el café se enfríe";
    if (streak < 14) return "¡Una semana! Tu café está hirviendo 🔥";
    if (streak < 30) return "¡Increíble! Eres una máquina de café";
    return "¡Leyenda del café! ☕";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {/* animacion simple de la taza */}
      <div
        style={{
          position: "relative",
          marginBottom: "0.5rem",
        }}
      >
        <img
          src="/assets/coffe_cup_streak.png"
          alt="Taza de racha"
          className="animate-float animate-glow"
          style={{
            width: "180px",
            height: "180px",
            objectFit: "contain",
          }}
        />
      </div>

      {/* número gigante de racha */}
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "6rem",
            fontWeight: "900",
            color: "#3C2A20",
            lineHeight: "1",
            margin: "0",
            fontFamily: "'Omnes', system-ui, sans-serif",
            textShadow: "2px 4px 8px rgba(60, 42, 32, 0.15)",
          }}
        >
          {streak}
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "#7F5539",
            margin: "0.25rem 0 0 0",
            fontFamily: "'Omnes', system-ui, sans-serif",
          }}
        >
          Días de racha
        </p>
      </div>

      {/* barra de progreso semanal con círculos de café */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: "320px",
        }}
      >
        {days.map((day, index) => {
          const isActive = index === currentDayIndex;
          const isPast = index < currentDayIndex;
          const isCompleted = isPast || isActive;

          return (
            <div
              key={day}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {/* Letra del día */}
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: isActive ? "#3C2A20" : "#7F5539",
                  fontFamily: "'Omnes', system-ui, sans-serif",
                }}
              >
                {day}
              </span>

              {/*circulo con imagen de cafe */}
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isCompleted ? "transparent" : "#E6CCB2",
                  border: isActive ? "3px solid #38491E" : "none",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.3s ease",
                  boxShadow: isActive
                    ? "0 4px 12px rgba(56, 73, 30, 0.3)"
                    : "none",
                }}
              >
                {isCompleted ? (
                  <img
                    src="/assets/coffe_circle.png"
                    alt="Día completado"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      opacity: isPast ? 0.7 : 1,
                    }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* el mensaje motivacional */}
      <p
        style={{
          fontSize: "1rem",
          fontStyle: "italic",
          color: "#3C2A20",
          textAlign: "center",
          margin: "0.5rem 0",
          padding: "0 1rem",
          fontFamily: "'Omnes', system-ui, sans-serif",
        }}
      >
        {getMessage()}
      </p>

      {/* botón para continuar */}
      <button
        onClick={() => (window.location.href = "/dashboard")}
        style={{
          backgroundColor: "#38491E",
          color: "#F5EDE0",
          fontWeight: "700",
          fontSize: "1.125rem",
          padding: "1rem 3rem",
          borderRadius: "9999px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(56, 73, 30, 0.3)",
          fontFamily: "'Omnes', system-ui, sans-serif",
          transition: "transform 0.2s, box-shadow 0.2s",
          marginTop: "0.5rem",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(56, 73, 30, 0.4)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(56, 73, 30, 0.3)";
        }}
      >
        Continuar
      </button>
    </div>
  );
}
