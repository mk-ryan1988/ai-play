import { classNames } from "@/utils/classNames";

interface BadgeProps {
  children: React.ReactNode;
  color?: 'blue-gray' | 'yellow' | 'green' | 'default';
  size?: 'small' | 'medium' | 'large';
}

export default function Badge({ children, ...props }: BadgeProps) {
  const getColorClasses = () => {
    switch (props.color) {
      case 'blue-gray':
        return 'bg-gray-50 ring-gray-500/10 text-gray-600';
      case 'green':
        return 'bg-green-50 ring-green-500/10 text-green-600';
      case 'yellow':
        return 'bg-blue-50 ring-blue-500/10 text-blue-600';
      default:
        return 'bg-gray-50 ring-gray-500/10 text-gray-600';
    }
  };

  const getDarkColorClasses = () => {
    switch (props.color) {
      case 'blue-gray':
        return 'bg-grey-950 ring-gray-500/10 text-gray-300';
      case 'green':
        return 'bg-emerald-950 ring-emerald-500/10 text-emerald-200';
      case 'yellow':
        return 'bg-indigo-950 ring-indigo-500/10 text-indigo-200';
      default:
        return 'bg-grey-950 ring-gray-500/10 text-gray-300';
    }
  };

  return (
    <span
      className={classNames(
        getDarkColorClasses(),
        'inline-flex items-center rounded-md ring-1 ring-inset',
        props.size === 'large' ? 'px-3 py-1.5 text-sm' :
        props.size === 'medium' ? 'px-2.5 py-1 text-xs' :
        'px-2 py-0.5 text-xs', // small (default)
        'font-medium',
      )}
    >
      {children}
    </span>

  )
}
