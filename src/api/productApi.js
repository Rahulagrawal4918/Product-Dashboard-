import { simulateUpdate } from "../utils/simulateApi";

export const fetchProducts = async () => {
  await new Promise((resolve) => setTimeout(resolve, 900));
  const res = await fetch("https://fakestoreapi.com/products");
  if (!res.ok) throw new Error("Unable to load products");
  return res.json();
};

export const saveProductCategory = async (product) => {
  return simulateUpdate(product);
};