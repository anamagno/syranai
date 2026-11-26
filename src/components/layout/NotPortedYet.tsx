import { Construction } from "lucide-react";
import { Card } from "@/components/ui/card";

/** Temporary page body for routes whose old Base44 page hasn't been ported yet. */
export function NotPortedYet({ title, oldFile }: { title: string; oldFile: string }) {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <Card className="p-10 text-center text-muted-foreground space-y-2">
        <Construction className="w-8 h-8 mx-auto text-primary" />
        <p>This page is being moved to the new app.</p>
        <p className="text-xs">Old source: <code>{oldFile}</code></p>
      </Card>
    </div>
  );
}
