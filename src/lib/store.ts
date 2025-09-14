import type { 
  Product, 
  ProductTotals
} from '../types';

export interface ProductWithCurrency extends Product {
  // No additional properties needed currently
}

export const PAGE_SIZE = 10;

function seedProducts(): ProductWithCurrency[] {
  const names: readonly string[] = [
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
  ] as const;
  
  const products: ProductWithCurrency[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const basePrice: number = +(50 + Math.random() * 950).toFixed(2);
    const quantity: number = Math.floor(1 + Math.random() * 20);
    const name: string = names[i % names.length] + ' #' + i;
    
    const product: ProductWithCurrency = {
      id: i,
      name,
      price: basePrice,
      quantity,
      category: 'Electronics'
    };
    
    products.push(product);
  }
  return products;
}

let db: ProductWithCurrency[] = seedProducts();

export interface GetProductsParams {
  page: number;
  pageSize: number;
  sort?: keyof Product | 'subtotal';
  sortDir?: 'asc' | 'desc';
  searchField?: keyof Product;
  searchTerm?: string;
}

export interface GetProductsResult {
  data: ProductWithCurrency[];
  total: number;
}

export function getProducts(params: GetProductsParams): GetProductsResult {
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

export function getTotals(rows: ProductWithCurrency[]): ProductTotals {
  const totalQuantity: number = rows.reduce((sum, p) => sum + p.quantity, 0);
  const grandTotal: number = rows.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const totalPrice: number = rows.reduce((sum, p) => sum + p.price, 0);
  const averagePrice: number = rows.length > 0 ? totalPrice / rows.length : 0;
  
  return {
    totalPrice: +totalPrice.toFixed(2),
    totalQuantity,
    grandTotal: +grandTotal.toFixed(2),
    averagePrice: +averagePrice.toFixed(2),
    productCount: rows.length
  };
}

export function getAllTotals(): ProductTotals {
  return getTotals(db);
}

export function getProductById(id: number): ProductWithCurrency | undefined {
  return db.find((p) => p.id === id);
}

export function updateProductField(
  id: number,
  field: 'price' | 'quantity',
  value: number
): ProductWithCurrency {
  const product = db.find((p) => p.id === id);
  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }

  if (field === 'price') {
    if (value < 0) {
      throw new Error('Price cannot be negative');
    }
    product.price = value;
  } else if (field === 'quantity') {
    if (value < 0) {
      throw new Error('Quantity cannot be negative');
    }
    product.quantity = Math.max(0, Math.floor(value));
  }

  return product;
}


export function deleteProduct(id: number): void {
  const index = db.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Product with id ${id} not found`);
  }
  db.splice(index, 1);
}
