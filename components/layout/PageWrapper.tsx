import { classNames } from "@/utils/classNames";
import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export default function PageWrapper(
  { children, title, description, action }: PageWrapperProps
) {
  return (
    <div>
      <div className={classNames(
        (title || description) ? 'mb-4' : '',
        'flex justify-between items-center'
      )}>
        {(title || description) && (
          <div>
            <h1 className="text-2xl font-thin mb-2">{title || ''}</h1>
            <p className="text-gray-400">{description || ''}</p>
          </div>
        )}

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

