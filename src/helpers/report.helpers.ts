import { GRADIENT_PALETTE, WIDGET_COLORS } from "@/types/reports.types";

export function getWidgetTheme(name: string, allNames: string[]) {
  const idx = allNames.indexOf(name);
  return WIDGET_COLORS[(idx >= 0 ? idx : 0) % WIDGET_COLORS.length];
}

export function getProjColor(projName: string, allProjNames: string[]) {
  const idx = allProjNames.indexOf(projName);
  return GRADIENT_PALETTE[(idx >= 0 ? idx : 0) % GRADIENT_PALETTE.length];
}

export function getElementColor(name: string, allNames: string[]) {
  const idx = allNames.indexOf(name);
  return GRADIENT_PALETTE[(idx >= 0 ? idx : 0) % GRADIENT_PALETTE.length];
}