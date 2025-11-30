import { useState, useEffect } from "react";

// URL del API - cambia automáticamente entre desarrollo y producción
const API = import.meta.env.PUBLIC_API_URL || "";

export default function UserInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      const token = localStorage.getItem("focus_token");
      if (!token) return;

      try {
        const res = await fetch(`${API}/gamification/inventory`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (error) {
        console.error("Error cargando inventario", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();

    // este es un truco que encontre para actualizar el inventario cuando se compra algo
    window.addEventListener("inventory-updated", fetchInventory);
    return () =>
      window.removeEventListener("inventory-updated", fetchInventory);
  }, []);

  if (loading)
    return (
      <div className="text-center text-[#7F5539] text-xs">
        Cargando mochila...
      </div>
    );

  if (items.length === 0)
    return (
      <div className="text-center p-4 border-2 border-dashed border-[#E6CCB2] rounded-xl mx-4 mt-4">
        <p className="text-[#7F5539] text-sm">Tu mochila está vacía 🎒</p>
        <p className="text-[#7F5539]/60 text-xs">¡Compra algo arriba!</p>
      </div>
    );

  return (
    <div className="px-4 pb-8">
      <h3 className="text-[#3C2A20] font-bold mb-3 ml-2 flex items-center gap-2">
        🎒 Mis Cosas
        <span className="bg-[#3C2A20] text-white text-[10px] px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </h3>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white p-3 rounded-xl border border-[#E6CCB2] flex justify-between items-center shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="bg-[#FFF8F0] p-2 rounded-lg">
                {/* por ahora con emoji generico, en el futuro se puede cargar directo un asset pero más optimizado por tamaño */}
                🎁
              </div>
              <div>
                <p className="text-[#3C2A20] font-bold text-sm">
                  {item.item_name}
                </p>
                <p className="text-[#7F5539] text-xs">
                  Comprado el {new Date(item.acquired_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="bg-[#38491E]/10 text-[#38491E] font-bold px-3 py-1 rounded-lg text-xs">
              x{item.quantity}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
