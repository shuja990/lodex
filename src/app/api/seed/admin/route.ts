import { NextResponse } from 'next/server';
import { createAdminUser } from '@/scripts/seed-admin';

export async function POST() {
  try {
    // In production, you might want to add authentication or remove this endpoint
    // For development, we'll allow it to be called freely
    
    await createAdminUser();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Admin user seeded successfully' 
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Seeder error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        message: `Seeder failed: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}