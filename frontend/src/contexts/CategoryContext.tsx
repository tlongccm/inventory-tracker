/**
 * CategoryContext provider for single source of truth for categories.
 * Fetches categories from API on mount and provides to all children.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Category, Subcategory } from '../types/category';
import { listCategories } from '../services/api';

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getCategoryById: (id: number) => Category | undefined;
  getSubcategoryById: (id: number) => Subcategory | undefined;
  getSubcategoriesForCategory: (categoryId: number) => Subcategory[];
}

const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  loading: true,
  error: null,
  refresh: async () => {},
  getCategoryById: () => undefined,
  getSubcategoryById: () => undefined,
  getSubcategoriesForCategory: () => [],
});

interface CategoryProviderProps {
  children: ReactNode;
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listCategories(false); // Only active categories
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getCategoryById = useCallback(
    (id: number): Category | undefined => {
      return categories.find((c) => c.id === id);
    },
    [categories]
  );

  const getSubcategoryById = useCallback(
    (id: number): Subcategory | undefined => {
      for (const category of categories) {
        const sub = category.subcategories.find((s) => s.id === id);
        if (sub) return sub;
      }
      return undefined;
    },
    [categories]
  );

  const getSubcategoriesForCategory = useCallback(
    (categoryId: number): Subcategory[] => {
      const category = categories.find((c) => c.id === categoryId);
      return category?.subcategories.filter((s) => s.is_active) || [];
    },
    [categories]
  );

  const value: CategoryContextType = {
    categories,
    loading,
    error,
    refresh,
    getCategoryById,
    getSubcategoryById,
    getSubcategoriesForCategory,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories(): CategoryContextType {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}

export default CategoryContext;
