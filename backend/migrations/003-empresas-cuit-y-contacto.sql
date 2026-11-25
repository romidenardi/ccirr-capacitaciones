-- Empresas: CUIT (opcional, único) y mail de contacto (opcional, para el acceso de empresas)
ALTER TABLE empresas
  ADD COLUMN cuit VARCHAR(11) DEFAULT NULL AFTER rubro,
  ADD COLUMN email_contacto VARCHAR(200) DEFAULT NULL AFTER cuit,
  ADD UNIQUE KEY cuit (cuit);
