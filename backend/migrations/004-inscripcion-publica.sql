-- Formulario público de inscripción:
-- capacitaciones: pago obligatorio al inscribirse y datos para el pago
-- empresas: marca de "a revisar" para las creadas desde una inscripción
-- inscripciones: CUIT, monto a pagar al momento de inscribirse y fecha del consentimiento de datos
ALTER TABLE capacitaciones
  ADD COLUMN pago_obligatorio TINYINT(1) NOT NULL DEFAULT 0 AFTER costo_no_socios,
  ADD COLUMN instrucciones_pago TEXT DEFAULT NULL AFTER pago_obligatorio;

ALTER TABLE empresas
  ADD COLUMN pendiente_revision TINYINT(1) NOT NULL DEFAULT 0 AFTER es_socia;

ALTER TABLE inscripciones
  ADD COLUMN cuit VARCHAR(11) DEFAULT NULL AFTER organizacion,
  ADD COLUMN monto DECIMAL(12,2) DEFAULT NULL AFTER es_socio,
  ADD COLUMN consentimiento_at DATETIME DEFAULT NULL AFTER codigo_certificado;
