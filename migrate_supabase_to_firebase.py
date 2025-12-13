"""
Script de migración de Supabase a Firebase
Migra participantes y configuración desde Supabase a Firebase Firestore

USO:
1. Asegúrate de tener configurados ambos:
   - Variables de Supabase en .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
   - Variables de Firebase en .env (FIREBASE_CREDENTIALS_PATH, FIREBASE_STORAGE_BUCKET)
   
2. Ejecuta: python migrate_supabase_to_firebase.py
"""

import json
from datetime import datetime

print("🔄 Iniciando migración de Supabase a Firebase...")
print()

# Importar clientes
try:
    print("📦 Importando módulos...")
    from lib.supabase_client import (
        get_participants as get_supabase_participants,
        get_settings as get_supabase_settings
    )
    from lib.firebase_client import (
        create_participant,
        update_settings,
        update_participant_assignment,
        get_participants as get_firebase_participants
    )
    print("✅ Módulos importados correctamente")
    print()
except Exception as e:
    print(f"❌ Error al importar módulos: {str(e)}")
    print()
    print("Verifica que:")
    print("1. Las dependencias estén instaladas (pip install -r requirements.txt)")
    print("2. Las variables de entorno estén configuradas en .env")
    exit(1)

def migrate_settings():
    """Migra la configuración global"""
    print("⚙️  Migrando configuración...")
    try:
        supabase_settings = get_supabase_settings()
        
        firebase_settings = {
            'encryption_password_hash': supabase_settings.get('encryption_password_hash', 'default'),
            'names_revealed': supabase_settings.get('names_revealed', False),
            'sorteo_completed': supabase_settings.get('sorteo_completed', False)
        }
        
        update_settings(firebase_settings)
        print(f"   ✅ Configuración migrada: {firebase_settings}")
        return True
    except Exception as e:
        print(f"   ❌ Error al migrar configuración: {str(e)}")
        return False

def migrate_participants():
    """Migra todos los participantes"""
    print()
    print("👥 Migrando participantes...")
    
    try:
        supabase_participants = get_supabase_participants()
        total = len(supabase_participants)
        
        if total == 0:
            print("   ℹ️  No hay participantes para migrar")
            return True, []
        
        print(f"   📊 Total de participantes a migrar: {total}")
        print()
        
        # Mapa de IDs antiguos a nuevos (para mantener asignaciones)
        id_mapping = {}
        migrated_count = 0
        errors = []
        
        # Primera pasada: crear todos los participantes
        for i, participant in enumerate(supabase_participants, 1):
            try:
                old_id = participant['id']
                
                new_participant = create_participant(
                    encrypted_name=participant['encrypted_name'],
                    category=participant['category'],
                    gift_options=participant.get('gift_options', []),
                    password_hash=participant.get('password_hash', ''),
                    gift_images=participant.get('gift_images', [])
                )
                
                new_id = new_participant['id']
                id_mapping[old_id] = new_id
                
                print(f"   ✅ [{i}/{total}] Participante migrado (ID: {old_id[:8]}... → {new_id[:8]}...)")
                migrated_count += 1
                
            except Exception as e:
                error_msg = f"Error en participante {participant.get('encrypted_name', 'desconocido')}: {str(e)}"
                errors.append(error_msg)
                print(f"   ❌ [{i}/{total}] {error_msg}")
        
        print()
        print(f"   📊 Participantes migrados: {migrated_count}/{total}")
        
        # Segunda pasada: actualizar asignaciones
        if migrated_count > 0:
            print()
            print("🔗 Actualizando asignaciones...")
            assignment_count = 0
            
            for participant in supabase_participants:
                old_id = participant['id']
                old_assigned_to = participant.get('assigned_to_id')
                
                if old_assigned_to and old_id in id_mapping and old_assigned_to in id_mapping:
                    try:
                        new_id = id_mapping[old_id]
                        new_assigned_to = id_mapping[old_assigned_to]
                        
                        update_participant_assignment(new_id, new_assigned_to)
                        assignment_count += 1
                        print(f"   ✅ Asignación actualizada: {old_id[:8]}... → {old_assigned_to[:8]}...")
                    except Exception as e:
                        error_msg = f"Error al actualizar asignación: {str(e)}"
                        errors.append(error_msg)
                        print(f"   ❌ {error_msg}")
            
            print()
            print(f"   📊 Asignaciones actualizadas: {assignment_count}")
        
        return migrated_count == total, errors
        
    except Exception as e:
        print(f"   ❌ Error general al migrar participantes: {str(e)}")
        return False, [str(e)]

def verify_migration():
    """Verifica que la migración fue exitosa"""
    print()
    print("🔍 Verificando migración...")
    
    try:
        supabase_participants = get_supabase_participants()
        firebase_participants = get_firebase_participants()
        
        supabase_count = len(supabase_participants)
        firebase_count = len(firebase_participants)
        
        print(f"   Participantes en Supabase: {supabase_count}")
        print(f"   Participantes en Firebase: {firebase_count}")
        
        if supabase_count == firebase_count:
            print("   ✅ Cantidad de participantes coincide")
            return True
        else:
            print(f"   ⚠️  Diferencia de {abs(supabase_count - firebase_count)} participantes")
            return False
            
    except Exception as e:
        print(f"   ❌ Error al verificar: {str(e)}")
        return False

def main():
    """Ejecuta la migración completa"""
    start_time = datetime.now()
    
    print("=" * 60)
    print("   MIGRACIÓN DE SUPABASE A FIREBASE")
    print("=" * 60)
    print()
    
    # Confirmar antes de proceder
    response = input("¿Deseas continuar con la migración? (s/n): ")
    if response.lower() not in ['s', 'si', 'sí', 'y', 'yes']:
        print("❌ Migración cancelada")
        return
    
    print()
    
    # Paso 1: Migrar configuración
    settings_ok = migrate_settings()
    
    # Paso 2: Migrar participantes
    participants_ok, errors = migrate_participants()
    
    # Paso 3: Verificar
    verification_ok = verify_migration()
    
    # Resumen final
    print()
    print("=" * 60)
    print("   RESUMEN DE MIGRACIÓN")
    print("=" * 60)
    print()
    
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    print(f"⏱️  Tiempo total: {duration:.2f} segundos")
    print()
    
    if settings_ok and participants_ok and verification_ok:
        print("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
        print()
        print("Próximos pasos:")
        print("1. Verifica que todo funcione correctamente en Firebase")
        print("2. Actualiza las variables de entorno para usar Firebase")
        print("3. Comenta o elimina las variables de Supabase del .env")
        print("4. Opcional: Mantén Supabase como respaldo por unos días")
    else:
        print("⚠️  MIGRACIÓN COMPLETADA CON ADVERTENCIAS")
        print()
        if errors:
            print("Errores encontrados:")
            for error in errors:
                print(f"  - {error}")
        print()
        print("Recomendaciones:")
        print("1. Revisa los errores anteriores")
        print("2. Verifica manualmente los datos en Firebase Console")
        print("3. Intenta ejecutar nuevamente la migración si es necesario")
    
    print()
    print("=" * 60)

if __name__ == '__main__':
    main()
