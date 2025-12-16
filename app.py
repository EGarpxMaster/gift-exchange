import streamlit as st
from datetime import datetime, date
import json
from typing import Optional
import base64
import pandas as pd
import pytz

# --- Sorteo automático al cerrar registro ---
# --- Sorteo automático al cerrar registro (SOLO DIVERSIÓN) ---
def auto_run_sorteo():
    try:
        tz = pytz.timezone('America/Bogota')
        # FECHA SORTEO: 16 de Diciembre a las 10:40
        sorteo_time = tz.localize(datetime(2025, 12, 16, 15, 5, 0))
        now_utc = datetime.now(pytz.utc)
        now = now_utc.astimezone(tz)
        
        try:
            from lib.appwrite_client import get_settings, get_participants, update_settings, update_participant_assignment
            from lib.sorteo import perform_sorteo, validate_assignments
            
            settings = get_settings()
            
            # Ejecutar solo si no se ha hecho y ya es la fecha
            if not settings.get('sorteo_completed', False) and now >= sorteo_time:
                participants = get_participants()
                
                # REGLA: Ignorar categoría Élite (se queda como está)
                elite_parts = [] 
                # REGLA: Procesar solo categoría Diversión
                div_parts = [{'id': p['id'], 'category': p['category']} for p in participants if p['category'] == 'diversion']
                
                if len(div_parts) >= 2:
                    try:
                        assignments = perform_sorteo(elite_parts, div_parts)
                        
                        # Validar solo los participantes de diversión porque los elite fueron excluidos
                        validation = validate_assignments(div_parts, assignments)
                        
                        if validation['valid']:
                            for participant_id, assigned_to_id in assignments.items():
                                update_participant_assignment(participant_id, assigned_to_id)
                            
                            update_settings({'sorteo_completed': True})
                            print('✅ Sorteo realizado automáticamente (Solo Categoría Diversión)')
                        else:
                            print('❌ Validación falló:', validation['errors'])
                    except Exception as e:
                        print('❌ Error en sorteo automático:', str(e))
                else:
                    print('No hay suficientes participantes en diversión para sorteo automático')
        except Exception:
            pass
    except Exception as e:
        print(f"Error en auto_run: {e}")


def show_register():
    """Formulario de registro con validación de fechas diferenciada"""
    import pytz
    tz = pytz.timezone('America/Bogota')
    
    start_date = tz.localize(datetime(2025, 12, 4, 0, 0, 0))
    
    # FECHA LÍMITE GLOBAL (Diversión): 16 de Diciembre 15:00
    end_date_global = tz.localize(datetime(2025, 12, 16, 15, 0, 0))
    
    # FECHA LÍMITE ÉLITE: 15 de Diciembre 23:59
    limit_elite = tz.localize(datetime(2025, 12, 15, 23, 59, 0))
    
    now_utc = datetime.now(pytz.utc)
    current_date = now_utc.astimezone(tz)
    
    # Validar si el registro global sigue abierto
    is_open = start_date <= current_date <= end_date_global
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if not is_open:
            st.markdown(f"""
            <div style="background: rgba(255, 255, 255, 0.95); padding: 3rem; border-radius: 16px; 
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); text-align: center;
                        border-top: 4px solid #16a34a; border-bottom: 4px solid #dc2626;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
                <h3 style="color: #dc2626; margin-bottom: 1rem;">Registro Cerrado</h3>
                <p style="color: #4b5563;">Las inscripciones han finalizado.</p>
                <p style="color: #6b7280; margin-top: 1rem;">
                    Fecha actual: {current_date.strftime('%d/%m/%Y %H:%M:%S')}
                </p>
            </div>
            """, unsafe_allow_html=True)
            if st.button("⬅️ Volver al inicio", key="back_closed"):
                st.session_state.view = 'home'
                st.rerun()
            return
        
        with st.form("registration_form"):
            st.markdown("""
            <div>
                <h1 style="text-align: center; color: #dc2626; margin-bottom: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); font-size: 2.5rem;">
                    🎁 Registro
                </h1>
            </div>
            """, unsafe_allow_html=True)
            
            st.write("")
            st.markdown("### 👤 Información Personal")
            name = st.text_input("Nombre Completo", placeholder="Ej. Juan Pérez")
            st.caption("⚠️ Tu nombre será encriptado")
            
            password = st.text_input("Contraseña", type="password", placeholder="Mínimo 6 caracteres")
            password_confirm = st.text_input("Confirmar Contraseña", type="password")
            
            st.markdown("### 💰 Categoría")
            category = st.radio(
                "Selecciona tu categoría:",
                options=["elite", "diversion"],
                format_func=lambda x: "💎 Élite ($1,000 MXN)" if x == "elite" else "🎉 Diversión ($500 MXN)"
            )
            
            # --- VALIDACIÓN VISUAL DE FECHA ÉLITE ---
            if category == 'elite' and current_date > limit_elite:
                st.warning("⚠️ El registro para la categoría Élite cerró el 15 de diciembre. Por favor selecciona Diversión.")
            
            st.markdown("### 🎁 Lista de Deseos (Mínimo 5)")
            gift_options = []
            uploaded_images = []
            for i in range(7):
                col_gift, col_link = st.columns([2, 1])
                with col_gift:
                    gift = st.text_input(f"Opción {i+1}", key=f"gift_{i}", placeholder="Ej. Libro, Juego...", label_visibility="visible" if i<5 else "collapsed")
                with col_link:
                    link = st.text_input("Link", key=f"link_{i}", placeholder="https://...", label_visibility="visible" if i<5 else "collapsed")
                
                uploaded_file = st.file_uploader(f"Imagen {i+1}", type=['png', 'jpg', 'jpeg', 'webp'], key=f"img_{i}", label_visibility="collapsed")
                uploaded_images.append(uploaded_file)
                
                if gift.strip():
                    entry = gift.strip()
                    if link.strip(): entry += f" | {link.strip()}"
                    gift_options.append(entry)
            
            st.write("")
            col1, col2 = st.columns(2)
            with col1:
                submit = st.form_submit_button("✅ Registrarse", use_container_width=True)
            with col2:
                back = st.form_submit_button("⬅️ Volver", use_container_width=True, type="secondary")
            
            if back:
                st.session_state.view = 'home'
                st.rerun()
            
            if submit:
                # --- VALIDACIÓN LÓGICA DE BLOQUEO ÉLITE ---
                if category == 'elite' and current_date > limit_elite:
                    st.error("❌ El registro para Categoría Élite cerró el 15 de diciembre. Solo está disponible Diversión.")
                elif not name.strip():
                    st.error("Ingresa tu nombre.")
                elif len(password) < 6 or password != password_confirm:
                    st.error("Verifica tu contraseña (mínimo 6 caracteres).")
                elif len(gift_options) < 3:
                    st.error("Agrega al menos 3 opciones.")
                else:
                    try:
                        with st.spinner("Registrando..."):
                            encrypted_name = encrypt(name.strip(), DEFAULT_ENCRYPTION_PASSWORD)
                            if check_name_exists(encrypted_name):
                                st.error("Ya existe un registro con este nombre.")
                            else:
                                pwd_hash = hash_password(password)
                                participant = create_participant(encrypted_name, category, gift_options, pwd_hash)
                                p_id = participant['id']
                                
                                # Subir imágenes
                                img_urls = []
                                for idx, f in enumerate(uploaded_images):
                                    if f and idx < len(gift_options):
                                        try:
                                            from lib.appwrite_client import upload_gift_image
                                            url = upload_gift_image(p_id, idx, f, f.name)
                                            img_urls.append(url)
                                        except:
                                            img_urls.append(None)
                                    else:
                                        img_urls.append(None)

                                databases.update_document(
                                    database_id=APPWRITE_DATABASE_ID,
                                    collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
                                    document_id=p_id,
                                    data={"gift_images": img_urls}
                                )

                                st.session_state.participant_id = p_id
                                st.success("✅ ¡Registro exitoso!")
                                st.balloons()
                                st.session_state.view = 'dashboard'
                                st.rerun()
                    except Exception as e:
                        st.error(f"Error al registrar: {e}")


# Configurar la página
st.set_page_config(
    page_title="🎄 Intercambio de Regalos 2025",
    page_icon="🎁",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Importar módulos locales
from lib.encryption import encrypt, decrypt, hash_password, verify_password
from lib.sorteo import perform_sorteo, validate_assignments
from lib.appwrite_client import (
    get_participant_by_id,
    create_participant,
    check_name_exists,
    get_participants,
    get_settings,
    update_settings,
    update_participant_assignment,
    upload_gift_image,
    databases, 
    APPWRITE_DATABASE_ID, 
    APPWRITE_PARTICIPANTS_COLLECTION_ID
)

# Contraseña por defecto
DEFAULT_ENCRYPTION_PASSWORD = 'GiftExchange2025!'

# Función para reproducir música de fondo
def add_bg_music():
    """Agregar música de fondo navideña con botón de control para móviles"""
    # Primero agregar el contenedor y botón visual
    st.markdown("""
    <div id="musicContainer" style="position: fixed; bottom: 20px; left: 20px; z-index: 999999;">
        <audio id="xmasMusic" loop preload="auto">
            <source src="https://raw.githubusercontent.com/EGarpxMaster/gift-exchange/main/music/Whispering%20Snowfall.mp3" type="audio/mpeg">
        </audio>
        <button id="musicBtn" style="
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            border: 2px solid #fbbf24;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
            animation: glow 2s ease-in-out infinite;
            outline: none;
        ">🎵</button>
    </div>
    <style>
        @keyframes glow {
            0%, 100% { box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4); }
            50% { box-shadow: 0 4px 25px rgba(220, 38, 38, 0.8); }
        }
        #musicBtn:active {
            transform: scale(0.9);
        }
    </style>
    """, unsafe_allow_html=True)
    
    # Luego agregar el JavaScript funcional con componente
    js_code = """
    <script>
        (function() {
            function initMusic() {
                var audio = parent.document.getElementById('xmasMusic');
                var btn = parent.document.getElementById('musicBtn');
                
                if (!audio || !btn) {
                    setTimeout(initMusic, 100);
                    return;
                }
                
                function toggleMusic() {
                    if (audio.paused) {
                        audio.volume = 0.5;
                        audio.play().then(function() {
                            btn.innerHTML = '🔊';
                        }).catch(function(err) {
                            console.error('Play error:', err);
                        });
                    } else {
                        audio.pause();
                        btn.innerHTML = '🎵';
                    }
                }
                
                btn.onclick = toggleMusic;
                btn.ontouchend = function(e) {
                    e.preventDefault();
                    toggleMusic();
                };
                
                // Autoplay en desktop
                if (!/Mobi|Android/i.test(navigator.userAgent)) {
                    setTimeout(function() {
                        audio.volume = 0.5;
                        audio.play().then(function() {
                            btn.innerHTML = '🔊';
                        }).catch(function() {});
                    }, 1500);
                }
            }
            
            initMusic();
        })();
    </script>
    """
    
    st.components.v1.html(js_code, height=0)

# Función para agregar imagen de fondo
def add_bg_image():
    """Agregar imagen de fondo navideña"""
    try:
        with open('images/christmas-background.jpg', 'rb') as img_file:
            img_bytes = img_file.read()
            img_base64 = base64.b64encode(img_bytes).decode()
            st.markdown(f"""
            <style>
                .stApp {{
                    background-image: url("data:image/jpg;base64,{img_base64}");
                    background-size: cover;
                    background-position: center;
                    background-attachment: fixed;
                    background-repeat: no-repeat;
                }}
                .stApp::before {{
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: -1;
                }}
            </style>
            """, unsafe_allow_html=True)
    except:
        pass  # Si no existe la imagen, usar fondo por defecto

# Aplicar música y fondo
add_bg_music()
add_bg_image()

# CSS personalizado para el tema navideño con animaciones
st.markdown("""
<style>
    /* Efecto de nieve cayendo */
    @keyframes snowfall {
        0% { 
            transform: translateY(-10vh) translateX(0);
            opacity: 1;
        }
        100% { 
            transform: translateY(100vh) translateX(100px);
            opacity: 0.3;
        }
    }
    
    .snowflake {
        position: fixed;
        color: white;
        font-size: 1em;
        font-family: Arial;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
        z-index: 9999;
        pointer-events: none;
    }
    
    /* Generar copos de nieve */
    .snowflake:nth-child(1) { left: 10%; animation: snowfall 8s linear infinite; animation-delay: 0s; }
    .snowflake:nth-child(2) { left: 20%; animation: snowfall 10s linear infinite; animation-delay: 1s; }
    .snowflake:nth-child(3) { left: 30%; animation: snowfall 12s linear infinite; animation-delay: 2s; }
    .snowflake:nth-child(4) { left: 40%; animation: snowfall 9s linear infinite; animation-delay: 3s; }
    .snowflake:nth-child(5) { left: 50%; animation: snowfall 11s linear infinite; animation-delay: 4s; }
    .snowflake:nth-child(6) { left: 60%; animation: snowfall 8s linear infinite; animation-delay: 5s; }
    .snowflake:nth-child(7) { left: 70%; animation: snowfall 10s linear infinite; animation-delay: 6s; }
    .snowflake:nth-child(8) { left: 80%; animation: snowfall 12s linear infinite; animation-delay: 7s; }
    .snowflake:nth-child(9) { left: 90%; animation: snowfall 9s linear infinite; animation-delay: 8s; }
    
    /* Botones con efecto navideño */
    .stButton>button,
    .stFormSubmitButton>button {
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        color: white;
        border-radius: 12px;
        padding: 0.75rem 2rem;
        font-weight: bold;
        border: 2px solid #fbbf24;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
        animation: glow 2s ease-in-out infinite;
    }
    
    .stButton>button:hover,
    .stFormSubmitButton>button:hover {
        background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
        transform: scale(1.05) translateY(-2px);
        box-shadow: 0 6px 20px rgba(220, 38, 38, 0.6);
    }
    
    /* Botones secundarios también en rojo */
    .stButton>button[kind="secondary"],
    .stFormSubmitButton>button[kind="secondary"] {
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        border: 2px solid #fbbf24;
        animation: glow 2s ease-in-out infinite;
    }
    
    .stButton>button[kind="secondary"]:hover,
    .stFormSubmitButton>button[kind="secondary"]:hover {
        background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
    }
    
    @keyframes glow {
        0%, 100% { box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4); }
        50% { box-shadow: 0 4px 25px rgba(220, 38, 38, 0.8); }
    }
    
    /* Tarjetas con tema navideño */
    .gift-card {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border-top: 4px solid #16a34a;
        border-bottom: 4px solid #dc2626;
        margin: 1rem 0;
        backdrop-filter: blur(10px);
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    /* Badges con brillo */
    .elite-badge {
        background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
        color: #92400e;
        padding: 0.35rem 1rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(252, 211, 77, 0.5);
        animation: shimmer 3s ease-in-out infinite;
        display: inline-block;
    }
    
    .diversion-badge {
        background: linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%);
        color: #065f46;
        padding: 0.35rem 1rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(110, 231, 183, 0.5);
        animation: shimmer 3s ease-in-out infinite;
        display: inline-block;
    }
    
    @keyframes shimmer {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.85; }
    }
    
    /* Título con efecto navideño */
    .header-title {
        color: #ffffff;
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        margin-bottom: 1rem;
        text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8),
                     0 0 20px rgba(220, 38, 38, 0.6),
                     0 0 30px rgba(255, 255, 255, 0.5);
        animation: twinkle 2s ease-in-out infinite;
    }
    
    @keyframes twinkle {
        0%, 100% { text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8), 0 0 20px rgba(220, 38, 38, 0.6); }
        50% { text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8), 0 0 40px rgba(220, 38, 38, 1); }
    }
    
    /* Ocultar elementos innecesarios */
    .stDeployButton {
        display: none;
    }
    
    header[data-testid="stHeader"] {
        background: transparent;
    }
    
    /* Contenedores con fondo semi-transparente solo cuando tienen contenido */
    div[data-testid="stVerticalBlock"] > div:has(> div > div > p),
    div[data-testid="stVerticalBlock"] > div:has(> div > div > h1),
    div[data-testid="stVerticalBlock"] > div:has(> div > div > h2),
    div[data-testid="stVerticalBlock"] > div:has(> div > div > h3) {
        background: rgba(255, 255, 255, 0.95);
        padding: 1.5rem;
        border-radius: 12px;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        margin: 0.5rem 0;
    }
    
    /* Inputs con estilo navideño */
    .stTextInput>div>div>input,
    .stSelectbox>div>div>select {
        background: rgba(255, 255, 255, 0.98) !important;
        border-radius: 8px;
        border: 2px solid #16a34a !important;
        transition: all 0.3s;
        padding: 0.6rem 1rem;
    }
    
    .stTextInput>div>div>input:focus,
    .stSelectbox>div>div>select:focus {
        border-color: #dc2626 !important;
        box-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
    }
    
    /* Radio buttons */
    .stRadio > div {
        background: transparent;
        padding: 1rem;
        border-radius: 8px;
    }
    
    .stRadio > div > label {
        font-size: 1.1rem !important;
        padding: 0.5rem 0;
    }
    
    .stRadio [role="radiogroup"] label {
        font-size: 1.15rem !important;
        padding: 0.75rem 1rem;
        margin: 0.5rem 0;
    }
    
    /* Labels */
    .stTextInput label,
    .stSelectbox label,
    .stRadio label {
        color: #1f2937 !important;
        font-weight: 600;
        font-size: 1rem;
    }
    
    /* Expander */
    .streamlit-expanderHeader {
        background: rgba(255, 255, 255, 0.9);
        border-radius: 8px;
        font-weight: 600;
    }
    
    /* Forms */
    .stForm {
        background: rgba(255, 255, 255, 0.95);
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border-top: 4px solid #16a34a;
        border-bottom: 4px solid #dc2626;
        backdrop-filter: blur(10px);
    }
    
    /* Divisores */
    hr {
        margin: 1.5rem 0;
        border: none;
        border-top: 2px solid rgba(22, 163, 74, 0.3);
    }
</style>

<div class="snowflake">❄</div>
<div class="snowflake">❅</div>
<div class="snowflake">❆</div>
<div class="snowflake">❄</div>
<div class="snowflake">❅</div>
<div class="snowflake">❆</div>
<div class="snowflake">❄</div>
<div class="snowflake">❅</div>
<div class="snowflake">❆</div>
""", unsafe_allow_html=True)

# Inicializar estado de sesión
if 'participant_id' not in st.session_state:
    st.session_state.participant_id = None
if 'view' not in st.session_state:
    # Verificar si hay parámetro admin en la URL
    query_params = st.query_params
    if 'admin' in query_params and query_params['admin'] == 'true':
        st.session_state.view = 'admin'
    else:
        st.session_state.view = 'home'
if 'simulated_date' not in st.session_state:
    st.session_state.simulated_date = datetime.now()


def show_home():
    """Pantalla de inicio con carta navideña"""
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown("""
        <div style="background: rgba(255, 255, 255, 0.95); padding: 2.5rem; border-radius: 16px; 
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); border-top: 4px solid #16a34a; 
                    border-bottom: 4px solid #dc2626; backdrop-filter: blur(10px);">
            <h1 style="color: #dc2626; text-align: center; margin-bottom: 1.5rem; font-size: 2.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                🎄 Intercambio de Regalos 2025 🎁
            </h1>
            <p style="text-align: center; color: #4b5563; font-size: 1rem; margin-bottom: 1.5rem; line-height: 1.6;">
                ¡Queremos dar la bienvenida al Año Nuevo 2026 de una manera muy especial y llena de sorpresas!
                <br><br>
                Están cordialmente invitados a participar en nuestro tradicional Intercambio de Regalos el próximo 24 de diciembre de 2025. Es la oportunidad perfecta para compartir alegría antes de que el reloj marque las doce.
            </p>
            <hr style="border: 1px solid #e5e7eb; margin: 1.5rem 0;">
            <h3 style="color: #16a34a; margin-top: 1.5rem; margin-bottom: 1rem;">🌟 Secciones de Intercambio (Tú Eliges tu Experiencia)</h3>
            <p style="color: #4b5563; font-size: 0.95rem; margin-bottom: 1rem;">Para asegurar que todos reciban un regalo increíble, tendremos dos categorías de participación:</p>
            <div style="background: rgba(22, 163, 74, 0.1); padding: 1.5rem; border-left: 4px solid #16a34a; margin-bottom: 1.5rem; border-radius: 8px;">
                <h4 style="color: #16a34a; margin-top: 0;">💎 Categoría Élite - $1,000 MXN:</h4>
                <ul style="color: #4b5563; font-size: 0.95rem; margin: 0.5rem 0; padding-left: 1.5rem;">
                    <li><strong>Monto Sugerido:</strong> $1,000 pesos mexicanos.</li>
                    <li><strong>Participantes:</strong> Especialmente diseñada para Adultos.</li>
                </ul>
            </div>
            <div style="background: rgba(220, 38, 38, 0.1); padding: 1.5rem; border-left: 4px solid #dc2626; margin-bottom: 1.5rem; border-radius: 8px;">
                <h4 style="color: #dc2626; margin-top: 0;">🎉 Categoría Diversión - $500 MXN:</h4>
                <ul style="color: #4b5563; font-size: 0.95rem; margin: 0.5rem 0; padding-left: 1.5rem;">
                    <li><strong>Monto Sugerido:</strong> $500 pesos mexicanos.</li>
                    <li><strong>Participantes:</strong> Dedicada a los Niños.</li>
                </ul>
            </div>
            <div style="background: rgba(251, 191, 36, 0.1); padding: 1.5rem; border-left: 4px solid #fbbf24; margin-bottom: 1.5rem; border-radius: 8px;">
                <p style="color: #92400e; font-size: 0.95rem; margin: 0;"><strong>📝 Nota para Adultos:</strong> Si por alguna razón la participación en la categoría de $1,000 pesos no es posible, ¡no se preocupen! Simplemente comuníquenoslo y con gusto los asignaremos a la categoría de $500 pesos, ¡lo importante es que todos participen!</p>
            </div>
            <hr style="border: 1px solid #e5e7eb; margin: 1.5rem 0;">
            <h3 style="color: #16a34a; margin-top: 1.5rem; margin-bottom: 1rem;">💻 El Secreto Mejor Guardado: El Sistema de Emmanuel</h3>
            <p style="color: #4b5563; font-size: 0.95rem; margin-bottom: 1rem;">¡Hemos creado un método infalible para garantizar que la sorpresa sea total!</p>
            <ol style="color: #4b5563; font-size: 0.95rem; margin-left: 1.5rem; line-height: 1.8;">
                <li><strong>Paso 1:</strong> Emmanuel está creando un programa especial.</li>
                <li><strong>Paso 2:</strong> Cada participante deberá anexar una lista de 5 o más ideas de regalo que le gustaría recibir.</li>
                <li><strong>Paso 3:</strong> El programa hará la "rifa" en secreto, y solo les dirá qué quiere la persona que les tocó regalar.</li>
            </ol>
            <p style="color: #4b5563; font-size: 0.95rem; margin-top: 1.5rem; line-height: 1.6;">De esta manera, nadie sabrá quién le regala, asegurando que la revelación del 24 de diciembre sea una maravillosa sorpresa para todos.</p>
            <hr style="border: 1px solid #e5e7eb; margin: 1.5rem 0;">
            <h3 style="color: #16a34a; margin-top: 1.5rem; margin-bottom: 1rem;">📋 Cronograma:</h3>
            <ul style="color: #4b5563; line-height: 2; font-size: 0.95rem; margin-left: 1.5rem;">
                <li>✨ <strong>Registro:</strong> Del 04 de diciembre al 16 de diciembre, 15:00 hrs (GMT-5)</li>
                <li>🎲 <strong>Sorteo:</strong> Se realizará el 16 de diciembre a las 15:00 hrs (GMT-5)</li>
                <li>🎁 <strong>Revelación:</strong> 24 de diciembre a medianoche</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
        
        st.write("")
        col_btn1, col_btn2 = st.columns(2)
        with col_btn1:
            if st.button("🎁 Registrarse", use_container_width=True, key="btn_register"):
                st.session_state.view = 'register'
                st.rerun()
        with col_btn2:
            if st.button("🔑 Ya estoy registrado", use_container_width=True, key="btn_login"):
                st.session_state.view = 'dashboard'
                st.rerun()


def show_register():
    """Formulario de registro"""
    import pytz
    tz = pytz.timezone('America/Bogota')  # GMT-5 sin horario de verano
    start_date = tz.localize(datetime(2025, 12, 4, 0, 0, 0))
    end_date = tz.localize(datetime(2025, 12, 16, 15, 0, 0))  # 16 dic 2025, 15:00 GMT-5
    now_utc = datetime.now(pytz.utc)
    current_date = now_utc.astimezone(tz)
    is_open = start_date <= current_date <= end_date
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if not is_open:
            st.markdown(f"""
            <div style="background: rgba(255, 255, 255, 0.95); padding: 3rem; border-radius: 16px; 
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); text-align: center;
                        border-top: 4px solid #16a34a; border-bottom: 4px solid #dc2626;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
                <h3 style="color: #dc2626; margin-bottom: 1rem;">Registro Cerrado</h3>
                <p style="color: #4b5563; font-size: 1.1rem;">
                    Las inscripciones solo están disponibles del 04 de diciembre al 16 de diciembre, 15:00 hrs (GMT-5).
                </p>
                <p style="color: #6b7280; margin-top: 1rem;">
                    Fecha y hora actual: {current_date.strftime('%d/%m/%Y %H:%M:%S')} (GMT-5)
                </p>
            </div>
            """, unsafe_allow_html=True)
            st.write("")
            if st.button("⬅️ Volver al inicio", key="back_closed"):
                st.session_state.view = 'home'
                st.rerun()
            return
        
        with st.form("registration_form"):
            st.markdown("""
            <div>
                <h1 style="text-align: center; color: #dc2626; margin-bottom: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); font-size: 2.5rem;">
                    🎁 Registro de Participante
                </h1>
            </div>
            """, unsafe_allow_html=True)
            
            st.write("")
            
            st.markdown("### 👤 Información Personal")
            name = st.text_input("Nombre Completo", placeholder="Ej. Juan Pérez", key="name_input")
            st.caption("⚠️ Tu nombre será encriptado para mantener el secreto hasta el 24 de diciembre")
            
            password = st.text_input("Contraseña Secreta", type="password", placeholder="Mínimo 6 caracteres", key="password_input")
            password_confirm = st.text_input("Confirmar Contraseña", type="password", placeholder="Repite tu contraseña", key="password_confirm_input")
            st.caption("🔐 Usarás esta contraseña para acceder a tu dashboard y ver tu asignación")
            
            st.markdown("### 💰 Categoría")
            category = st.radio(
                "Selecciona tu categoría:",
                options=["elite", "diversion"],
                format_func=lambda x: "💎 Élite ($1,000 MXN)" if x == "elite" else "🎉 Diversión ($500 MXN)",
                key="category_radio"
            )
            
            st.markdown("### 🎁 Lista de Deseos (Mínimo 5 opciones)")
            gift_options = []
            uploaded_images = []
            for i in range(7):
                col_gift, col_link = st.columns([2, 1])
                with col_gift:
                    gift = st.text_input(
                        f"Opción {i+1}", 
                        key=f"gift_{i}", 
                        placeholder="Ej. Libro, Juego, Gadget...",
                        label_visibility="visible" if i < 5 else "collapsed"
                    )
                with col_link:
                    link = st.text_input(
                        "Link (opcional)" if i < 5 else "Link",
                        key=f"link_{i}",
                        placeholder="Ej. https://...",
                        label_visibility="visible" if i < 5 else "collapsed"
                    )
                
                # Agregar opción de subir imagen (siempre visible)
                uploaded_file = st.file_uploader(
                    f"📷 Imagen de referencia (opcional) - Opción {i+1}",
                    type=['png', 'jpg', 'jpeg', 'webp'],
                    key=f"img_{i}",
                    label_visibility="visible" if i < 5 else "collapsed"
                )
                uploaded_images.append(uploaded_file)
                
                if gift.strip():
                    gift_entry = gift.strip()
                    if link.strip():
                        gift_entry += f" | {link.strip()}"
                    gift_options.append(gift_entry)
            
            st.write("")
            col1, col2 = st.columns(2)
            with col1:
                submit = st.form_submit_button("✅ Registrarse", use_container_width=True)
            with col2:
                back = st.form_submit_button("⬅️ Volver", use_container_width=True, type="secondary")
            
            if back:
                st.session_state.view = 'home'
                st.rerun()
            
            if submit:
                # Validaciones
                if not name.strip():
                    st.error("Por favor ingresa tu nombre completo.")
                elif not password or len(password) < 6:
                    st.error("La contraseña debe tener al menos 6 caracteres.")
                elif password != password_confirm:
                    st.error("Las contraseñas no coinciden.")
                elif len(gift_options) < 3:
                    st.error(f"Por favor agrega al menos 3 opciones de regalo. Tienes {len(gift_options)}.")
                else:
                    try:
                        with st.spinner("Registrando..."):
                            # Encriptar nombre
                            encrypted_name = encrypt(name.strip(), DEFAULT_ENCRYPTION_PASSWORD)
                            
                            # Hash de contraseña
                            password_hash = hash_password(password)
                            
                            # Verificar si ya existe
                            if check_name_exists(encrypted_name):
                                st.error("Ya existe un registro con este nombre.")
                            else:
                                # Crear participante primero
                                participant = create_participant(encrypted_name, category, gift_options, password_hash)
                                participant_id = participant['id']
                                
                                # Subir imágenes si existen
                                gift_image_urls = []
                                for idx, uploaded_file in enumerate(uploaded_images):
                                    if uploaded_file is not None and idx < len(gift_options):
                                        try:
                                            # Se usa importación tardía para evitar problemas circulares si ocurren
                                            from lib.appwrite_client import upload_gift_image
                                            if uploaded_file is not None and hasattr(uploaded_file, 'read') and hasattr(uploaded_file, 'name'):
                                                image_url = upload_gift_image(participant_id, idx, uploaded_file, uploaded_file.name)
                                            else:
                                                image_url = None
                                            gift_image_urls.append(image_url)
                                        except Exception as img_error:
                                            st.warning(f"No se pudo subir la imagen {idx+1}: {str(img_error)}")
                                            gift_image_urls.append(None)
                                    else:
                                        gift_image_urls.append(None)

                                # Actualizar participante con las URLs de imágenes
                                from lib.appwrite_client import databases, APPWRITE_DATABASE_ID, APPWRITE_PARTICIPANTS_COLLECTION_ID
                                databases.update_document(
                                    database_id=APPWRITE_DATABASE_ID,
                                    collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
                                    document_id=participant_id,
                                    data={"gift_images": gift_image_urls}
                                )

                                st.session_state.participant_id = participant_id
                                st.session_state.participant_name = encrypted_name
                                st.success("✅ ¡Registro exitoso!")
                                st.balloons()
                                st.session_state.view = 'dashboard'
                                st.rerun()
                    except Exception as e:
                        st.error(f"Error al registrar: {str(e)}")


def show_dashboard():
    """Dashboard del participante"""
    
    # --- ESTILOS CSS ESPECÍFICOS PARA EL DASHBOARD Y LOGIN ---
    # Aplica el ancho 75% desktop / 95% mobile a la tarjeta del formulario
    st.markdown("""
    <style>
        /* Estilo unificado para la tarjeta del formulario */
        [data-testid="stForm"] {
            background: rgba(255, 255, 255, 0.95);
            padding: 2.5rem;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border-top: 4px solid #16a34a;
            border-bottom: 4px solid #dc2626;
            backdrop-filter: blur(10px);
            margin: 0 auto; /* Centrar */
        }
        
        /* Media Query para Desktop */
        @media (min-width: 769px) {
            [data-testid="stForm"] {
                width: 75% !important;
            }
        }
        
        /* Media Query para Móviles */
        @media (max-width: 768px) {
            [data-testid="stForm"] {
                width: 95% !important;
                padding: 1.5rem;
            }
        }
        
        /* Ajuste para etiquetas */
        .stTextInput label {
            font-weight: bold;
        }
        
        /* Separación entre botones */
        div.stButton > button {
            margin-top: 10px;
        }
    </style>
    """, unsafe_allow_html=True)

    # ---------------------------------------------------------
    # 1. INICIO DE SESIÓN
    # ---------------------------------------------------------
    if not st.session_state.participant_id:
        col1, col2, col3 = st.columns([1, 2, 1]) # Columnas para centrar en la grid general
        with col2:
            with st.form("login_form"):
                st.markdown("""
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <h1 style="color: #dc2626; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); font-size: 2.5rem;">
                        🔑 Inicio de Sesión
                        </h1>
                    </div>
                """, unsafe_allow_html=True)
                
                login_name = st.text_input("Nombre Completo")
                login_password = st.text_input("Contraseña", type="password")
                
                st.write("") # Espacio
                
                # Botones dentro del formulario
                btn_enter = st.form_submit_button("Entrar", use_container_width=True)
                btn_back = st.form_submit_button("⬅️ Volver", type="secondary", use_container_width=True)
                
                if btn_enter:
                    try:
                        participants = get_participants()
                        found = False
                        for p in participants:
                            try:
                                db_name = decrypt(p['encrypted_name'], DEFAULT_ENCRYPTION_PASSWORD)
                                if db_name.lower().strip() == login_name.lower().strip():
                                    if verify_password(login_password, p['password_hash']):
                                        st.session_state.participant_id = p['id']
                                        found = True
                                        break
                            except:
                                continue
                        
                        if found:
                            st.success("¡Bienvenido!")
                            st.rerun()
                        else:
                            st.error("Credenciales incorrectas")
                    except Exception as e:
                        st.error(f"Error login: {e}")
                
                if btn_back:
                    st.session_state.view = 'home'
                    st.rerun()

    # ---------------------------------------------------------
    # 2. DASHBOARD VISUALIZACIÓN
    # ---------------------------------------------------------
    else:
        try:
            user_data = get_participant_by_id(st.session_state.participant_id)
            settings = get_settings()
            
            try:
                decrypted_name = decrypt(user_data['encrypted_name'], DEFAULT_ENCRYPTION_PASSWORD)
            except:
                decrypted_name = "Participante"

            # Preparar datos para tabla
            my_gift_options = user_data.get('gift_options', [])
            my_gift_images = user_data.get('gift_images', [])
            
            table_data = []
            for idx in range(7):
                gift_text, link_text, img_url = "", "", None
                if idx < len(my_gift_options):
                    parts = my_gift_options[idx].split("|")
                    gift_text = parts[0].strip()
                    if len(parts) > 1: link_text = parts[1].strip()
                if my_gift_images and idx < len(my_gift_images):
                    img_url = my_gift_images[idx]
                
                table_data.append({"Opción": gift_text, "Link": link_text, "Imagen": img_url})
            
            df = pd.DataFrame(table_data)

            with st.form("dashboard_form"):
                # --- ENCABEZADO INTEGRADO ---
                st.markdown(f"""
                <div style='border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem;'>
                    <h2 style='color: #1f2937; margin: 0 0 0.5rem 0;'>Hola, {decrypted_name} 👋</h2>
                    <span class="{'elite-badge' if user_data['category'] == 'elite' else 'diversion-badge'}">
                        Categoría {'Élite ($1,000)' if user_data['category'] == 'elite' else 'Diversión ($500)'}
                    </span>
                </div>
                <h3 style='color: #1f2937; margin: 1.5rem 0 1rem 0;'>🎁 Edita tu Lista de Deseos:</h3>
                """, unsafe_allow_html=True)
                
                # --- CAMPOS DE EDICIÓN ---
                edited_gifts = []
                edited_links = []
                edited_files = []
                
                for idx, row in df.iterrows():
                    cols = st.columns([2, 2, 2])
                    with cols[0]:
                        gift_val = st.text_input(f"Opción {idx+1}", value=row["Opción"], key=f"my_table_gift_{idx}", placeholder="¿Qué te gustaría?")
                        edited_gifts.append(gift_val)
                    with cols[1]:
                        link_val = st.text_input(f"Link (opcional) {idx+1}", value=row["Link"], key=f"my_table_link_{idx}", placeholder="https://...")
                        edited_links.append(link_val)
                    with cols[2]:
                        if row["Imagen"]:
                            st.image(row["Imagen"], width=80)
                        file = st.file_uploader(f"Imagen {idx+1}", type=["png","jpg","jpeg","webp"], key=f"my_table_img_{idx}", label_visibility="collapsed")
                        edited_files.append(file)

                # --- VISUALIZACIÓN DEL AMIGO SECRETO ---
                if user_data.get('assigned_to_id'):
                    st.markdown("<hr style='margin: 2rem 0; border-top: 2px dashed #dc2626;'>", unsafe_allow_html=True)
                    
                    match_data = get_participant_by_id(user_data['assigned_to_id'])
                    reveal_date = datetime(2025, 12, 24, 0, 0, 0)
                    should_reveal = settings.get('names_revealed', False) or st.session_state.simulated_date >= reveal_date
                    
                    st.markdown(f"<h3 style='color: #dc2626; margin: 0 0 1rem 0;'>🎄 Tienes que regalarle a:</h3>", unsafe_allow_html=True)
                    
                    if not should_reveal:
                        st.info("🔒 El nombre se revelará el 24 de diciembre a medianoche, ¡pero aquí tienes su lista!")
                        st.markdown(f"""
                        <div style="background: rgba(220, 38, 38, 0.1); padding: 1rem; border-radius: 8px; border: 2px solid #dc2626; text-align: center; margin-bottom: 1.5rem;">
                            <h2 style="color: #dc2626; margin:0;">🕵️ Amigo Secreto 🕵️</h2>
                        </div>
                        """, unsafe_allow_html=True)
                    else:
                        try:
                            decrypted_match = decrypt(match_data['encrypted_name'], DEFAULT_ENCRYPTION_PASSWORD)
                        except:
                            decrypted_match = "Error"
                        st.markdown(f"""
                        <div style="background: rgba(22, 163, 74, 0.1); padding: 1rem; border-radius: 8px; border: 2px solid #16a34a; text-align: center; margin-bottom: 1.5rem;">
                            <h2 style="color: #16a34a; margin:0;">✨ {decrypted_match} ✨</h2>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    # Mostrar regalos (Siempre visible)
                    st.markdown("**📝 Su lista de deseos:**")
                    assigned_opts = match_data.get('gift_options', [])
                    assigned_imgs = match_data.get('gift_images', [])
                    
                    for idx, gift in enumerate(assigned_opts):
                        c1, c2 = st.columns([3, 1])
                        with c1:
                            st.write(f"🎁 **{idx+1}.** {gift}")
                        with c2:
                            if assigned_imgs and idx < len(assigned_imgs) and assigned_imgs[idx]:
                                st.image(assigned_imgs[idx], use_container_width=True)

                st.markdown("<br>", unsafe_allow_html=True)
                
                # BOTONES DE ACCIÓN (Dentro del form)
                btn_save = st.form_submit_button("💾 Guardar Cambios", use_container_width=True)
                btn_logout = st.form_submit_button("🚪 Salir", type="secondary", use_container_width=True)
                
                if btn_save:
                    final_gift_options = []
                    for g, l in zip(edited_gifts, edited_links):
                        entry = g.strip()
                        if entry:
                            if l.strip(): entry += f" | {l.strip()}"
                            final_gift_options.append(entry)
                    
                    # Subir imágenes
                    from lib.appwrite_client import upload_gift_image, databases, APPWRITE_DATABASE_ID, APPWRITE_PARTICIPANTS_COLLECTION_ID
                    new_gift_images = list(my_gift_images) if my_gift_images else [None] * 7
                    while len(new_gift_images) < 7: new_gift_images.append(None)

                    for idx, file in enumerate(edited_files):
                        if file is not None:
                            try:
                                if hasattr(file, 'read') and hasattr(file, 'name'):
                                    image_url = upload_gift_image(user_data['id'], idx, file, file.name)
                                    new_gift_images[idx] = image_url
                            except Exception:
                                pass
                    
                    new_gift_images = new_gift_images[:7]
                    
                    databases.update_document(
                        database_id=APPWRITE_DATABASE_ID,
                        collection_id=APPWRITE_PARTICIPANTS_COLLECTION_ID,
                        document_id=user_data['id'],
                        data={"gift_options": final_gift_options, "gift_images": new_gift_images}
                    )
                    st.success("✅ Cambios guardados correctamente.")
                    st.rerun()

                if btn_logout:
                    st.session_state.participant_id = None
                    st.session_state.view = 'home'
                    st.rerun()
                
        except Exception as e:
            st.error(f"Error al cargar el dashboard: {str(e)}")
            if st.button("Reiniciar"):
                st.session_state.participant_id = None
                st.rerun()


# Navegación principal
def main():
    auto_run_sorteo()
    if st.session_state.view == 'home':
        show_home()
    elif st.session_state.view == 'register':
        show_register()
    elif st.session_state.view == 'dashboard':
        show_dashboard()

if __name__ == "__main__":
    main()