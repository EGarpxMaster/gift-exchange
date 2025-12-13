"""
Cliente de AppWrite para la aplicación de intercambio de regalos
Migrado desde Firebase/Supabase
"""

import os
from typing import Optional, List, Dict, Any
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.query import Query
from appwrite.id import ID
from dotenv import load_dotenv
import uuid

# Cargar variables de entorno
load_dotenv()

# Configuración de AppWrite
APPWRITE_ENDPOINT = os.getenv('APPWRITE_ENDPOINT')
APPWRITE_PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID')
APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY')
APPWRITE_DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID')
APPWRITE_PARTICIPANTS_COLLECTION_ID = os.getenv('APPWRITE_PARTICIPANTS_COLLECTION_ID')
APPWRITE_SETTINGS_COLLECTION_ID = os.getenv('APPWRITE_SETTINGS_COLLECTION_ID')
APPWRITE_STORAGE_BUCKET_ID = os.getenv('APPWRITE_STORAGE_BUCKET_ID')

# Verificar que las credenciales existan
if not APPWRITE_ENDPOINT:
    raise ValueError("APPWRITE_ENDPOINT es requerido en .env")
if not APPWRITE_PROJECT_ID:
    raise ValueError("APPWRITE_PROJECT_ID es requerido en .env")
if not APPWRITE_API_KEY:
    raise ValueError("APPWRITE_API_KEY es requerido en .env")
if not APPWRITE_DATABASE_ID:
    raise ValueError("APPWRITE_DATABASE_ID es requerido en .env")
if not APPWRITE_PARTICIPANTS_COLLECTION_ID:
    raise ValueError("APPWRITE_PARTICIPANTS_COLLECTION_ID es requerido en .env")
if not APPWRITE_SETTINGS_COLLECTION_ID:
    raise ValueError("APPWRITE_SETTINGS_COLLECTION_ID es requerido en .env")

# Inicializar cliente de AppWrite
client = Client()
client.set_endpoint(APPWRITE_ENDPOINT)
client.set_project(APPWRITE_PROJECT_ID)
client.set_key(APPWRITE_API_KEY)

# Inicializar servicios
databases = Databases(client)
storage = Storage(client)


# ============== PARTICIPANTS ==============

def get_participants() -> List[Dict[str, Any]]:
    """
    Obtiene todos los participantes
    
    Returns:
        Lista de participantes
    """
    try:
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID
        )
        
        # Convertir documentos de AppWrite a formato dict
        participants = []
        for doc in response['documents']:
            participant = {
                'id': doc['$id'],
                'encrypted_name': doc.get('encrypted_name', ''),
                'category': doc.get('category', ''),
                'gift_options': doc.get('gift_options', []),
                'password_hash': doc.get('password_hash', ''),
                'gift_images': doc.get('gift_images', []),
                'assigned_to_id': doc.get('assigned_to_id'),
                'created_at': doc.get('$createdAt')
            }
            participants.append(participant)
        
        return participants
    except Exception as e:
        print(f"Error al obtener participantes: {str(e)}")
        return []


def get_participant_by_id(participant_id: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene un participante por su ID
    
    Args:
        participant_id: ID del participante
        
    Returns:
        Datos del participante o None si no existe
    """
    try:
        doc = databases.get_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
            document_id=participant_id
        )
        
        participant = {
            'id': doc['$id'],
            'encrypted_name': doc.get('encrypted_name', ''),
            'category': doc.get('category', ''),
            'gift_options': doc.get('gift_options', []),
            'password_hash': doc.get('password_hash', ''),
            'gift_images': doc.get('gift_images', []),
            'assigned_to_id': doc.get('assigned_to_id'),
            'created_at': doc.get('$createdAt')
        }
        
        return participant
    except Exception as e:
        print(f"Error al obtener participante {participant_id}: {str(e)}")
        return None


def check_name_exists(encrypted_name: str) -> bool:
    """
    Verifica si ya existe un participante con el nombre encriptado
    
    Args:
        encrypted_name: Nombre encriptado a verificar
        
    Returns:
        True si existe, False en caso contrario
    """
    try:
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
            queries=[
                Query.equal('encrypted_name', encrypted_name),
                Query.limit(1)
            ]
        )
        
        return len(response['documents']) > 0
    except Exception as e:
        print(f"Error al verificar nombre: {str(e)}")
        return False


def create_participant(encrypted_name: str, category: str, gift_options: List[str], password_hash: str, gift_images: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Crea un nuevo participante
    
    Args:
        encrypted_name: Nombre encriptado del participante
        category: Categoría ('elite' o 'diversion')
        gift_options: Lista de opciones de regalo
        password_hash: Hash de la contraseña del participante
        gift_images: Lista de URLs de imágenes de regalos (opcional)
        
    Returns:
        Datos del participante creado
        
    Raises:
        Exception: Si hay un error al crear el participante
    """
    try:
        data = {
            'encrypted_name': encrypted_name,
            'category': category,
            'gift_options': gift_options,
            'password_hash': password_hash,
            'gift_images': gift_images or [],
            'assigned_to_id': None
        }
        
        doc = databases.create_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
            document_id=ID.unique(),
            data=data
        )
        
        participant = {
            'id': doc['$id'],
            'encrypted_name': doc.get('encrypted_name', ''),
            'category': doc.get('category', ''),
            'gift_options': doc.get('gift_options', []),
            'password_hash': doc.get('password_hash', ''),
            'gift_images': doc.get('gift_images', []),
            'assigned_to_id': doc.get('assigned_to_id'),
            'created_at': doc.get('$createdAt')
        }
        
        return participant
    except Exception as e:
        raise Exception(f'Error al crear participante: {str(e)}')


def update_participant_assignment(participant_id: str, assigned_to_id: str) -> Dict[str, Any]:
    """
    Actualiza la asignación de un participante
    
    Args:
        participant_id: ID del participante
        assigned_to_id: ID del participante asignado
        
    Returns:
        Datos del participante actualizado
    """
    try:
        doc = databases.update_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
            document_id=participant_id,
            data={'assigned_to_id': assigned_to_id}
        )
        
        return get_participant_by_id(participant_id)
    except Exception as e:
        raise Exception(f'Error al actualizar asignación para {participant_id}: {str(e)}')


# ============== SETTINGS ==============

def get_settings() -> Dict[str, Any]:
    """
    Obtiene la configuración global del sistema
    
    Returns:
        Configuración global
    """
    try:
        # Intentar obtener el documento 'global' de settings
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_SETTINGS_COLLECTION_ID,
            queries=[Query.limit(1)]
        )
        
        if response['documents']:
            doc = response['documents'][0]
            settings = {
                'id': doc['$id'],
                'encryption_password_hash': doc.get('encryption_password_hash', 'default'),
                'names_revealed': doc.get('names_revealed', False),
                'sorteo_completed': doc.get('sorteo_completed', False)
            }
            return settings
        else:
            # Crear configuración por defecto
            default_settings = {
                'encryption_password_hash': 'default',
                'names_revealed': False,
                'sorteo_completed': False
            }
            
            doc = databases.create_document(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=APPWRITE_SETTINGS_COLLECTION_ID,
                document_id='global',
                data=default_settings
            )
            
            default_settings['id'] = doc['$id']
            return default_settings
            
    except Exception as e:
        print(f"Error al obtener settings: {str(e)}")
        # Retornar defaults en caso de error
        return {
            'id': 'global',
            'encryption_password_hash': 'default',
            'names_revealed': False,
            'sorteo_completed': False
        }


def update_settings(updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Actualiza la configuración global
    
    Args:
        updates: Diccionario con los campos a actualizar
        
    Returns:
        Configuración actualizada
    """
    try:
        settings = get_settings()
        settings_id = settings['id']
        
        databases.update_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_SETTINGS_COLLECTION_ID,
            document_id=settings_id,
            data=updates
        )
        
        return get_settings()
    except Exception as e:
        raise Exception(f'Error al actualizar configuración: {str(e)}')


# ============== UTILITY FUNCTIONS ==============

def reset_all_assignments() -> None:
    """
    Reinicia todas las asignaciones (útil para testing)
    ADVERTENCIA: Esta función eliminará todas las asignaciones
    """
    try:
        participants = get_participants()
        
        for participant in participants:
            databases.update_document(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
                document_id=participant['id'],
                data={'assigned_to_id': None}
            )
        
        update_settings({'sorteo_completed': False, 'names_revealed': False})
    except Exception as e:
        print(f"Error al resetear asignaciones: {str(e)}")


def get_participants_by_category(category: str) -> List[Dict[str, Any]]:
    """
    Obtiene participantes filtrados por categoría
    
    Args:
        category: 'elite' o 'diversion'
        
    Returns:
        Lista de participantes de la categoría especificada
    """
    try:
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
            queries=[Query.equal('category', category)]
        )
        
        participants = []
        for doc in response['documents']:
            participant = {
                'id': doc['$id'],
                'encrypted_name': doc.get('encrypted_name', ''),
                'category': doc.get('category', ''),
                'gift_options': doc.get('gift_options', []),
                'password_hash': doc.get('password_hash', ''),
                'gift_images': doc.get('gift_images', []),
                'assigned_to_id': doc.get('assigned_to_id'),
                'created_at': doc.get('$createdAt')
            }
            participants.append(participant)
        
        return participants
    except Exception as e:
        print(f"Error al obtener participantes por categoría: {str(e)}")
        return []


def delete_participant(participant_id: str) -> None:
    """
    Elimina un participante (solo para admin/testing)
    
    Args:
        participant_id: ID del participante a eliminar
    """
    try:
        databases.delete_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
            document_id=participant_id
        )
    except Exception as e:
        print(f"Error al eliminar participante: {str(e)}")


# ============== STORAGE FUNCTIONS ==============

def upload_gift_image(participant_id: str, option_index: int, image_bytes: bytes, file_name: str) -> str:
    """
    Sube una imagen de regalo a AppWrite Storage
    
    Args:
        participant_id: ID del participante
        option_index: Índice de la opción de regalo (0-6)
        image_bytes: Bytes de la imagen
        file_name: Nombre original del archivo
        
    Returns:
        URL pública de la imagen subida
    """
    if not APPWRITE_STORAGE_BUCKET_ID:
        raise ValueError("APPWRITE_STORAGE_BUCKET_ID no está configurado")
    
    try:
        # Crear nombre único para el archivo
        file_extension = file_name.split('.')[-1] if '.' in file_name else 'jpg'
        file_id = f"{participant_id}_option_{option_index}"
        
        # AppWrite requiere un objeto tipo archivo
        from io import BytesIO
        file_obj = BytesIO(image_bytes)
        file_obj.name = f"option_{option_index}.{file_extension}"
        
        # Subir archivo
        result = storage.create_file(
            bucket_id=APPWRITE_STORAGE_BUCKET_ID,
            file_id=file_id,
            file=file_obj
        )
        
        # Obtener URL pública
        file_url = f"{APPWRITE_ENDPOINT}/storage/buckets/{APPWRITE_STORAGE_BUCKET_ID}/files/{result['$id']}/view?project={APPWRITE_PROJECT_ID}"
        
        return file_url
    except Exception as e:
        raise Exception(f"Error al subir imagen: {str(e)}")


def get_gift_image_url(participant_id: str, option_index: int) -> Optional[str]:
    """
    Obtiene la URL de una imagen de regalo si existe
    
    Args:
        participant_id: ID del participante
        option_index: Índice de la opción de regalo
        
    Returns:
        URL de la imagen o None si no existe
    """
    if not APPWRITE_STORAGE_BUCKET_ID:
        return None
    
    try:
        file_id = f"{participant_id}_option_{option_index}"
        
        # Verificar si el archivo existe
        file_info = storage.get_file(
            bucket_id=APPWRITE_STORAGE_BUCKET_ID,
            file_id=file_id
        )
        
        # Retornar URL pública
        return f"{APPWRITE_ENDPOINT}/storage/buckets/{APPWRITE_STORAGE_BUCKET_ID}/files/{file_id}/view?project={APPWRITE_PROJECT_ID}"
    except:
        return None


def delete_gift_image(participant_id: str, option_index: int) -> None:
    """
    Elimina una imagen de regalo
    
    Args:
        participant_id: ID del participante
        option_index: Índice de la opción de regalo
    """
    if not APPWRITE_STORAGE_BUCKET_ID:
        return
    
    try:
        file_id = f"{participant_id}_option_{option_index}"
        
        storage.delete_file(
            bucket_id=APPWRITE_STORAGE_BUCKET_ID,
            file_id=file_id
        )
    except:
        pass


# ============== PASSWORD FUNCTIONS ==============

def get_participant_by_name_and_password(name: str, password_hash: str, encryption_password: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene un participante por nombre (sin encriptar) y contraseña
    
    Args:
        name: Nombre del participante en texto plano
        password_hash: Hash de la contraseña para comparar
        encryption_password: Contraseña de encriptación para desencriptar nombres
        
    Returns:
        Datos del participante o None si no existe o la contraseña es incorrecta
    """
    from lib.encryption import decrypt
    
    # Obtener todos los participantes
    participants = get_participants()
    
    if not participants:
        return None
    
    # Buscar el participante desencriptando nombres
    for participant in participants:
        try:
            decrypted_name = decrypt(participant['encrypted_name'], encryption_password)
            
            # Verificar si el nombre coincide (ignorando mayúsculas/minúsculas y espacios extra)
            if decrypted_name.strip().lower() == name.strip().lower():
                # Verificar que el hash de contraseña coincida
                if participant.get('password_hash') == password_hash:
                    return participant
                else:
                    # Nombre correcto pero contraseña incorrecta
                    return None
        except:
            # Si hay error al desencriptar, continuar con el siguiente
            continue
    
    return None
