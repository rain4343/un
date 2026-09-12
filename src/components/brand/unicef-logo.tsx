type UnicefLogoProps = {
  className?: string;
  variant?: "full" | "compact";
};

export function UnicefLogo({ className, variant = "full" }: UnicefLogoProps) {
  const height = variant === "compact" ? 32 : 44;
  return (
    // Official UNICEF lockup (white wordmark + emblem on UNICEF blue)
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/unicef-logo.png"
      alt="UNICEF"
      height={height}
      className={className ?? "h-11 w-auto rounded-lg"}
    />
  );
}
