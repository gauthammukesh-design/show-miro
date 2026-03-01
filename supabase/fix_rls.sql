-- Add policy to allow any authenticated user to view public templates
CREATE POLICY "Anyone can view public templates"
ON public.prompt_templates
FOR SELECT
TO authenticated
USING (is_public = true);
