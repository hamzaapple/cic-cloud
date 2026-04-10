-- Run this SQL in the Supabase SQL Editor to add the submission_link column
ALTER TABLE materials ADD COLUMN IF NOT EXISTS submission_link text;
