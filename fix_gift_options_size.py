"""
Script para actualizar el atributo gift_options en AppWrite
Aumentar el tamaño máximo de cada elemento del array

USO: python fix_gift_options_size.py
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

# Inicializar cliente
client = Client()
client.set_endpoint(APPWRITE_ENDPOINT)
client.set_project(APPWRITE_PROJECT_ID)
client.set_key(APPWRITE_API_KEY)

databases = Databases(client)

print("🔧 Actualizando atributo 'gift_options'")
print("=" * 60)
print()

print("Pasos a seguir:")
print("1. Ve a AppWrite Console")
print("2. Navega a: Databases > gift_exchange > participants")
print("3. Click en la pestaña 'Attributes'")
print("4. Encuentra el atributo 'gift_options'")
print("5. Click en el ícono de editar (lápiz)")
print("6. Cambia 'Size' de 255 a 1000")
print("7. Click en 'Update'")
print()
print("=" * 60)
print()
print("Alternativamente, puedes eliminar y recrear el atributo:")
print()

response = input("¿Deseas que elimine y recree el atributo automáticamente? (s/n): ")

if response.lower() in ['s', 'si', 'sí', 'yes', 'y']:
    try:
        print()
        print("1️⃣  Eliminando atributo 'gift_options'...", end=' ')
        
        databases.delete_attribute(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
            key='gift_options'
        )
        
        print("✅")
        print()
        print("⏳ Esperando 5 segundos para que AppWrite procese la eliminación...")
        
        import time
        time.sleep(5)
        
        print()
        print("2️⃣  Creando atributo 'gift_options' con tamaño 1000...", end=' ')
        
        databases.create_string_attribute(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
            key='gift_options',
            size=1000,
            required=True,
            array=True
        )
        
        print("✅")
        print()
        print("=" * 60)
        print("✅ ATRIBUTO ACTUALIZADO")
        print()
        print("Ahora puedes:")
        print("  1. Esperar unos segundos para que AppWrite procese el cambio")
        print("  2. Intentar registrar un participante nuevamente")
        print("  3. Ejecutar: streamlit run app.py")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print()
        print("Si el error es que el atributo no existe o está en uso,")
        print("actualízalo manualmente desde AppWrite Console siguiendo")
        print("los pasos indicados arriba.")
else:
    print()
    print("⏭️  Operación cancelada")
    print()
    print("Por favor actualiza el atributo manualmente desde AppWrite Console.")
