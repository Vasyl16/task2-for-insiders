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
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          mutate({ productId });
        }}
      >
        Add to cart
      </Button>
      {isError && <p className="mt-1 text-xs text-red-600">Couldn&apos;t add to cart. Try again.</p>}
    </div>
  );
}
