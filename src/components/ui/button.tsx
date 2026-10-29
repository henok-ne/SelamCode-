import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost"; };
export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ className, variant = "primary", type = "button", ...props }, ref) {
  return <button ref={ref} type={type} className={cn(`btn-${variant}`, className)} {...props} />;
});
