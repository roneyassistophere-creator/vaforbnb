import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[400px] rounded-[20px] border border-line bg-white p-6 md:p-8">
        <p className="m-0 text-[13px] font-extrabold tracking-[0.6px] text-brand uppercase">VA for BnB</p>
        <h1 className="m-0 mt-1 mb-5 text-2xl font-extrabold">Sign in to the admin area</h1>
        <LoginForm />
      </div>
    </main>
  );
}
