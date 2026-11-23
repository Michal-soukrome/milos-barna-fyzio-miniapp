import type { ReactNode } from "react";
import PageContainer from "@/components/PageContainer";

const PLACEHOLDER_ROWS = [0, 1, 2, 3];
const PLACEHOLDER_CARDS = [0, 1, 2, 3, 4, 5];

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 motion-reduce:animate-none ${className}`}
    />
  );
}

function LoadingPage({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <PageContainer>
      <div aria-busy="true">
        <p role="status" className="sr-only">
          {label}
        </p>
        <div aria-hidden="true">{children}</div>
      </div>
    </PageContainer>
  );
}

export function PatientGuideListSkeleton() {
  return (
    <LoadingPage label="Načítají se rady a tipy.">
      <header className="mb-8 space-y-3">
        <SkeletonBlock className="h-9 w-2/3 max-w-md" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-4/5" />
      </header>

      <div className="space-y-6">
        <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm sm:p-6">
          <SkeletonBlock className="h-7 w-1/2 max-w-xs" />
          <SkeletonBlock className="mt-4 h-4 w-full" />
          <SkeletonBlock className="mt-2 h-4 w-5/6" />
          <SkeletonBlock className="mt-5 h-24 w-full rounded-xl bg-white" />
          <div className="mt-4 flex flex-wrap gap-3">
            <SkeletonBlock className="h-11 w-36 rounded-xl" />
            <SkeletonBlock className="h-11 w-48 rounded-xl" />
          </div>
        </section>

        <div className="dashboard-grid gap-8">
          <aside className="mb-7 sm:mb-0">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <SkeletonBlock className="mb-5 h-4 w-28" />
              <SkeletonBlock className="h-3 w-36" />
              <div className="mt-3 flex flex-wrap gap-2">
                {PLACEHOLDER_ROWS.map((row) => (
                  <SkeletonBlock key={row} className="h-8 w-20 rounded-full" />
                ))}
              </div>
              <SkeletonBlock className="my-4 h-px w-full" />
              <SkeletonBlock className="h-3 w-28" />
              <div className="mt-3 flex flex-wrap gap-2">
                {[0, 1, 2].map((row) => (
                  <SkeletonBlock key={row} className="h-8 w-20 rounded-full" />
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SkeletonBlock className="h-8 w-44" />
              <SkeletonBlock className="h-11 w-full rounded-xl sm:max-w-xs" />
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {PLACEHOLDER_CARDS.map((card) => (
                <li
                  key={card}
                  className="min-h-52 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <SkeletonBlock className="h-6 w-24 rounded-full" />
                  <SkeletonBlock className="mt-6 h-6 w-4/5" />
                  <SkeletonBlock className="mt-3 h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-2/3" />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </LoadingPage>
  );
}

export function DiagnosisListSkeleton() {
  return (
    <LoadingPage label="Načítá se přehled diagnóz.">
      <SkeletonBlock className="h-9 w-2/3 max-w-md" />
      <SkeletonBlock className="mt-4 h-4 w-full" />
      <SkeletonBlock className="mt-2 h-4 w-full" />
      <SkeletonBlock className="mt-2 h-4 w-4/5" />
      <SkeletonBlock className="mt-10 h-12 w-full rounded-xl" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <aside className="order-first rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:order-2">
          <SkeletonBlock className="h-4 w-28" />
          <div className="mt-4 space-y-4">
            {PLACEHOLDER_ROWS.map((row) => (
              <SkeletonBlock key={row} className="h-5 w-4/5" />
            ))}
          </div>
        </aside>

        <div className="space-y-12 lg:order-1">
          {[0, 1, 2].map((group) => (
            <section key={group}>
              <SkeletonBlock className="mb-5 h-8 w-1/2 max-w-sm" />
              <ul className="divide-y divide-slate-200 border-b border-slate-200">
                {PLACEHOLDER_ROWS.map((row) => (
                  <li key={row} className="px-2 py-4">
                    <SkeletonBlock className="h-6 w-3/4" />
                    <SkeletonBlock className="mt-2 h-4 w-full" />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </LoadingPage>
  );
}

export function ArticleListSkeleton() {
  return (
    <LoadingPage label="Načítají se články.">
      <SkeletonBlock className="h-9 w-48" />
      <SkeletonBlock className="mt-4 h-4 w-full" />
      <SkeletonBlock className="mt-2 h-4 w-4/5" />

      {[0, 1].map((group) => (
        <section key={group} className="mt-10">
          <SkeletonBlock className="mb-4 h-8 w-1/2 max-w-sm" />
          <ul className="grid gap-4 md:grid-cols-2">
            {PLACEHOLDER_ROWS.map((card) => (
              <li
                key={card}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="mt-3 h-7 w-4/5" />
                <SkeletonBlock className="mt-4 h-4 w-full" />
                <SkeletonBlock className="mt-2 h-4 w-2/3" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </LoadingPage>
  );
}

export function PatientGuideFinderSkeleton() {
  return (
    <LoadingPage label="Načítá se průvodce obtížemi.">
      <header>
        <SkeletonBlock className="h-9 w-2/3 max-w-md" />
        <SkeletonBlock className="mt-4 h-4 w-full" />
        <SkeletonBlock className="mt-2 h-4 w-4/5" />
      </header>

      <SkeletonBlock className="mt-5 h-16 w-full rounded-xl" />

      <div className="mt-6 flex items-center gap-3">
        {[0, 1, 2, 3].map((step) => (
          <div key={step} className="flex flex-1 items-center gap-2">
            <SkeletonBlock className="h-7 w-7 rounded-full" />
            <SkeletonBlock className="hidden h-4 w-20 sm:block" />
            {step < 3 && <SkeletonBlock className="h-px flex-1" />}
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <SkeletonBlock className="h-7 w-2/3 max-w-sm" />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((choice) => (
            <SkeletonBlock
              key={choice}
              className="h-16 rounded-xl border border-slate-200 bg-slate-50"
            />
          ))}
        </div>
        <SkeletonBlock className="mt-3 h-12 w-full rounded-xl bg-slate-50" />
        <SkeletonBlock className="mt-5 h-11 w-32 rounded-xl" />
      </section>
    </LoadingPage>
  );
}

export function ContentDetailSkeleton() {
  return (
    <LoadingPage label="Načítá se obsah.">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="h-fit min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="mt-4 h-10 w-4/5" />
          <SkeletonBlock className="mt-4 h-4 w-full" />
          <SkeletonBlock className="mt-2 h-4 w-2/3" />

          <div className="mt-8 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <SkeletonBlock className="h-6 w-1/2" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
          </div>

          <div className="mt-8 space-y-8">
            {[0, 1, 2].map((section) => (
              <section key={section} className="space-y-3">
                <SkeletonBlock className="h-7 w-2/3" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-4/5" />
              </section>
            ))}
          </div>

          <SkeletonBlock className="mt-8 h-4 w-full" />
          <SkeletonBlock className="mt-5 h-11 w-28 rounded-xl" />
        </article>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SkeletonBlock className="h-8 w-3/4" />
          <div className="mt-5 space-y-5">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="space-y-3 border-b border-slate-200 pb-5"
              >
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-6 w-4/5" />
                <SkeletonBlock className="h-4 w-full" />
              </div>
            ))}
          </div>
          <SkeletonBlock className="mt-5 h-4 w-32" />
        </aside>
      </div>
    </LoadingPage>
  );
}
