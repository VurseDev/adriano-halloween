import React from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  Input,
  Checkbox,
  Button,
  Image,
  addToast,
} from "@heroui/react";

interface FormData {
  name: string;
  password: string;
  terms: string;
}

type Errors = Record<string, string>;

export default function Register() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [submitted, setSubmitted] = React.useState<any>(null);
  const [errors, setErrors] = React.useState<Errors>({});
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
  const audio = new Audio('/piano-song.mp3');
  audio.loop = true;
  audio.volume = 0.8;

  // Function to play when user interacts
  const enableAudio = () => {
    audio.play().catch(err => {
      console.warn("Autoplay prevented:", err);
    });
    // Remove event listeners so it only runs once
    document.removeEventListener("click", enableAudio);
    document.removeEventListener("scroll", enableAudio);
    document.removeEventListener("keydown", enableAudio);
  };

  // Add listeners for any user interaction
  document.addEventListener("click", enableAudio);
  document.addEventListener("scroll", enableAudio);
  document.addEventListener("keydown", enableAudio);

  // Cleanup on unmount
  return () => {
    audio.pause();
    audio.currentTime = 0;
    document.removeEventListener("click", enableAudio);
    document.removeEventListener("scroll", enableAudio);
    document.removeEventListener("keydown", enableAudio);
  };
}, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: FormData = {
      name: String(formData.get('name') || ''),
      password: String(formData.get('password') || ''),
      terms: String(formData.get('terms') || ''),
    };

    const newErrors: Errors = {};

    if (data.name === "admin") newErrors.name = "ta facil";
    if (data.terms !== "true") newErrors.terms = "Por favor aceite os termos.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrors({ api: result.error || "Erro ao registrar" });
        
        addToast({
          title: "Erro no Registro",
          description: result.error || "Erro ao registrar",
          color: "danger",
          timeout: 5000,
        });
        return;
      }

      addToast({
        title: "Registro realizado com sucesso!",
        description: "Bem-vindo ao Atlas!",
        color: "success",
        timeout: 4000,
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);

      setSubmitted(result);
    } catch (err) {
      console.error(err);
      setErrors({ api: "Erro de conexão com o servidor" });
      
      addToast({
        title: "Erro de Conexão",
        description: "Erro de conexão com o servidor",
        color: "danger",
        timeout: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Form
        className="w-full justify-center items-center space-y-4"
        validationErrors={errors}
        onReset={() => setSubmitted(null)}
        onSubmit={onSubmit}
      >
         <div className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="flex items-center gap-4">
              <Image
                src="../logo.png"
                alt="Company Logo"
                width={130}
                height={80}
                isBlurred
              />
              <h1 className="text-5xl font-bold text-foreground">
                SORTEIO
              </h1>
            </div>
          </div>
        
          <Input
            isRequired
            errorMessage={errors.name}
            label="Nome"
            labelPlacement="outside"
            name="name"
            placeholder="Digite seu nome"
            onValueChange={() => removeError('name')}
          />

          <Input
            isRequired
            label="Turma"
            labelPlacement="outside"
            name="password"
            placeholder="Digite sua Turma"
            type="text"
            value={password}
            onValueChange={setPassword}
          />
          
          <Checkbox
            isRequired
            classNames={{
              label: "text-small",
            }}
            isInvalid={!!errors.terms}
            name="terms"
            validationBehavior="aria"
            value="true"
            onValueChange={() => removeError('terms')}
          >
            Eu concordo com os termos e condições
          </Checkbox>

          {errors.terms && (
            <span className="text-danger text-small">{errors.terms}</span>
          )}

          {errors.api && (
            <div className="text-danger text-small bg-danger-50 p-2 rounded-md">
              {errors.api}
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              className="bg-gradient-to-tr from-[#FF705B] to-[#FFB457] text-white shadow-lg hover:shadow-2xl font-semibold px-4 py-2 rounded-full inline-flex items-center justify-center w-full" 
              type="submit"
              isLoading={isLoading}
            >
              {isLoading ? "Registrando..." : "Registrar-se"}
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-default-500">
              Já tem uma conta?{" "}
              <button
                type="button"
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => router.push("/registrado")}
              >
                Faça login
              </button>
            </p>
          </div>
        </div>

        {submitted && (
          <div className="text-small text-default-500 mt-4">
            Submitted data: <pre>{JSON.stringify(submitted, null, 2)}</pre>
          </div>
        )}
      </Form>
    </div>
  );
}