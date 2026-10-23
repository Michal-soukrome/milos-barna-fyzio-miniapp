export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="safe-area-inline mx-auto w-full max-w-7xl py-8 sm:py-12">
      {children}
    </main>
  );
}
