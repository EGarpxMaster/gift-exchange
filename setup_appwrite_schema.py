"""
Script para crear automáticamente los atributos en las collections de AppWrite
Ejecutar una sola vez después de crear las collections vacías

USO: python setup_appwrite_schema.py
"""

import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases

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

print("🔧 Configurando Schema de AppWrite")
print("=" * 60)
print()

# ============== PARTICIPANTS COLLECTION ==============
print("1️⃣  Configurando collection 'participants'...")
print()

participants_attributes = [
    {
        'key': 'encrypted_name',
        'type': 'string',
        'size': 500,
        'required': True,
        'array': False
    },
    {
        'key': 'category',
        'type': 'enum',
        'elements': ['elite', 'diversion'],
        'required': True,
        'array': False
    },
    {
        'key': 'gift_options',
        'type': 'string',
        'size': 255,
        'required': True,
        'array': True
    },
    {
        'key': 'password_hash',
        'type': 'string',
        'size': 255,
        'required': True,
        'array': False
    },
    {
        'key': 'gift_images',
        'type': 'string',
        'size': 500,
        'required': False,
        'array': True,
        'default': []
    },
    {
        'key': 'assigned_to_id',
        'type': 'string',
        'size': 36,
        'required': False,
        'array': False,
        'default': None
    }
]

for attr in participants_attributes:
    try:
        key = attr['key']
        attr_type = attr['type']
        
        print(f"   Creando atributo '{key}' ({attr_type})...", end=' ')
        
        if attr_type == 'string':
            databases.create_string_attribute(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
                key=key,
                size=attr['size'],
                required=attr['required'],
                array=attr.get('array', False),
                default=attr.get('default')
            )
        elif attr_type == 'enum':
            databases.create_enum_attribute(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
                key=key,
                elements=attr['elements'],
                required=attr['required'],
                array=attr.get('array', False),
                default=attr.get('default')
            )
        
        print("✅")
    except Exception as e:
        error_msg = str(e)
        if 'Attribute already exists' in error_msg or 'already exists' in error_msg.lower():
            print("⚠️  Ya existe")
        else:
            print(f"❌ Error: {error_msg}")

print()

# ============== SETTINGS COLLECTION ==============
print("2️⃣  Configurando collection 'settings'...")
print()

settings_attributes = [
    {
        'key': 'encryption_password_hash',
        'type': 'string',
        'size': 255,
        'required': True,
        'default': 'default'
    },
    {
        'key': 'names_revealed',
        'type': 'boolean',
        'required': True,
        'default': False
    },
    {
        'key': 'sorteo_completed',
        'type': 'boolean',
        'required': True,
        'default': False
    }
]

for attr in settings_attributes:
    try:
        key = attr['key']
        attr_type = attr['type']
        
        print(f"   Creando atributo '{key}' ({attr_type})...", end=' ')
        
        if attr_type == 'string':
            databases.create_string_attribute(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=APPWRITE_SETTINGS_COLLECTION_ID,
                key=key,
                size=attr['size'],
                required=attr['required'],
                default=attr.get('default')
            )
        elif attr_type == 'boolean':
            databases.create_boolean_attribute(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=APPWRITE_SETTINGS_COLLECTION_ID,
                key=key,
                required=attr['required'],
                default=attr.get('default')
            )
        
        print("✅")
    except Exception as e:
        error_msg = str(e)
        if 'Attribute already exists' in error_msg or 'already exists' in error_msg.lower():
            print("⚠️  Ya existe")
        else:
            print(f"❌ Error: {error_msg}")

print()
print("=" * 60)
print("✅ SCHEMA CONFIGURADO")
print()
print("Próximos pasos:")
print("  1. Espera unos segundos para que AppWrite procese los atributos")
print("  2. Ve a AppWrite Console y verifica que los atributos estén creados")
print("  3. Crea el documento 'global' en la collection 'settings' manualmente")
print("     o ejecuta: python create_settings_document.py")
print("  4. Ejecuta: python test_appwrite_connection.py")
print("=" * 60)
