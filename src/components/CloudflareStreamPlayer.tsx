import { Stream } from '@cloudflare/stream-react';

interface CloudflareStreamPlayerProps {
  videoId: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  responsive?: boolean;
  className?: string;
}

const CloudflareStreamPlayer = ({
  videoId,
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
  preload = 'auto',
  responsive = true,
  className = '',
}: CloudflareStreamPlayerProps) => {
  return (
    <div className={className}>
      <Stream
        src={videoId}
        autoplay={autoplay}
        controls={controls}
        loop={loop}
        muted={muted}
        preload={preload}
        responsive={responsive}
      />
    </div>
  );
};

export default CloudflareStreamPlayer;
