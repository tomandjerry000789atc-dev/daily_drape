import { supabase, isSchemaReady } from "./supabase";
import { categories as seedCategories, products as seedProducts, brands as seedBrands, demoReviews } from "../data/seed";
import type { Category, Product, Review } from "./types";

/**
 * Data-access layer for the storefront.
 *
 * Behaviour:
 * - If the documented Supabase schema (sql/schema.sql) is live, we read
 *   real rows from Postgres.
 * - Otherwise (or if a query errors) we fall back to local seed data so
 *   the UI stays usable during development, and we flag the response as
 *   `source: "demo"` so the app never claims a database result that
 *   didn't actually happen.
 */
export interface CatalogResult<T> {
  data: T;
  source: "database" | "demo";
  error?: string;
}

export async function fetchCategories(): Promise<CatalogResult<Category[]>> {
  const ready = await isSchemaReady();
  if (!ready) return { data: seedCategories, source: "demo" };
  try {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error || !data || data.length === 0) {
      return { data: seedCategories, source: "demo", error: error?.message };
    }
    return { data: data as Category[], source: "database" };
  } catch (e) {
    return { data: seedCategories, source: "demo", error: String(e) };
  }
}

export async function fetchProducts(): Promise<CatalogResult<Product[]>> {
  const ready = await isSchemaReady();
  if (!ready) return { data: seedProducts, source: "demo" };
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*), product_variants(*)")
      .eq("is_active", true);
    if (error || !data || data.length === 0) {
      return { data: seedProducts, source: "demo", error: error?.message };
    }
    // Map DB shape -> UI Product shape (best-effort; real schema in sql/schema.sql)
    const mapped: Product[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      brand: row.brand_name ?? row.brand ?? "Daily Drape",
      category: row.category_slug ?? row.category ?? "women",
      subcategory: row.subcategory ?? undefined,
      description: row.description ?? "",
      material_care: row.material_care ?? "",
      price: Number(row.price),
      mrp: Number(row.mrp ?? row.price),
      discount_percent: row.mrp
        ? Math.round(((row.mrp - row.price) / row.mrp) * 100)
        : 0,
      images:
        row.product_images?.map((i: any) => i.url) ??
        (row.image_url ? [row.image_url] : []),
      variants:
        row.product_variants?.map((v: any) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          color_hex: v.color_hex ?? "#7c3f58",
          stock: v.stock_quantity ?? 0,
          sku: v.sku ?? "",
        })) ?? [],
      rating: row.rating ?? 4.2,
      rating_count: row.rating_count ?? 0,
      tags: row.tags ?? [],
      created_at: row.created_at ?? new Date().toISOString(),
    }));
    return { data: mapped, source: "database" };
  } catch (e) {
    return { data: seedProducts, source: "demo", error: String(e) };
  }
}

export async function fetchReviews(productId: string): Promise<CatalogResult<Review[]>> {
  const ready = await isSchemaReady();
  if (!ready) return { data: demoReviews[productId] ?? [], source: "demo" };
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (error || !data) {
      return { data: demoReviews[productId] ?? [], source: "demo", error: error?.message };
    }
    return { data: data as unknown as Review[], source: "database" };
  } catch (e) {
    return { data: demoReviews[productId] ?? [], source: "demo", error: String(e) };
  }
}

export { seedBrands as brands };
