import { Combobox as HeadlessCombobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ComboItem {
  id: number;
  name: string;
  image?: string;
}

interface ComboboxProps {
  items: Array<ComboItem>;
  onSearch: (query: string) => Promise<Array<ComboItem>>;
  onSelect: (item: ComboItem) => void;
}

export default function Combobox({
  items,
  onSearch,
  onSelect,
}: ComboboxProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ComboItem | null>(null)
  const [filteredItems, setFilteredItems] = useState(items)

  useEffect(() => {
    const fetchItems = async () => {
      const results = await onSearch(query)
      setFilteredItems(results)
    }

    if (query) {
      fetchItems()
    } else {
      setFilteredItems(items)
    }
  }, [query, items, onSearch])

  const handleSelect = (value: { id: number; name: string }) => {
    setSelected(value)
    onSelect(value)
  }

  return (
    <HeadlessCombobox value={selected} onChange={handleSelect} onClose={() => setQuery('')}>
      <div className="relative">
        <ComboboxInput
          className={clsx(
            'w-full rounded-lg border-none bg-white/5 py-1.5 pr-8 pl-3 text-sm/6 text-white',
            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
          )}
          displayValue={(item: { id: number; name: string }) => item?.name}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
          <ChevronDownIcon className="size-4 fill-white/60 group-data-[hover]:fill-white" />
        </ComboboxButton>
      </div>

      <ComboboxOptions
        anchor="bottom"
        transition
        className={clsx(
          'w-[var(--input-width)] rounded-xl border border-white/5 bg-white/5 p-1 [--anchor-gap:var(--spacing-1)] empty:invisible',
          'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
        )}
      >
        {filteredItems.map((item) => (
          <ComboboxOption
            key={item.id}
            value={item}
            className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
          >
            { item.image &&
              <Image
                src={item.image}
                alt={item.name}
                width={30}
                height={30}
                className="rounded-full"
              />
            }
            {/* <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" /> */}
            <div className="text-sm/6 text-white">{item.name}</div>
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </HeadlessCombobox>
  )
}
