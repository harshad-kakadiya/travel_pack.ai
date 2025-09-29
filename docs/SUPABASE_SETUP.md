# Supabase setup (Itineraries)

1) Run SQL: supabase/sql/001_itineraries.sql in Studio.
2) Deploy functions with the CLI (see supabase/README.md).
3) Set Function env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PUBLIC_BASE_URL.
4) Schedule purge: daily "purge-itineraries".
5) App env: VITE_FUNCTIONS_BASE=https://<REF>.functions.supabase.co.