import { classNames } from "@/utils/classNames";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  backTo?: string;
  action?: ReactNode;
}

export default function PageWrapper(
  { children, title, description, backTo, action }: PageWrapperProps
) {
  return (
    <div>
      <div className={classNames(
        (title || description) ? 'mb-4' : '',
        'flex justify-between items-center'
      )}>
        <div className="flex items-center gap-4">
          {backTo && (
            <Link href={backTo}>
              <div className="w-12 h-12 border border-tertiary rounded-lg flex items-center justify-center">
                <ArrowLeftIcon className="w-4 h-4" />
              </div>
            </Link>
          )}

          <div className="flex flex-col">
            <h1 className="text-2xl font-thin">{title || ''}</h1>
            { description &&
              <p className="text-sm min-h-6 mt-2">{description}</p>
            }
          </div>
        </div>

        {action && (
          <div>
            {action}
          </div>
        )}
      </div>

      <div>
        {children}
      </div>
    </div>
  );
}

