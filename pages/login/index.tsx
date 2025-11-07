import { useRouter } from "next/navigation";
import React from "react";
import {
  Form,
  Input,
  Checkbox,
  Button,
  Link,
  Image,
  addToast
} from "@heroui/react";

export default function App() {
  const [password, setPassword] = React.useState(""); 
  const [submitted, setSubmitted] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    
    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        let errorMessage = "Erro ao logar";
        
        if (res.status === 401) {
          errorMessage = result.error || "Usuário inválido ou senha incorreta";
        } else if (res.status === 400) {
          errorMessage = result.error || "Dados inválidos";
        }
        
        // Show error toast
        addToast({
          title: "Erro no Login",
          description: errorMessage,
          color: "danger",
          timeout: 5000,
        });
        
        setErrors({ api: errorMessage });
        return;
      }
      
      // Show success toast
      addToast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando...",
        color: "success",
        timeout: 3000,
      });
      
      // Wait a bit before redirecting to show the success message
      setTimeout(() => {
        router.push("/main");
      }, 1000);
      
      setSubmitted(result);
      
    } catch (err) {
      console.error(err);
      const errorMessage = "Erro de conexão com o servidor";
      
      // Show error toast for connection issues
      addToast({
        title: "Erro de Conexão",
        description: errorMessage,
        color: "danger",
        timeout: 5000,
      });
      
      setErrors({ api: errorMessage });
    } finally {
      setIsLoading(false);
    }
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
            label="Email"
            labelPlacement="outside"
            name="email"
            placeholder="Digite seu Email"
            type="email"
          />

          <Input
            isRequired
            label="Senha"
            labelPlacement="outside"
            name="password"
            placeholder="Digite sua Senha"
            type="password"
            value={password}
            onValueChange={setPassword}
          />
          
          <div className="flex flex-col gap-2 ">
            <Button 
              className="w-full" 
              color="primary" 
              type="submit"
              isLoading={isLoading}
            >
              {isLoading ? "Entrando..." : "Logar-se"}
            </Button>
            <Checkbox size="sm">Lembrar-me</Checkbox>
          </div>        
          
          <div className="flex justify-center">
            <Link href="/reset-password" className="text-sm text-blue-600 hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
          
          <p className="text-center text-sm text-default-500">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
          
          {submitted && (
            <div className="text-small text-default-500 mt-4">
              Submitted data: <pre>{JSON.stringify(submitted, null, 2)}</pre>
            </div>
          )}
        </div>
      </Form>
    </div>
  );
}