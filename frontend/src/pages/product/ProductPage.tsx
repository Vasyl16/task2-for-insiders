import { Link, useParams } from 'react-router-dom';
import { paths } from '@/app/routes';
import { useProduct } from '@/entities/product';
import { AddToCartButton } from '@/features/add-to-cart';

export function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading, isError } = useProduct(productId);

  if (isLoading) {
    return <p className="mx-auto max-w-4xl px-4 py-8 text-sm text-slate-500">Loading product…</p>;
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm text-red-600">Product not found.</p>
        <Link to={paths.home} className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to={paths.home} className="mb-6 inline-block text-sm font-medium text-slate-600 underline">
        Back to products
      </Link>
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {product.category.name}
          </span>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-slate-900">${product.price.toFixed(2)}</p>
          <p className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-700">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </p>
          <p className="mt-6 whitespace-pre-line text-sm text-slate-700">{product.description}</p>
          <AddToCartButton
            productId={product.id}
            disabled={product.stock === 0}
            className="mt-6"
          />
        </div>
      </div>
    </div>
  );
}
