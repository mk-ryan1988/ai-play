import { useState } from 'react';
import { Field, Label, Switch } from '@headlessui/react';

export default function Toggle({
  label,
  value,
  onChange,
}) {
  const [enabled, setEnabled] = useState(value || false);

  const handleChange = () => {
    setEnabled(!enabled);
    if (onChange) onChange(!enabled);
  }

  return (
    <Field
      className="flex items-center gap-3 cursor-pointer"
    >
      <Switch
        checked={enabled}
        onChange={handleChange}
        className="group relative flex h-7 w-14 rounded-full bg-white/10 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-white/10"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white ring-0 shadow-lg transition duration-200 ease-in-out group-data-[checked]:translate-x-7"
        />
      </Switch>
      <Label>
        <span className="cursor-pointer">{label}</span>
      </Label>
    </Field>
  )
};
