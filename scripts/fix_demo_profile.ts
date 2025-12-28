
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDemoProfile() {
    const email = 'demo@artha.com';
    const password = 'demo123';

    console.log(`Signing in as ${email}...`);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        console.error('Error signing in:', authError.message);
        return;
    }

    const user = authData.user;
    if (!user) {
        console.error('No user found');
        return;
    }

    console.log('User ID:', user.id);

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile) {
        console.log('Profile already exists:', profile);
    } else {
        console.log('Profile not found. Creating...');
        // Create organization first if needed, but let's assume we just need a profile linked to an org
        // We'll create a demo org

        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name: 'Artha Demo Corp',
                tier: 'enterprise',
                credits_purchased: 150000
            })
            .select()
            .single();

        if (orgError) {
            console.error('Error creating org:', orgError);
            // Try to find existing org
            const { data: existingOrg } = await supabase.from('organizations').select().eq('name', 'Artha Demo Corp').single();
            if (existingOrg) {
                console.log('Found existing org, linking to it.');
                await createProfile(user.id, email, existingOrg.id);
            }
        } else {
            console.log('Created org:', org.id);
            await createProfile(user.id, email, org.id);
        }
    }
}

async function createProfile(userId: string, email: string, orgId: string) {
    const { error } = await supabase
        .from('profiles')
        .insert({
            id: userId,
            email: email,
            full_name: 'Demo User',
            organization_id: orgId,
            role: 'admin'
        });

    if (error) {
        console.error('Error creating profile:', error);
    } else {
        console.log('Profile created successfully');
    }
}

fixDemoProfile();
