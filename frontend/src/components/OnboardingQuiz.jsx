import { useState } from "react";

// Preguntas para el onboarding quiz
const questions = [
  {
    question: "¿Cuánto te cuesta concentrarte cuando estudias en línea?",
    options: [
      { text: "Mucho, me distraigo muy fácil", points: 0 },
      { text: "A veces, depende del día", points: 1 },
      { text: "Casi siempre logro concentrarme", points: 2 },
    ],
  },
  {
    question:
      "Actualmente, ¿cuántos días a la semana tienes un momento fijo para estudiar?",
    options: [
      { text: "Ninguno o solo 1 día", points: 0 },
      { text: "2 o 3 días", points: 1 },
      { text: "4 días o más", points: 2 },
    ],
  },
  {
    question: "¿Qué tan cómodo te sientes estudiando 40 minutos seguidos?",
    options: [
      { text: "Se me hace muy pesado", points: 0 },
      { text: "Depende del tema y del día", points: 1 },
      { text: "Lo hago con frecuencia", points: 2 },
    ],
  },
  {
    question: "¿Qué te cuesta más al estudiar?",
    options: [
      { text: "Arrancar, me cuesta empezar", points: 0 },
      { text: "Mantenerme, empiezo bien pero me caigo", points: 1 },
      { text: "Más bien organizar, pero al empezar sigo", points: 2 },
    ],
  },
  {
    question: "¿Sientes que tienes tu estudio 'bajo control'?",
    options: [
      { text: "Casi siempre voy apagando incendios", points: 0 },
      { text: "A ratos controlado, a ratos no", points: 1 },
      { text: "La mayoría del tiempo planificado", points: 2 },
    ],
  },
  // NO suma puntos, buscamos saber la preferencia del usuario
  {
    question: "Para empezar, ¿qué bloques se sienten realistas para ti?",
    isPreference: true,
    options: [
      { text: "Bloques cortos (15 min)", value: 15 },
      { text: "Bloques medianos (25 min)", value: 25 },
      { text: "Bloques largos (40 min)", value: 40 },
    ],
  },
];

export default function OnboardingQuiz() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [preferredMinutes, setPreferredMinutes] = useState(25); // Default
  const [loading, setLoading] = useState(false);

  const handleAnswer = async (option) => {
    // Los puntos solo se suman si no es la pregunta de preferencia
    if (!questions[step].isPreference) {
      setScore((prev) => prev + option.points);
    } else {
      setPreferredMinutes(option.value);
    }

    //Avanzar o Finalizar
    if (step < questions.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      finishQuiz(option.value || preferredMinutes); 
    }
  };

  const finishQuiz = async (finalMinutes) => {
    setLoading(true);
    let archetype = "B"; // Default

    // Reglas de Clasificación en base al motor definido
    if (score <= 4) archetype = "A";
    else if (score <= 7) archetype = "B";
    else archetype = "C";

    // Ajuste especial futuro para la Regla 6
    // por ejemplo: si es A pero pidió 40min, se baja a 25min
    // esto es opcional segun el tiempo que me de, lo dejo como recordatorio

    // Envia al Backend
    try {
      const token = localStorage.getItem("focus_token");
      const response = await fetch("http://127.0.0.1:8000/users/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          score: score,
          archetype: archetype,
          preferred_minutes: finalMinutes,
        }),
      });

      if (response.ok) {
        // Guarda en local para usarlo en el dashboard
        localStorage.setItem("focus_archetype", archetype);
        localStorage.setItem("focus_minutes", finalMinutes);

        // Redirige al dashboard
        window.location.href = "/dashboard";
      } else {
        alert("Error guardando perfil");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  const currentQ = questions[step];

  //obtiene la imagen del café según los puntos
  const getCoffeeImage = (option) => {
    if (currentQ.isPreference) {
      return "/assets/coffee_happy.png";
    }
    if (option.points === 2) return "/assets/coffee_happy.png";
    if (option.points === 1) return "/assets/coffee_meh.png";
    return "/assets/coffee_sad.png";
  };

  if (loading)
    return (
      <div className="text-center p-10 font-bold text-brand-coffee">
        Calculando tu plan ideal... ☕
      </div>
    );

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      {/* Barra de Progreso */}
      <div className="w-full h-2 bg-brand-beige rounded-full mb-6">
        <div
          className="h-full bg-brand-coffee rounded-full transition-all duration-300"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <h2 className="text-xl font-bold text-brand-dark text-center mb-6 min-h-[60px]">
        {currentQ.question}
      </h2>

      <div className="flex flex-col gap-3 w-full">
        {currentQ.options.map((opt, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
            }}
          >
            {/* Café al lado */}
            <img
              src={getCoffeeImage(opt)}
              alt=""
              style={{
                width: "36px",
                height: "36px",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />

            {/* Botón de respuesta */}
            <button
              onClick={() => handleAnswer(opt)}
              style={{
                flex: 1,
                padding: "1rem",
                backgroundColor: "#3C2A20",
                color: "white",
                borderRadius: "1rem",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: "500",
                fontFamily: "'Omnes', system-ui, sans-serif",
                fontSize: "0.9rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "transform 0.2s, background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#7F5539")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#3C2A20")
              }
            >
              {opt.text}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-brand-coffee/60">
        Pregunta {step + 1} de {questions.length}
      </p>
    </div>
  );
}
