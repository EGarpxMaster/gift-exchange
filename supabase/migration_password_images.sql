-- Migración: Agregar password_hash y gift_images a la tabla participants

-- Agregar columna password_hash (texto para almacenar el hash de la contraseña)
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Agregar columna gift_images (array de URLs de imágenes)
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS gift_images TEXT[] DEFAULT '{}';

-- Crear índice para búsquedas por nombre y contraseña
CREATE INDEX IF NOT EXISTS idx_participants_encrypted_name_password 
ON participants(encrypted_name, password_hash);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN participants.password_hash IS 'Hash bcrypt de la contraseña del participante para login';
COMMENT ON COLUMN participants.gift_images IS 'Array de URLs de imágenes de referencia para las opciones de regalo';

-- Nota: El bucket 'gift-images' debe crearse manualmente en Supabase Storage
-- con las siguientes configuraciones:
-- 1. Ir a Storage > Create new bucket
-- 2. Nombre: gift-images
-- 3. Public bucket: YES (para que las imágenes sean accesibles)
-- 4. File size limit: 5MB
-- 5. Allowed MIME types: image/jpeg, image/png, image/webp
