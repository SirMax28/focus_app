import { useState, useEffect } from "react";

// URL del API - cambia automáticamente entre desarrollo y producción
const API = import.meta.env.PUBLIC_API_URL || "";

export default function DashboardHeader() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("focus_token");

    // saca al usuario si no hay token
    if (!token) {
      window.location.href = "/login";
      return;
    }

    //se obtiene la info del usuario
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token inválido");
        return res.json();
      })
      .then((userData) => {
        setUser(userData);

        //verifica si el usuario tiene perfil
        return fetch(`${API}/users/my-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => {
        if (res.status === 404) {
          // en caso de que no tenga perfil redirige a onboarding
          console.log("Usuario nuevo detectado. Redirigiendo a onboarding...");
          window.location.href = "/onboarding";
        } else {
          // si tiene perfil carga normalmente
          setLoading(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("focus_token");
        window.location.href = "/login";
      });
  }, []);

  if (loading)
    return <div style={{ color: "#7F5539", fontSize: "0.9rem" }}>☕</div>;

  // Badge de puntos
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "white",
        padding: "0.5rem 1rem",
        borderRadius: "25px",
        border: "2px solid #3C2A20",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <img
        src="/assets/coffee_bean.png"
        alt=""
        style={{ width: "20px", height: "20px" }}
      />
      <span
        style={{
          color: "#3C2A20",
          fontWeight: "700",
          fontSize: "1rem",
        }}
      >
        {user?.current_points || 0}
      </span>
      <span style={{ color: "#38491E", fontSize: "1rem" }}>+</span>
    </div>
  );
}
