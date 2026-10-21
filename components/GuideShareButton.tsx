"use client";

import { useEffect, useRef, useState } from "react";
import { Share, X } from "lucide-react";
import TopicActions from "@/components/TopicActions";
import type { PatientGuide } from "@/sanity/lib/types";

export default function GuideShareButton({
  topic,
}: {
  topic: PatientGuide;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const previousDocumentOverflow = documentElement.style.overflow;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      const bodyPaddingRight =
        Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;
    }

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
      documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-800 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
      >
        <Share aria-hidden="true" className="h-4 w-4" />
        Sdílet
      </button>

      {isOpen && (
        <dialog
          ref={dialogRef}
          aria-label={`Sdílet: ${topic.title}`}
          onClose={() => {
            setIsOpen(false);
            triggerRef.current?.focus();
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              event.currentTarget.close();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.currentTarget.close();
            }
          }}
          className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto border-0 bg-white p-0 shadow-2xl backdrop:bg-slate-950/60"
        >
          <div className="relative p-5 sm:p-7">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="absolute right-0 top-0 inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              <X className="h-4 w-4" />
            </button>
            <TopicActions topic={topic} />
          </div>
        </dialog>
      )}
    </>
  );
}
