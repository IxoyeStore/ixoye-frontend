export type StrapiImage = {
  id: number;
  url: string;
  alternativeText?: string | null;
};

export type CategoryType = {
  id: number;
  categoryName: string;
  slug: string;
};

export type ProductType = {
  id: number;
  documentId?: string;
  productName: string;
  slug: string;
  description: string;
  code: string;

  // Clasificación del Catálogo
  department: string;
  subDepartment: string;
  productType: string;
  category?: CategoryType | null;

  // Especificaciones
  brand: string;
  series: string;
  oemCode?: string;

  // Valores y Estados
  price: number;
  wholesalePrice?: number;
  stock: number;
  active: boolean;
  isFeatured: boolean;

  quantity?: number;
  images: StrapiImage[];
};
