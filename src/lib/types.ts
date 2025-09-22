
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
  unitsSold: number;
  totalRevenue: number;
  averageRating: number;
  numberOfReviews: number;
}

export interface WebsiteProduct {
    id: string;
    title: string;
    description: string;
    vendor: string;
    product_type: string;
    price: number;
    inventory: number;
    image_url: string;
    image_hint: string;
    units_sold: number;
    total_revenue: number;
    average_rating: number;
    number_of_reviews: number;
}
