import { Star } from "lucide-react";
import { cn } from "../utils/cn";

export default function StarRating({
  rating,
  count,
  size = 14,
  className,
}: {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={
              i <= Math.round(rating)
                ? "fill-gold text-gold"
                : "fill-border text-border"
            }
          />
        ))}
      </div>
      <span className="text-xs text-muted">
        {rating.toFixed(1)}
        {count !== undefined && <> ({count})</>}
      </span>
    </div>
  );
}
