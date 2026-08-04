import { useEffect, useState } from 'react';
import { Input } from '@/shared/ui';
import { useDebouncedValue } from '@/shared/hooks';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const debouncedDraft = useDebouncedValue(draft, 400);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    onChange(debouncedDraft);
    // Only re-run when the debounced value settles, not when `onChange`/`value` identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft]);

  return (
    <Input
      type="search"
      placeholder="Search products…"
      aria-label="Search products"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
    />
  );
}
