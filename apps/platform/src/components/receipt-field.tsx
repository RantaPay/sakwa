"use client";

import { Button } from "@sakwa/ui";
import { useState } from "react";

const MAX_BYTES = 1_500_000;

export type ReceiptValue = {
  filename: string;
  url: string;
};

export function ReceiptView({
  filename,
  url,
}: {
  filename: string;
  url: string;
}) {
  const isImage = url.startsWith("data:image") || /\.(png|jpe?g|webp|gif)$/i.test(filename);
  return (
    <div className="rounded-xl border border-border bg-wash p-3">
      <p className="text-sm font-medium">{filename}</p>
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Receipt" className="mt-3 max-h-64 w-full rounded-lg object-contain bg-white" />
      ) : (
        <a href={url} className="mt-2 inline-block text-base font-semibold text-primary" target="_blank" rel="noreferrer">
          Open receipt
        </a>
      )}
    </div>
  );
}

export function ReceiptField({
  label = "Receipt",
  onPicked,
}: {
  label?: string;
  onPicked: (value: ReceiptValue) => void;
}) {
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<ReceiptValue | null>(null);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError("Use a file under 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? "");
      const value = { filename: file.name, url };
      setPicked(value);
      onPicked(value);
    };
    reader.onerror = () => setError("Could not read that file.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor="receipt">
        {label}
      </label>
      <input
        id="receipt"
        name="receipt"
        type="file"
        accept="image/*,.pdf"
        onChange={onChange}
        className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
      />
      {picked ? <ReceiptView filename={picked.filename} url={picked.url} /> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {picked ? (
        <Button type="button" variant="ghost" size="sm" className="justify-self-start" onClick={() => setPicked(null)}>
          Choose another
        </Button>
      ) : null}
    </div>
  );
}
