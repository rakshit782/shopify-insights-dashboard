
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Competitor } from '@/lib/types';

export const revalidate = 0; // Disable caching for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  // Use the WEBSITE credentials to read the data
  const supabaseUrl = process.env.WEBSITE_SUPABASE_URL;
  const supabaseKey = process.env.WEBSITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Website Supabase credentials are not configured.' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Query the 'brand_competitors' table
    const { data, error } = await supabase
      .from('brand_competitors')
      .select('*')
      .order('fetched_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching competitors:', error);
      throw new Error(error.message);
    }

    return NextResponse.json({ competitors: data as Competitor[] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('API Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
