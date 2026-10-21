"use client";

import { useEffect, useRef } from "react";
import {
  PatchEvent,
  set,
  useFormValue,
  type BooleanInputProps,
} from "sanity";
import { getReviewedContentSignature } from "../lib/reviewed-content";

export function ReviewedInput(props: BooleanInputProps) {
  const document = useFormValue([]);
  const signature = getReviewedContentSignature(document);
  const previousSignature = useRef<string | null>(null);

  useEffect(() => {
    const previous = previousSignature.current;
    previousSignature.current = signature;

    if (previous !== null && previous !== signature && props.value === true) {
      props.onChange(PatchEvent.from(set(false)));
    }
  }, [props.onChange, props.value, signature]);

  return props.renderDefault(props);
}
