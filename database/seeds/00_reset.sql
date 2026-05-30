-- ============================================================
-- RESET: Revierte todo al estado inicial (solo 8vos definidos)
-- Ejecutar cuando quieras reiniciar el torneo desde cero
-- ============================================================

-- Limpiar resultados de octavos
UPDATE hackathon_db.tb_match SET
  id_winner = NULL,
  tx_status = 'pending'
WHERE tx_stage = 'octavos';

-- Resetear placeholders de cuartos, semis, tercer lugar y final
UPDATE hackathon_db.tb_match SET
  id_home_team = NULL,
  id_away_team = NULL,
  id_winner = NULL,
  tx_status = 'pending'
WHERE tx_stage IN ('cuartos', 'semifinal', 'tercer_lugar', 'final');

-- Verificar estado final
SELECT
  m.id_match, m.tx_stage,
  h.nm_name AS home_team,
  a.nm_name AS away_team,
  m.tx_status,
  m.nu_match_order
FROM hackathon_db.tb_match m
LEFT JOIN hackathon_db.tb_football_team h ON h.id_football_team = m.id_home_team
LEFT JOIN hackathon_db.tb_football_team a ON a.id_football_team = m.id_away_team
ORDER BY m.nu_match_order;
