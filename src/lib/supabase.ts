import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajttodynjfrpelpizghu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdHRvZHluamZycGVscGl6Z2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM1NjgyMzgsImV4cCI6MTk5OTE0NDIzOH0.O9XIhihpFmTXKlC4gAI6ldj7HMk4yHH94udEABK4F9s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);