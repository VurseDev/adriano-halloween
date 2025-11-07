import React from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Button,
  Image,
  addToast,
} from "@heroui/react";

interface FormData {
  name: string;
  email: string;
  password: string;
  country: string;
  terms: string;
}

// Use Record type for ValidationErrors compatibility
type Errors = Record<string, string>;

export default function Register() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [submitted, setSubmitted] = React.useState<any>(null);
  const [errors, setErrors] = React.useState<Errors>({});
  const [isLoading, setIsLoading] = React.useState(false);

  // Real-time password validation
  const getPasswordError = (value: string): string | null => {
    if (value.length < 4) {
      return "Senha precisa ter 4 caracteres ou mais";
    }
    if ((value.match(/[A-Z]/g) || []).length < 1) {
      return "Senha precisa de pelo menos uma letra em caixa alta";
    }
    if ((value.match(/[^a-z]/gi) || []).length < 1) {
      return "Senha necessita pelo menos um simbolo";
    }

    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Convert FormData to plain object with proper string conversion
    const data: FormData = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      password: String(formData.get('password') || ''),
      country: String(formData.get('country') || ''),
      terms: String(formData.get('terms') || ''),
    };

    // Custom validation checks
    const newErrors: Errors = {};

    // Password validation
    const passwordError = getPasswordError(data.password);
    if (passwordError) newErrors.password = passwordError;

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
        
        // Toast de erro
        addToast({
          title: "Erro no Registro",
          description: result.error || "Erro ao registrar",
          color: "danger",
          timeout: 5000,
        });
        return;
      }

      // Toast de sucesso
      addToast({
        title: "Registro realizado com sucesso!",
        description: "Bem-vindo ao Atlas!",
        color: "success",
        timeout: 4000,
      });

      // Redirect to login after successful registration
      setTimeout(() => {
        router.push("/login");
      }, 2000);

      setSubmitted(result);
    } catch (err) {
      console.error(err);
      setErrors({ api: "Erro de conexão com o servidor" });
      
      // Toast de erro de conexão
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

  // Helper function to remove error for a specific field
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
                {/* Logo and Brand Name Section */}
                <div className="flex flex-col items-center gap-3 mb-6">
                  <div className="flex items-center gap-4">
                    <Image
                      src="./logo.png"
                      alt="Company Logo"
                      width={130}
                      height={80}
                      isBlurred
                    />
                    <h1 className="text-5xl font-bold text-foreground">
                      Atlas
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
            errorMessage={errors.email}
            label="Email"
            labelPlacement="outside"
            name="email"
            placeholder="Digite seu Email"
            type="email"
            onValueChange={() => removeError('email')}
          />

          <Input
            isRequired
            errorMessage={getPasswordError(password) || undefined}
            isInvalid={getPasswordError(password) !== null}
            label="Senha"
            labelPlacement="outside"
            name="password"
            placeholder="Digite sua Senha"
            type="password"
            value={password}
            onValueChange={setPassword}
          />

          <Select
            isRequired
            label="País"
            labelPlacement="outside"
            name="country"
            placeholder="Escolha seu país"
          >
            <SelectItem key="br">Brasil</SelectItem>
            <SelectItem key="ar">Argentina</SelectItem>
            <SelectItem key="us">United States</SelectItem>
            <SelectItem key="ca">Canada</SelectItem>
            <SelectItem key="uk">United Kingdom</SelectItem>
            <SelectItem key="au">Australia</SelectItem>
          </Select>

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
              className="w-full" 
              color="primary" 
              type="submit"
              isLoading={isLoading}
            >
              {isLoading ? "Registrando..." : "Registrar-se"}
            </Button>
          </div>

          {/* Navigation link to login */}
          <div className="text-center mt-4">
            <p className="text-sm text-default-500">
              Já tem uma conta?{" "}
              <button
                type="button"
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => router.push("/login")}
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