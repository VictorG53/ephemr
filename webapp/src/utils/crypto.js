/**
 * Dérive une clé de chiffrement à partir du channel ID
 * (Tous les utilisateurs du même channel auront la même clé)
 */
export async function deriveKeyFromChannelId(channelId) {
  const encoder = new TextEncoder()
  const data = encoder.encode(channelId)

  // Créer un hash SHA-256 du channel ID
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // Importer le hash comme clé AES-256
  const key = await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  return key
}

/**
 * Chiffre un message avec AES-GCM
 */
export async function encryptMessage(plaintext, encryptionKey) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)

  // Générer un IV aléatoire
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // Chiffrer
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    encryptionKey,
    data
  )

  // Retourner IV + données chiffrées (IV doit être visible)
  return {
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(encrypted))
  }
}

/**
 * Déchiffre un message avec AES-GCM
 */
export async function decryptMessage(encryptedData, decryptionKey) {
  const iv = new Uint8Array(encryptedData.iv)
  const ciphertext = new Uint8Array(encryptedData.ciphertext)

  // Déchiffrer
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    decryptionKey,
    ciphertext
  )

  // Convertir en string
  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}
