import { useState, useEffect } from "react";

// URL del API - cambia automáticamente entre desarrollo y producción
const API = import.meta.env.PUBLIC_API_URL || "";

export default function WeeklyReview() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentArchetype, setCurrentArchetype] = useState("B");
  const [currentMinutes, setCurrentMinutes] = useState(25);

  // Configuración de arquetipos y sus transiciones
  const archetypeConfig = {
    A: {
      minutes: 15,
      down: null,
      up: { archetype: "B", minutes: 25 },
      upMore: { archetype: "C", minutes: 40 },
    },
    B: {
      minutes: 25,
      down: { archetype: "A", minutes: 15 },
      up: { archetype: "C", minutes: 40 },
      upMore: null,
    },
    C: {
      minutes: 40,
      down: { archetype: "B", minutes: 25 },
      up: null,
      upMore: null,
    },
  };

  useEffect(() => {
    const checkReview = async () => {
      const token = localStorage.getItem("focus_token");
      if (!token) return;

      // scá se guarda el arquetipo actual
      const savedArchetype = localStorage.getItem("focus_archetype") || "B";
      setCurrentArchetype(savedArchetype);
      setCurrentMinutes(archetypeConfig[savedArchetype]?.minutes || 25);

      try {
        const res = await fetch(`${API}/users/check-weekly-review`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.due) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkReview();
  }, []);

  // Maneja la decisión del usuario
  const handleDecision = async (decision) => {
    const config = archetypeConfig[currentArchetype];
    let newArchetype = currentArchetype;
    let newMinutes = currentMinutes;

    if (decision === "down" && config.down) {
      newArchetype = config.down.archetype;
      newMinutes = config.down.minutes;
    } else if (decision === "same") {
      newArchetype = currentArchetype;
      newMinutes = currentMinutes;
    } else if (decision === "up" && config.up) {
      newArchetype = config.up.archetype;
      newMinutes = config.up.minutes;
    } else if (decision === "upMore" && config.upMore) {
      newArchetype = config.upMore.archetype;
      newMinutes = config.upMore.minutes;
    }

    const token = localStorage.getItem("focus_token");
    await fetch(`${API}/users/update-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        new_archetype: newArchetype,
        new_minutes: newMinutes,
      }),
    });

    localStorage.setItem("focus_minutes", newMinutes);
    localStorage.setItem("focus_archetype", newArchetype);

    setIsVisible(false);
    alert("¡Plan actualizado! Vamos a por otra semana.");
    window.location.reload();
  };

  if (!isVisible) return null;

  const config = archetypeConfig[currentArchetype];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFF8F0",
          width: "100%",
          maxWidth: "360px",
          borderRadius: "1.5rem",
          padding: "2rem 1.5rem",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
          border: "3px solid #E6CCB2",
          textAlign: "center",
          fontFamily: "'Omnes', system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>

        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "800",
            color: "#3C2A20",
            margin: "0 0 0.5rem 0",
          }}
        >
          Revisión Semanal
        </h2>

        <p
          style={{
            color: "#7F5539",
            fontSize: "0.9rem",
            lineHeight: "1.5",
            margin: "0 0 0.5rem 0",
          }}
        >
          Actualmente estudias en bloques de{" "}
          <strong>{currentMinutes} minutos</strong>.
        </p>

        <p
          style={{
            color: "#3C2A20",
            fontSize: "1rem",
            fontWeight: "600",
            margin: "0 0 1.25rem 0",
          }}
        >
          ¿Cómo te fue esta semana?
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {/* opción: bajar no siempre la hay */}
          {config.down && (
            <button
              onClick={() => handleDecision("down")}
              style={{
                backgroundColor: "#E6CCB2",
                color: "#3C2A20",
                padding: "1rem",
                borderRadius: "1rem",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.95rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: "'Omnes', system-ui, sans-serif",
                transition: "transform 0.2s, background-color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#D4A373";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#E6CCB2";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <span>😰 Me costó mucho</span>
              <span
                style={{
                  fontSize: "0.7rem",
                  backgroundColor: "rgba(255,255,255,0.6)",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.5rem",
                }}
              >
                Bajar a {config.down.minutes}m
              </span>
            </button>
          )}

          {/* opción: mantener siempre disponible */}
          <button
            onClick={() => handleDecision("same")}
            style={{
              backgroundColor: "#38491E",
              color: "white",
              padding: "1rem",
              borderRadius: "1rem",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "'Omnes', system-ui, sans-serif",
              boxShadow: "0 4px 12px rgba(56, 73, 30, 0.3)",
              transition: "transform 0.2s, opacity 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <span>👍 Estuvo bien así</span>
            <span
              style={{
                fontSize: "0.7rem",
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.5rem",
              }}
            >
              Mantener {currentMinutes}m
            </span>
          </button>

          {/* opción: subir no siempre la hay */}
          {config.up && (
            <button
              onClick={() => handleDecision("up")}
              style={{
                backgroundColor: "#3C2A20",
                color: "white",
                padding: "1rem",
                borderRadius: "1rem",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.95rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: "'Omnes', system-ui, sans-serif",
                transition: "transform 0.2s, opacity 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <span>😎 Fue fácil</span>
              <span
                style={{
                  fontSize: "0.7rem",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.5rem",
                }}
              >
                Subir a {config.up.minutes}m
              </span>
            </button>
          )}

          {/* opción: subir más, por logica solo para arquetipo A, cuando sube a C */}
          {config.upMore && (
            <button
              onClick={() => handleDecision("upMore")}
              style={{
                backgroundColor: "#7F5539",
                color: "white",
                padding: "0.75rem",
                borderRadius: "1rem",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: "'Omnes', system-ui, sans-serif",
                transition: "transform 0.2s, opacity 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <span>🔥 ¡Me siento inspirado!</span>
              <span
                style={{
                  fontSize: "0.7rem",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.5rem",
                }}
              >
                Saltar a {config.upMore.minutes}m
              </span>
            </button>
          )}
        </div>

        <p
          style={{
            fontSize: "0.75rem",
            color: "rgba(127, 85, 57, 0.6)",
            marginTop: "1.5rem",
            marginBottom: 0,
          }}
        >
          Esto ajustará tus tiempos de Pomodoro automáticamente.
        </p>
      </div>
    </div>
  );
}
