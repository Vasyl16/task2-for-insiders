import { AlertCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useAddToCart } from '../api/use-add-to-cart';

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({ productId, disabled = false, className }: AddToCartButtonProps) {
  const { mutate, isPending, isError } = useAddToCart();

  return (
    <div className={className}>
      <Button
        type="button"
        isLoading={isPending}
        disabled={disabled}
        className="rounded-full"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          mutate({ productId });
        }}
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="ml-1.5">Add to cart</span>
      </Button>
      {isError && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          Couldn&apos;t add to cart. Try again.
        </p>
      )}
    </div>
  );
}
