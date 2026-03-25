-- Rally: Sample seed data for demo
-- Run this AFTER schema.sql and after creating a test user via Supabase Auth

-- Create a demo family
INSERT INTO families (id, name, invite_code) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'The Martinez Family', 'RALLY1');

-- You'll need to replace this UUID with your actual auth.users UUID after signup
-- INSERT INTO profiles (id, family_id, full_name, role, avatar_color) VALUES
--   ('YOUR_USER_UUID_HERE', 'a0000000-0000-4000-8000-000000000001', 'Sarah Martinez', 'parent', '#7F77DD');

-- Children
INSERT INTO children (id, family_id, name, color, grade, school) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Emma', '#7F77DD', '3rd Grade', 'Lincoln Elementary'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Jake', '#1D9E75', '1st Grade', 'Lincoln Elementary');

-- Feed items (realistic school/activity items)
INSERT INTO feed_items (family_id, child_id, type, priority, title, description, due_at, event_at, location, source_label, badge_type, badge_label) VALUES

  -- Action required items
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'action_required', 10,
   'Permission slip: Science Museum field trip',
   'Sign and return the permission slip for the 3rd grade field trip to the Museum of Science and Industry.',
   NOW()::date + interval '0 days',
   NULL,
   NULL,
   'Found in email from Mrs. Hernandez, Mon Mar 18',
   'urgent', 'Due today'),

  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002',
   'action_required', 9,
   'Soccer registration closes Friday',
   'Spring soccer league registration for U7 division. $85 fee includes jersey and end-of-season party.',
   NOW()::date + interval '4 days',
   NULL,
   NULL,
   'Found in email from Parks & Rec, Tue Mar 12',
   'warning', 'Closes soon'),

  -- Today events
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'event', 6,
   'Piano lesson',
   'Weekly piano lesson with Ms. Chen. Bring the Suzuki Book 2.',
   NULL,
   NOW()::date + interval '15 hours 30 minutes',
   'Melody Music Studio, 445 Oak Ave',
   NULL,
   NULL, NULL),

  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002',
   'event', 5,
   'Soccer practice — location changed',
   'Practice moved to North Field due to maintenance on South Field.',
   NULL,
   NOW()::date + interval '16 hours',
   'North Field, Lincoln Park',
   'Updated by Coach Davis via team app',
   'change', 'Location changed'),

  -- Conflict
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'conflict', 7,
   'Emma: Ballet recital rehearsal',
   'Dress rehearsal for spring recital. Must arrive 30 min early.',
   NULL,
   NOW()::date + interval '6 days 10 hours',
   'Community Arts Center',
   NULL,
   'warning', 'Schedule conflict'),

  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002',
   'conflict', 7,
   'Jake: T-ball game',
   'First game of the season! Bring water bottle and sunscreen.',
   NULL,
   NOW()::date + interval '6 days 10 hours',
   'Riverside Diamond #3',
   NULL,
   'warning', 'Same time'),

  -- Upcoming
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'upcoming', 4,
   'Parent-teacher conference signup',
   'Book your 15-minute slot for spring conferences. Slots fill fast!',
   NOW()::date + interval '10 days',
   NOW()::date + interval '10 days 9 hours',
   'Lincoln Elementary, Room 204',
   'Found in school newsletter, Mar 15',
   'info', 'Book your slot'),

  ('a0000000-0000-4000-8000-000000000001', NULL,
   'upcoming', 3,
   'Early dismissal — Teacher in-service',
   'All students dismissed at 1:00 PM. After-school care available until 5:30 PM.',
   NULL,
   NOW()::date + interval '5 days 13 hours',
   'Lincoln Elementary',
   'Found in district email, Mar 10',
   NULL, NULL);
