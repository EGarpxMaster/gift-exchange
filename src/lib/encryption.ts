/**
 * Encryption utilities using Web Crypto API (AES-GCM)
 * Para encriptar/desencriptar nombres de participantes
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits

/**
 * Deriva una clave de encriptación desde una contraseña
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encripta un texto usando una contraseña
 */
export async function encrypt(text: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Generar salt e IV aleatorios
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derivar clave desde contraseña
  const key = await deriveKey(password, salt);

  // Encriptar
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );

  // Combinar salt + iv + datos encriptados
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Convertir a base64
  return btoa(String.fromCharCode(...result));
}

/**
 * Desencripta un texto usando una contraseña
 */
export async function decrypt(encryptedText: string, password: string): Promise<string> {
  try {
    // Convertir desde base64
    const data = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));

    // Extraer salt, iv y datos encriptados
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 16 + IV_LENGTH);
    const encrypted = data.slice(16 + IV_LENGTH);

    // Derivar clave desde contraseña
    const key = await deriveKey(password, salt);

    // Desencriptar
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encrypted
    );

    // Convertir a texto
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Error al desencriptar:', error);
    throw new Error('Contraseña incorrecta o datos corruptos');
  }
}

/**
 * Genera un hash de una contraseña para almacenar en la BD
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

/**
 * Verifica si una contraseña coincide con su hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}
