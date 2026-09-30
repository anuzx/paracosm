export const ApiError = (message = "Error") => ({
  message,
  success: false as const,
});
