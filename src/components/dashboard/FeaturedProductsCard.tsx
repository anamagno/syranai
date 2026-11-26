import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeaturedProduct } from "@/lib/queries/dashboard";

/** Products card on the doctor/distributor dashboards. */
export function FeaturedProductsCard({ products }: { products: FeaturedProduct[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" /> Products
        </CardTitle>
        <Link href="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-center py-8 text-xs text-muted-foreground">No products available.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <div className="group border border-border rounded-lg overflow-hidden hover:shadow-sm hover:border-primary/30 transition-all">
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- images come from any storage URL
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-xs font-medium truncate">{p.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
