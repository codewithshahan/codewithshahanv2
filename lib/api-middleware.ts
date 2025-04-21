import { NextRequest, NextResponse } from "next/server";

/**
 * Interface for API response options
 */
export interface ApiResponseOptions {
  status?: number;
  cacheTtl?: number; // Time to live in seconds
  headers?: Record<string, string>;
}

/**
 * Wrapper for API route handlers with standardized response formatting,
 * error handling, and caching headers
 */
export async function apiHandler<T>(
  request: NextRequest,
  handler: () => Promise<T>,
  options: ApiResponseOptions = {}
): Promise<NextResponse> {
  const {
    status = 200,
    cacheTtl = 0, // Default no caching
    headers = {},
  } = options;

  try {
    // Execute the handler
    const data = await handler();

    // Add cache headers if ttl is provided
    const responseHeaders: Record<string, string> = { ...headers };

    if (cacheTtl > 0) {
      // Add cache control headers for API response
      responseHeaders[
        "Cache-Control"
      ] = `public, s-maxage=${cacheTtl}, stale-while-revalidate=${Math.floor(
        cacheTtl * 0.1
      )}`;
    }

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        status,
        headers: responseHeaders,
      }
    );
  } catch (error) {
    // Log error
    console.error(`[API Error]`, error);

    // Get error message
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Get status code from error if available
    const errorStatus = error instanceof ApiError ? error.status : 500;

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: errorStatus,
      }
    );
  }
}

/**
 * Custom API error class with status code
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * Helper to create common errors
 */
export const ApiErrors = {
  notFound: (resource = "Resource") =>
    new ApiError(`${resource} not found`, 404),

  badRequest: (message = "Bad request") => new ApiError(message, 400),

  unauthorized: (message = "Unauthorized") => new ApiError(message, 401),

  forbidden: (message = "Forbidden") => new ApiError(message, 403),

  serverError: (message = "Internal server error") =>
    new ApiError(message, 500),
};
