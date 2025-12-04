"""
Cliente de Supabase para la aplicación de intercambio de regalos
Portado desde TypeScript (supabase.ts)
"""

import os
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de Supabase
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError(
        "Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas. "
        "Asegúrate de tener un archivo .env con estas credenciales."
    )

# Crear cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


# ============== PARTICIPANTS ==============

def get_participants() -> List[Dict[str, Any]]:
    """
    Obtiene todos los participantes
    
    Returns:
        Lista de participantes
    """
    response = supabase.table('participants').select('*').execute()
    return response.data


def get_participant_by_id(participant_id: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene un participante por su ID
    
    Args:
        participant_id: UUID del participante
        
    Returns:
        Datos del participante o None si no existe
    """
    response = supabase.table('participants').select('*').eq('id', participant_id).execute()
    return response.data[0] if response.data else None


def check_name_exists(encrypted_name: str) -> bool:
    """
    Verifica si ya existe un participante con el nombre encriptado
    
    Args:
        encrypted_name: Nombre encriptado a verificar
        
    Returns:
        True si existe, False en caso contrario
    """
    response = supabase.table('participants').select('id').eq('encrypted_name', encrypted_name).execute()
    return len(response.data) > 0


def create_participant(encrypted_name: str, category: str, gift_options: List[str]) -> Dict[str, Any]:
    """
    Crea un nuevo participante
    
    Args:
        encrypted_name: Nombre encriptado del participante
        category: Categoría ('elite' o 'diversion')
        gift_options: Lista de opciones de regalo
        
    Returns:
        Datos del participante creado
        
    Raises:
        Exception: Si hay un error al crear el participante
    """
    data = {
        'encrypted_name': encrypted_name,
        'category': category,
        'gift_options': gift_options
    }
    
    response = supabase.table('participants').insert(data).execute()
    
    if not response.data:
        raise Exception('Error al crear participante')
    
    return response.data[0]


def update_participant_assignment(participant_id: str, assigned_to_id: str) -> Dict[str, Any]:
    """
    Actualiza la asignación de un participante
    
    Args:
        participant_id: UUID del participante
        assigned_to_id: UUID del participante asignado
        
    Returns:
        Datos del participante actualizado
    """
    data = {'assigned_to_id': assigned_to_id}
    
    response = supabase.table('participants').update(data).eq('id', participant_id).execute()
    
    if not response.data:
        raise Exception(f'Error al actualizar asignación para {participant_id}')
    
    return response.data[0]


# ============== SETTINGS ==============

def get_settings() -> Dict[str, Any]:
    """
    Obtiene la configuración global del sistema
    
    Returns:
        Configuración global
    """
    response = supabase.table('settings').select('*').limit(1).execute()
    
    if not response.data:
        # Si no existe, crear configuración por defecto
        default_settings = {
            'encryption_password_hash': 'default',
            'names_revealed': False,
            'sorteo_completed': False
        }
        create_response = supabase.table('settings').insert(default_settings).execute()
        return create_response.data[0] if create_response.data else default_settings
    
    return response.data[0]


def update_settings(updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Actualiza la configuración global
    
    Args:
        updates: Diccionario con los campos a actualizar
        
    Returns:
        Configuración actualizada
    """
    settings = get_settings()
    settings_id = settings['id']
    
    response = supabase.table('settings').update(updates).eq('id', settings_id).execute()
    
    if not response.data:
        raise Exception('Error al actualizar configuración')
    
    return response.data[0]


# ============== UTILITY FUNCTIONS ==============

def reset_all_assignments() -> None:
    """
    Reinicia todas las asignaciones (útil para testing)
    ADVERTENCIA: Esta función eliminará todas las asignaciones
    """
    supabase.table('participants').update({'assigned_to_id': None}).neq('id', '00000000-0000-0000-0000-000000000000').execute()
    update_settings({'sorteo_completed': False, 'names_revealed': False})


def get_participants_by_category(category: str) -> List[Dict[str, Any]]:
    """
    Obtiene participantes filtrados por categoría
    
    Args:
        category: 'elite' o 'diversion'
        
    Returns:
        Lista de participantes de la categoría especificada
    """
    response = supabase.table('participants').select('*').eq('category', category).execute()
    return response.data


def delete_participant(participant_id: str) -> None:
    """
    Elimina un participante (solo para admin/testing)
    
    Args:
        participant_id: UUID del participante a eliminar
    """
    supabase.table('participants').delete().eq('id', participant_id).execute()
