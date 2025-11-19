// src/app/api/healthz/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: '1.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
}