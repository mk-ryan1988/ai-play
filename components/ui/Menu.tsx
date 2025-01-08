import Link from 'next/link';
import { Menu as HeadlessMenu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisVerticalIcon} from '@heroicons/react/24/outline';

export default function FlyoutMenu({ trigger, items }: { trigger?: React.ReactNode, items: { label: string, href: string }[] }) {
  return (
    <div className="relative">
      <HeadlessMenu>
          <MenuButton className="inline-flex items-center gap-2 rounded-md bg-transparent py-1.5 px-3 text-sm/6 font-semibold text-white focus:outline-none data-[hover]:bg-gray-tertiary data-[open]:bg-gray-tertiary data-[focus]:outline-1 data-[focus]:outline-white">
          {trigger ? trigger : <EllipsisVerticalIcon className="w-6 h-6" />}
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom end"
          className="w-52 origin-top-right rounded-xl border border-white/5 bg-secondary bg-opacity-10 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {items.map((item) => (
            <MenuItem key={item.label}>
              <Link href={item.href}>
                <button className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10">
                  {item.label}
                </button>
              </Link>
            </MenuItem>
          ))}
        </MenuItems>
      </HeadlessMenu>
    </div>
  )
}
