-- ============================================================
-- FASE 3: Semifinales (2 partidos)
-- Ejecutar cuando tengas los 4 ganadores de cuartos
--
-- Bracket:
--   Semi 1: Ganador Cuartos 1 vs Ganador Cuartos 2
--   Semi 2: Ganador Cuartos 3 vs Ganador Cuartos 4
-- ============================================================

INSERT INTO hackathon_db.tb_match (tx_stage, id_home_team, id_away_team, tx_status, id_winner, ts_match_date, nu_match_order)
VALUES
  ('semifinal',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_C1'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_C2'),
    'pending', NULL, '2026-07-21 18:00:00-04', 13),

  ('semifinal',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_C3'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_C4'),
    'pending', NULL, '2026-07-22 18:00:00-04', 14);

-- Verificar
SELECT
  m.id_match, m.tx_stage,
  h.nm_name AS home_team, a.nm_name AS away_team, m.nu_match_order
FROM hackathon_db.tb_match m
JOIN hackathon_db.tb_football_team h ON h.id_football_team = m.id_home_team
JOIN hackathon_db.tb_football_team a ON a.id_football_team = m.id_away_team
WHERE m.tx_stage = 'semifinal'
ORDER BY m.nu_match_order;
