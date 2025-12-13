"""
Script para crear el documento inicial de settings en AppWrite
y completar los atributos faltantes

USO: python create_settings_document.py
"""

import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID

load_dotenv()

# Configuración
APPWRITE_ENDPOINT = os.getenv('APPWRITE_ENDPOINT')
APPWRITE_PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID')
APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY')
APPWRITE_DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID')
APPWRITE_PARTICIPANTS_COLLECTION_ID = os.getenv('APPWRITE_PARTICIPANTS_COLLECTION_ID')
APPWRITE_SETTINGS_COLLECTION_ID = os.getenv('APPWRITE_SETTINGS_COLLECTION_ID')

# Inicializar cliente
client = Client()
client.set_endpoint(APPWRITE_ENDPOINT)
client.set_project(APPWRITE_PROJECT_ID)
client.set_key(APPWRITE_API_KEY)

databases = Databases(client)

print("📝 Completando configuración de AppWrite")
print("=" * 60)
print()

# Paso 1: Completar atributos faltantes de participants
print("1️⃣  Completando atributos de 'participants'...")
try:
    print("   Creando 'gift_images' (array de strings)...", end=' ')
    databases.create_string_attribute(
        database_id=APPWRITE_DATABASE_ID,
        collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
        key='gift_images',
        size=500,
        required=False,
        array=True
    )
    print("✅")
except Exception as e:
    if 'already exists' in str(e).lower():
        print("⚠️  Ya existe")
    else:
        print(f"⚠️  {str(e)}")

print()

# Paso 2: Completar atributos de settings
print("2️⃣  Completando atributos de 'settings'...")

# Atributos sin default (AppWrite no permite defaults en required)
settings_attrs = [
    ('encryption_password_hash', 'string', 255),
    ('names_revealed', 'boolean', None),
    ('sorteo_completed', 'boolean', None)
]

for key, attr_type, size in settings_attrs:
    try:
        print(f"   Verificando '{key}' ({attr_type})...", end=' ')
        
        if attr_type == 'string':
            databases.create_string_attribute(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=APPWRITE_SETTINGS_COLLECTION_ID,
                key=key,
                size=size,
                required=True
            )
        elif attr_type == 'boolean':
            databases.create_boolean_attribute(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=APPWRITE_SETTINGS_COLLECTION_ID,
                key=key,
                required=True
            )
        print("✅")
    except Exception as e:
        if 'already exists' in str(e).lower():
            print("⚠️  Ya existe")
        else:
            print(f"⚠️  {str(e)}")

print()

# Paso 3: Crear documento inicial de settings
print("3️⃣  Creando documento 'global' en 'settings'...")

try:
    doc = databases.create_document(
        database_id=APPWRITE_DATABASE_ID,
        collection_id=APPWRITE_SETTINGS_COLLECTION_ID,
        document_id='global',
        data={
            'encryption_password_hash': 'default',
            'names_revealed': False,
            'sorteo_completed': False
        }
    )
    print("   ✅ Documento 'global' creado exitosamente!")
    print(f"      - encryption_password_hash: {doc['encryption_password_hash']}")
    print(f"      - names_revealed: {doc['names_revealed']}")
    print(f"      - sorteo_completed: {doc['sorteo_completed']}")
except Exception as e:
    if 'already exists' in str(e).lower() or 'Document with the requested ID already exists' in str(e):
        print("   ⚠️  El documento 'global' ya existe")
    else:
        print(f"   ❌ Error: {str(e)}")

print()
print("=" * 60)
print("✅ CONFIGURACIÓN COMPLETADA")
print()
print("Ahora puedes:")
print("  1. Ejecutar: python test_appwrite_connection.py")
print("  2. Ejecutar: streamlit run app.py")
print("  3. Visitar: http://localhost:8501")
print("=" * 60)
