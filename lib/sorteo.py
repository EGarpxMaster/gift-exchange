"""
Algoritmo de sorteo para asignación de amigos secretos
Garantiza que nadie se toque a sí mismo y no hay intercambios equivalentes
Portado desde TypeScript (sorteo.ts)
"""

import random
from typing import List, Dict, Tuple


def shuffle(array: list) -> list:
    """
    Algoritmo de Fisher-Yates para mezclar aleatoriamente un array
    
    Args:
        array: Lista a mezclar
        
    Returns:
        Lista mezclada
    """
    result = array.copy()
    for i in range(len(result) - 1, 0, -1):
        j = random.randint(0, i)
        result[i], result[j] = result[j], result[i]
    return result


def is_valid_assignment(participants: List[dict], assignments: Dict[str, str]) -> bool:
    """
    Valida que la asignación cumpla las restricciones:
    - Nadie se toca a sí mismo
    - No hay intercambios equivalentes (si A->B, entonces B no puede ser ->A)
    
    Args:
        participants: Lista de participantes con id y category
        assignments: Diccionario {participant_id: assigned_to_id}
        
    Returns:
        True si la asignación es válida
    """
    for participant in participants:
        participant_id = participant['id']
        assigned_to = assignments.get(participant_id)
        
        # No puede tocarse a sí mismo
        if assigned_to == participant_id:
            return False
        
        # No puede haber intercambios equivalentes
        assigned_to_target = assignments.get(assigned_to)
        if assigned_to_target == participant_id:
            return False
    
    return True


def create_valid_assignment(participants: List[dict]) -> Dict[str, str]:
    """
    Crea una asignación circular válida para un grupo de participantes
    Evita ciclos de 2 (A->B, B->A) garantizando un ciclo más largo
    
    Args:
        participants: Lista de participantes con id y category
        
    Returns:
        Diccionario con las asignaciones {participant_id: assigned_to_id}
        
    Raises:
        Exception: Si no se puede generar una asignación válida
    """
    n = len(participants)
    
    if n < 2:
        raise Exception('Se necesitan al menos 2 participantes para el sorteo')
    
    # Para evitar ciclos de 2, creamos un ciclo único que incluye a todos
    # Esto garantiza que si A->B, B nunca apuntará a A directamente
    max_attempts = 1000
    
    for attempt in range(max_attempts):
        shuffled = shuffle(participants)
        assignments = {}
        
        # Crear un ciclo: cada persona apunta a la siguiente, la última apunta a la primera
        for i in range(n):
            next_index = (i + 1) % n
            assignments[shuffled[i]['id']] = shuffled[next_index]['id']
        
        # Validar que no hay ciclos de 2
        if is_valid_assignment(participants, assignments):
            return assignments
    
    raise Exception('No se pudo generar una asignación válida después de múltiples intentos')


def perform_sorteo(elite_participants: List[dict], diversion_participants: List[dict]) -> Dict[str, str]:
    """
    Realiza el sorteo por categoría
    
    Args:
        elite_participants: Lista de participantes de categoría élite
        diversion_participants: Lista de participantes de categoría diversión
        
    Returns:
        Diccionario con todas las asignaciones {participant_id: assigned_to_id}
        
    Raises:
        Exception: Si hay solo 1 participante en alguna categoría
    """
    assignments = {}
    
    # Sorteo para categoría Élite
    if len(elite_participants) >= 2:
        elite_assignments = create_valid_assignment(elite_participants)
        assignments.update(elite_assignments)
    elif len(elite_participants) == 1:
        raise Exception('Solo hay 1 participante en categoría Élite, no se puede asignar')
    
    # Sorteo para categoría Diversión
    if len(diversion_participants) >= 2:
        diversion_assignments = create_valid_assignment(diversion_participants)
        assignments.update(diversion_assignments)
    elif len(diversion_participants) == 1:
        raise Exception('Solo hay 1 participante en categoría Diversión, no se puede asignar')
    
    return assignments


def validate_assignments(participants: List[dict], assignments: Dict[str, str]) -> dict:
    """
    Valida las asignaciones del sorteo y retorna un reporte
    
    Args:
        participants: Lista de todos los participantes
        assignments: Diccionario con las asignaciones
        
    Returns:
        Dict con 'valid' (bool), 'errors' (List[str]) y 'summary' (str)
    """
    errors = []
    
    # Verificar que todos tengan asignación
    for participant in participants:
        if participant['id'] not in assignments:
            errors.append(f"Participante {participant['id']} no tiene asignación")
    
    # Verificar que nadie se toque a sí mismo
    for participant_id, assigned_to_id in assignments.items():
        if participant_id == assigned_to_id:
            errors.append(f"Participante {participant_id} se asignó a sí mismo")
    
    # Verificar que no haya intercambios equivalentes
    for participant_id, assigned_to_id in assignments.items():
        if assignments.get(assigned_to_id) == participant_id:
            errors.append(f"Intercambio equivalente detectado: {participant_id} <-> {assigned_to_id}")
    
    # Verificar que todos los assigned_to_id sean participantes válidos
    participant_ids = {p['id'] for p in participants}
    for participant_id, assigned_to_id in assignments.items():
        if assigned_to_id not in participant_ids:
            errors.append(f"Asignación inválida: {participant_id} -> {assigned_to_id} (no existe)")
    
    # Verificar asignaciones por categoría
    participants_by_id = {p['id']: p for p in participants}
    for participant_id, assigned_to_id in assignments.items():
        if participant_id in participants_by_id and assigned_to_id in participants_by_id:
            if participants_by_id[participant_id]['category'] != participants_by_id[assigned_to_id]['category']:
                errors.append(
                    f"Asignación entre categorías diferentes: {participant_id} ({participants_by_id[participant_id]['category']}) -> "
                    f"{assigned_to_id} ({participants_by_id[assigned_to_id]['category']})"
                )
    
    valid = len(errors) == 0
    summary = f"Validación {'exitosa' if valid else 'fallida'}: {len(assignments)} asignaciones"
    
    return {
        'valid': valid,
        'errors': errors,
        'summary': summary
    }
