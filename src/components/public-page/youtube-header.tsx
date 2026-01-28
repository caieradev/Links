interface YouTubeHeaderProps {
  videoUrl: string
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /^([^"&?\/\s]{11})$/, // Direct vídeo ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function YouTubeHeader({ videoUrl }: YouTubeHeaderProps) {
  const vídeoId = extractYouTubeId(videoUrl)

  if (!vídeoId) return null

  return (
    <div className="w-full mb-6 rounded-xl overflow-hidden shadow-lg">
      <div className="relative pb-[56.25%] h-0">
        <iframe
          src={`https://www.youtube.com/embed/${vídeoId}?rel=0&modestbranding=1`}
          title="Vídeo"
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
