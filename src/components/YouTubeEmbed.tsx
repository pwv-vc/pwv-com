interface YouTubeEmbedProps {
  url: string;
  title?: string;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
}

const YouTubeEmbed = ({
  url,
  title = 'YouTube video player',
  autoplay = false,
  controls = true,
  className = '',
}: YouTubeEmbedProps) => {
  // Extract video ID from various YouTube URL formats
  const getVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = getVideoId(url);

  if (!videoId) {
    return (
      <div className={`bg-gray-100 p-4 text-center ${className}`}>
        <p className="text-gray-600">Invalid YouTube URL</p>
      </div>
    );
  }

  // Build embed URL with parameters
  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  if (autoplay) embedUrl.searchParams.set('autoplay', '1');
  if (!controls) embedUrl.searchParams.set('controls', '0');

  return (
    <div className={`relative w-full ${className}`} style={{ paddingBottom: '56.25%' }}>
      <iframe
        className="absolute top-0 left-0 h-full w-full"
        src={embedUrl.toString()}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubeEmbed;

