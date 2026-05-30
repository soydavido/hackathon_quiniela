-- ============================================================
-- Equipos competidores (alumnos del hackathon)
-- Ejecutar antes de arrancar la competencia
-- Agrega una fila por equipo con su token único
-- ============================================================

INSERT INTO hackathon_db.tb_team (nm_team, tx_token)
VALUES
  ('SiGanamosEdwinBrindaAlmuerzo', 'TEAM-EDWIN-BRINDA'),
  ('Tralala', 'TEAM-TRALALA-YR'),
  ('Los tung tung sitos', 'TEAM-TUNG-TUNG'),
  ('Muwigaras ', 'TEAM-MUWIGARA'),
  ('Programing Girls', 'PROGRAMMING-GIRLS'),
  ('Team Rocket', 'TEAM-ROCKET');

-- Verificar
SELECT id_team, nm_team, tx_token FROM hackathon_db.tb_team ORDER BY id_team;
