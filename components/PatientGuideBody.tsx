import MedicalBody from "@/components/MedicalBody";
import type {
  PatientGuideBodyBlock,
  PatientGuideSection,
} from "@/sanity/lib/types";

export default function PatientGuideBody({
  body,
  legacySections,
}: {
  body?: PatientGuideBodyBlock[];
  legacySections?: PatientGuideSection[];
}) {
  if (body?.length) {
    return (
      <div className="mt-8">
        <MedicalBody body={body} />
      </div>
    );
  }

  if (legacySections?.length) {
    return (
      <div className="mt-8 space-y-8">
        {legacySections.map((section, index) => (
          <section
            key={`${section.heading}-${index}`}
            className="border-t border-slate-200 pt-6"
          >
            <h2 className="font-serif-display text-2xl text-slate-800">
              {section.heading}
            </h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-slate-700">
              {section.text}
            </p>
          </section>
        ))}
      </div>
    );
  }

  return (
    <p role="alert" className="mt-8 text-sm text-rose-800">
      Obsah rady zatím není k dispozici.
    </p>
  );
}
