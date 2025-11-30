import { useState, useEffect } from "react";

export default function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Carga datos de usuario
    const token = localStorage.getItem("focus_token");
    if (token) {
      fetch("http://127.0.0.1:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(() => {});
    }

    // Cerrar menú con la tecla Escape
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("focus_token");
    localStorage.removeItem("focus_archetype");
    window.location.href = "/login";
  };

  const menuItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pomodoro", href: "/pomodoro" },
    { label: "Mi Racha", href: "/streak" },
    { label: "Tienda", href: "/shop" },
    { label: "Recalibrar", href: "/onboarding" },
  ];

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: "none",
          border: "none",
          fontSize: "1.8rem",
          color: "#3C2A20",
          cursor: "pointer",
          padding: 0,
          lineHeight: 1,
        }}
      >
        ☰
      </button>

      {/* Overlay oscuro */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 998,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      {/* Panel lateral */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: isOpen ? 0 : "-280px",
          width: "280px",
          height: "100%",
          backgroundColor: "#F5E6D3",
          boxShadow: isOpen ? "4px 0 20px rgba(0, 0, 0, 0.2)" : "none",
          zIndex: 999,
          transition: "left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Omnes', system-ui, sans-serif",
        }}
      >
        {/* Header del menú */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #E6CCB2",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <img
              src="/assets/focus_logo_letras.png"
              alt="Focus"
              style={{ height: "30px" }}
            />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              color: "#3C2A20",
              cursor: "pointer",
              padding: "0.25rem",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Info del usuario */}
        {user && (
          <div
            style={{
              padding: "1rem 1.5rem",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              borderBottom: "1px solid #E6CCB2",
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                color: "#3C2A20",
                fontSize: "1.1rem",
              }}
            >
              Hola, {user.full_name?.split(" ")[0]}
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "0.5rem",
                fontSize: "0.85rem",
                color: "#7F5539",
              }}
            >
              <span>🔥 {user.current_streak_days || 0} días</span>
              <span>☕ {user.current_points || 0} pts</span>
            </div>
          </div>
        )}

        {/*items del menu */}
        <nav style={{ flex: 1, padding: "1rem 0" }}>
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.9rem 1.5rem",
                textDecoration: "none",
                color: "#3C2A20",
                fontSize: "1rem",
                fontWeight: 500,
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(127, 85, 57, 0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        {/* footer que es Cerrar sesión */}
        <div
          style={{
            padding: "1.5rem",
            borderTop: "1px solid #E6CCB2",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "transparent",
              border: "1.5px solid #7F5539",
              borderRadius: "12px",
              color: "#7F5539",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#7F5539";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#7F5539";
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}
