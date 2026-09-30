export default function LoadingScreen({
  message = "Loading...",
  subMessage,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-neutral-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent" />
      </div>

      <p className="mt-6 text-lg font-medium text-neutral-900">{message}</p>
      {subMessage && (
        <p className="mt-2 max-w-sm text-sm text-neutral-500">{subMessage}</p>
      )}
    </div>
  );
}