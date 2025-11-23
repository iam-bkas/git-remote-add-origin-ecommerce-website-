import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Product, User, Order, Coupon } from '../types';
import { MOCK_PRODUCTS, MOCK_COUPONS } from '../constants';

interface LuminaDB extends DBSchema {
  products: {
    key: string;
    value: Product;
  };
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  orders: {
    key: string;
    value: Order;
    indexes: { 'by-user': string };
  };
  coupons: {
    key: string;
    value: Coupon;
  };
}

const DB_NAME = 'lumina-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LuminaDB>> | null = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<LuminaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('by-email', 'email', { unique: true });
        }
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
          orderStore.createIndex('by-user', 'userId');
        }
        if (!db.objectStoreNames.contains('coupons')) {
          db.createObjectStore('coupons', { keyPath: 'code' });
        }
      },
    });
  }
  return dbPromise;
};

export const seedDatabase = async () => {
  const db = await initDB();
  
  // Check if products exist
  const productsCount = await db.count('products');
  if (productsCount === 0) {
    console.log('Seeding products...');
    const tx = db.transaction('products', 'readwrite');
    await Promise.all(MOCK_PRODUCTS.map(p => tx.store.put(p)));
    await tx.done;
  }

  // Check if coupons exist
  const couponsCount = await db.count('coupons');
  if (couponsCount === 0) {
    console.log('Seeding coupons...');
    const tx = db.transaction('coupons', 'readwrite');
    await Promise.all(MOCK_COUPONS.map(c => tx.store.put(c)));
    await tx.done;
  }
  
  // Seed default admin if not exists
  const adminEmail = 'admin@lumina.com';
  const existingAdmin = await db.getFromIndex('users', 'by-email', adminEmail);
  if (!existingAdmin) {
     console.log('Seeding admin...');
     await db.put('users', {
        id: 'admin-1',
        name: 'Alex Admin',
        email: adminEmail,
        password: 'password',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Alex+Admin&background=1e1b4b&color=fff',
        addresses: [],
        wishlist: []
     });
  }
  
  // Seed demo user
  const userEmail = 'user@lumina.com';
  const existingUser = await db.getFromIndex('users', 'by-email', userEmail);
  if (!existingUser) {
      console.log('Seeding demo user...');
      await db.put('users', {
        id: 'user-1',
        name: 'Demo User',
        email: userEmail,
        password: 'password',
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=4f46e5&color=fff',
        addresses: [
            {
            id: 'addr-1',
            label: 'Home',
            street: '123 Main St',
            city: 'Tech City',
            state: 'CA',
            zip: '94000',
            country: 'USA',
            isDefault: true
            }
        ],
        wishlist: ['p1', 'p3']
      });
  }

  return db;
};

// --- CRUD Helpers ---

export const dbService = {
    async getAllProducts() {
        const db = await initDB();
        return db.getAll('products');
    },
    async saveProduct(product: Product) {
        const db = await initDB();
        return db.put('products', product);
    },
    async deleteProduct(id: string) {
        const db = await initDB();
        return db.delete('products', id);
    },
    async getAllUsers() {
        const db = await initDB();
        return db.getAll('users');
    },
    async saveUser(user: User) {
        const db = await initDB();
        return db.put('users', user);
    },
    async deleteUser(id: string) {
        const db = await initDB();
        return db.delete('users', id);
    },
    async getAllOrders() {
        const db = await initDB();
        // Since idb returns sorted by key (date usually not key), we might need sorting in app
        return (await db.getAll('orders')).reverse(); // Newest first
    },
    async saveOrder(order: Order) {
        const db = await initDB();
        return db.put('orders', order);
    },
    async getAllCoupons() {
        const db = await initDB();
        return db.getAll('coupons');
    }
};
