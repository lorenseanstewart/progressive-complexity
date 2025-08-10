export type Product = {
  id: number;
  name: string;
  price: number; // base currency USD
  quantity: number;
  prices: Record<string, number>; // per-currency prices
};

export const PAGE_SIZE = 10;

export const currencyMap: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 157,
  CAD: 1.35,
  AUD: 1.5,
  CHF: 0.89,
};

function seedProducts(): Product[] {
  const names = [
    'Aurora Headphones',
    'Lumen Desk Lamp',
    'Nimbus Router',
    'Solace Monitor',
    'Pulse Keyboard',
    'Echo Speakers',
    'Quanta Mouse',
    'Zenith Webcam',
    'Vertex Laptop Stand',
    'Nova USB Hub',
  ];
  const products: Product[] = [];
  for (let i = 1; i <= 50; i++) {
    const basePrice = +(50 + Math.random() * 950).toFixed(2);
    const quantity = Math.floor(1 + Math.random() * 20);
    const name = names[i % names.length] + ' #' + i;
    const prices: Record<string, number> = {};
    for (const [code, rate] of Object.entries(currencyMap)) {
      prices[code] = +(basePrice * rate).toFixed(2);
    }
    products.push({ id: i, name, price: basePrice, quantity, prices });
  }
  return products;
}

let db: Product[] = seedProducts();

export function getProducts(params: {
  page: number;
  pageSize: number;
  sort?: keyof Product | 'name' | 'price' | 'quantity';
  sortDir?: 'asc' | 'desc';
  searchField?: 'name';
  searchTerm?: string;
}) {
  const { page, pageSize, sort = 'id', sortDir = 'asc', searchField, searchTerm } = params;
  let rows = [...db];
  if (searchField && searchTerm) {
    rows = rows.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  rows.sort((a, b) => {
    const aVal = (a as any)[sort];
    const bVal = (b as any)[sort];
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const total = rows.length;
  const start = (page - 1) * pageSize;
  const data = rows.slice(start, start + pageSize);
  return { data, total };
}

export function getTotals(rows: Product[]) {
  const totalItems = rows.reduce((sum, p) => sum + p.quantity, 0);
  const totalAmountUSD = rows.reduce((sum, p) => sum + p.quantity * p.price, 0);
  return { totalItems, totalAmountUSD: +totalAmountUSD.toFixed(2) };
}

export function getAllTotals() {
  return getTotals(db);
}

export function updateProductField(id: number, field: 'price' | 'quantity', value: number) {
  const product = db.find((p) => p.id === id);
  if (!product) throw new Error('Not found');
  if (field === 'price') {
    product.price = value;
    for (const [code, rate] of Object.entries(currencyMap)) {
      product.prices[code] = +(value * rate).toFixed(2);
    }
  } else if (field === 'quantity') {
    product.quantity = Math.max(0, Math.floor(value));
  }
  return product;
}

export function getById(id: number) {
  return db.find((p) => p.id === id);
}

export function deleteProduct(id: number) {
  const index = db.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Product not found');
  db.splice(index, 1);
}
