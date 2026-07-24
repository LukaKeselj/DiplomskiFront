export function getYoutubeVideoId(url) {
  if (!url) return null

  const trimmed = url.trim()
  if (!trimmed) return null

  let parsed
  try {
    parsed = new URL(trimmed)
  } catch {
    try {
      parsed = new URL(`https://${trimmed}`)
    } catch {
      return null
    }
  }

  const hostname = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "")
  let videoId = null

  if (hostname === "youtu.be") {
    videoId = parsed.pathname.split("/")[1]
  } else if (hostname === "youtube.com" || hostname === "youtube-nocookie.com") {
    if (parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v")
    } else if (parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.split("/shorts/")[1]
    } else if (parsed.pathname.startsWith("/embed/")) {
      videoId = parsed.pathname.split("/embed/")[1]
    }
  }

  if (!videoId) return null

  return videoId.split("/")[0].split("?")[0]
}

export function getYoutubeEmbedUrl(url) {
  const videoId = getYoutubeVideoId(url)
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null
}

export function getYoutubeThumbnailUrl(url) {
  const videoId = getYoutubeVideoId(url)
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null
}
