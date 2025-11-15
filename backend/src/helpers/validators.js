import validator from 'validator';

// ============================================
// HELPERS DE VALIDACIÓN
// ============================================

/**
 * Valida formato de email (mejorado con validación estricta)
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido, false si no
 */
export function validarEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }

    // Regex mejorado para emails
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim()) && validator.isEmail(email.trim());
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

/**
 * Sanitiza un string para prevenir XSS
 * @param {string} input - String a sanitizar
 * @returns {string} - String sanitizado
 */
export function sanitizarString(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }
    return validator.escape(input.trim());
}

/**
 * Sanitiza múltiples campos de un objeto
 * @param {Object} obj - Objeto con campos a sanitizar
 * @param {Array<string>} campos - Array de nombres de campos a sanitizar
 * @returns {Object} - Objeto con campos sanitizados
 */
export function sanitizarCampos(obj, campos) {
    const sanitizado = { ...obj };
    for (const campo of campos) {
        if (sanitizado[campo] && typeof sanitizado[campo] === 'string') {
            sanitizado[campo] = sanitizarString(sanitizado[campo]);
        }
    }
    return sanitizado;
}
