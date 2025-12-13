"""
Script de prueba para verificar la conexión a AppWrite
Prueba funciones básicas de Database y Storage

USO: python test_appwrite_connection.py
"""

import sys

print("🚀 Test de Conexión a AppWrite")
print("=" * 50)
print()

# Test 1: Verificar variables de entorno
print("1️⃣  Verificando variables de entorno...")
import os
from dotenv import load_dotenv

load_dotenv()

required_vars = [
    'APPWRITE_ENDPOINT',
    'APPWRITE_PROJECT_ID',
    'APPWRITE_API_KEY',
    'APPWRITE_DATABASE_ID',
    'APPWRITE_PARTICIPANTS_COLLECTION_ID',
    'APPWRITE_SETTINGS_COLLECTION_ID'
]

missing_vars = []
for var in required_vars:
    value = os.getenv(var)
    if not value:
        missing_vars.append(var)
        print(f"   ❌ {var}: NO configurada")
    else:
        # Mostrar solo parte del valor para seguridad
        if 'KEY' in var or 'SECRET' in var:
            display_value = value[:20] + "..." if len(value) > 20 else value
        else:
            display_value = value
        print(f"   ✅ {var}: {display_value}")

if missing_vars:
    print()
    print(f"❌ Faltan {len(missing_vars)} variable(s) de entorno")
    print()
    print("Por favor configura estas variables en tu archivo .env")
    print("Consulta APPWRITE_SETUP.md para más información")
    sys.exit(1)

print()

# Test 2: Importar módulos
print("2️⃣  Probando imports...")
try:
    from lib.appwrite_client import (
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
    print("  - El archivo lib/appwrite_client.py exista")
    sys.exit(1)

print()

# Test 3: Conectar a AppWrite Database
print("3️⃣  Probando conexión a AppWrite Database...")
try:
    settings = get_settings()
    print(f"   ✅ Conexión exitosa a AppWrite")
    print(f"   📄 Settings actuales:")
    print(f"      - ID: {settings.get('id', 'N/A')}")
    print(f"      - encryption_password_hash: {settings.get('encryption_password_hash', 'N/A')}")
    print(f"      - names_revealed: {settings.get('names_revealed', 'N/A')}")
    print(f"      - sorteo_completed: {settings.get('sorteo_completed', 'N/A')}")
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    print()
    print("Verifica que:")
    print("  - APPWRITE_SETTINGS_COLLECTION_ID sea correcto")
    print("  - La collection 'settings' exista en AppWrite")
    print("  - Exista un documento con ID 'global' en settings")
    print("  - Los permisos de la collection permitan lectura")
    sys.exit(1)

print()

# Test 4: Leer participantes
print("4️⃣  Probando lectura de participantes...")
try:
    participants = get_participants()
    count = len(participants)
    print(f"   ✅ Lectura exitosa")
    print(f"   👥 Participantes encontrados: {count}")
    
    if count > 0:
        print(f"   📋 Ejemplo (primero):")
        first = participants[0]
        print(f"      - ID: {first.get('id', 'N/A')[:20]}...")
        print(f"      - Categoría: {first.get('category', 'N/A')}")
        print(f"      - Opciones de regalo: {len(first.get('gift_options', []))}")
    else:
        print("   ℹ️  No hay participantes aún (esto es normal para nueva instalación)")
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    print()
    print("Verifica que:")
    print("  - APPWRITE_PARTICIPANTS_COLLECTION_ID sea correcto")
    print("  - La collection 'participants' exista en AppWrite")
    print("  - Los atributos estén creados correctamente")
    sys.exit(1)

print()

# Test 5: Crear participante de prueba (opcional)
print("5️⃣  ¿Deseas crear un participante de prueba?")
response = input("   Escribe 'si' para continuar (o Enter para saltar): ")

if response.lower() in ['si', 'sí', 's', 'yes', 'y']:
    print()
    print("   Creando participante de prueba...")
    
    try:
        # Encriptar nombre
        test_name = f"Test Usuario AppWrite"
        encrypted_name = encrypt(test_name, "GiftExchange2025!")
        password_hash = hash_password("test123")
        
        # Verificar que no exista
        if check_name_exists(encrypted_name):
            print(f"   ⚠️  El participante de prueba ya existe")
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
            print(f"      - Nombre (desencriptado): {test_name}")
            print(f"      - Contraseña: test123")
            print(f"      - Categoría: diversion")
            print()
            print("   💡 Puedes eliminarlo desde AppWrite Console > Databases > participants")
            
    except Exception as e:
        print(f"   ❌ Error al crear participante: {str(e)}")
        print()
        print("Posibles causas:")
        print("  - Atributos faltantes en la collection")
        print("  - Permisos insuficientes para crear documentos")
        print("  - Tipo de datos incorrecto en algún atributo")
else:
    print("   ⏭️  Saltando creación de participante")

print()

# Test 6: Verificar Storage (opcional)
storage_bucket_id = os.getenv('APPWRITE_STORAGE_BUCKET_ID')
if storage_bucket_id:
    print("6️⃣  Probando AppWrite Storage...")
    try:
        from appwrite.client import Client
        from appwrite.services.storage import Storage
        
        endpoint = os.getenv('APPWRITE_ENDPOINT')
        project_id = os.getenv('APPWRITE_PROJECT_ID')
        api_key = os.getenv('APPWRITE_API_KEY')
        
        client = Client()
        client.set_endpoint(endpoint)
        client.set_project(project_id)
        client.set_key(api_key)
        
        storage = Storage(client)
        
        # Intentar listar archivos
        files = storage.list_files(bucket_id=storage_bucket_id)
        
        print(f"   ✅ Conexión a Storage exitosa")
        print(f"   🪣 Bucket ID: {storage_bucket_id}")
        print(f"   📁 Archivos encontrados: {files['total']}")
        
    except Exception as e:
        print(f"   ⚠️  Advertencia: {str(e)}")
        print("   Verifica que:")
        print("     - El bucket exista en AppWrite Storage")
        print("     - APPWRITE_STORAGE_BUCKET_ID sea correcto")
        print("     - Los permisos del bucket permitan lectura")
else:
    print("6️⃣  Storage no configurado")
    print("   ℹ️  APPWRITE_STORAGE_BUCKET_ID no está configurado")
    print("   Configúralo si necesitas subir imágenes de regalos")

print()
print("=" * 50)
print("✅ PRUEBAS COMPLETADAS")
print()
print("Todo está funcionando correctamente. Puedes:")
print("  1. Ejecutar la aplicación: streamlit run app.py")
print("  2. Ver datos en AppWrite Console: https://cloud.appwrite.io/console")
print("  3. Consultar APPWRITE_SETUP.md para más información")
print("=" * 50)
