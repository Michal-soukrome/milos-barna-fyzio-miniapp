import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

const components: PortableTextComponents = {
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
      <h3 className="mb-2 mt-6 text-lg font-bold text-slate-800">
        {children}
      </h3>
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
};

export default function MedicalBody({
  body,
}: {
  body?: PortableTextBlock[] | null;
}) {
  if (!body?.length) return null;

  return <PortableText value={body} components={components} />;
}
