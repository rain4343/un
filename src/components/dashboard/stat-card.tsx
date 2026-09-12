import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-unicef to-navy" />
      <CardContent className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-unicef">
          {label}
        </p>
        <p className="mt-3 text-4xl font-bold tabular-nums tracking-tight text-heading">
          {value}
        </p>
        {hint ? (
          <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
