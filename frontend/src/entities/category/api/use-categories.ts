import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchCategories } from './categories.api';
import { categoryQueryKeys } from '../model/query-keys';
import type { Category } from '../model/category.types';

export function useCategories(): UseQueryResult<Category[]> {
  return useQuery({
    queryKey: categoryQueryKeys.lists(),
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
}
