// app/search/page.tsx
'use client';

import SearchContainer from '@/components/features/friend/SearchContainer';
import Providers from '@/components/features/providers';

export default function SearchPage() {
  return (
    <Providers>
      <SearchContainer/>
    </Providers>
  );
}
