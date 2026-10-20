import { useEffect, useState } from "react";
import {
  PatchEvent,
  SlugInput,
  set,
  useClient,
  useFormValue,
  type SlugInputProps,
} from "sanity";

const MAX_SLUG_LENGTH = 96;

function slugifyTitle(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

export async function createUniqueArticleSlug(
  title: string,
  client: ReturnType<typeof useClient>,
  documentId?: string,
) {
  const baseSlug = slugifyTitle(title) || "clanek";
  const publishedId = documentId?.replace(/^drafts\./, "");
  const documentIds = publishedId
    ? [publishedId, `drafts.${publishedId}`]
    : [];

  for (let index = 1; ; index += 1) {
    const suffix = index === 1 ? "" : `-${index}`;
    const candidate = `${baseSlug.slice(0, MAX_SLUG_LENGTH - suffix.length).replace(/-+$/g, "")}${suffix}`;
    const exists = await client.fetch(
      'count(*[_type == "article" && slug.current == $slug && !(_id in $documentIds)]) > 0',
      { slug: candidate, documentIds },
    );

    if (!exists) return candidate;
  }
}

export function ArticleSlugInput(props: SlugInputProps) {
  const title = useFormValue(["title"]);
  const documentId = useFormValue(["_id"]);
  const client = useClient({ apiVersion: "2026-10-20" });
  const [generationError, setGenerationError] = useState<string | null>(null);
  const slug = props.value?.current;
  const onChange = props.onChange;

  useEffect(() => {
    if (typeof title !== "string" || !title.trim() || slug) return;

    let cancelled = false;
    const timeout = setTimeout(() => {
      void createUniqueArticleSlug(
        title,
        client,
        typeof documentId === "string" ? documentId : undefined,
      )
        .then((current) => {
          if (cancelled) return;
          setGenerationError(null);
          onChange(PatchEvent.from(set({ _type: "slug", current })));
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setGenerationError(
            error instanceof Error ? error.message : String(error),
          );
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [client, documentId, onChange, slug, title]);

  return (
    <div>
      <SlugInput {...props} />
      {generationError && (
        <p role="alert">
          URL se nepodařilo automaticky vytvořit: {generationError}
        </p>
      )}
    </div>
  );
}
