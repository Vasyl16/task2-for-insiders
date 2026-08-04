import { useCategories } from '@/entities/category';
import { Select } from '@/shared/ui';

interface CategoryFilterProps {
  value: string | undefined;
  onChange: (categoryId: string | undefined) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { data: categories, isLoading } = useCategories();

  const options = [
    { value: '', label: 'All categories' },
    ...(categories?.map((category) => ({ value: category.id, label: category.name })) ?? []),
  ];

  return (
    <Select
      aria-label="Filter by category"
      value={value ?? ''}
      disabled={isLoading}
      options={options}
      onChange={(next) => onChange(next || undefined)}
    />
  );
}
