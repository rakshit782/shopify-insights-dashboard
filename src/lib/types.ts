

// This corresponds to the raw product object from the Shopify Admin API
export interface ShopifyProduct {
  id: string; // Changed to string to be consistently admin_graphql_api_id
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
  linked_to_platforms?: string[]; // New field to track connections
  amazon_asin?: string;
  walmart_id?: string;
}

export interface MappedShopifyProduct {
  id: string;
  title: string;
  vendor: string;
  product_type: string;
  description: string;
  price: number;
  inventory: number;
  imageUrl: string;
  imageHint: string;
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
  id: string; // Use string for GID
  title?: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  variants?: ShopifyVariantUpdate[];
}

export interface ShopifyCredentials {
    store_name: string;
    access_token: string;
    api_version: string;
}

export interface AppSettings {
  marketplaces: MarketplaceSyncSetting[];
  logoUrl: string;
  faviconUrl: string;
}


// Represents the possible fulfillment statuses from Walmart
export type WalmartFulfillmentStatus = 'Created' | 'Acknowledged' | 'Shipped' | 'Delivered' | 'Cancelled';
export type AmazonFulfillmentStatus = 'Shipped' | 'Unshipped' | 'PartiallyShipped' | 'Canceled' | 'Unfulfillable' | 'Pending' | 'InvoiceUnconfirmed';

// Corresponds to the Order object from Shopify Admin API, adapted for multiple platforms
export interface ShopifyOrder {
    id: number | string; // Made flexible for other platforms
    admin_graphql_api_id: string;
    name: string; // e.g., #1001 or a purchase order ID
    created_at: string;
    updated_at: string;
    processed_at?: string | null; // Optional for other platforms
    total_price: string;
    subtotal_price?: string | null; // Optional for other platforms
    total_tax?: string | null; // Optional for other platforms
    total_shipping?: string | null; // Added for shipping costs
    total_discounts?: string | null; // Added for discounts
    currency: string;
    financial_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';
    fulfillment_status: WalmartFulfillmentStatus | AmazonFulfillmentStatus | 'fulfilled' | 'unfulfilled' | 'partial' | null;
    customer: {
        id?: number | string | null;
        email?: string | null;
        first_name?: string | null;
        last_name?: string | null;
        phone?: string | null;
    } | null;
    shipping_address: {
        first_name: string | null;
        last_name: string | null;
        address1: string | null;
        address2?: string | null;
        city: string | null;
        province: string | null; // State/Province code
        country: string | null;
        zip: string | null;
        phone?: string | null;
        country_code?: string | null;
    } | null;
    line_items: {
        id?: number | string;
        title: string;
        quantity: number;
        price: string;
        sku: string | null;
        vendor?: string | null;
    }[];
}

// Represents a raw order from the Walmart API
export interface WalmartOrder {
  purchaseOrderId: string;
  customerOrderId: string;
  customerEmailId: string;
  orderDate: number; // This is a timestamp
  shippingInfo: {
    postalAddress: {
      name: string;
      address1: string;
      address2: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    phone: string;
  };
  orderLines: {
    orderLine: {
      lineNumber: string;
      item: {
        productName: string;
        sku: string;
      };
      charges: {
        charge: {
          chargeType: string;
          chargeName: string;
          chargeAmount: {
            currency: string;
            amount: number;
          };
          tax: {
            taxName: string;
            taxAmount: {
              currency: string;
              amount: number;
            };
          };
        }[];
      };
      orderLineQuantity: {
        unitOfMeasurement: string;
        amount: string;
      };
      status: WalmartFulfillmentStatus;
      statusDate: number;
    }[];
  };
}

// Represents a raw order from the Amazon SP-API
export interface AmazonOrder {
    AmazonOrderId: string;
    PurchaseDate: string; // ISO 8601 format
    LastUpdateDate: string; // ISO 8601 format
    OrderStatus: 'Pending' | 'Unshipped' | 'PartiallyShipped' | 'Shipped' | 'Canceled' | 'Unfulfillable' | 'InvoiceUnconfirmed';
    FulfillmentChannel: 'AFN' | 'MFN';
    SalesChannel: string;
    OrderTotal: {
      CurrencyCode: string;
      Amount: string;
    };
    ShippingAddress?: {
      Name: string;
      AddressLine1: string;
      AddressLine2?: string;
      City: string;
      StateOrRegion: string;
      PostalCode: string;
      CountryCode: string;
      Phone?: string;
    };
    BuyerInfo?: {
      BuyerEmail?: string;
    };
    ShipmentServiceLevelCategory?: string;
}

export interface AmazonOrderItem {
    OrderItemId: string;
    SellerSKU: string;
    Title: string;
    QuantityOrdered: number;
    ItemPrice?: {
        CurrencyCode: string;
        Amount: string;
    };
     ShippingPrice?: {
        CurrencyCode: string;
        Amount: string;
    };
    ItemTax?: {
        CurrencyCode: string;
        Amount: string;
    };
    PromotionDiscount?: {
        CurrencyCode: string;
        Amount: string;
    };
}

export interface Agency {
    agency_id: string;
    name: string;
}
    
// User and Profile types for Supabase
export interface User {
    id: string; // uuid, primary key
    auth0_id: string; // unique
    username: string; // email
    role: 'admin' | 'sub';
    status: 'active' | 'inactive';
    created_at: string;
}

export interface Profile {
    id: string; // uuid, foreign key to users.id
    first_name?: string;
    last_name?: string;
    email: string; // unique
    address?: string;
    phone?: string;
    country?: string;
    sync_settings?: AppSettings; // JSONB column for settings
}

export interface MarketplaceSyncSetting {
  id: string;
  name: string;
  syncInventory: boolean;
  syncPrice: boolean;
  priceAdjustment: number;
  autoUpdateInventory: boolean;
  defaultInventory: number;
}
    
