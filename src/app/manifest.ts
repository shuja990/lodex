import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LodEx",
    short_name: "LodEx",
    description:
      "LodEx™ – Fast, reliable micro-load shipping. Connect with verified carriers, post loads instantly, and track deliveries end-to-end.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "fullscreen", "minimal-ui", "browser"],
    background_color: "#0B1220",
    theme_color: "#0EA5E9",
    icons: [
      { src: "/placeholder-logo.png", sizes: "192x192", type: "image/png" },
      { src: "/placeholder-logo.png", sizes: "512x512", type: "image/png" },
      { src: "/placeholder-logo.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      { src: "/mobile-dashboard-showing-load-listings-with-blue-a.jpg", sizes: "1280x720", type: "image/jpeg" },
      { src: "/mobile-messaging-interface-showing-chat-between-sh.jpg", sizes: "720x1280", type: "image/jpeg" },
      { src: "/mobile-tracking-screen-showing-map-with-delivery-r.jpg", sizes: "720x1280", type: "image/jpeg" },
    ],
    shortcuts: [
      { name: "Post a Load", short_name: "Post Load", url: "/post-load", description: "Quickly post a micro-load" },
      { name: "Browse Loads", short_name: "Loads", url: "/for-carriers", description: "See available loads for carriers" },
      { name: "Dashboard", short_name: "Dashboard", url: "/dashboard", description: "Go to your dashboard" },
    ],
  }
}
