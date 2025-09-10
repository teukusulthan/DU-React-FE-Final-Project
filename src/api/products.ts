import api from "./client";

export type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  imageUrl?: string | null;
  deletedAt?: string | null;
  supplierId?: number | string;
  createdAt?: string;
  updatedAt?: string;
};

export const fetchProducts = async (params: {
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}) => {
  const limit = params.limit ?? 12;
  const page = params.page ?? 1;
  const offset = (page - 1) * limit;
  const search = params.search?.trim() || undefined;

  const r = await api.get("/products", {
    params: {
      sortBy: params.sortBy,
      order: params.order,
      limit,
      offset,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      search,
      name: search,
      q: search,
      searchBy: "name",
    },
  });

  const body = r.data as {
    code?: number;
    status?: string;
    message?: string;
    data?: Product[];
    items?: Product[];
    total?: number;
    meta?: {
      total?: number;
      totalCount?: number;
      limit?: number;
      offset?: number;
    } | null;
  };

  const items = body.data ?? body.items ?? [];
  const total =
    body.total ?? body.meta?.total ?? body.meta?.totalCount ?? items.length;

  return { items, total, page, limit };
};

export const fetchProductById = async (id: string | number) => {
  const r = await api.get(`/product/${id}`);
  return (r.data?.data ?? r.data) as Product;
};

export const createProduct = async (fd: FormData) => {
  const r = await api.post("/products", fd);
  return r.data?.data ?? r.data;
};

export const updateProduct = async (
  id: string | number,
  formData: FormData
) => {
  const r = await api.patch(`/product/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return r.data;
};

export const softDeleteProduct = async (id: string | number) => {
  const r = await api.delete(`/product/${id}`);
  return r.data?.data ?? r.data;
};

export const restoreProduct = async (id: string | number) => {
  const r = await api.patch(`/product/${id}/restore`);
  return r.data?.data ?? r.data;
};
