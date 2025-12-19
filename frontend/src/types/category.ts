/**
 * TypeScript types for Category and Subcategory.
 */

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
  subcategories: Subcategory[];
}

export interface CategoryCreate {
  name: string;
  display_order?: number;
}

export interface CategoryUpdate {
  name?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface SubcategoryCreate {
  name: string;
  display_order?: number;
}

export interface SubcategoryUpdate {
  name?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UsageCount {
  subscription_count: number;
}
