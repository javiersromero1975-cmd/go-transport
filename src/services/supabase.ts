import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hgvaszdkekbkfnhoaqgp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhndmFzemRrZWtia2ZuaG9hcWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MjYyNjQsImV4cCI6MjA5MzAwMjI2NH0.35rXkLEJq8jpWrrYWw4JtPvUHZ5Jz6ksUvqPCtbgGBM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);