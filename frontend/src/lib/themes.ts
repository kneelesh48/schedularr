import { Rocket } from "lucide-react";

export const colorSchemes = {
  orange: {
    name: "orange",
    primary: {
      50: "orange-50",
      100: "orange-100",
      500: "orange-500",
      600: "orange-600",
      700: "orange-700",
    },
    backgrounds: {
      primary: "bg-orange-500",
      primaryHover: "hover:bg-orange-600",
      light: "bg-orange-50",
      gradient: "bg-gradient-to-b from-orange-50 to-white",
      cta: "bg-gradient-to-r from-orange-500 to-red-500",
      section: "bg-gray-50",
    },
    text: {
      primary: "text-orange-500",
      primaryDark: "text-orange-600",
      ctaLight: "text-orange-100",
      ctaButton: "text-orange-500",
    },
    accents: {
      border: "border-orange-200",
      badge: "bg-orange-500",
      iconBg: "bg-orange-100",
      iconText: "text-orange-500",
    },
  },

  indigo: {
    name: "indigo",
    primary: {
      50: "indigo-50",
      100: "indigo-100",
      500: "indigo-500",
      600: "indigo-600",
      700: "indigo-700",
    },
    backgrounds: {
      primary: "bg-indigo-600",
      primaryHover: "hover:bg-indigo-700",
      light: "bg-gray-50",
      gradient: "bg-gradient-to-b from-gray-50 to-gray-100",
      cta: "bg-indigo-700",
      section: "bg-gray-50",
    },
    text: {
      primary: "text-indigo-600",
      primaryDark: "text-indigo-700",
      ctaLight: "text-indigo-100",
      ctaButton: "text-indigo-500",
    },
    accents: {
      border: "border-indigo-200",
      badge: "bg-indigo-500",
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-500",
    },
  },
};

export const brandAssets = {
  brandName: "Schedularr",
  BrandIcon: Rocket,
};

export const currentTheme = colorSchemes.indigo;

export const getThemeClass = (
  category: keyof typeof currentTheme,
  variant: string
) => {
  return (currentTheme as any)[category]?.[variant] || "";
};
