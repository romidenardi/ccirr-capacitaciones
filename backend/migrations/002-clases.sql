-- Capacitaciones de varias clases: la fecha, el horario, la modalidad, el lugar y el link pasan de
-- la tabla capacitaciones a una tabla nueva, clases (una fila por encuentro).
-- Cada capacitación que ya existía queda con una sola clase, con los datos que tenía.

CREATE TABLE IF NOT EXISTS clases (
  id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  capacitacion_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME DEFAULT NULL,
  modalidad ENUM('presencial','virtual','hibrida') NOT NULL DEFAULT 'presencial',
  lugar VARCHAR(200) DEFAULT NULL,
  link_virtual VARCHAR(500) DEFAULT NULL,
  tema VARCHAR(200) DEFAULT NULL,
  disertante VARCHAR(200) DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY capacitacion_id (capacitacion_id),
  CONSTRAINT clases_ibfk_1 FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO clases (id, capacitacion_id, fecha, hora_inicio, hora_fin, modalidad, lugar, link_virtual, created_at, updated_at)
SELECT UUID(), id, fecha, hora_inicio, hora_fin, modalidad, lugar, link_virtual, NOW(), NOW() FROM capacitaciones;

ALTER TABLE capacitaciones ADD COLUMN asistencia_minima TINYINT UNSIGNED NOT NULL DEFAULT 75 AFTER entrega_certificado;

ALTER TABLE capacitaciones
  DROP COLUMN fecha,
  DROP COLUMN hora_inicio,
  DROP COLUMN hora_fin,
  DROP COLUMN modalidad,
  DROP COLUMN lugar,
  DROP COLUMN link_virtual;
