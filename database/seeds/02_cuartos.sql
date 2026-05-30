-- ============================================================
-- FASE 2: Cuartos de Final (4 partidos)
-- Ejecutar cuando tengas los 8 ganadores de octavos
--
-- Bracket:
--   Cuartos 1: Ganador P1 (Argentina/Ecuador)   vs Ganador P2 (Brasil/Uruguay)
--   Cuartos 2: Ganador P3 (España/Marruecos)    vs Ganador P4 (Francia/Senegal)
--   Cuartos 3: Ganador P5 (Alemania/Suiza)      vs Ganador P6 (Portugal/Polonia)
--   Cuartos 4: Ganador P7 (Inglaterra/Colombia) vs Ganador P8 (PBajos/México)
--
-- Reemplaza 'NOMBRE_EQUIPO' con el nombre exacto del ganador.
-- ============================================================

INSERT INTO hackathon_db.tb_match (tx_stage, id_home_team, id_away_team, tx_status, id_winner, ts_match_date, nu_match_order)
VALUES
  ('cuartos',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_P1'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_P2'),
    'pending', NULL, '2026-07-17 14:00:00-04', 9),

  ('cuartos',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_P3'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_P4'),
    'pending', NULL, '2026-07-17 18:00:00-04', 10),

  ('cuartos',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_P5'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_P6'),
    'pending', NULL, '2026-07-18 14:00:00-04', 11),

  ('cuartos',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_P7'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_P8'),
    'pending', NULL, '2026-07-18 18:00:00-04', 12);

-- Verificar
SELECT
  m.id_match, m.tx_stage,
  h.nm_name AS home_team, a.nm_name AS away_team, m.nu_match_order
FROM hackathon_db.tb_match m
JOIN hackathon_db.tb_football_team h ON h.id_football_team = m.id_home_team
JOIN hackathon_db.tb_football_team a ON a.id_football_team = m.id_away_team
WHERE m.tx_stage = 'cuartos'
ORDER BY m.nu_match_order;
