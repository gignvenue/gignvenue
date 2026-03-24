// GigNVenue — Supabase client
// Loaded via CDN script tag in each page's <head>.
// anon/public key is safe for client-side use — RLS policies enforce data access.
// NEVER put the service_role key here.

const SUPABASE_URL  = 'https://mbyubvofkzjntgejydze.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ieXVidm9ma3pqbnRnZWp5ZHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzI4OTksImV4cCI6MjA4OTk0ODg5OX0.YHz_bcP0dWY1ML-tKs5MLjqWP62njnV_oqWkkMZ461Y'

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
