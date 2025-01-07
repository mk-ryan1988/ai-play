import { classNames } from "@/utils/classNames";

export default function PageWrapper(
  { children, title, description }: { children: React.ReactNode, title?: string, description?: string }
) {
  return (
    <div>
      <div className="flex flex-col w-full">
        <div className={classNames(title ?? 'mb-8')}>
          <h1 className="text-2xl font-thin mb-2">{title || ''}</h1>
          <p className="text-gray-400">{description || ''}</p>
        </div>
      </div>

      <div>
        {children}
      </div>
    </div>
  );
}

