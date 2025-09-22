export interface ShopifyProduct {
  id: number;
  title: string;
  description: string;
  vendor: string;
  product_type: string;
  price: number;
  inventory: number;
  imageUrl: string;
  imageHint: string;
  unitsSold: number;
  totalRevenue: number;
  averageRating: number;
  numberOfReviews: number;
}
