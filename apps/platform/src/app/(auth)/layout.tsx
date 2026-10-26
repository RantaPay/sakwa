export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col px-4 py-10">
        <p className="text-sm font-semibold tracking-tight">Sakwa Agro Enterprise</p>
        {children}
      </div>
    </div>
  );
}
