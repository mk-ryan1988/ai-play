export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function resolveClassOverrides(className: string) {
  const defaultClassName = 'p-6 bg-secondary border border-tertiary rounded-lg';
  const defaults = defaultClassName.split(' ').filter((c) => {
    const [prefix, ...rest] = c.split('-');
    return !className.includes(`${prefix}-`);
  });
  return `${defaults.join(' ')} ${className}`;
}
