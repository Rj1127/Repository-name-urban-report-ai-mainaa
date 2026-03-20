-- Fix overly permissive INSERT on ai_detections - restrict to complaint owners
DROP POLICY "detections_insert" ON public.ai_detections;
CREATE POLICY "detections_insert" ON public.ai_detections FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.complaints WHERE id = complaint_id AND user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);