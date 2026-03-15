import { CheckBadgeIcon } from "@heroicons/react/24/solid";

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerifiedBadge({ className = "", size = 'md' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "size-3.5 md:size-4",
    md: "size-5 md:size-6",
    lg: "size-7 md:size-8"
  };

  return (
    <div 
      className={`inline-flex items-center justify-center bg-blue-500 rounded-full p-0.5 shadow-sm shrink-0 ${className}`}
      title="Verified Account"
    >
      <CheckBadgeIcon className={`${sizeClasses[size]} text-white`} />
    </div>
  );
}
