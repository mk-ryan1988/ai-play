import { classNames } from "@/utils/classNames";

interface BadgeProps {
  children: React.ReactNode;
  color?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'small' | 'medium' | 'large';
}

export default function Badge({ children, color = 'default', size = 'small' }: BadgeProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'bg-success-light text-success border-success/20';
      case 'warning':
        return 'bg-warning-light text-warning border-warning/20';
      case 'error':
        return 'bg-error-light text-error border-error/20';
      case 'info':
        return 'bg-info-light text-info border-info/20';
      default:
        return 'bg-tertiary text-label border-tertiary';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'large':
        return 'px-3 py-1.5 text-sm';
      case 'medium':
        return 'px-2.5 py-1 text-xs';
      default: // small
        return 'px-2 py-0.5 text-xs';
    }
  };

  return (
    <span
      className={classNames(
        getColorClasses(),
        getSizeClasses(),
        'inline-flex items-center rounded-md border font-medium',
      )}
    >
      {children}
    </span>
  )
}
