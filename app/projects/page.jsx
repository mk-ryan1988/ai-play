'use client';

import { useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';

export default function Projects() {
  useEffect(() => {
    console.log('Projects');
  }, []);

  return (
    <PageWrapper
      title="Projects"
    >
      <div>
      </div>
    </PageWrapper>
  );
}
