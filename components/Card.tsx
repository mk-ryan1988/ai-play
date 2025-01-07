import { resolveClassOverrides } from "@/utils/classNames";
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={resolveClassOverrides(className)}>
      {children}
    </div>
  );
}

