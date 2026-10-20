import type { Brand, Category, Product, Review } from "../lib/types";

/**
 * DEV / DEMO SEED DATA
 * --------------------
 * This data powers the storefront whenever the Supabase schema in
 * /sql/schema.sql has not been applied yet, or when a query fails.
 * It is clearly a local fallback — the app never pretends a failed
 * database request actually succeeded. See src/lib/catalog.ts.
 */

export const categories: Category[] = [
  {
    id: "cat-women",
    name: "Women",
    slug: "women",
    image:
      "https://images.pexels.com/photos/29172779/pexels-photo-29172779.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=700",
    description: "Sarees, kurtas, dresses & ethnic wear",
  },
  {
    id: "cat-men",
    name: "Men",
    slug: "men",
    image:
      "https://images.pexels.com/photos/34423746/pexels-photo-34423746.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=700",
    description: "Kurtas, shirts & festive fits",
  },
  {
    id: "cat-kids",
    name: "Kids",
    slug: "kids",
    image:
      "https://images.pexels.com/photos/5893853/pexels-photo-5893853.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=700",
    description: "Playful, comfy styles for little ones",
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    image:
      "https://images.pexels.com/photos/30748147/pexels-photo-30748147.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=700",
    description: "Bags, jewellery & finishing touches",
  },
  {
    id: "cat-sale",
    name: "Sale",
    slug: "sale",
    image:
      "https://images.pexels.com/photos/6842907/pexels-photo-6842907.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=700",
    description: "Up to 50% off edits",
  },
];

export const brands: Brand[] = [
  { id: "b1", name: "Drape House", slug: "drape-house" },
  { id: "b2", name: "Lumen Studio", slug: "lumen-studio" },
  { id: "b3", name: "Kantha & Co.", slug: "kantha-co" },
  { id: "b4", name: "Veda Looms", slug: "veda-looms" },
  { id: "b5", name: "Little Drape", slug: "little-drape" },
  { id: "b6", name: "Atelier Noor", slug: "atelier-noor" },
];

const colorHex: Record<string, string> = {
  Burgundy: "#7c3f58",
  Maroon: "#5d2d42",
  Ivory: "#f4ede4",
  Mustard: "#d9a441",
  Emerald: "#235347",
  Navy: "#1f2a44",
  Blush: "#e8c4c4",
  Black: "#1c1a1b",
  Gold: "#c89a5b",
  Rust: "#b5542e",
};

function variants(sizes: string[], colors: string[]) {
  const list = [];
  let i = 0;
  for (const color of colors) {
    for (const size of sizes) {
      i++;
      list.push({
        id: `v${i}-${size}-${color}`.toLowerCase().replace(/\s+/g, "-"),
        size,
        color,
        color_hex: colorHex[color] ?? "#7c3f58",
        stock: Math.floor(Math.random() * 15) + (i % 5 === 0 ? 0 : 3),
        sku: `DD-${size}-${color.slice(0, 3).toUpperCase()}-${i}`,
      });
    }
  }
  return list;
}

const womenImgs = [
  "https://images.pexels.com/photos/2103942/pexels-photo-2103942.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/29172779/pexels-photo-29172779.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/6382266/pexels-photo-6382266.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/33600246/pexels-photo-33600246.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/2723623/pexels-photo-2723623.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/6842907/pexels-photo-6842907.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/6382264/pexels-photo-6382264.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/8891974/pexels-photo-8891974.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
];

const menImgs = [
  "https://images.pexels.com/photos/23696193/pexels-photo-23696193.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/27798776/pexels-photo-27798776.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/28113612/pexels-photo-28113612.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/26984682/pexels-photo-26984682.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/34423746/pexels-photo-34423746.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/34423730/pexels-photo-34423730.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
];

const kidsImgs = [
  "https://images.pexels.com/photos/8084066/pexels-photo-8084066.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/6261908/pexels-photo-6261908.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/8083844/pexels-photo-8083844.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/5893853/pexels-photo-5893853.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
];

const accImgs = [
  "https://images.pexels.com/photos/8396300/pexels-photo-8396300.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/30748147/pexels-photo-30748147.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/9249815/pexels-photo-9249815.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/16255152/pexels-photo-16255152.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/5405623/pexels-photo-5405623.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  "https://images.pexels.com/photos/12194934/pexels-photo-12194934.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
];

interface Seed {
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  mrp: number;
  images: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  description: string;
}

const seeds: Seed[] = [
  {
    name: "Handwoven Banarasi Silk Saree",
    brand: "Drape House",
    category: "women",
    subcategory: "Sarees",
    price: 4299,
    mrp: 6999,
    images: [womenImgs[0], womenImgs[1]],
    sizes: ["Free Size"],
    colors: ["Burgundy", "Maroon", "Gold"],
    tags: ["trending", "bestseller"],
    description:
      "A timeless handwoven Banarasi silk saree with intricate zari work, perfect for weddings and festive occasions. Draped by our artisans in Varanasi using traditional looms.",
  },
  {
    name: "Ivory Chikankari Anarkali Kurta",
    brand: "Kantha & Co.",
    category: "women",
    subcategory: "Kurtas",
    price: 1899,
    mrp: 2999,
    images: [womenImgs[2], womenImgs[3]],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Ivory", "Blush"],
    tags: ["new"],
    description:
      "Delicate Lucknowi chikankari embroidery on breathable cotton, cut in a flattering Anarkali silhouette for all-day comfort.",
  },
  {
    name: "Emerald Georgette Flare Gown",
    brand: "Lumen Studio",
    category: "women",
    subcategory: "Dresses",
    price: 3299,
    mrp: 4599,
    images: [womenImgs[4], womenImgs[5]],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Emerald", "Navy"],
    tags: ["trending"],
    description:
      "A floor-sweeping georgette gown with a fitted bodice and dramatic flare, finished with hand-stitched sequin detailing.",
  },
  {
    name: "Mustard Block Print Straight Kurta",
    brand: "Veda Looms",
    category: "women",
    subcategory: "Kurtas",
    price: 1199,
    mrp: 1799,
    images: [womenImgs[6], womenImgs[7]],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Mustard", "Rust"],
    tags: ["bestseller", "sale"],
    description:
      "Hand block-printed straight kurta in pure cotton — breathable, easy to style and perfect for everyday wear.",
  },
  {
    name: "Bandhani Co-ord Set",
    brand: "Drape House",
    category: "women",
    subcategory: "Co-ords",
    price: 2599,
    mrp: 3899,
    images: [womenImgs[1], womenImgs[6]],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Rust", "Mustard"],
    tags: ["new", "trending"],
    description:
      "A relaxed-fit kurta and pant co-ord set with traditional bandhani tie-dye, designed for effortless everyday elegance.",
  },
  {
    name: "Classic Nehru Collar Kurta",
    brand: "Atelier Noor",
    category: "men",
    subcategory: "Kurtas",
    price: 1599,
    mrp: 2199,
    images: [menImgs[3], menImgs[4]],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Mustard", "Ivory", "Navy"],
    tags: ["bestseller"],
    description:
      "A tailored Nehru-collar kurta in premium cotton-silk blend, perfect for festive gatherings and celebrations.",
  },
  {
    name: "Festive Gold Jacquard Kurta Set",
    brand: "Atelier Noor",
    category: "men",
    subcategory: "Kurta Sets",
    price: 2899,
    mrp: 3999,
    images: [menImgs[4], menImgs[5]],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gold", "Mustard"],
    tags: ["trending", "new"],
    description:
      "A jacquard kurta and churidar set with subtle self-weave patterns — tailored for a sharp, festive silhouette.",
  },
  {
    name: "Casual Linen Shirt",
    brand: "Veda Looms",
    category: "men",
    subcategory: "Shirts",
    price: 1399,
    mrp: 1999,
    images: [menImgs[2], menImgs[0]],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Ivory", "Navy", "Black"],
    tags: ["sale"],
    description:
      "Breathable pure linen shirt with a relaxed fit — an everyday essential that transitions from desk to dinner.",
  },
  {
    name: "Traditional Angrakha Jacket",
    brand: "Atelier Noor",
    category: "men",
    subcategory: "Jackets",
    price: 3499,
    mrp: 4999,
    images: [menImgs[1], menImgs[3]],
    sizes: ["M", "L", "XL"],
    colors: ["Maroon", "Navy"],
    tags: ["new"],
    description:
      "An heirloom-inspired angrakha jacket with asymmetric draping, hand finished with contrast piping.",
  },
  {
    name: "Little Drape Floral Frock",
    brand: "Little Drape",
    category: "kids",
    subcategory: "Dresses",
    price: 899,
    mrp: 1299,
    images: [kidsImgs[0], kidsImgs[1]],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    colors: ["Blush", "Ivory"],
    tags: ["bestseller"],
    description:
      "A twirl-worthy floral frock in soft cotton, designed for all-day play and special occasions alike.",
  },
  {
    name: "Boys Festive Kurta Pyjama Set",
    brand: "Little Drape",
    category: "kids",
    subcategory: "Ethnic Wear",
    price: 1099,
    mrp: 1599,
    images: [kidsImgs[2], kidsImgs[3]],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    colors: ["Mustard", "Maroon"],
    tags: ["new", "trending"],
    description:
      "A comfortable festive kurta pyjama set in soft cotton blend, made for celebrations and comfort both.",
  },
  {
    name: "Kids Everyday Playsuit",
    brand: "Little Drape",
    category: "kids",
    subcategory: "Playwear",
    price: 699,
    mrp: 999,
    images: [kidsImgs[1], kidsImgs[0]],
    sizes: ["2-3Y", "4-5Y", "6-7Y"],
    colors: ["Emerald", "Blush"],
    tags: ["sale"],
    description:
      "A breezy, easy-to-wear playsuit built for climbing, running and everything in between.",
  },
  {
    name: "Hand-beaded Potli Clutch",
    brand: "Kantha & Co.",
    category: "accessories",
    subcategory: "Bags",
    price: 1299,
    mrp: 1899,
    images: [accImgs[1], accImgs[4]],
    sizes: ["Free Size"],
    colors: ["Gold", "Burgundy"],
    tags: ["trending"],
    description:
      "A hand-beaded potli clutch finished with a silk drawstring — the perfect finishing touch for festive fits.",
  },
  {
    name: "Oxidised Temple Jewellery Set",
    brand: "Kantha & Co.",
    category: "accessories",
    subcategory: "Jewellery",
    price: 1599,
    mrp: 2399,
    images: [accImgs[2], accImgs[3]],
    sizes: ["Free Size"],
    colors: ["Gold"],
    tags: ["bestseller", "new"],
    description:
      "An intricately detailed oxidised necklace and earring set inspired by South Indian temple motifs.",
  },
  {
    name: "Embroidered Juttis",
    brand: "Drape House",
    category: "accessories",
    subcategory: "Footwear",
    price: 999,
    mrp: 1499,
    images: [accImgs[0], accImgs[5]],
    sizes: ["36", "37", "38", "39", "40", "41"],
    colors: ["Burgundy", "Gold"],
    tags: ["sale"],
    description:
      "Hand-embroidered juttis crafted by artisans, cushioned for comfort and finished with a durable sole.",
  },
  {
    name: "Silk Dupatta with Zari Border",
    brand: "Veda Looms",
    category: "accessories",
    subcategory: "Dupattas",
    price: 1499,
    mrp: 2199,
    images: [accImgs[4], accImgs[1]],
    sizes: ["Free Size"],
    colors: ["Maroon", "Emerald"],
    tags: ["new"],
    description:
      "A pure silk dupatta with a hand-finished zari border — an instant upgrade to any ethnic outfit.",
  },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const products: Product[] = seeds.map((s, idx) => {
  const discount = Math.round(((s.mrp - s.price) / s.mrp) * 100);
  const vs = variants(s.sizes, s.colors);
  const createdDaysAgo = (idx * 3) % 40;
  const d = new Date();
  d.setDate(d.getDate() - createdDaysAgo);
  return {
    id: `p${idx + 1}`,
    name: s.name,
    slug: slugify(s.name) + "-" + (idx + 1),
    brand: s.brand,
    category: s.category,
    subcategory: s.subcategory,
    description: s.description,
    material_care:
      "Fabric: Premium blend as per style. Care: Dry clean recommended for embellished pieces; gentle hand wash in cold water for cottons. Do not bleach. Iron on reverse at low heat.",
    price: s.price,
    mrp: s.mrp,
    discount_percent: discount,
    images: s.images,
    variants: vs,
    rating: +(3.8 + ((idx * 7) % 12) / 10).toFixed(1),
    rating_count: 12 + ((idx * 37) % 180),
    tags: s.tags,
    created_at: d.toISOString(),
  };
});

export const demoReviews: Record<string, Review[]> = Object.fromEntries(
  products.map((p) => [
    p.id,
    [
      {
        id: `${p.id}-r1`,
        product_id: p.id,
        user_name: "Ananya R.",
        rating: 5,
        title: "Beautiful quality!",
        comment:
          "The fabric feels premium and the fit is exactly as described. Received so many compliments!",
        created_at: p.created_at,
        verified: true,
      },
      {
        id: `${p.id}-r2`,
        product_id: p.id,
        user_name: "Priya S.",
        rating: 4,
        title: "Lovely but runs slightly large",
        comment:
          "Gorgeous piece, true to the pictures. I'd recommend sizing down by one.",
        created_at: p.created_at,
        verified: true,
      },
    ],
  ])
);
