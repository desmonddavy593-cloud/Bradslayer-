-- À exécuter après prisma db push. Les anciennes notifications personnelles restent conservées,
-- mais sont classées PERSONAL et ne sont donc plus visibles sans destinataire.
UPDATE "Announcement"
SET kind = 'PERSONAL'
WHERE title IN (
  'Compte validé', 'Compte refusé', 'Compte suspendu', 'Compte réactivé',
  'Compte en attente', 'Badge officiel attribué', 'Badge officiel retiré',
  'Réponse de l’administration'
) AND recipient_id IS NULL;

CREATE INDEX IF NOT EXISTS "Announcement_kind_recipientId_createdAt_idx"
  ON "Announcement" (kind, recipient_id, "createdAt");
CREATE INDEX IF NOT EXISTS "Announcement_recipientId_createdAt_idx"
  ON "Announcement" (recipient_id, "createdAt");
