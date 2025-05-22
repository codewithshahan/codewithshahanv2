/**
 * Schema.org structured data utilities for improving SEO
 * Based on Apple's approach to clean, maintainable structured data implementation
 */

// Schema namespace containing TypeScript type definitions for Schema.org types
export namespace Schema {
  // Core schema types
  export interface Thing {
    "@context": "https://schema.org";
    "@type": string;
    name?: string | string[];
    description?: string | string[];
    url?: string | string[];
    image?: string | ImageObject;
  }

  // Person schema
  export interface Person extends Thing {
    "@type": "Person";
    givenName?: string;
    familyName?: string;
    jobTitle?: string;
    email?: string;
    telephone?: string;
    sameAs?: string[];
  }

  // Organization schema
  export interface Organization extends Thing {
    "@type": "Organization";
    logo?: ImageObject | string;
    sameAs?: string[];
    contactPoint?: ContactPoint[];
  }

  // Base article schema with common properties
  export interface BaseArticle extends Thing {
    headline: string;
    author: Person | Organization | string;
    publisher: Organization;
    datePublished: string;
    dateModified?: string;
    mainEntityOfPage?: WebPage | string;
    articleBody?: string;
    wordCount?: number;
    keywords?: string;
  }

  // Article schema
  export interface Article extends BaseArticle {
    "@type": "Article";
  }

  // BlogPosting schema
  export interface BlogPosting extends BaseArticle {
    "@type": "BlogPosting";
  }

  // Base list schema
  export interface BaseList extends Thing {
    itemListElement: (ListItem | string)[];
    numberOfItems?: number;
  }

  // ItemList schema
  export interface ItemList extends BaseList {
    "@type": "ItemList";
  }

  // BreadcrumbList schema
  export interface BreadcrumbList extends BaseList {
    "@type": "BreadcrumbList";
  }

  export interface ListItem extends Thing {
    "@type": "ListItem";
    position: number;
    item: Thing;
  }

  // Navigation schema
  export interface SiteNavigationElement extends Thing {
    "@type": "SiteNavigationElement";
  }

  // WebPage schema
  export interface WebPage extends Thing {
    "@type": "WebPage";
    "@id"?: string;
    breadcrumb?: BreadcrumbList;
    lastReviewed?: string;
    reviewedBy?: Person | Organization;
    specialty?: string;
  }

  // Product schema
  export interface Product extends Thing {
    "@type": "Product";
    brand?: Organization | string;
    sku?: string;
    mpn?: string;
    gtin?: string;
    gtin8?: string;
    gtin13?: string;
    gtin14?: string;
    offers?: Offer | Offer[];
    review?: Review | Review[];
    aggregateRating?: AggregateRating;
  }

  // Supporting types
  export interface ImageObject extends Thing {
    "@type": "ImageObject";
    width?: number;
    height?: number;
    contentUrl?: string;
  }

  export interface ContactPoint extends Thing {
    "@type": "ContactPoint";
    contactType: string;
    telephone?: string;
    email?: string;
    areaServed?: string;
    availableLanguage?: string | string[];
  }

  export interface Offer extends Thing {
    "@type": "Offer";
    price: number | string;
    priceCurrency: string;
    priceValidUntil?: string;
    availability?: string;
    itemCondition?: string;
    seller?: Organization | Person;
  }

  export interface Review extends Thing {
    "@type": "Review";
    reviewRating: Rating;
    author: Person | Organization;
    reviewBody?: string;
    datePublished?: string;
  }

  // Base rating schema
  export interface BaseRating extends Thing {
    ratingValue: number | string;
    bestRating?: number | string;
    worstRating?: number | string;
  }

  // Rating schema
  export interface Rating extends BaseRating {
    "@type": "Rating";
  }

  // AggregateRating schema
  export interface AggregateRating extends BaseRating {
    "@type": "AggregateRating";
    ratingCount: number;
    reviewCount?: number;
  }
}

/**
 * Helper function to generate structured data JSON with proper typing
 * @param data The structured data object matching a Schema.org type
 * @returns The same data object, properly typed for schema.org
 */
export function structuredData<T extends Schema.Thing>(data: T): T {
  return data;
}

/**
 * Helper function to convert typed structured data to JSON string
 * @param data The structured data object
 * @returns JSON string representation of the structured data
 */
export function structuredDataToJson<T extends Schema.Thing>(data: T): string {
  return JSON.stringify(data);
}
