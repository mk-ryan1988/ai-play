'use client';

interface ShimmerOverlayProps {
  isVisible: boolean;
}

export default function ShimmerOverlay({ isVisible }: ShimmerOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dark overlay with slight transparency */}
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />

      {/* Shimmer effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="shimmer-gradient" />
      </div>

      {/* Loading text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-primary/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-xl border border-tertiary">
          <p className="text-title font-medium animate-pulse">
            Generating theme...
          </p>
        </div>
      </div>

      <style jsx>{`
        .shimmer-gradient {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(249, 115, 22, 0.1) 25%,
            rgba(249, 115, 22, 0.2) 50%,
            rgba(249, 115, 22, 0.1) 75%,
            transparent 100%
          );
          animation: shimmer 2s infinite;
          transform: rotate(45deg);
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) rotate(45deg);
          }
        }
      `}</style>
    </div>
  );
}
