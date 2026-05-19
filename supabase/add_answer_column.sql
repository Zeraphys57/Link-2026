-- Run this in Supabase SQL Editor if you already ran schema.sql before
-- Adds the answer column to existing submissions table

alter table public.submissions add column if not exists answer text;
