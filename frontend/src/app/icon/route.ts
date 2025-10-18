import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the favicon.ico file in the public directory
    const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico');
    const favicon = fs.readFileSync(faviconPath);
    
    return new NextResponse(favicon, {
      status: 200,
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=86400, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error serving favicon:', error);
    return new NextResponse(null, { status: 204 }); // No Content
  }
}
