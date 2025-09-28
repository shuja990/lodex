"use client"

import { useEffect } from "react"

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return
    if (process.env.NODE_ENV !== "production") return
    const swUrl = "/sw.js"
    const onControllerChange = () => {
      // New SW took control; could show a toast or reload if desired
    }
    navigator.serviceWorker
      .register(swUrl, { scope: "/" })
      .then((registration) => {
        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              // If there's already a controller, the new SW is ready to activate on next load
              if (navigator.serviceWorker.controller) {
                // Optionally, prompt the user to refresh
                // console.log("New version available. Reload to update.")
              }
            }
          })
        })
        navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)
      })
      .catch(() => {
        // No-op if registration fails
      })

    return () => {
      navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange)
    }
  }, [])

  return null
}
