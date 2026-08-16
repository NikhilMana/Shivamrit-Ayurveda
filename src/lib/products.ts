import { Product, products as staticProducts } from "@/data/products";

export function mapDbProductToProduct(dbP: any): Product {
  const localP = staticProducts.find((p) => p.id === dbP.id || p.slug === dbP.slug);

  const images =
    dbP.product_images && dbP.product_images.length > 0
      ? dbP.product_images
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((img: any) => img.image_url)
      : localP?.images || [
          dbP.id === "kesh-kalpa-shampoo"
            ? "/assets/kesh kalpa shampoo.png"
            : dbP.id === "kesh-amrit-hair-oil"
            ? "/assets/kesh amrit hair oil.png"
            : dbP.id === "twak-amrit-face-oil"
            ? "/assets/twak amrit face oil.png"
            : dbP.id === "greeshm-smooth-soap"
            ? "/assets/greeshm soap.png"
            : dbP.id === "neem-wooden-comb"
            ? "/assets/neem wooden comb.png"
            : "/assets/combo pack.png",
        ];

  return {
    id: dbP.id,
    name: dbP.name || localP?.name || "Product",
    slug: dbP.slug || localP?.slug || dbP.id,
    category:
      dbP.categories?.name ||
      localP?.category ||
      (dbP.id?.includes("shampoo") || dbP.id?.includes("oil")
        ? "Hair Care"
        : dbP.id?.includes("soap") || dbP.id?.includes("face")
        ? "Skin Care"
        : dbP.id?.includes("comb")
        ? "Accessories"
        : dbP.id?.includes("combo") || dbP.id?.includes("pack")
        ? "Sanctuary Kit"
        : "Hair Care"),
    shortDescription: dbP.description || localP?.shortDescription || "",
    price: dbP.price !== undefined && dbP.price !== null ? Number(dbP.price) : (localP?.price || 0),
    distributorPrice:
      dbP.offer_price !== undefined && dbP.offer_price !== null
        ? Number(dbP.offer_price)
        : (localP?.distributorPrice || 0),
    size: dbP.size || localP?.size,
    images,
    benefits: dbP.benefits && dbP.benefits.length > 0 ? dbP.benefits : (localP?.benefits || []),
  };
}
