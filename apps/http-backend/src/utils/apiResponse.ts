export const ApiResponse = <T>(data: T) => ({
  data,
  success: true as const,
});
