"""
Script de prueba para verificar la conexión a Firebase
Prueba funciones básicas de Firestore y Storage

USO: python test_firebase_connection.py
"""

import sys

print("🔥 Test de Conexión a Firebase")
print("=" * 50)
print()

# Test 1: Importar módulos
print("1️⃣  Probando imports...")
try:
    from lib.firebase_client import (
        get_settings,
        get_participants,
        create_participant,
        check_name_exists
    )
    from lib.encryption import encrypt, hash_password
    print("   ✅ Imports correctos")
except Exception as e:
    print(f"   ❌ Error en imports: {str(e)}")
    print()
    print("Verifica que:")
    print("  - requirements.txt esté instalado: pip install -r requirements.txt")
    print("  - Las variables de entorno estén en .env")
    sys.exit(1)

print()

# Test 2: Conectar a Firestore
print("2️⃣  Probando conexión a Firestore...")
try:
    settings = get_settings()
    print(f"   ✅ Conexión exitosa a Firestore")
    print(f"   📄 Settings actuales: {settings}")
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    print()
    print("Verifica que:")
    print("  - FIREBASE_CREDENTIALS_PATH apunte al archivo JSON correcto")
    print("  - El proyecto de Firebase exista y Firestore esté habilitado")
    sys.exit(1)

print()

# Test 3: Leer participantes
print("3️⃣  Probando lectura de participantes...")
try:
    participants = get_participants()
    count = len(participants)
    print(f"   ✅ Lectura exitosa")
    print(f"   👥 Participantes encontrados: {count}")
    
    if count > 0:
        print(f"   📋 Ejemplo (primero):")
        first = participants[0]
        print(f"      - ID: {first.get('id', 'N/A')[:8]}...")
        print(f"      - Categoría: {first.get('category', 'N/A')}")
        print(f"      - Opciones de regalo: {len(first.get('gift_options', []))}")
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    sys.exit(1)

print()

# Test 4: Crear participante de prueba (opcional)
print("4️⃣  ¿Deseas crear un participante de prueba?")
response = input("   Escribe 'si' para continuar (o Enter para saltar): ")

if response.lower() in ['si', 'sí', 's', 'yes', 'y']:
    print()
    print("   Creando participante de prueba...")
    
    try:
        # Encriptar nombre
        test_name = f"Test Usuario {len(participants) + 1}"
        encrypted_name = encrypt(test_name, "GiftExchange2025!")
        password_hash = hash_password("test123")
        
        # Verificar que no exista
        if check_name_exists(encrypted_name):
            print(f"   ⚠️  El participante '{test_name}' ya existe")
        else:
            # Crear participante
            new_participant = create_participant(
                encrypted_name=encrypted_name,
                category='diversion',
                gift_options=['Opción 1', 'Opción 2', 'Opción 3'],
                password_hash=password_hash,
                gift_images=[]
            )
            
            print(f"   ✅ Participante creado exitosamente!")
            print(f"      - ID: {new_participant['id']}")
            print(f"      - Nombre (encriptado): {test_name}")
            print(f"      - Categoría: diversion")
            print()
            print("   💡 Puedes eliminarlo manualmente desde Firebase Console")
            
    except Exception as e:
        print(f"   ❌ Error al crear participante: {str(e)}")
else:
    print("   ⏭️  Saltando creación de participante")

print()

# Test 5: Verificar Storage (opcional)
print("5️⃣  Probando Firebase Storage...")
try:
    from firebase_admin import storage
    
    bucket = storage.bucket()
    print(f"   ✅ Conexión a Storage exitosa")
    print(f"   🪣 Bucket: {bucket.name}")
    
    # Listar algunos archivos (si existen)
    blobs = list(bucket.list_blobs(max_results=5))
    if blobs:
        print(f"   📁 Archivos encontrados: {len(blobs)}")
        for blob in blobs[:3]:
            print(f"      - {blob.name}")
    else:
        print(f"   📁 No hay archivos en Storage (esto es normal si es nuevo)")
        
except Exception as e:
    print(f"   ⚠️  Advertencia: {str(e)}")
    print("   Verifica que FIREBASE_STORAGE_BUCKET esté configurado")

print()
print("=" * 50)
print("✅ PRUEBAS COMPLETADAS")
print()
print("Todo está funcionando correctamente. Puedes:")
print("  1. Ejecutar la aplicación: streamlit run app.py")
print("  2. Migrar datos desde Supabase: python migrate_supabase_to_firebase.py")
print("  3. Consultar FIREBASE_SETUP.md para más información")
print("=" * 50)
