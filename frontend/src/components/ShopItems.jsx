import { useState } from "react";
import { playSound } from "../utils/audio";

// URL del API - cambia automáticamente entre desarrollo y producción
const API = import.meta.env.PUBLIC_API_URL || "";

const ITEMS = [
  {
    id: "theme",
    name: "Cambiar tema de la app",
    price: 20,
    img: "/assets/shop_bag.png",
    dark: false,
  },
  {
    id: "rest",
    name: "+5 min descanso",
    price: 10,
    img: "/assets/coffee_cup.png",
    dark: true,
  },
  {
    id: "streak",
    name: "Comodín Salvar racha",
    price: 50,
    img: "/assets/moka_pot.png",
    dark: false,
  },
  {
    id: "sound",
    name: "Sonido ambiente premium",
    price: 5,
    img: "/assets/croissant.png",
    dark: true,
  },
  {
    id: "guilt",
    name: "10 min de móvil sin culpa",
    price: 20,
    img: "/assets/coffee_to_go.png",
    dark: false,
  },
  {
    id: "reminder",
    name: "10 min de redes sociales",
    price: 10,
    img: "/assets/filter.png",
    dark: true,
  },
];

export default function ShopItems() {
  const buy = async (item) => {
    const token = localStorage.getItem("focus_token");
    if (!confirm(`¿Comprar ${item.name} por ${item.price} granos?`)) return;

    try {
      const res = await fetch(`${API}/gamification/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: item.id,
          price: item.price,
          name: item.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "No te alcanza el dinero 💸");
      } else {
        alert(`¡Comprado! ${data.message}`);
        playSound("money");

        if (window.updatePointsDisplay) {
          window.updatePointsDisplay(data.new_balance);
        }
        window.dispatchEvent(new Event("inventory-updated"));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "0.75rem",
        width: "100%",
      }}
    >
      {ITEMS.map((item) => (
        <div
          key={item.id}
          style={{
            backgroundColor: item.dark ? "#3C2A20" : "#FFF8F0",
            border: item.dark ? "none" : "2px solid #E6CCB2",
            borderRadius: "1rem",
            padding: "1rem 0.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onClick={() => buy(item)}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
          }}
        >
          {/* Imagen del item */}
          <div
            style={{
              height: "50px",
              width: "50px",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={item.img}
              alt={item.name}
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
              }}
              onError={(e) => (e.target.src = "/assets/coffee_cup.png")}
            />
          </div>

          {/* Nombre del item */}
          <h3
            style={{
              color: item.dark ? "#F5EDE0" : "#3C2A20",
              fontWeight: "700",
              fontSize: "0.7rem",
              lineHeight: "1.2",
              marginBottom: "0.5rem",
              minHeight: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Omnes', system-ui, sans-serif",
            }}
          >
            {item.name}
          </h3>

          {/* Precio */}
          <div
            style={{
              backgroundColor: item.dark ? "#38491E" : "#3C2A20",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: "700",
              padding: "0.35rem 0.75rem",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontFamily: "'Omnes', system-ui, sans-serif",
            }}
          >
            {item.price}
            <img
              src="/assets/coffee_bean.png"
              alt=""
              style={{
                width: "12px",
                height: "12px",
                filter: "brightness(0) invert(1)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
