import { LOGO_URL } from "@/lib/brand";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm mx-auto mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_URL} alt="BoneEasy" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sr-only">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}

export function FormMessage({ state }: { state?: { error?: string; message?: string } }) {
  if (!state) return null;
  if (state.error) return <p className="text-sm text-destructive">{state.error}</p>;
  if (state.message) return <p className="text-sm text-muted-foreground">{state.message}</p>;
  return null;
}
