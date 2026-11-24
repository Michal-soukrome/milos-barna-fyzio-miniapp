import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityClient } from "@/sanity/lib/client";
import type { PatientGuideBodyBlock } from "@/sanity/lib/types";

const imageBuilder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

const components: PortableTextComponents<PatientGuideBodyBlock> = {
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
      const dimensions = value.asset?.metadata?.dimensions;
      const croppedWidth =
        (dimensions?.width ?? 0) *
        (1 - (value.crop?.left ?? 0) - (value.crop?.right ?? 0));
      const croppedHeight =
        (dimensions?.height ?? 0) *
        (1 - (value.crop?.top ?? 0) - (value.crop?.bottom ?? 0));
      if (
        !imageBuilder ||
        !value.asset?._ref ||
        !value.alt?.trim() ||
        !Number.isFinite(croppedWidth) ||
        !Number.isFinite(croppedHeight) ||
        croppedWidth <= 0 ||
        croppedHeight <= 0
      ) {
        return (
          <p role="alert" className="my-4 text-sm text-rose-800">
            Obrázek nelze zobrazit. Zkontrolujte jeho soubor a alternativní text
            v redakčním systému.
          </p>
        );
      }

      const width = Math.max(1, Math.round(Math.min(croppedWidth, 1600)));
      const height = Math.max(
        1,
        Math.round((croppedHeight / croppedWidth) * width),
      );
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

export default function MedicalBody({
  body,
}: {
  body?: PatientGuideBodyBlock[] | null;
}) {
  if (!body?.length) return null;

  return <PortableText value={body} components={components} />;
}
