import { useState } from "react";

export default function RegisterForm() {
  // los estados donde se guardan los datos del formulario
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //envía datos al backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    //valida que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setStatus("error");
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al registrarse");
      }

      setStatus("success");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  //icono de ojo cerrado
  const EyeOffIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  //icono de ojo abierto
  const EyeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  // Estilos compartidos para inputs
  const inputStyle = {
    width: "100%",
    padding: "0.875rem 1.5rem",
    borderRadius: "9999px",
    backgroundColor: "white",
    border: "2px solid #5D4037",
    color: "#3C2A20",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
  };

  const inputWithIconStyle = {
    ...inputStyle,
    paddingRight: "3rem",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
      }}
    >
      {/* Mensajes de Error o Éxito */}
      {status === "error" && (
        <div
          style={{
            backgroundColor: "rgba(188, 71, 73, 0.1)",
            color: "#BC4749",
            padding: "0.75rem",
            borderRadius: "1rem",
            textAlign: "center",
            fontSize: "0.875rem",
            fontWeight: "600",
            border: "1px solid #BC4749",
          }}
        >
          {errorMsg}
        </div>
      )}
      {status === "success" && (
        <div
          style={{
            backgroundColor: "rgba(96, 108, 56, 0.1)",
            color: "#606C38",
            padding: "0.75rem",
            borderRadius: "1rem",
            textAlign: "center",
            fontSize: "0.875rem",
            fontWeight: "600",
            border: "1px solid #606C38",
          }}
        >
          ¡Cuenta creada! Redirigiendo...
        </div>
      )}

      {/* Campo Username (full_name) */}
      <input
        type="text"
        required
        style={inputStyle}
        placeholder="Nombre"
        onChange={(e) =>
          setFormData({ ...formData, full_name: e.target.value })
        }
      />

      {/* Campo Email */}
      <input
        type="email"
        required
        style={inputStyle}
        placeholder="Correo electrónico"
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      {/* Campo Password */}
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type={showPassword ? "text" : "password"}
          required
          style={inputWithIconStyle}
          placeholder="Contraseña"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#5D4037",
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          {showPassword ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </div>

      {/* Campo Confirm Password */}
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type={showConfirmPassword ? "text" : "password"}
          required
          style={inputWithIconStyle}
          placeholder="Confirmar contraseña"
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          style={{
            position: "absolute",
            right: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#5D4037",
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </div>

      {/* Botón de Enviar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "1.5rem",
        }}
      >
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            backgroundColor: "#38491E",
            color: "#E8E4D9",
            fontWeight: "600",
            fontSize: "1.25rem",
            padding: "0.875rem 3rem",
            borderRadius: "9999px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            opacity: status === "loading" ? 0.5 : 1,
            fontFamily: "'Omnes', system-ui, sans-serif",
          }}
        >
          {status === "loading" ? "Registrando..." : "Registrarme"}
        </button>
      </div>
    </form>
  );
}
