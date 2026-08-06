import { useEffect, useState } from 'react';
import { Input } from '@/shared/ui';
import { useDebouncedValue } from '@/shared/hooks';

interface PriceRangeInputProps {
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onChange: (minPrice: number | undefined, maxPrice: number | undefined) => void;
}

function toDraft(price: number | undefined): string {
  return price === undefined ? '' : String(price);
}

function parseDraft(draft: string): number | undefined {
  if (draft.trim() === '') return undefined;
  const value = Number(draft);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

/**
 * Custom min/max price filter — two plain number inputs kept in sync with the
 * URL-backed filter state, debounced so it doesn't refetch on every keystroke.
 */
export function PriceRangeInput({ minPrice, maxPrice, onChange }: PriceRangeInputProps) {
  const [minDraft, setMinDraft] = useState(toDraft(minPrice));
  const [maxDraft, setMaxDraft] = useState(toDraft(maxPrice));
  const debouncedMin = useDebouncedValue(minDraft, 400);
  const debouncedMax = useDebouncedValue(maxDraft, 400);

  useEffect(() => {
    setMinDraft(toDraft(minPrice));
  }, [minPrice]);

  useEffect(() => {
    setMaxDraft(toDraft(maxPrice));
  }, [maxPrice]);

  useEffect(() => {
    onChange(parseDraft(debouncedMin), parseDraft(debouncedMax));
    // Only re-run when the debounced values settle, not when `onChange`/props identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin, debouncedMax]);

  const isInvalidRange =
    parseDraft(minDraft) !== undefined &&
    parseDraft(maxDraft) !== undefined &&
    parseDraft(minDraft)! > parseDraft(maxDraft)!;

  return (
    <div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="Min price"
          aria-label="Minimum price"
          value={minDraft}
          onChange={(event) => setMinDraft(event.target.value)}
        />
        <span className="text-sm text-slate-400" aria-hidden="true">
          –
        </span>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="Max price"
          aria-label="Maximum price"
          value={maxDraft}
          onChange={(event) => setMaxDraft(event.target.value)}
        />
      </div>
      {isInvalidRange && (
        <p className="mt-1 text-xs text-red-600">Min price is greater than max price.</p>
      )}
    </div>
  );
}
