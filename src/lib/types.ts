
export interface ShopifyProduct {
  id: string; // Shopify IDs are strings
  title: string;
  description: string;
  vendor: string;
  product_type: string;
  price: number;
  inventory: number;
  imageUrl: string;
  imageHint: string;
  // These fields are not directly available from the basic product endpoint.
  // They are kept for compatibility with existing components but will be placeholders.
  unitsSold: number;
  totalRevenue: number;
  averageRating: number;
  numberOfReviews: number;
}
