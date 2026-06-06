-- Move all existing Year 1 admins to Year 2
UPDATE moderators 
SET academic_year = '2' 
WHERE academic_year = '1' OR academic_year IS NULL;
