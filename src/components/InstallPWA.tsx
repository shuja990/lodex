"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPWA() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  if (installed || !deferred) return null

  return (
    <button
      className="fixed right-4 bottom-4 z-40 rounded-md bg-sky-600 px-3 py-2 text-white shadow-md hover:bg-sky-700 active:bg-sky-800"
      onClick={async () => {
        await deferred.prompt()
        try {
          const choice = await deferred.userChoice
          if (choice.outcome === "accepted") setDeferred(null)
        } catch {
          /* ignore */
        }
      }}
    >
      Install app
    </button>
  )
}
