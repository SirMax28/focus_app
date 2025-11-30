import { useState } from "react";

// URL del API - cambia automáticamente entre desarrollo y producción
const API = import.meta.env.PUBLIC_API_URL || "";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    // FastAPI usa username para el login pero es email, linea furuta para agregar inicio con username
    username: "",
    password: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    // FastAPI espera un Form Data no un JSON
    const formBody = new URLSearchParams();
    formBody.append("username", formData.username);
    formBody.append("password", formData.password);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const data = await response.json();

      // Guardar el token en localStorage
      localStorage.setItem("focus_token", data.access_token);

      setStatus("success");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  //icono de ojo cerrado
  const EyeOffIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
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
      width="22"
      height="22"
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

  //Se comparte el estilo de los inputs
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
    fontFamily: "'Omnes', system-ui, sans-serif",
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
      {/* Aqui van los mensajes de error o éxito */}
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
            backgroundColor: "rgba(56, 73, 30, 0.1)",
            color: "#38491E",
            padding: "0.75rem",
            borderRadius: "1rem",
            textAlign: "center",
            fontSize: "0.875rem",
            fontWeight: "600",
            border: "1px solid #38491E",
          }}
        >
          ¡Bienvenido de vuelta! ☕
        </div>
      )}

      {/* Campo Email */}
      <input
        type="email"
        required
        style={inputStyle}
        placeholder="Correo electrónico"
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />

      {/* Campo Password */}
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type={showPassword ? "text" : "password"}
          required
          style={{ ...inputStyle, paddingRight: "3rem" }}
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

      {/* ¿Has olvidado la contraseña? */}
      <a
        href="#"
        style={{
          fontSize: "0.875rem",
          color: "#3C2A20",
          textDecoration: "underline",
          marginLeft: "0.25rem",
        }}
      >
        ¿Has olvidado la contraseña?
      </a>

      {/* Boton iniciar sesión */}
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}
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
          {status === "loading" ? "Entrando..." : "Iniciar sesión"}
        </button>
      </div>

      {/* Separador */}
      <p
        style={{
          textAlign: "center",
          fontSize: "0.875rem",
          color: "#7F5539",
          margin: "1rem 0 0.5rem",
        }}
      >
        Otras formas de iniciar sesión
      </p>

      {/* Botones de redes sociales */}
      <div style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
        {/* Facebook */}
        <button
          type="button"
          onClick={() => alert("Integración con Facebook próximamente")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "50%",
            transition: "opacity 0.2s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.opacity = "0.5")}
          onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="24" fill="#1877F2" />
            <path
              d="M33.5 24.0694C33.5 18.8294 29.24 14.5694 24 14.5694C18.76 14.5694 14.5 18.8294 14.5 24.0694C14.5 28.7894 17.94 32.7094 22.47 33.4294V26.7894H20.09V24.0694H22.47V22.0094C22.47 19.6594 23.88 18.3594 26.02 18.3594C27.04 18.3594 28.11 18.5394 28.11 18.5394V20.8494H26.93C25.77 20.8494 25.41 21.5694 25.41 22.3094V24.0694H28L27.59 26.7894H25.41V33.4294C29.94 32.7094 33.5 28.7894 33.5 24.0694Z"
              fill="white"
            />
          </svg>
        </button>

        {/* Google */}
        <button
          type="button"
          onClick={() => alert("Integración con Google próximamente")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "50%",
            transition: "opacity 0.2s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.opacity = "0.5")}
          onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M44.5 24.5C44.5 23.1 44.4 22.1 44.2 21H24V27.5H35.7C35.4 29.7 33.8 33 30.3 35.2L30.3 35.3L37.1 40.5L37.6 40.5C42 36.5 44.5 31 44.5 24.5Z"
              fill="#4285F4"
            />
            <path
              d="M24 45C30 45 35 43 37.6 40.5L30.3 35.2C28.5 36.4 26 37.2 24 37.2C18.2 37.2 13.3 33.2 11.6 27.9L11.5 28L4.5 33.4L4.4 33.5C7.9 40.4 15.4 45 24 45Z"
              fill="#34A853"
            />
            <path
              d="M11.6 27.9C11.1 26.5 10.8 25 10.8 23.5C10.8 22 11.1 20.5 11.6 19.1L11.6 19L4.5 13.5L4.4 13.6C2.9 16.6 2 20 2 23.5C2 27 2.9 30.4 4.4 33.5L11.6 27.9Z"
              fill="#FBBC05"
            />
            <path
              d="M24 9.8C28.2 9.8 31.1 11.6 32.8 13.2L37.8 8.4C35 5.8 30 3.5 24 3.5C15.4 3.5 7.9 8.1 4.4 15L11.6 20.6C13.3 15.3 18.2 9.8 24 9.8Z"
              fill="#EA4335"
            />
          </svg>
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={() => alert("Integración con Apple próximamente")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "50%",
            transition: "opacity 0.2s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.opacity = "0.5")}
          onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M34.5 39.5C32.5 41.5 30.3 41.2 28.2 40.3C25.9 39.4 23.8 39.3 21.4 40.3C18.4 41.6 16.8 41.2 15 39.5C6.3 30.5 7.6 17 17.5 16.5C20.3 16.6 22.3 18 23.9 18.1C26.4 17.6 28.8 16 31.5 16.2C34.8 16.5 37.2 17.9 38.7 20.4C32.5 24.1 34 32.2 39.7 35.5C38.5 38.2 36.8 40.8 34.5 39.5ZM23.7 16.3C23.3 12 26.7 8.5 30.7 8.2C31.3 13 26.8 16.8 23.7 16.3Z"
              fill="black"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
