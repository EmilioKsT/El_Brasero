import validator from 'validator';

/**
 * Middleware de sanitización de inputs
 * Previene ataques XSS escapando caracteres HTML peligrosos
 *
 * NOTA: Se aplica selectivamente en rutas que aceptan input del usuario
 */
export const sanitizeInput = async (request, reply) => {
  try {
    // Sanitizar body
    if (request.body && typeof request.body === 'object') {
      sanitizeObject(request.body);
    }

    // Sanitizar query params
    if (request.query && typeof request.query === 'object') {
      sanitizeObject(request.query);
    }

    // Sanitizar params
    if (request.params && typeof request.params === 'object') {
      sanitizeObject(request.params);
    }

  } catch (error) {
    request.log.error('Error en sanitización de inputs:', error);
  }
};

/**
 * Sanitiza recursivamente un objeto
 * @param {Object} obj - Objeto a sanitizar
 */
function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Escapar caracteres HTML peligrosos
      obj[key] = validator.escape(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursión para objetos anidados
      sanitizeObject(obj[key]);
    }
  }
}

export default sanitizeInput;
