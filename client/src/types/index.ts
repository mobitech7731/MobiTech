export interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ApiProductImage {
  url: string;
  publicId?: string;
}

export interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: { _id: string; name: string; slug: string } | string;
  price: number;
  compareAtPrice?: number;
  images: (string | ApiProductImage)[];
  isNewArrival: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  inStock: boolean;
  stockQuantity: number;
  isActive: boolean;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug?: string;
  price: number;
  image: string;
  images?: string[];
  inStock?: boolean;
  isNew?: boolean;
  description?: string;
}

export const mapApiProductToUI = (p: ApiProduct): Product => {
  let catName = 'Accessories';
  let catSlug = 'accessories';
  if (typeof p.category === 'object' && p.category !== null) {
    if ('name' in p.category) catName = p.category.name;
    if ('slug' in p.category) catSlug = p.category.slug;
  } else if (typeof p.category === 'string') {
    catSlug = p.category;
  }
  
  return {
    id: p._id,
    name: p.name,
    category: catName,
    categorySlug: catSlug,
    price: p.price,
    image: p.images && p.images.length > 0 
      ? (typeof p.images[0] === 'string' ? p.images[0] as string : (p.images[0] as ApiProductImage).url) 
      : '/images/placeholder.svg',
    images: p.images ? p.images.map(img => typeof img === 'string' ? img : (img as ApiProductImage).url) : [],
    inStock: p.inStock,
    isNew: p.isNewArrival,
    description: p.description,
  };
};
