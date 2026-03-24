// GigNVenue — Supabase client
// Uses var so it's accessible across all scripts on the page.
// Named gnvClient to avoid collision with window.supabase (the CDN library).

var gnvClient = window.supabase.createClient(
  'https://mbyubvofkzjntgejydze.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ieXVidm9ma3pqbnRnZWp5ZHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzI4OTksImV4cCI6MjA4OTk0ODg5OX0.YHz_bcP0dWY1ML-tKs5MLjqWP62njnV_oqWkkMZ461Y'
)
