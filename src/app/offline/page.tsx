export const dynamic = "error";

export default function OfflinePage() {
  return (
    <main className="min-h-dvh grid place-items-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold">You are offline</h1>
        <p className="mt-2 text-muted-foreground">
          It looks like you don’t have an internet connection. You can continue
          browsing previously visited pages. We’ll reconnect automatically when
          you’re back online.
        </p>
      </div>
    </main>
  )
}
