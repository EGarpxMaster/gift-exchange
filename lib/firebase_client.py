"""
Cliente de Firebase para la aplicación de intercambio de regalos
Migrado desde Supabase
"""

import os
import json
from typing import Optional, List, Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore, storage
from dotenv import load_dotenv
import uuid

# Cargar variables de entorno
load_dotenv()

# Configuración de Firebase
# Soporta tanto desarrollo local como Streamlit Cloud
try:
    import streamlit as st
    # En Streamlit Cloud, usar secrets
    if 'firebase_credentials' in st.secrets:
        cred_dict = dict(st.secrets['firebase_credentials'])
        cred = credentials.Certificate(cred_dict)
        FIREBASE_STORAGE_BUCKET = st.secrets['FIREBASE_STORAGE_BUCKET']
    else:
        # Desarrollo local
        FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH')
        FIREBASE_STORAGE_BUCKET = os.getenv('FIREBASE_STORAGE_BUCKET')
        
        if not FIREBASE_CREDENTIALS_PATH:
            raise ValueError(
                "La variable de entorno FIREBASE_CREDENTIALS_PATH es requerida. "
                "Asegúrate de tener un archivo .env con la ruta a tu archivo de credenciales JSON."
            )
        
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
except ImportError:
    # Sin Streamlit, usar variables de entorno
    FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH')
    FIREBASE_STORAGE_BUCKET = os.getenv('FIREBASE_STORAGE_BUCKET')
    
    if not FIREBASE_CREDENTIALS_PATH:
        raise ValueError(
            "La variable de entorno FIREBASE_CREDENTIALS_PATH es requerida. "
            "Asegúrate de tener un archivo .env con la ruta a tu archivo de credenciales JSON."
        )
    
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)

if not FIREBASE_STORAGE_BUCKET:
    raise ValueError(
        "La variable de entorno FIREBASE_STORAGE_BUCKET es requerida. "
        "Ejemplo: FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com"
    )

# Inicializar Firebase Admin SDK (solo una vez)
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred, {
        'storageBucket': FIREBASE_STORAGE_BUCKET
    })

# Referencias a Firestore y Storage
db = firestore.client()
bucket = storage.bucket()


# ============== PARTICIPANTS ==============

def get_participants() -> List[Dict[str, Any]]:
    """
    Obtiene todos los participantes
    
    Returns:
        Lista de participantes
    """
    participants_ref = db.collection('participants')
    docs = participants_ref.stream()
    
    participants = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        participants.append(data)
    
    return participants


def get_participant_by_id(participant_id: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene un participante por su ID
    
    Args:
        participant_id: UUID del participante
        
    Returns:
        Datos del participante o None si no existe
    """
    doc_ref = db.collection('participants').document(participant_id)
    doc = doc_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        data['id'] = doc.id
        return data
    
    return None


def check_name_exists(encrypted_name: str) -> bool:
    """
    Verifica si ya existe un participante con el nombre encriptado
    
    Args:
        encrypted_name: Nombre encriptado a verificar
        
    Returns:
        True si existe, False en caso contrario
    """
    participants_ref = db.collection('participants')
    query = participants_ref.where('encrypted_name', '==', encrypted_name).limit(1)
    docs = list(query.stream())
    
    return len(docs) > 0


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
    from datetime import datetime
    
    # Generar un ID único
    participant_id = str(uuid.uuid4())
    
    data = {
        'encrypted_name': encrypted_name,
        'category': category,
        'gift_options': gift_options,
        'password_hash': password_hash,
        'gift_images': gift_images or [],
        'assigned_to_id': None,
        'created_at': datetime.utcnow()
    }
    
    try:
        db.collection('participants').document(participant_id).set(data)
        data['id'] = participant_id
        return data
    except Exception as e:
        raise Exception(f'Error al crear participante: {str(e)}')


def update_participant_assignment(participant_id: str, assigned_to_id: str) -> Dict[str, Any]:
    """
    Actualiza la asignación de un participante
    
    Args:
        participant_id: UUID del participante
        assigned_to_id: UUID del participante asignado
        
    Returns:
        Datos del participante actualizado
    """
    doc_ref = db.collection('participants').document(participant_id)
    
    try:
        doc_ref.update({'assigned_to_id': assigned_to_id})
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
    settings_ref = db.collection('settings').document('global')
    doc = settings_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        data['id'] = doc.id
        return data
    
    # Si no existe, crear configuración por defecto
    default_settings = {
        'encryption_password_hash': 'default',
        'names_revealed': False,
        'sorteo_completed': False
    }
    
    try:
        settings_ref.set(default_settings)
        default_settings['id'] = 'global'
        return default_settings
    except:
        return default_settings


def update_settings(updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Actualiza la configuración global
    
    Args:
        updates: Diccionario con los campos a actualizar
        
    Returns:
        Configuración actualizada
    """
    settings_ref = db.collection('settings').document('global')
    
    try:
        settings_ref.update(updates)
        return get_settings()
    except Exception as e:
        raise Exception(f'Error al actualizar configuración: {str(e)}')


# ============== UTILITY FUNCTIONS ==============

def reset_all_assignments() -> None:
    """
    Reinicia todas las asignaciones (útil para testing)
    ADVERTENCIA: Esta función eliminará todas las asignaciones
    """
    participants_ref = db.collection('participants')
    docs = participants_ref.stream()
    
    batch = db.batch()
    for doc in docs:
        batch.update(doc.reference, {'assigned_to_id': None})
    
    batch.commit()
    
    update_settings({'sorteo_completed': False, 'names_revealed': False})


def get_participants_by_category(category: str) -> List[Dict[str, Any]]:
    """
    Obtiene participantes filtrados por categoría
    
    Args:
        category: 'elite' o 'diversion'
        
    Returns:
        Lista de participantes de la categoría especificada
    """
    participants_ref = db.collection('participants')
    query = participants_ref.where('category', '==', category)
    docs = query.stream()
    
    participants = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        participants.append(data)
    
    return participants


def delete_participant(participant_id: str) -> None:
    """
    Elimina un participante (solo para admin/testing)
    
    Args:
        participant_id: UUID del participante a eliminar
    """
    db.collection('participants').document(participant_id).delete()


# ============== STORAGE FUNCTIONS ==============

def upload_gift_image(participant_id: str, option_index: int, image_bytes: bytes, file_name: str) -> str:
    """
    Sube una imagen de regalo a Firebase Storage
    
    Args:
        participant_id: UUID del participante
        option_index: Índice de la opción de regalo (0-6)
        image_bytes: Bytes de la imagen
        file_name: Nombre original del archivo
        
    Returns:
        URL pública de la imagen subida
    """
    # Crear nombre único para el archivo
    file_extension = file_name.split('.')[-1] if '.' in file_name else 'jpg'
    storage_path = f"gift-images/{participant_id}/option_{option_index}.{file_extension}"
    
    # Subir imagen a Firebase Storage
    blob = bucket.blob(storage_path)
    blob.upload_from_string(image_bytes, content_type=f"image/{file_extension}")
    
    # Hacer el archivo público
    blob.make_public()
    
    # Obtener URL pública
    return blob.public_url


def get_gift_image_url(participant_id: str, option_index: int) -> Optional[str]:
    """
    Obtiene la URL de una imagen de regalo si existe
    
    Args:
        participant_id: UUID del participante
        option_index: Índice de la opción de regalo
        
    Returns:
        URL de la imagen o None si no existe
    """
    try:
        # Buscar archivos con diferentes extensiones
        extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
        
        for ext in extensions:
            storage_path = f"gift-images/{participant_id}/option_{option_index}.{ext}"
            blob = bucket.blob(storage_path)
            
            if blob.exists():
                return blob.public_url
        
        return None
    except:
        return None


def delete_gift_image(participant_id: str, option_index: int) -> None:
    """
    Elimina una imagen de regalo
    
    Args:
        participant_id: UUID del participante
        option_index: Índice de la opción de regalo
    """
    try:
        extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
        
        for ext in extensions:
            storage_path = f"gift-images/{participant_id}/option_{option_index}.{ext}"
            blob = bucket.blob(storage_path)
            
            if blob.exists():
                blob.delete()
                break
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
