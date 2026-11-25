-- Gestión de inscriptos:
-- asistencias: una fila por cada clase a la que asistió cada persona inscripta
-- inscripciones: motivo del rechazo del pago; se quita "asistio" (con varias clases, se calcula de asistencias)
CREATE TABLE IF NOT EXISTS asistencias (
  id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  inscripcion_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  clase_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY asistencias_inscripcion_id_clase_id (inscripcion_id, clase_id),
  KEY clase_id (clase_id),
  CONSTRAINT asistencias_ibfk_1 FOREIGN KEY (inscripcion_id) REFERENCES inscripciones (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT asistencias_ibfk_2 FOREIGN KEY (clase_id) REFERENCES clases (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE inscripciones
  ADD COLUMN motivo_rechazo VARCHAR(500) DEFAULT NULL AFTER estado_pago,
  DROP COLUMN asistio;
