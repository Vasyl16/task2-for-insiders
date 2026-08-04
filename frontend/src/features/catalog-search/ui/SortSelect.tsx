import type { ProductSortField, SortOrder } from '@/entities/product';
import { Select } from '@/shared/ui';

interface SortSelectProps {
  sortBy: ProductSortField;
  sortOrder: SortOrder;
  onChange: (sortBy: ProductSortField, sortOrder: SortOrder) => void;
}

interface SortOption {
  value: string;
  label: string;
  sortBy: ProductSortField;
  sortOrder: SortOrder;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt-desc', label: 'Newest', sortBy: 'createdAt', sortOrder: 'desc' },
  { value: 'price-asc', label: 'Price: Low to High', sortBy: 'price', sortOrder: 'asc' },
  { value: 'price-desc', label: 'Price: High to Low', sortBy: 'price', sortOrder: 'desc' },
  { value: 'name-asc', label: 'Name: A to Z', sortBy: 'name', sortOrder: 'asc' },
];

export function SortSelect({ sortBy, sortOrder, onChange }: SortSelectProps) {
  const currentValue = `${sortBy}-${sortOrder}`;

  return (
    <Select
      aria-label="Sort products"
      value={currentValue}
      options={SORT_OPTIONS.map(({ value: optionValue, label }) => ({ value: optionValue, label }))}
      onChange={(next) => {
        const option = SORT_OPTIONS.find((candidate) => candidate.value === next);
        if (option) {
          onChange(option.sortBy, option.sortOrder);
        }
      }}
    />
  );
}
