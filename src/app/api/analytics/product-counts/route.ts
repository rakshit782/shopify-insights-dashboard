// This API route has been removed as it was part of the deleted Analytics Dashboard.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 404 });
}
