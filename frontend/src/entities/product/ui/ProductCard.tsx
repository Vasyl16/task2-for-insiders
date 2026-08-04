import type { Product } from '../model/product.types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-square w-full overflow-hidden bg-slate-100">
        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {product.category.name}
        </span>
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-base font-bold text-slate-900">${product.price.toFixed(2)}</p>
          {product.stock === 0 && <span className="text-xs font-medium text-red-600">Out of stock</span>}
        </div>
      </div>
    </div>
  );
}
