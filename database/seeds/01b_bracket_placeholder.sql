-- ============================================================
-- Partidos placeholder para cuartos, semis, tercer lugar y final
-- Ejecutar DESPUÉS de 01_octavos.sql
-- Los equipos son NULL hasta que se definan los clasificados
-- Esto permite que los participantes envíen su quiniela completa
-- desde el inicio, prediciendo los 16 partidos del bracket
-- ============================================================

INSERT INTO hackathon_db.tb_match (tx_stage, id_home_team, id_away_team, tx_status, id_winner, ts_match_date, nu_match_order)
VALUES
  ('cuartos',      NULL, NULL, 'pending', NULL, '2026-07-17 14:00:00-04', 9),
  ('cuartos',      NULL, NULL, 'pending', NULL, '2026-07-17 18:00:00-04', 10),
  ('cuartos',      NULL, NULL, 'pending', NULL, '2026-07-18 14:00:00-04', 11),
  ('cuartos',      NULL, NULL, 'pending', NULL, '2026-07-18 18:00:00-04', 12),
  ('semifinal',    NULL, NULL, 'pending', NULL, '2026-07-21 18:00:00-04', 13),
  ('semifinal',    NULL, NULL, 'pending', NULL, '2026-07-22 18:00:00-04', 14),
  ('tercer_lugar', NULL, NULL, 'pending', NULL, '2026-07-25 14:00:00-04', 15),
  ('final',        NULL, NULL, 'pending', NULL, '2026-07-26 18:00:00-04', 16);

-- Verificar
SELECT id_match, tx_stage, nu_match_order, tx_status
FROM hackathon_db.tb_match
ORDER BY nu_match_order;
