"""
Módulo de encriptación usando AES-256-GCM con cryptography
Portado desde TypeScript (encryption.ts)
"""

from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os
import base64
import hashlib


# Constantes
ALGORITHM = 'AES-GCM'
KEY_LENGTH = 32  # 256 bits
IV_LENGTH = 12  # 96 bits
SALT_LENGTH = 16  # 128 bits
ITERATIONS = 100000


def derive_key(password: str, salt: bytes) -> bytes:
    """
    Deriva una clave de encriptación desde una contraseña usando PBKDF2
    
    Args:
        password: Contraseña en texto plano
        salt: Salt aleatorio
        
    Returns:
        Clave derivada de 32 bytes
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=KEY_LENGTH,
        salt=salt,
        iterations=ITERATIONS,
        backend=default_backend()
    )
    return kdf.derive(password.encode('utf-8'))


def encrypt(text: str, password: str) -> str:
    """
    Encripta un texto usando AES-256-GCM con una contraseña
    
    Args:
        text: Texto a encriptar
        password: Contraseña para derivar la clave
        
    Returns:
        String en base64 con formato: salt + iv + ciphertext
    """
    # Generar salt e IV aleatorios
    salt = os.urandom(SALT_LENGTH)
    iv = os.urandom(IV_LENGTH)
    
    # Derivar clave desde contraseña
    key = derive_key(password, salt)
    
    # Encriptar usando AES-GCM
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(iv, text.encode('utf-8'), None)
    
    # Combinar salt + iv + ciphertext
    result = salt + iv + ciphertext
    
    # Convertir a base64
    return base64.b64encode(result).decode('utf-8')


def decrypt(encrypted_text: str, password: str) -> str:
    """
    Desencripta un texto usando AES-256-GCM con una contraseña
    
    Args:
        encrypted_text: Texto encriptado en base64
        password: Contraseña para derivar la clave
        
    Returns:
        Texto desencriptado
        
    Raises:
        Exception: Si la contraseña es incorrecta o los datos están corruptos
    """
    try:
        # Decodificar desde base64
        data = base64.b64decode(encrypted_text)
        
        # Extraer salt, iv y ciphertext
        salt = data[:SALT_LENGTH]
        iv = data[SALT_LENGTH:SALT_LENGTH + IV_LENGTH]
        ciphertext = data[SALT_LENGTH + IV_LENGTH:]
        
        # Derivar clave desde contraseña
        key = derive_key(password, salt)
        
        # Desencriptar usando AES-GCM
        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(iv, ciphertext, None)
        
        # Convertir a string
        return plaintext.decode('utf-8')
    except Exception as e:
        raise Exception(f'Contraseña incorrecta o datos corruptos: {str(e)}')


def hash_password(password: str) -> str:
    """
    Crea un hash de la contraseña usando SHA-256
    
    Args:
        password: Contraseña en texto plano
        
    Returns:
        Hash en formato hexadecimal
    """
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verifica si una contraseña coincide con su hash
    
    Args:
        password: Contraseña en texto plano
        password_hash: Hash almacenado
        
    Returns:
        True si coinciden, False en caso contrario
    """
    return hash_password(password) == password_hash
