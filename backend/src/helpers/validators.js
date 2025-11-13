// ============================================
// HELPERS DE VALIDACIÓN
// ============================================

/**
 * Valida formato de email
 * Regex estándar que acepta la mayoría de emails válidos
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido, false si no
 */
export function validarEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }

    // Regex estándar para emails
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
}

/**
 * Valida política de contraseñas
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Al menos 1 minúscula
 * - Al menos 1 mayúscula
 * - Al menos 1 número
 * @param {string} password - Contraseña a validar
 * @returns {boolean} - True si cumple la política, false si no
 */
export function validarPassword(password) {
    if (!password || typeof password !== 'string') {
        return false;
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

/**
 * Normaliza un email (trim + lowercase)
 * @param {string} email - Email a normalizar
 * @returns {string} - Email normalizado
 */
export function normalizarEmail(email) {
    if (!email || typeof email !== 'string') {
        return '';
    }
    return email.trim().toLowerCase();
}

/**
 * Valida formato de código de recuperación (6 dígitos)
 * @param {string} codigo - Código a validar
 * @returns {boolean} - True si es válido, false si no
 */
export function validarCodigoRecuperacion(codigo) {
    if (!codigo || typeof codigo !== 'string') {
        return false;
    }
    return /^\d{6}$/.test(codigo.trim());
}
