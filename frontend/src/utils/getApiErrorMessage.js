export const getApiErrorMessage = (
  error,
  fallbackMessage = "No se pudo completar la operacion",
) => {
  const responseData = error?.response?.data;
  const validationErrors = Array.isArray(responseData?.errors)
    ? responseData.errors.filter(
        (message) => typeof message === "string" && message.trim().length > 0,
      )
    : [];

  if (validationErrors.length > 0) {
    return validationErrors[0];
  }

  if (
    typeof responseData?.message === "string" &&
    responseData.message.trim().length > 0
  ) {
    return responseData.message.trim();
  }

  if (typeof error?.message === "string" && error.message.trim().length > 0) {
    return error.message.trim();
  }

  return fallbackMessage;
};
