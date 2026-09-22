import { toast } from 'sonner';

/**
 * Extrae y formatea mensajes de error provenientes del backend Spring Boot 3.4.
 * Soporta:
 * - Bean Validation (`validationErrors`: { campo: "mensaje" })
 * - Excepciones de negocio (`message`: "...")
 * - Respuestas de texto plano o fallback genérico
 * Evita estrictamente renderizar `[object Object]`.
 */
export const extractErrorMessage = (error, defaultMsg = "Ocurrió un error inesperado.") => {
  if (!error) return defaultMsg;

  const data = error.response?.data;

  if (!data) {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return defaultMsg;
  }

  // 1. Manejo de Bean Validation (validationErrors: { campo: "mensaje" })
  if (data.validationErrors && typeof data.validationErrors === 'object') {
    const errorEntries = Object.entries(data.validationErrors);
    if (errorEntries.length > 0) {
      return errorEntries
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(' | ');
    }
  }

  // 2. Mensaje directo en data (string)
  if (typeof data === 'string') {
    return data;
  }

  // 3. Campo message en el objeto de error de Spring Boot
  if (data.message && typeof data.message === 'string') {
    return data.message;
  }

  // 4. Campo error general
  if (data.error && typeof data.error === 'string') {
    return data.error;
  }

  // 5. Fallback a error.message o default
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  return defaultMsg;
};

/**
 * Notifica un error al usuario vía toast de Sonner de forma segura y legible.
 */
export const handleApiError = (error, defaultMsg = "Error en la operación", toastId = null) => {
  const message = extractErrorMessage(error, defaultMsg);
  const options = toastId ? { id: toastId, duration: 6000 } : { duration: 5000 };
  toast.error(message, options);
  return message;
};
