export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string; // Storing strictly for mock auth purposes in local storage
}

export enum ProductCategory {
  PLANTS = 'Plants',
  SEEDS = 'Seeds',
  FERTILIZERS = 'Fertilizers',
  TOOLS = 'Tools',
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  quantityAvailable: number;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantityOrdered: number;
}

export interface Notification {
  id: string;
  sellerId: string;
  buyerName: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
}

export interface WeatherData {
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy';
  humidity: number;
}
