-- ============================================================
-- Equipos de fútbol participantes en octavos de final
-- Ejecutar ANTES de 01_octavos.sql
-- Banderas: https://flagcdn.com (ISO 3166-1 alpha-2, minúsculas)
-- ============================================================

INSERT INTO hackathon_db.tb_football_team (nm_name, tx_country_code, tx_flag_url)
VALUES
  ('Argentina',      'AR', 'https://flagcdn.com/w320/ar.png'),
  ('Ecuador',        'EC', 'https://flagcdn.com/w320/ec.png'),
  ('Brasil',         'BR', 'https://flagcdn.com/w320/br.png'),
  ('Uruguay',        'UY', 'https://flagcdn.com/w320/uy.png'),
  ('España',         'ES', 'https://flagcdn.com/w320/es.png'),
  ('Marruecos',      'MA', 'https://flagcdn.com/w320/ma.png'),
  ('Francia',        'FR', 'https://flagcdn.com/w320/fr.png'),
  ('Senegal',        'SN', 'https://flagcdn.com/w320/sn.png'),
  ('Alemania',       'DE', 'https://flagcdn.com/w320/de.png'),
  ('Suiza',          'CH', 'https://flagcdn.com/w320/ch.png'),
  ('Portugal',       'PT', 'https://flagcdn.com/w320/pt.png'),
  ('Polonia',        'PL', 'https://flagcdn.com/w320/pl.png'),
  ('Inglaterra',     'GB', 'https://flagcdn.com/w320/gb-eng.png'),
  ('Colombia',       'CO', 'https://flagcdn.com/w320/co.png'),
  ('Países Bajos',   'NL', 'https://flagcdn.com/w320/nl.png'),
  ('México',         'MX', 'https://flagcdn.com/w320/mx.png');

-- Verificar con IDs (los necesitarás para el seed de partidos)
SELECT id_football_team, nm_name, tx_country_code FROM hackathon_db.tb_football_team ORDER BY id_football_team;
