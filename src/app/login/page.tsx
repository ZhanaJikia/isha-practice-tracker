import { AuthForm } from "@components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="p-6 max-w-md">
      <AuthForm initialMode="login" successRedirectTo="/" />
    </main>
  );
}
