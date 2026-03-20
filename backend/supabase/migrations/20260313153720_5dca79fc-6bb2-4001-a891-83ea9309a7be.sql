
DROP POLICY "notifications_insert_citizen" ON public.notifications;
CREATE POLICY "notifications_insert_citizen"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = notifications.complaint_id
      AND complaints.user_id = auth.uid()
    )
  );
