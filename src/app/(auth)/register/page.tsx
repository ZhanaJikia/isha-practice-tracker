import { AuthForm } from "@components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <AuthForm initialMode="register" successRedirectTo="/" />
    </main>
  );
}


