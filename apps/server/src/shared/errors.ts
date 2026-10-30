import type { FastifyInstance } from "fastify";
import type { ErrorEnvelope } from "shared";

// Thrown by domain/app code; rendered by the one error handler below.
export class AppError extends Error {
  readonly code: string;
  readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

function envelope(code: string, message: string): ErrorEnvelope {
  return { error: { code, message } };
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.httpStatus).send(envelope(error.code, error.message));
    }
    // Fastify's own client errors (malformed JSON, schema validation) keep their 4xx status.
    const status = (error as { statusCode?: number }).statusCode;
    if (status !== undefined && status >= 400 && status < 500) {
      return reply.status(status).send(envelope("bad_request", (error as Error).message));
    }
    request.log.error(error);
    return reply.status(500).send(envelope("internal", "Internal server error"));
  });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send(envelope("not_found", `Route ${request.method} ${request.url} not found`));
  });
}
