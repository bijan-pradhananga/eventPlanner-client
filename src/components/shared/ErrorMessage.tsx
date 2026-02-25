interface ErrorMessageProps {
  error: string | null | undefined;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;
  return (
    <div className="w-full rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
      {error}
    </div>
  );
}
