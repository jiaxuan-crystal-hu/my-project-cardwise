import { NextResponse } from "next/server";

export type ApiErrorBody = {
  ok: false;
  error: { code: string; message: string };
};

export type ApiOkBody<T> = { ok: true; data: T };

export function jsonError(
  status: number,
  code: string,
  message: string,
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export function jsonOk<T>(data: T): NextResponse<ApiOkBody<T>> {
  return NextResponse.json({ ok: true, data });
}
