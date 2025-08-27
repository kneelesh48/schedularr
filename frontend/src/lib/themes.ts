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
      light: "bg-indigo-50",
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

const themeName = import.meta.env.VITE_THEME || "indigo";
export const currentTheme = colorSchemes[themeName as keyof typeof colorSchemes];

export const getThemeClass = (
  category: keyof typeof currentTheme,
  variant: string
) => {
  return (currentTheme as any)[category]?.[variant] || "";
};

export const getThemeColor = (colorKey: 500 | 600 | 700) => {
  const colorMap = {
    orange: {
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
    },
    indigo: {
      500: "#6366f1", 
      600: "#4f46e5",
      700: "#4338ca",
    }
  };
  
  return colorMap[currentTheme.name as keyof typeof colorMap]?.[colorKey] || "#6366f1";
};

export const updateFavicon = () => {
  const color = getThemeColor(600);
  
  // Lucide Rocket icon paths
  const rocketPaths = [
    "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",
    "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
    "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0",
    "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
  ];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket">${rocketPaths.map(path => `<path d="${path}"></path>`).join('')}</svg>`;
  
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
  link.type = 'image/svg+xml';
  link.rel = 'shortcut icon';
  link.href = url;
  
  if (!document.querySelector("link[rel*='icon']")) {
    document.head.appendChild(link);
  }
};
