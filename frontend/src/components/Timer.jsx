import { useState, useEffect, useRef } from "react";
import { playSound } from "../utils/audio";

// URL del API - cambia automáticamente entre desarrollo y producción
const API = import.meta.env.PUBLIC_API_URL || "";

export default function Timer() {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("ready");
  const [label, setLabel] = useState("Estudio");
  const [quote, setQuote] = useState("Preparando tu café...");
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);

  const timerRef = useRef(null);
  const quoteRef = useRef(null);

  const quotes = [
    "Deja que el café se prepare...",
    "Mantén el foco, tú puedes",
    "Estás construyendo tu futuro",
    "Un grano a la vez...",
    "Respira y sigue...",
  ];

  //efecto para cargar el tiempo en base a lo que diga el arquetipo
  useEffect(() => {
    const archetype = localStorage.getItem("focus_archetype");
    let defaultMinutes = 25; // Estándar

    if (archetype === "A") defaultMinutes = 15;
    else if (archetype === "C") defaultMinutes = 40;

    setSelectedMinutes(defaultMinutes);
    setTimeLeft(defaultMinutes * 60);
    setIsInitialized(true);
  }, []);

  // este efecto sirve para resetear tiempo cuando cambia la selección después de inicializar
  useEffect(() => {
    if (sessionStatus === "ready" && isInitialized) {
      setTimeLeft(selectedMinutes * 60);
      setQuote("Preparando tu café...");
    }
  }, [selectedMinutes, sessionStatus, isInitialized]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      finishSession();
    }
    return () => {
      clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // efecto separado para las quotes que van apareciendo
  useEffect(() => {
    if (isActive && sessionStatus === "running") {
      // cambia el mensaje cada 20 segundos
      quoteRef.current = setInterval(() => {
        const remaining = timeLeft;
        if (remaining <= 60) {
          setQuote("¡Ya casi! El aroma está cerca");
        } else {
          setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        }
      }, 20000);
    }
    return () => {
      clearInterval(quoteRef.current);
    };
  }, [isActive, sessionStatus]);

  // hay una frase final especial siempre
  useEffect(() => {
    if (timeLeft <= 60 && timeLeft > 0 && isActive) {
      setQuote("¡Ya casi! El aroma está cerca");
    }
  }, [timeLeft, isActive]);

  const finishSession = async () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    setSessionStatus("completed");
    playSound("success");
    setQuote("¡Café listo! Disfruta tu recompensa.");

    //lógica de cobro de la sesion
    const token = localStorage.getItem("focus_token");
    if (!token) return;

    try {
      const response = await fetch(`${API}/sessions/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Se envia el tiempo seleccionado y la etiqueta
          duration_minutes: selectedMinutes,
          label: label,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`¡Ganaste ${data.points_earned} puntos!`);
        //  puntos nuevos en localStorage para actualizar el header más rapido
        localStorage.setItem("cached_points", data.new_total_points);
        // Guardamos el resultado para mostrarlo y usarlo al redirigir
        setSessionResult(data);
      }
    } catch (error) {
      console.error("Error guardando sesión:", error);
    }
  };

  // Función para reclamar recompensa y redirigir
  const claimReward = () => {
    if (sessionResult?.first_session_of_day) {
      // Primera sesión del día, mostrar racha
      window.location.href = "/streak";
    } else {
      // Ya estudió hoy, volver al dashboard
      window.location.href = "/dashboard";
    }
  };

  // --- CÁLCULOS VISUALES ( esta seccion fue con ayuda exslusiva de IA para que quedara bien) ---
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = selectedMinutes * 60;
  const progress = timeLeft / totalSeconds;
  const dashOffset = circumference * (1 - progress);

  // Calcular posición del grano de café en el círculo
  // El grano debe seguir EXACTAMENTE el círculo de progreso (radius = 120)
  // El contenedor del círculo tiene paddingTop: 10px, así que ajustamos
  const progressAngle = (1 - progress) * 360; // Cuánto ha avanzado en grados (0 a 360)
  const angleInRadians = ((-90 + progressAngle) * Math.PI) / 180; // Sentido horario desde arriba

  // El SVG es de 280x280 con centro en 140,140
  // El grano se posiciona relativo al contenedor de 280x320 con paddingTop 10px
  const beanCenterX = 140; // Centro X del círculo
  const beanCenterY = 140 + 10; // Centro Y + el paddingTop del contenedor
  const beanX = beanCenterX + radius * Math.cos(angleInRadians);
  const beanY = beanCenterY + radius * Math.sin(angleInRadians);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}
    >
      {/* etiqueta e icono */}
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{
            backgroundColor: "#38491E",
            color: "#E8E4D9",
            fontWeight: "500",
            fontSize: "0.875rem",
            padding: "0.5rem 2.25rem 0.5rem 1.5rem",
            borderRadius: "9999px",
            border: "none",
            textAlign: "center",
            outline: "none",
            fontFamily: "'Omnes', system-ui, sans-serif",
          }}
        />
        {/* icono de editar */}
        <svg
          style={{
            position: "absolute",
            right: "10px",
            width: "14px",
            height: "14px",
            pointerEvents: "none",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#E8E4D9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </div>

      {/* círculo central con timer y taza */}
      <div
        style={{
          position: "relative",
          width: "280px",
          height: "320px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "10px",
        }}
      >
        {/* SVG del círculo de progreso */}
        <svg
          style={{
            position: "absolute",
            top: "0",
            width: "280px",
            height: "280px",
            transform: "rotate(-90deg) scaleY(-1)",
          }}
          viewBox="0 0 280 280"
        >
          {/* Círculo de fondo */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="#E6D5C3"
            strokeWidth="6"
            fill="none"
          />
          {/* Círculo de progreso */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="#C9A87C"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>

        {/* Grano de café que sigue el progreso - DETRÁS de la taza */}
        <img
          src="/assets/coffee_bean.png"
          alt=""
          style={{
            position: "absolute",
            width: "20px",
            height: "20px",
            objectFit: "contain",
            left: `${beanX}px`,
            top: `${beanY}px`,
            transform: "translate(-50%, -50%)",
            transition: "left 1s linear, top 1s linear",
            zIndex: 1,
          }}
        />

        {/* Contenido central */}
        <div
          style={{
            position: "absolute",
            top: "0",
            width: "280px",
            height: "280px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Timer */}
          <p
            style={{
              fontSize: "2.75rem",
              fontWeight: "300",
              color: "#3C2A20",
              margin: "0",
              letterSpacing: "0.05em",
              fontFamily: "'Omnes', system-ui, sans-serif",
            }}
          >
            {formatTime(timeLeft)}
          </p>
        </div>

        {/* Imagen de la taza -- sobresale del círculo, por encima del grano */}
        <img
          src="/assets/coffee_cup.png"
          alt="Taza de café"
          style={{
            position: "absolute",
            bottom: "0",
            width: "200px",
            height: "180px",
            objectFit: "contain",
            zIndex: 10,
          }}
        />
      </div>

      {/* 3. mensaje */}
      <p
        style={{
          fontSize: "1.125rem",
          fontStyle: "italic",
          color: "#3C2A20",
          textAlign: "center",
          margin: "0",
          fontFamily: "'Omnes', system-ui, sans-serif",
        }}
      >
        {quote}
      </p>

      {/* 4. CONTROLES */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
          marginTop: "0.5rem",
        }}
      >
        {/*selector de minutos (solo en ready) */}
        {sessionStatus === "ready" && (
          <div
            style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}
          >
            {[1, 15, 25, 40].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMinutes(m)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                  backgroundColor:
                    selectedMinutes === m ? "#3C2A20" : "transparent",
                  color: selectedMinutes === m ? "white" : "#7F5539",
                  fontFamily: "'Omnes', system-ui, sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* botón empezar */}
        {sessionStatus === "ready" && (
          <button
            onClick={() => {
              setIsActive(true);
              setSessionStatus("running");
            }}
            style={{
              backgroundColor: "#38491E",
              color: "#E8E4D9",
              fontWeight: "600",
              fontSize: "1.125rem",
              padding: "0.875rem 2.5rem",
              borderRadius: "9999px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              fontFamily: "'Omnes', system-ui, sans-serif",
            }}
          >
            Empezar!
          </button>
        )}

        {/* botones durante sesión */}
        {sessionStatus === "running" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setIsActive(!isActive)}
              style={{
                backgroundColor: isActive ? "#B08968" : "#38491E",
                color: "#E8E4D9",
                fontWeight: "600",
                fontSize: "1.125rem",
                padding: "0.875rem 2.5rem",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                fontFamily: "'Omnes', system-ui, sans-serif",
              }}
            >
              {isActive ? "Pausar" : "Reanudar"}
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.7rem",
                color: "#7F5539",
                fontWeight: "600",
                fontFamily: "'Omnes', system-ui, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              CANCELAR SESIÓN
            </button>
          </div>
        )}

        {/* botón al completar */}
        {sessionStatus === "completed" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            {sessionResult && (
              <p
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#38491E",
                  margin: "0",
                  fontFamily: "'Omnes', system-ui, sans-serif",
                }}
              >
                +{sessionResult.points_earned} puntos ☕
              </p>
            )}
            <button
              onClick={claimReward}
              style={{
                backgroundColor: "#38491E",
                color: "#E8E4D9",
                fontWeight: "600",
                fontSize: "1.125rem",
                padding: "0.875rem 2.5rem",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                fontFamily: "'Omnes', system-ui, sans-serif",
              }}
            >
              Recoger Recompensa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
