-- ============================================================
-- FASE 4: Resultados de Semis + Equipos de Final y Tercer Lugar
-- Ejecutar después de 03_semis.sql
-- ============================================================

-- Resultados de Semifinales
UPDATE hackathon_db.tb_match SET
  id_winner = (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Argentina'),
  tx_status = 'finished'
WHERE nu_match_order = 13;

UPDATE hackathon_db.tb_match SET
  id_winner = (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Países Bajos'),
  tx_status = 'finished'
WHERE nu_match_order = 14;

-- Definir equipos de Tercer Lugar y Final (UPDATE de los placeholders)
-- Tercer lugar: perdedores de semis
UPDATE hackathon_db.tb_match SET
  id_home_team = (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Francia'),
  id_away_team = (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Portugal')
WHERE nu_match_order = 15;

-- Final: ganadores de semis
UPDATE hackathon_db.tb_match SET
  id_home_team = (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Argentina'),
  id_away_team = (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Países Bajos')
WHERE nu_match_order = 16;

-- Verificar
SELECT
  m.id_match, m.tx_stage,
  h.nm_name AS home_team, a.nm_name AS away_team,
  w.nm_name AS winner, m.tx_status, m.nu_match_order
FROM hackathon_db.tb_match m
LEFT JOIN hackathon_db.tb_football_team h ON h.id_football_team = m.id_home_team
LEFT JOIN hackathon_db.tb_football_team a ON a.id_football_team = m.id_away_team
LEFT JOIN hackathon_db.tb_football_team w ON w.id_football_team = m.id_winner
ORDER BY m.nu_match_order;
