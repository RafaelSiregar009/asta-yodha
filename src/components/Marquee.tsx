type MarqueeProps = {
  items: string[];
  className?: string;
};

export default function Marquee({ items, className = "" }: MarqueeProps) {
  const sequence = [...items, ...items];

  return (
    <div
      className={`group overflow-hidden border-y border-ink/10 bg-cream py-5 ${className}`}
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-10">
            {sequence.map((text, i) => (
              <span key={`${copy}-${i}`} className="flex items-center gap-10">
                <span
                  className={`font-display text-3xl tracking-wide md:text-5xl ${
                    i % 2 === 1
                      ? "text-transparent [-webkit-text-stroke:1.5px_#0A0A0A]"
                      : "text-ink"
                  }`}
                >
                  {text}
                </span>
                <span className="h-2.5 w-2.5 rotate-45 bg-redd" aria-hidden="true" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
