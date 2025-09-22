


// This corresponds to the raw product object from the Shopify Admin API
export interface ShopifyProduct {
  id: number;
  admin_graphql_api_id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string | null;
  template_suffix: string;
  published_scope: string;
  tags: string;
  status: string;
  variants: {
    id: number;
    product_id: number;
    title: string;
    price: string;
    sku: string;
    position: number;
    inventory_policy: string;
    compare_at_price: string | null;
    fulfillment_service: string;
    inventory_management: string;
    option1: string;
    option2: string | null;
    option3: string | null;
    created_at: string;
    updated_at: string;
    taxable: boolean;
    barcode: string;
    grams: number;
    image_id: number | null;
    weight: number;
    weight_unit: string;
    inventory_item_id: number;
    inventory_quantity: number;
    old_inventory_quantity: number;
    requires_shipping: boolean;
    admin_graphql_api_id: string;
  }[];
  options: {
    id: number;
    product_id: number;
    name: string;
    position: number;
    values: string[];
  }[];
  images: {
    id: number;
    product_id: number;
    position: number;
    created_at: string;
    updated_at: string;
    alt: string | null;
    width: number;
    height: number;
    src: string;
    variant_ids: number[];
    admin_graphql_api_id: string;
  }[];
  image: {
    id: number;
    product_id: number;
    position: number;
    created_at: string;
    updated_at: string;
    alt: string | null;
    width: number;
    height: number;
    src: string;
    variant_ids: number[];
    admin_graphql_api_id: string;
  } | null;
}

export interface MappedShopifyProduct {
  id: string;
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
    id: string; // This will be the admin_graphql_api_id
    handle: string;
    shopify_data: ShopifyProduct;
}

export interface ShopifyProductCreation {
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  price: number;
}

export interface ShopifyVariantUpdate {
  id: number;
  price?: string;
  sku?: string;
  inventory_quantity?: number;
}


export interface ShopifyProductUpdate {
  id: number;
  title?: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  variants?: ShopifyVariantUpdate[];
}

export interface AmazonCredentials {
    profile_id: string;
    client_id: string;
    client_secret: string;
    refresh_token: string;
}

export interface WalmartCredentials {
    client_id: string;
    client_secret: string;
}

export interface EbayCredentials {
    app_id: string;
    cert_id: string;
    dev_id: string;
    oauth_token: string;
}

export interface EtsyCredentials {
    keystring: string;
}

export interface WayfairCredentials {
    client_id: string;
    client_secret: string;
}

// Corresponds to the Order object from Shopify Admin API
export interface ShopifyOrder {
    id: number;
    admin_graphql_api_id: string;
    name: string; // e.g., #1001
    created_at: string;
    updated_at: string;
    processed_at: string;
    total_price: string;
    subtotal_price: string;
    total_tax: string;
    currency: string;
    financial_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';
    fulfillment_status: 'fulfilled' | 'unfulfilled' | 'partial' | null;
    customer: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        phone: string | null;
    } | null;
    shipping_address: {
        first_name: string;
        last_name: string;
        address1: string;
        address2: string | null;
        city: string;
        province: string; // State/Province code
        country: string;
        zip: string;
        phone: string | null;
        country_code: string;
    } | null;
    line_items: {
        id: number;
        title: string;
        quantity: number;
        price: string;
        sku: string | null;
        vendor: string | null;
    }[];
}
