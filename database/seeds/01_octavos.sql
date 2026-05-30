-- ============================================================
-- FASE 1: Octavos de Final (8 partidos)
-- Ejecutar DESPUÉS de 00b_football_teams.sql
-- Los IDs de equipos se resuelven por nombre con subqueries
-- ============================================================

INSERT INTO hackathon_db.tb_match (tx_stage, id_home_team, id_away_team, tx_status, id_winner, ts_match_date, nu_match_order)
VALUES
  ('octavos',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Argentina'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Ecuador'),
    'pending', NULL, '2026-07-10 14:00:00-04', 1),

  ('octavos',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Brasil'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Uruguay'),
    'pending', NULL, '2026-07-10 18:00:00-04', 2),

  ('octavos',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'España'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Marruecos'),
    'pending', NULL, '2026-07-11 14:00:00-04', 3),

  ('octavos',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Francia'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Senegal'),
    'pending', NULL, '2026-07-11 18:00:00-04', 4),

  ('octavos',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Alemania'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Suiza'),
    'pending', NULL, '2026-07-12 14:00:00-04', 5),

  ('octavos',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Portugal'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Polonia'),
    'pending', NULL, '2026-07-12 18:00:00-04', 6),

  ('octavos',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Inglaterra'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Colombia'),
    'pending', NULL, '2026-07-13 14:00:00-04', 7),

  ('octavos',
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'Países Bajos'),
    (SELECT id_football_team FROM hackathon_db.tb_football_team WHERE nm_name = 'México'),
    'pending', NULL, '2026-07-13 18:00:00-04', 8);

-- Verificar
SELECT
  m.id_match,
  m.tx_stage,
  h.nm_name AS home_team,
  a.nm_name AS away_team,
  m.nu_match_order
FROM hackathon_db.tb_match m
JOIN hackathon_db.tb_football_team h ON h.id_football_team = m.id_home_team
JOIN hackathon_db.tb_football_team a ON a.id_football_team = m.id_away_team
WHERE m.tx_stage = 'octavos'
ORDER BY m.nu_match_order;
