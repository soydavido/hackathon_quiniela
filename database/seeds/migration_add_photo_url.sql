-- Migración: agrega columna tx_photo_url a tb_participant
ALTER TABLE hackathon_db.tb_participant
  ADD COLUMN tx_photo_url VARCHAR(500) NULL;
