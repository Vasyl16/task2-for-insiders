import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/common/utils/slugify.util';

const prisma = new PrismaClient();

interface CategorySeed {
  name: string;
}

interface ProductSeed {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
}

const categories: CategorySeed[] = [
  { name: 'Electronics' },
  { name: 'Home & Kitchen' },
  { name: 'Books' },
  { name: 'Apparel' },
];

const products: ProductSeed[] = [
  {
    name: 'Wireless Mechanical Keyboard',
    description: 'A tactile wireless mechanical keyboard with hot-swappable switches and per-key backlighting.',
    price: 129.99,
    stock: 24,
    imageUrl: 'https://picsum.photos/seed/wireless-mechanical-keyboard/600/600',
    category: 'Electronics',
  },
  {
    name: 'Noise-Cancelling Headphones',
    description: 'Over-ear wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 199.5,
    stock: 15,
    imageUrl: 'https://picsum.photos/seed/noise-cancelling-headphones/600/600',
    category: 'Electronics',
  },
  {
    name: '4K Action Camera',
    description: 'Waterproof action camera with 4K60 recording, image stabilization, and a mounting kit.',
    price: 249.0,
    stock: 8,
    imageUrl: 'https://picsum.photos/seed/4k-action-camera/600/600',
    category: 'Electronics',
  },
  {
    name: 'USB-C Fast Charger, 65W',
    description: 'Compact GaN charger with three ports, fast-charges laptops, tablets, and phones simultaneously.',
    price: 39.99,
    stock: 60,
    imageUrl: 'https://picsum.photos/seed/usb-c-fast-charger/600/600',
    category: 'Electronics',
  },
  {
    name: 'Stainless Steel Cookware Set',
    description: '10-piece tri-ply stainless steel cookware set, oven-safe and dishwasher-safe.',
    price: 179.0,
    stock: 10,
    imageUrl: 'https://picsum.photos/seed/cookware-set/600/600',
    category: 'Home & Kitchen',
  },
  {
    name: 'Programmable Espresso Machine',
    description: '15-bar espresso machine with built-in grinder and programmable shot volume.',
    price: 349.99,
    stock: 6,
    imageUrl: 'https://picsum.photos/seed/espresso-machine/600/600',
    category: 'Home & Kitchen',
  },
  {
    name: 'Memory Foam Pillow, 2-Pack',
    description: 'Contoured memory foam pillows with breathable cooling gel cover.',
    price: 54.95,
    stock: 40,
    imageUrl: 'https://picsum.photos/seed/memory-foam-pillow/600/600',
    category: 'Home & Kitchen',
  },
  {
    name: 'The Pragmatic Programmer',
    description: 'A classic guide to software craftsmanship, updated for modern engineering practices.',
    price: 34.99,
    stock: 50,
    imageUrl: 'https://picsum.photos/seed/pragmatic-programmer/600/600',
    category: 'Books',
  },
  {
    name: 'Atomic Habits',
    description: 'A practical guide to building good habits and breaking bad ones.',
    price: 18.0,
    stock: 75,
    imageUrl: 'https://picsum.photos/seed/atomic-habits/600/600',
    category: 'Books',
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'A deep dive into the principles behind reliable, scalable, and maintainable systems.',
    price: 44.5,
    stock: 20,
    imageUrl: 'https://picsum.photos/seed/data-intensive-applications/600/600',
    category: 'Books',
  },
  {
    name: 'Merino Wool Crewneck Sweater',
    description: 'Breathable, odor-resistant merino wool sweater for all-season layering.',
    price: 89.0,
    stock: 30,
    imageUrl: 'https://picsum.photos/seed/merino-wool-sweater/600/600',
    category: 'Apparel',
  },
  {
    name: 'Water-Resistant Trail Running Shoes',
    description: 'Lightweight trail running shoes with a water-resistant upper and aggressive grip outsole.',
    price: 119.99,
    stock: 18,
    imageUrl: 'https://picsum.photos/seed/trail-running-shoes/600/600',
    category: 'Apparel',
  },
];

async function main(): Promise<void> {
  const categoryIdByName = new Map<string, string>();

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name, slug: slugify(category.name) },
    });
    categoryIdByName.set(category.name, record.id);
  }
  console.log(`Seeded ${categories.length} categories.`);

  for (const product of products) {
    const categoryId = categoryIdByName.get(product.category);
    if (!categoryId) {
      throw new Error(`Unknown category "${product.category}" for product "${product.name}"`);
    }

    const slug = slugify(product.name);
    await prisma.product.upsert({
      where: { slug },
      update: {
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId,
      },
      create: {
        name: product.name,
        slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId,
      },
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
