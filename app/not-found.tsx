import Link from "next/link";
import Layout from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-12 sm:py-16">
      
        <h1 className="font-serif-display mt-3 text-3xl leading-tight text-slate-800 sm:text-4xl">
          Tuto stránku se nepodařilo najít
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Omlouvám se, ale odkaz je buď zastaralý nebo adresa neexistuje.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-xl bg-teal-800 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-900"
          >
            Zpět na úvod
          </Link>
          <Link
            href="/navody"
            className="inline-flex min-h-11 items-center rounded-xl border border-teal-800 px-5 py-3 text-sm font-bold text-teal-900 transition-colors hover:bg-teal-50"
          >
            Rady a tipy
          </Link>
        </div>
      </section>
    </Layout>
  );
}
