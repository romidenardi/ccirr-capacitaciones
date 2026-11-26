-- Gestión de usuarios: contraseña temporal a cambiar, versión de sesión y último ingreso
ALTER TABLE usuarios
  ADD COLUMN debe_cambiar_password TINYINT(1) NOT NULL DEFAULT 0 AFTER activo,
  ADD COLUMN sesion_version INT UNSIGNED NOT NULL DEFAULT 0 AFTER debe_cambiar_password,
  ADD COLUMN ultimo_ingreso DATETIME DEFAULT NULL AFTER sesion_version;
