import api from "./client";

export const createOrder = async (payload: {
  productId: string | number;
  quantity: number;
}) => {
  const r = await api.post("/orders", payload);
  return r.data?.data ?? r.data;
};

export const getMyOrders = async () => {
  const r = await api.get("/orders/me");
  return r.data;
};
