interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-secondary border border-tertiary rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}

