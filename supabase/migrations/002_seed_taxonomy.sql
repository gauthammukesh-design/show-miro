-- Migration: 002_seed_taxonomy
-- Purpose: Seed the initial Categories and Tags for ShowMiro Inspiration Gallery

INSERT INTO public.categories (name, slug, description, sort_order)
VALUES
  ('Photography', 'photography', 'Photorealistic images, portraits, and landscapes', 10),
  ('Digital Art', 'digital-art', 'Illustrations, concept art, and stylized digital creations', 20),
  ('UI/UX', 'ui-ux', 'User interfaces, dashboards, and app designs', 30),
  ('Branding', 'branding', 'Logos, typography, and brand identity assets', 40),
  ('3D Renders', '3d-renders', 'CGI, architectural viz, and 3D modeling scenes', 50),
  ('Architecture', 'architecture', 'Exterior and interior architectural design', 60),
  ('Product Design', 'product-design', 'Industrial design, packaging, and objects', 70)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tags (name, slug)
VALUES
  ('Cyberpunk', 'cyberpunk'),
  ('Minimalist', 'minimalist'),
  ('Dark Mode', 'dark-mode'),
  ('Glassmorphism', 'glassmorphism'),
  ('Retro', 'retro'),
  ('Cinematic', 'cinematic'),
  ('Isometric', 'isometric'),
  ('Surreal', 'surreal'),
  ('Macro', 'macro'),
  ('Studio Lighting', 'studio-lighting'),
  ('Vector', 'vector'),
  ('Typographic', 'typographic')
ON CONFLICT (slug) DO NOTHING;
