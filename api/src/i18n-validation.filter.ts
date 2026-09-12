import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import type { Response } from "express";

@Catch(HttpException)
export class I18nValidationFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const i18n = I18nContext.current();
    const payload = exception.getResponse();
    const raw =
      typeof payload === "string"
        ? payload
        : typeof payload === "object" && payload && "message" in payload
          ? String((payload as { message: string | string[] }).message)
          : exception.message;
    const mappedKey = raw.startsWith("errors.")
      ? `common.${raw}`
      : status === 400
        ? "common.errors.required"
        : status === 403 || status === 401
          ? "common.errors.unauthorized"
          : "common.errors.generic";
    const message = i18n?.t(mappedKey) ?? raw;
    res.status(status).json({
      statusCode: status,
      message,
      error: exception.name,
    });
  }
}
