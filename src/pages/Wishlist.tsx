import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { fetchProducts } from "../lib/catalog";
import type { Product } from "../lib/types";
import { useWishlistStore } from "../store/wishlistStore";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const wishlist = useWishlistStore();

  useEffect(() => {
    fetchProducts().then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

  const items = products.filter((p) => wishlist.has(p.id));

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif-display text-3xl font-semibold text-ink">My Wishlist</h1>
      <p className="mt-1 text-sm text-muted">{items.length} saved item(s)</p>

      {items.length === 0 ? (
        <div className="mx-auto mt-14 max-w-md text-center">
          <Heart className="mx-auto mb-4 text-muted" size={40} />
          <p className="font-serif-display text-xl font-semibold text-ink">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-muted">Save your favourite styles here to shop them later.</p>
          <Link to="/products" className="mt-6 inline-block rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
