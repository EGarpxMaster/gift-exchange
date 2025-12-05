"""
🎄 Intercambio de Regalos 2025 - Streamlit App
Aplicación para gestionar el intercambio de regalos con encriptación y sorteo automático.
"""

import streamlit as st
from datetime import datetime, date
import json
from typing import Optional
import base64

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
from lib.supabase_client import (
    get_participant_by_id,
    create_participant,
    check_name_exists,
    get_participants,
    get_settings,
    update_settings,
    update_participant_assignment
)

# Contraseña por defecto
DEFAULT_ENCRYPTION_PASSWORD = 'GiftExchange2025!'

# Función para reproducir música de fondo
def add_bg_music():
    """Agregar música de fondo navideña con botón de control para móviles"""
    # URL del archivo de música en GitHub Raw
    music_url = "https://raw.githubusercontent.com/EGarpxMaster/gift-exchange/main/music/Whispering%20Snowfall.mp3"
    
    audio_html = f"""
    <style>
        @keyframes glow {{
            0%, 100% {{ box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4); }}
            50% {{ box-shadow: 0 4px 25px rgba(220, 38, 38, 0.8); }}
        }}
        #musicToggle {{
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            border: 2px solid #fbbf24;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
            transition: all 0.3s ease;
            animation: glow 2s ease-in-out infinite;
            -webkit-tap-highlight-color: transparent;
            outline: none;
            touch-action: manipulation;
            user-select: none;
            -webkit-user-select: none;
        }}
        #musicToggle:active {{
            transform: scale(0.9);
        }}
    </style>
    <audio id="bgMusic" loop preload="auto">
        <source src="{music_url}" type="audio/mpeg">
    </audio>
    <button id="musicToggle" type="button">🎵</button>
    <script>
        (function() {{
            var music = document.getElementById('bgMusic');
            var toggle = document.getElementById('musicToggle');
            var isPlaying = false;
            
            if (!music || !toggle) {{
                console.error('❌ Elementos no encontrados');
                return;
            }}
            
            console.log('✓ Elementos cargados');
            
            music.addEventListener('playing', function() {{
                isPlaying = true;
                toggle.innerHTML = '🔊';
                console.log('▶️ Reproduciendo');
            }});
            
            music.addEventListener('pause', function() {{
                isPlaying = false;
                toggle.innerHTML = '🎵';
                console.log('⏸️ Pausado');
            }});
            
            music.addEventListener('error', function() {{
                toggle.innerHTML = '❌';
                console.error('❌ Error al cargar música');
            }});
            
            function togglePlay() {{
                if (isPlaying) {{
                    music.pause();
                }} else {{
                    music.volume = 0.5;
                    music.play().then(function() {{
                        console.log('✅ Play exitoso');
                    }}).catch(function(err) {{
                        console.error('❌ Play error:', err.message);
                    }});
                }}
            }}
            
            toggle.addEventListener('touchend', function(e) {{
                e.preventDefault();
                togglePlay();
            }}, {{ passive: false }});
            
            toggle.addEventListener('click', function(e) {{
                togglePlay();
            }});
            
            // Autoplay en desktop
            if (!/Mobi|Android/i.test(navigator.userAgent)) {{
                setTimeout(function() {{
                    music.volume = 0.5;
                    music.play().catch(function() {{
                        console.log('Autoplay bloqueado - usa el botón');
                    }});
                }}, 1500);
            }}
        }})();
    </script>
    """
    
    st.markdown(audio_html, unsafe_allow_html=True)

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

<!-- Copos de nieve -->
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
                <li>✨ <strong>Registro:</strong> Del 04 al 11 de diciembre</li>
                <li>🎲 <strong>Sorteo:</strong> Se realizará el 12 de diciembre</li>
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
    # Validación de fechas
    start_date = date(2025, 12, 4)
    end_date = date(2025, 12, 11)
    current_date = datetime.now().date()
    
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
                    Las inscripciones solo están disponibles del 04 al 11 de Diciembre.
                </p>
                <p style="color: #6b7280; margin-top: 1rem;">
                    Fecha actual: {current_date.strftime('%d/%m/%Y')}
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
                elif len(gift_options) < 5:
                    st.error(f"Por favor agrega al menos 5 opciones de regalo. Tienes {len(gift_options)}.")
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
                                            from lib.supabase_client import upload_gift_image
                                            image_bytes = uploaded_file.read()
                                            image_url = upload_gift_image(participant_id, idx, image_bytes, uploaded_file.name)
                                            gift_image_urls.append(image_url)
                                        except Exception as img_error:
                                            st.warning(f"No se pudo subir la imagen {idx+1}: {str(img_error)}")
                                            gift_image_urls.append(None)
                                    else:
                                        gift_image_urls.append(None)
                                
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
    if not st.session_state.participant_id:
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            with st.form("login_form"):
                st.markdown("""
                <div>
                    <h1 style="text-align: center; color: #dc2626; margin-bottom: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); font-size: 2.5rem;">
                        🔑 Inicio de Sesión
                    </h1>
                </div>
                """, unsafe_allow_html=True)
                
                st.write("")
                
                st.markdown("### 👤 Accede a tu Dashboard")
                login_name = st.text_input("Nombre Completo", placeholder="Ej. Juan Pérez", key="login_name_input")
                login_password = st.text_input("Contraseña", type="password", placeholder="Tu contraseña secreta", key="login_password_input")
                st.caption("🔐 Ingresa el mismo nombre y contraseña que usaste al registrarte")
                
                st.write("")
                col_a, col_b = st.columns(2)
                with col_a:
                    submit = st.form_submit_button("🔓 Entrar", use_container_width=True)
                with col_b:
                    back = st.form_submit_button("⬅️ Volver al inicio", use_container_width=True, type="secondary")
                
                if back:
                    st.session_state.view = 'home'
                    st.rerun()
                
                if submit:
                    if not login_name.strip() or not login_password:
                        st.error("Por favor completa todos los campos.")
                    else:
                        try:
                            # Hash de contraseña
                            password_hash = hash_password(login_password)
                            
                            # Buscar participante (pasando nombre sin encriptar)
                            from lib.supabase_client import get_participant_by_name_and_password
                            participant = get_participant_by_name_and_password(login_name.strip(), password_hash, DEFAULT_ENCRYPTION_PASSWORD)
                            
                            if participant:
                                st.session_state.participant_id = participant['id']
                                st.session_state.participant_name = participant['encrypted_name']
                                st.success("✅ ¡Inicio de sesión exitoso!")
                                st.rerun()
                            else:
                                st.error("❌ Nombre o contraseña incorrectos.")
                        except Exception as e:
                            st.error(f"Error al iniciar sesión: {str(e)}")
        return
    
    try:
        # Obtener datos
        user_data = get_participant_by_id(st.session_state.participant_id)
        settings = get_settings()
        
        if not user_data:
            st.error("❌ Participante no encontrado")
            st.session_state.participant_id = None
            if st.button("⬅️ Volver", key="back_notfound"):
                st.session_state.view = 'home'
                st.rerun()
            return
        
        # Desencriptar nombre propio
        try:
            decrypted_name = decrypt(user_data['encrypted_name'], DEFAULT_ENCRYPTION_PASSWORD)
        except:
            decrypted_name = "[Nombre encriptado]"
        
        # Contenedor principal centrado
        col1, col2, col3 = st.columns([0.125, 0.75, 0.125])
        with col2:
            # Verificar si hay asignación
            if user_data['assigned_to_id']:
                match_data = get_participant_by_id(user_data['assigned_to_id'])
                
                # Verificar si se deben revelar los nombres
                reveal_date = datetime(2025, 12, 24, 0, 0, 0)
                should_reveal = settings['names_revealed'] or st.session_state.simulated_date >= reveal_date
                
                try:
                    decrypted_match = decrypt(match_data['encrypted_name'], DEFAULT_ENCRYPTION_PASSWORD) if should_reveal else None
                except:
                    decrypted_match = None
                
                # Construir lista de deseos con imágenes
                gift_options = match_data.get('gift_options', [])
                gift_images = match_data.get('gift_images', [])
                
                # Contenedor completo en un solo bloque
                st.markdown(f"""
                <div style="background: rgba(255, 255, 255, 0.95); padding: 2.5rem; border-radius: 16px; 
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); 
                            border-top: 4px solid #16a34a; border-bottom: 4px solid #dc2626;
                            backdrop-filter: blur(10px);">
                    <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                        <h2 style="color: #1f2937; margin: 0 0 0.5rem 0;">Hola, {decrypted_name} 👋</h2>
                        <span class="{'elite-badge' if user_data['category'] == 'elite' else 'diversion-badge'}">
                            Categoría {'Élite ($1,000)' if user_data['category'] == 'elite' else 'Diversión ($500)'}
                        </span>
                    </div>
                    <h2 style="color: #1f2937; margin: 1.5rem 0 1rem 0;">🎁 Tu Asignación</h2>
                """, unsafe_allow_html=True)
                
                # Renderizar el contenido según el estado
                if should_reveal and decrypted_match:
                    st.markdown(f"""
                    <div style="background: rgba(34, 197, 94, 0.1); padding: 1.5rem; border-left: 4px solid #16a34a; margin-bottom: 1.5rem; border-radius: 8px; text-align: center;">
                        <h3 style="color: #16a34a; margin: 0 0 1rem 0;">¡Tu amigo secreto es!</h3>
                        <h1 style="color: #dc2626; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); font-size: 2.5rem;">{decrypted_match}</h1>
                    </div>
                    <h3 style="color: #1f2937; margin: 1.5rem 0 1rem 0;">🎁 Lista de Deseos:</h3>
                    """, unsafe_allow_html=True)
                    
                    # Mostrar cada regalo con su imagen si existe
                    for idx, gift in enumerate(gift_options):
                        col_gift1, col_gift2 = st.columns([2, 1])
                        with col_gift1:
                            st.markdown(f"**{idx+1}.** {gift}")
                        with col_gift2:
                            if gift_images and idx < len(gift_images) and gift_images[idx]:
                                st.image(gift_images[idx], caption=f"Opción {idx+1}", use_container_width=True)
                    
                    st.balloons()
                elif should_reveal and not decrypted_match:
                    st.markdown("""
                    <div style="background: rgba(239, 68, 68, 0.1); padding: 1.5rem; border-left: 4px solid #dc2626; margin-bottom: 1.5rem; border-radius: 8px;">
                        <p style="color: #dc2626; margin: 0;">❌ Error al desencriptar el nombre</p>
                    </div>
                    <h3 style="color: #1f2937; margin: 1.5rem 0 1rem 0;">🎁 Lista de Deseos:</h3>
                    """, unsafe_allow_html=True)
                    
                    for idx, gift in enumerate(gift_options):
                        col_gift1, col_gift2 = st.columns([2, 1])
                        with col_gift1:
                            st.markdown(f"**{idx+1}.** {gift}")
                        with col_gift2:
                            if gift_images and idx < len(gift_images) and gift_images[idx]:
                                st.image(gift_images[idx], caption=f"Opción {idx+1}", use_container_width=True)
                else:
                    st.markdown("""
                    <div style="background: rgba(59, 130, 246, 0.1); padding: 1.5rem; border-left: 4px solid #3b82f6; margin-bottom: 1.5rem; border-radius: 8px;">
                        <p style="color: #1e40af; margin: 0;">🎄 El nombre se revelará el 24 de diciembre a medianoche</p>
                    </div>
                    <h3 style="color: #1f2937; margin: 1.5rem 0 1rem 0;">🎁 Lista de Deseos:</h3>
                    """, unsafe_allow_html=True)
                    
                    for idx, gift in enumerate(gift_options):
                        col_gift1, col_gift2 = st.columns([2, 1])
                        with col_gift1:
                            st.markdown(f"**{idx+1}.** {gift}")
                        with col_gift2:
                            if gift_images and idx < len(gift_images) and gift_images[idx]:
                                st.image(gift_images[idx], caption=f"Opción {idx+1}", use_container_width=True)
                
                # Cerrar el div principal
                st.markdown("""
                </div>
                """, unsafe_allow_html=True)
                
            else:
                # Sin asignación - todo en un bloque
                st.markdown(f"""
                <div style="background: rgba(255, 255, 255, 0.95); padding: 2.5rem; border-radius: 16px; 
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); 
                            border-top: 4px solid #16a34a; border-bottom: 4px solid #dc2626;
                            backdrop-filter: blur(10px);">
                    <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                        <h2 style="color: #1f2937; margin: 0 0 0.5rem 0;">Hola, {decrypted_name} 👋</h2>
                        <span class="{'elite-badge' if user_data['category'] == 'elite' else 'diversion-badge'}">
                            Categoría {'Élite ($1,000)' if user_data['category'] == 'elite' else 'Diversión ($500)'}
                        </span>
                    </div>
                    <h2 style="color: #1f2937; margin: 1.5rem 0 1rem 0;">📊 Estado de Participación</h2>
                    <div style="background: rgba(251, 191, 36, 0.1); padding: 2rem; border-left: 4px solid #fbbf24; border-radius: 8px; text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                        <h3 style="color: #92400e; margin: 0 0 0.5rem 0;">El sorteo aún no se ha realizado</h3>
                        <p style="color: #4b5563; margin: 0;">¡Mantente atento! Te notificaremos cuando tengas tu asignación.</p>
                    </div>
                </div>
                """, unsafe_allow_html=True)
            
            st.write("")
            if st.button("🚪 Salir", use_container_width=True, key="logout_btn"):
                st.session_state.participant_id = None
                st.session_state.view = 'home'
                st.rerun()
        
    except Exception as e:
        st.error(f"Error al cargar el dashboard: {str(e)}")


def show_admin():
    """Panel de administrador"""
    st.markdown('<h1 class="header-title">🔧 Panel de Administrador</h1>', unsafe_allow_html=True)
    
    try:
        participants = get_participants()
        settings = get_settings()
        
        # Estadísticas
        st.markdown("## 📊 Estadísticas")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Participantes", len(participants))
        with col2:
            elite_count = len([p for p in participants if p['category'] == 'elite'])
            st.metric("Categoría Élite", elite_count)
        with col3:
            diversion_count = len([p for p in participants if p['category'] == 'diversion'])
            st.metric("Categoría Diversión", diversion_count)
        
        st.divider()
        
        # Acciones principales
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("### 🎲 Ejecutar Sorteo")
            if settings['sorteo_completed']:
                st.success("✅ Sorteo completado")
            else:
                if st.button("🎲 Realizar Sorteo", use_container_width=True):
                    try:
                        with st.spinner("Ejecutando sorteo..."):
                            elite_parts = [{'id': p['id'], 'category': p['category']} 
                                         for p in participants if p['category'] == 'elite']
                            div_parts = [{'id': p['id'], 'category': p['category']} 
                                       for p in participants if p['category'] == 'diversion']
                            
                            if len(elite_parts) < 2 and len(elite_parts) > 0:
                                st.error("Se necesitan al menos 2 participantes en Élite")
                            elif len(div_parts) < 2 and len(div_parts) > 0:
                                st.error("Se necesitan al menos 2 participantes en Diversión")
                            else:
                                assignments = perform_sorteo(elite_parts, div_parts)
                                
                                # Validar
                                all_parts = [{'id': p['id'], 'category': p['category']} for p in participants]
                                validation = validate_assignments(all_parts, assignments)
                                
                                if not validation['valid']:
                                    st.error(f"Validación falló: {', '.join(validation['errors'])}")
                                else:
                                    # Guardar asignaciones
                                    for participant_id, assigned_to_id in assignments.items():
                                        update_participant_assignment(participant_id, assigned_to_id)
                                    
                                    update_settings({'sorteo_completed': True})
                                    st.success("✅ ¡Sorteo realizado con éxito!")
                                    st.rerun()
                    except Exception as e:
                        st.error(f"Error en el sorteo: {str(e)}")
        
        with col2:
            st.markdown("### 👁️ Revelar Nombres")
            if settings['names_revealed']:
                st.success("✅ Nombres revelados")
            else:
                if st.button("👁️ Revelar Ahora", use_container_width=True):
                    try:
                        update_settings({'names_revealed': True})
                        st.success("✅ ¡Nombres revelados!")
                        st.rerun()
                    except Exception as e:
                        st.error(f"Error: {str(e)}")
        
        with col3:
            st.markdown("### 🔑 Cambiar Contraseña")
            with st.expander("Cambiar contraseña de encriptación"):
                current_pwd = st.text_input("Contraseña actual", type="password", key="curr_pwd")
                new_pwd = st.text_input("Nueva contraseña", type="password", key="new_pwd")
                confirm_pwd = st.text_input("Confirmar contraseña", type="password", key="conf_pwd")
                
                if st.button("Actualizar Contraseña"):
                    if new_pwd != confirm_pwd:
                        st.error("Las contraseñas no coinciden")
                    elif len(new_pwd) < 8:
                        st.error("La contraseña debe tener al menos 8 caracteres")
                    else:
                        try:
                            if verify_password(current_pwd, settings['encryption_password_hash']) or current_pwd == DEFAULT_ENCRYPTION_PASSWORD:
                                new_hash = hash_password(new_pwd)
                                update_settings({'encryption_password_hash': new_hash})
                                st.success("✅ Contraseña actualizada")
                            else:
                                st.error("Contraseña actual incorrecta")
                        except Exception as e:
                            st.error(f"Error: {str(e)}")
        
        st.divider()
        
        # Lista de participantes
        st.markdown("## 👥 Participantes Registrados")
        
        show_decrypted = st.checkbox("🔓 Mostrar nombres desencriptados (solo admin)")
        
        for participant in participants:
            with st.expander(f"{'🌟' if participant['category'] == 'elite' else '🎉'} {participant['id'][:8]}..."):
                col1, col2 = st.columns([2, 1])
                with col1:
                    st.write(f"**ID:** `{participant['id']}`")
                    st.write(f"**Nombre encriptado:** `{participant['encrypted_name'][:50]}...`")
                    
                    if show_decrypted:
                        try:
                            dec_name = decrypt(participant['encrypted_name'], DEFAULT_ENCRYPTION_PASSWORD)
                            st.success(f"**Nombre:** {dec_name}")
                        except:
                            st.error("Error al desencriptar")
                    
                    st.write(f"**Categoría:** {participant['category']}")
                    
                    if participant['assigned_to_id']:
                        st.write(f"**Asignado a:** `{participant['assigned_to_id'][:8]}...`")
                
                with col2:
                    st.write("**Lista de deseos:**")
                    for idx, gift in enumerate(participant.get('gift_options', []), 1):
                        st.write(f"{idx}. {gift}")
        
        if st.button("⬅️ Volver al inicio"):
            st.session_state.view = 'home'
            st.rerun()
            
    except Exception as e:
        st.error(f"Error en el panel de admin: {str(e)}")


# Navegación principal
def main():
    if st.session_state.view == 'home':
        show_home()
    elif st.session_state.view == 'register':
        show_register()
    elif st.session_state.view == 'dashboard':
        show_dashboard()
    elif st.session_state.view == 'admin':
        show_admin()


if __name__ == "__main__":
    main()
