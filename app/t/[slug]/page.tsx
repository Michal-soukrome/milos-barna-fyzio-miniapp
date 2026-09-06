import { notFound } from "next/navigation";
import { getTopicBySlug, topics } from "@/lib/content";

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return notFound();

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <div className="mb-1 text-sm text-[var(--ink-soft)]">
        {topic.bodyPart}
      </div>
      <h1 className="font-serif-display text-3xl leading-tight">
        {topic.title}
      </h1>

      <div className="mt-6 flex flex-col gap-5">
        {topic.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="mb-1 font-medium">{s.heading}</h2>
            <p className="text-[15px] leading-relaxed text-[var(--ink-soft)]">
              {s.text}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-[var(--caution)] bg-[var(--caution-soft)] px-4 py-4">
        <h2 className="mb-2 font-medium text-[var(--caution)]">
          Seek care right away if:
        </h2>
        <ul className="list-inside list-disc text-[15px] leading-relaxed text-[var(--ink)]">
          {topic.warningSigns.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-xs text-[var(--ink-soft)]">
        This page gives general information only and does not replace an
        in-person medical evaluation. If anything here doesn&apos;t match what
        you were told in person, follow what your doctor told you and contact
        the clinic with questions.
      </p>

      <a href="/">
        <button className="mt-4 rounded-md bg-[var(--clinical)] px-4 py-2 text-sm font-medium text-white">
          Back to topics
        </button>
      </a>
    </main>
  );
}
