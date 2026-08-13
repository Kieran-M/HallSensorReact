import { tv } from "tailwind-variants";

export const Button = tv({
  base: "px-4 py-2 rounded-md transition-colors duration-200",
  variants: {
    variant: {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
})