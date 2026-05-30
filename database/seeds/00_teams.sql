-- ============================================================
-- Equipos competidores (alumnos del hackathon)
-- Ejecutar antes de arrancar la competencia
-- Agrega una fila por equipo con su token único
-- ============================================================

INSERT INTO hackathon_db.tb_team (nm_team, tx_token)
VALUES
  ('Equipo 1', 'TEAM-TOKEN-001'),
  ('Equipo 2', 'TEAM-TOKEN-002'),
  ('Equipo 3', 'TEAM-TOKEN-003'),
  ('Equipo 4', 'TEAM-TOKEN-004'),
  ('Equipo 5', 'TEAM-TOKEN-005'),
  ('Equipo 6', 'TEAM-TOKEN-006'),
  ('Equipo 7', 'TEAM-TOKEN-007'),
  ('Equipo 8', 'TEAM-TOKEN-008');

-- Verificar
SELECT id_team, nm_team, tx_token FROM hackathon_db.tb_team ORDER BY id_team;
