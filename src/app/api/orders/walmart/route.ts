
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 404 });
}
