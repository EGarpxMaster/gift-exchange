/**
 * Algoritmo de sorteo para asignación de amigos secretos
 * Garantiza que nadie se toque a sí mismo y no hay intercambios equivalentes
 */

interface Participant {
  id: string;
  category: string;
}

/**
 * Algoritmo de Shuffle (Fisher-Yates)
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Valida que la asignación cumpla las restricciones
 */
function isValidAssignment(
  participants: Participant[],
  assignments: Map<string, string>
): boolean {
  for (const participant of participants) {
    const assignedTo = assignments.get(participant.id);
    
    // No puede tocarse a sí mismo
    if (assignedTo === participant.id) {
      return false;
    }
    
    // No puede haber intercambios equivalentes (si A->B, entonces B no puede ser ->A)
    const assignedToTarget = assignments.get(assignedTo!);
    if (assignedToTarget === participant.id) {
      return false;
    }
  }
  
  return true;
}

/**
 * Crea una asignación circular válida
 * Evita ciclos de 2 (A->B, B->A) garantizando un ciclo más largo
 */
function createValidAssignment(participants: Participant[]): Map<string, string> {
  const n = participants.length;
  
  if (n < 2) {
    throw new Error('Se necesitan al menos 2 participantes para el sorteo');
  }
  
  // Para evitar ciclos de 2, creamos un ciclo único que incluye a todos
  // Esto garantiza que si A->B, B nunca apuntará a A directamente
  let attempts = 0;
  const maxAttempts = 1000;
  
  while (attempts < maxAttempts) {
    const shuffled = shuffle(participants);
    const assignments = new Map<string, string>();
    
    // Crear un ciclo: cada persona apunta a la siguiente, la última apunta a la primera
    for (let i = 0; i < n; i++) {
      const nextIndex = (i + 1) % n;
      assignments.set(shuffled[i].id, shuffled[nextIndex].id);
    }
    
    // Validar que no hay ciclos de 2 (esto ya está garantizado por la construcción del ciclo)
    // Pero verificamos por si acaso
    if (isValidAssignment(participants, assignments)) {
      return assignments;
    }
    
    attempts++;
  }
  
  throw new Error('No se pudo generar una asignación válida después de múltiples intentos');
}

/**
 * Realiza el sorteo por categoría
 */
export function performSorteo(
  eliteParticipants: Participant[],
  diversionParticipants: Participant[]
): Map<string, string> {
  const assignments = new Map<string, string>();
  
  // Sorteo para categoría Élite
  if (eliteParticipants.length >= 2) {
    const eliteAssignments = createValidAssignment(eliteParticipants);
    eliteAssignments.forEach((value, key) => assignments.set(key, value));
  } else if (eliteParticipants.length === 1) {
    console.warn('Solo hay 1 participante en categoría Élite, no se puede asignar');
  }
  
  // Sorteo para categoría Diversión
  if (diversionParticipants.length >= 2) {
    const diversionAssignments = createValidAssignment(diversionParticipants);
    diversionAssignments.forEach((value, key) => assignments.set(key, value));
  } else if (diversionParticipants.length === 1) {
    console.warn('Solo hay 1 participante en categoría Diversión, no se puede asignar');
  }
  
  return assignments;
}

/**
 * Verifica que todas las asignaciones sean válidas
 */
export function validateAssignments(
  participants: Participant[],
  assignments: Map<string, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const assignedTo = new Set<string>();
  
  for (const participant of participants) {
    const target = assignments.get(participant.id);
    
    if (!target) {
      errors.push(`Participante ${participant.id} no tiene asignación`);
      continue;
    }
    
    // Verificar que no se asigne a sí mismo
    if (target === participant.id) {
      errors.push(`Participante ${participant.id} está asignado a sí mismo`);
    }
    
    // Verificar que el objetivo existe
    const targetExists = participants.find(p => p.id === target);
    if (!targetExists) {
      errors.push(`El objetivo ${target} no existe`);
    }
    
    // Verificar categorías coinciden
    if (targetExists && targetExists.category !== participant.category) {
      errors.push(`Participante ${participant.id} y su objetivo ${target} tienen diferentes categorías`);
    }
    
    assignedTo.add(target);
  }
  
  // Verificar que todos reciban regalo (en su categoría)
  const categoryCounts = new Map<string, { total: number; receiving: number }>();
  
  for (const participant of participants) {
    const category = participant.category;
    if (!categoryCounts.has(category)) {
      categoryCounts.set(category, { total: 0, receiving: 0 });
    }
    const counts = categoryCounts.get(category)!;
    counts.total++;
    
    if (assignedTo.has(participant.id)) {
      counts.receiving++;
    }
  }
  
  categoryCounts.forEach((counts, category) => {
    if (counts.total !== counts.receiving && counts.total > 1) {
      errors.push(`En categoría ${category}: ${counts.total} participantes pero solo ${counts.receiving} recibirán regalo`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
