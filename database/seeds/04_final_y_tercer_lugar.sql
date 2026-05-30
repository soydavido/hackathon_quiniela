-- ============================================================
-- FASE 4: Final y Tercer Lugar (2 partidos)
-- Ejecutar cuando tengas los resultados de las semis
--
-- Tercer lugar: Perdedor Semi 1 vs Perdedor Semi 2
-- Final:        Ganador Semi 1  vs Ganador Semi 2
-- ============================================================

INSERT INTO hackathon_db.tb_match (tx_stage, id_home_team, id_away_team, tx_status, id_winner, ts_match_date, nu_match_order)
VALUES
  ('tercer_lugar',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_PERDEDOR_S1'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_PERDEDOR_S2'),
    'pending', NULL, '2026-07-25 14:00:00-04', 15),

  ('final',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_S1'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'NOMBRE_GANADOR_S2'),
    'pending', NULL, '2026-07-26 18:00:00-04', 16);

-- Verificar
SELECT
  m.id_match, m.tx_stage,
  h.nm_name AS home_team, a.nm_name AS away_team, m.nu_match_order
FROM hackathon_db.tb_match m
JOIN hackathon_db.tb_football_team h ON h.id_football_team = m.id_home_team
JOIN hackathon_db.tb_football_team a ON a.id_football_team = m.id_away_team
WHERE m.tx_stage IN ('tercer_lugar', 'final')
ORDER BY m.nu_match_order;
