
'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

const supabaseSchema = z.object({
    supabaseUrl: z.string().url(),
    supabaseKey: z.string().min(1),
});

export async function saveSupabaseCredentials(formData: FormData) {
    const data = Object.fromEntries(formData);
    const parsed = supabaseSchema.safeParse(data);

    if (!parsed.success) {
        return { success: false, error: 'Invalid data provided.' };
    }

    cookies().set('supabaseUrl', parsed.data.supabaseUrl, { secure: true, httpOnly: true, sameSite: 'strict' });
    cookies().set('supabaseKey', parsed.data.supabaseKey, { secure: true, httpOnly: true, sameSite: 'strict' });
    
    return { success: true };
}

export async function getSupabaseCredentials(): Promise<{ supabaseUrl: string | undefined, supabaseKey: string | undefined }> {
    const supabaseUrl = cookies().get('supabaseUrl')?.value;
    const supabaseKey = cookies().get('supabaseKey')?.value;

    return { 
      supabaseUrl: supabaseUrl ?? process.env.SUPABASE_URL, 
      supabaseKey: supabaseKey ?? process.env.SUPABASE_ANON_KEY 
    };
}
