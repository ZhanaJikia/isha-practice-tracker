import { AuthForm } from "@components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <AuthForm initialMode="login" successRedirectTo="/" />
    </main>
  );
}


