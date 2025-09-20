export function createErrorResponse(
  message: string,
  status: number = 500
): Response {
  return new Response(message, {
    status,
    headers: { 'Content-Type': 'text/html' },
  });
}

export function createNotFoundResponse(resource: string = 'Resource'): Response {
  return createErrorResponse(`${resource} not found`, 404);
}

export function createValidationErrorResponse(
  field: string,
  value: any,
  reason: string
): Response {
  return createErrorResponse(
    `Error: ${field} ${reason}. Received: ${value}`,
    400
  );
}

export function createSuccessResponse(content: string): Response {
  return new Response(content, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

export interface ApiErrorOptions {
  status?: number;
  logError?: boolean;
  userMessage?: string;
}

export function handleApiError(
  error: unknown,
  defaultMessage: string = 'An error occurred',
  options: ApiErrorOptions = {}
): Response {
  const { status = 500, logError = true, userMessage } = options;

  if (logError && error instanceof Error) {
    console.error(`API Error: ${error.message}`, error.stack);
  }

  const message = userMessage || defaultMessage;
  return createErrorResponse(message, status);
}

export function validateNumericInput(
  value: any,
  fieldName: string,
  min?: number,
  max?: number
): number | Response {
  const num = Number(value);

  if (isNaN(num)) {
    return createValidationErrorResponse(fieldName, value, 'must be a number');
  }

  if (min !== undefined && num < min) {
    return createValidationErrorResponse(
      fieldName,
      value,
      `must be at least ${min}`
    );
  }

  if (max !== undefined && num > max) {
    return createValidationErrorResponse(
      fieldName,
      value,
      `must be at most ${max}`
    );
  }

  return num;
}