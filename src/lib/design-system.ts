// design-system.ts
// Single source of truth exported from tailwind.config.ts

import tailwindConfig from '../../tailwind.config';

// The resolved theme object
export const designTokens = tailwindConfig.theme?.extend || {};

export const colors = designTokens.colors;
export const typography = {
    fontFamily: designTokens.fontFamily,
    fontSize: designTokens.fontSize,
};
export const spacing = designTokens.spacing;
export const borderRadius = designTokens.borderRadius;
