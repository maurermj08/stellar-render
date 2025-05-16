import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Add spaces to camel case text, keeping '3D' together.
 * Example: 'Mountains3D' -> 'Mountains 3D', '3DTrees' -> '3D Trees'
 */
export function addSpacesToCamelCase(text: string) {
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/3 D/g, " 3D")
    .trim();
}