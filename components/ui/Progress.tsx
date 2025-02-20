
export default function Progress({ total, done }: { total: number, done: number }) {
  const outstandingCount = total - done;

  return (
    <div className="flex items-center space-x-4">
    { outstandingCount > 0 &&
      <span className="text-sm font-semibold text-label text-rose-800">{outstandingCount} outstanding</span>
    }

    {/* pie circle displaying outstanding items E.g those that are not checked. It will go from an empty outlined red circle to a filled in circle */}
    <div className={classNames(
      "relative w-8 h-8",
      outstandingCount > 0 ? 'text-rose-800' : 'text-green-800'
    )}>
      <svg
        className="absolute inset-0"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          opacity="0.2" /* Light background to indicate full circle */
        />

        {/* Progress circle */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeDasharray="62.832" /* Circumference = 2 * Math.PI * radius (approx 62.832 for r=10) */
          strokeDashoffset={62.832 - (outstandingCount / total) * 62.832}
          strokeLinecap="round"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
          }}
        />
      </svg>
    </div>
  </div>
  );
}
