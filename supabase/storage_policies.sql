-- Políticas de seguridad (RLS) para el bucket 'gift-images'
-- Ejecuta este script en el SQL Editor de Supabase después de crear el bucket

-- 1. Permitir subida de imágenes (INSERT) - Cualquiera puede subir
CREATE POLICY "Permitir subida de imágenes"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'gift-images');

-- 2. Permitir lectura pública (SELECT) - Cualquiera puede ver las imágenes
CREATE POLICY "Permitir lectura pública de imágenes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gift-images');

-- 3. Permitir actualización de imágenes (UPDATE)
CREATE POLICY "Permitir actualización de imágenes"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'gift-images')
WITH CHECK (bucket_id = 'gift-images');

-- 4. Permitir eliminación de imágenes (DELETE)
CREATE POLICY "Permitir eliminación de imágenes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'gift-images');

-- Verificar que las políticas se crearon correctamente
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%imagen%';
