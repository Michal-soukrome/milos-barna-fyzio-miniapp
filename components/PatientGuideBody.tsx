import { createImageUrlBuilder } from "@sanity/image-url";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { sanityClient } from "@/sanity/lib/client";
import type {
  PatientGuideBodyBlock,
  PatientGuideSection,
} from "@/sanity/lib/types";

const imageBuilder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

const portableTextComponents: PortableTextComponents<PatientGuideBodyBlock> = {
  block: {
    normal: ({ children }) => (
      <p className="mb-4 leading-8 text-slate-700">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="font-serif-display mb-3 mt-8 text-2xl text-slate-800">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-6 text-lg font-bold text-slate-800">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-5 border-l-4 border-teal-600 pl-4 italic text-slate-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-2 pl-6 text-slate-700">
        {children}
      </ol>
    ),
  },
  types: {
    image: ({ value }) => {
      const dimensions = value.asset.metadata?.dimensions;
      if (
        !imageBuilder ||
        !value.alt?.trim() ||
        !dimensions?.width ||
        !dimensions.height
      ) {
        return (
          <p role="alert" className="my-4 text-sm text-rose-800">
            Obrázek rady nelze zobrazit. Zkontrolujte jeho soubor a alternativní
            text v redakčním systému.
          </p>
        );
      }

      const width = Math.min(dimensions.width, 1600);
      const height = Math.round((dimensions.height / dimensions.width) * width);
      const src = imageBuilder.image(value).width(width).auto("format").url();

      return (
        <figure className="my-8">
          <img
            src={src}
            alt={value.alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-xl"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-slate-500">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

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
        <PortableText value={body} components={portableTextComponents} />
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
