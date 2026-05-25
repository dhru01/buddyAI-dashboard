insert into badges (badge_name, criteria)
values
  ('Consistent Learner', '7 day streak'),
  ('Math Explorer', '100 maths questions'),
  ('Language Star', '50 English questions')
on conflict (badge_name) do nothing;

insert into learners (id, learner_name, grade, school, curriculum, preferred_language, status, consent_status)
values
  ('11111111-1111-1111-1111-111111111111', 'Ayanda Khumalo', 'Grade 10', 'Soweto High School', 'CAPS', 'isiZulu', 'active', 'completed'),
  ('22222222-2222-2222-2222-222222222222', 'Naledi Mokoena', 'Grade 8', 'Pretoria Girls School', 'CAPS', 'English', 'needs support', 'completed'),
  ('33333333-3333-3333-3333-333333333333', 'Liyema Jacobs', 'Grade 11', 'Rondebosch Secondary', 'CAPS', 'Afrikaans', 'flagged', 'completed'),
  ('44444444-4444-4444-4444-444444444444', 'Thato Dlamini', 'Grade 6', 'Ekurhuleni Primary', 'CAPS', 'Setswana', 'inactive', 'pending')
on conflict do nothing;

insert into learner_subjects (learner_id, subject)
values
  ('11111111-1111-1111-1111-111111111111', 'Mathematics'),
  ('11111111-1111-1111-1111-111111111111', 'Physical Sciences'),
  ('22222222-2222-2222-2222-222222222222', 'English'),
  ('22222222-2222-2222-2222-222222222222', 'History'),
  ('33333333-3333-3333-3333-333333333333', 'Accounting'),
  ('33333333-3333-3333-3333-333333333333', 'Economics'),
  ('44444444-4444-4444-4444-444444444444', 'Natural Sciences');

insert into conversations (id, learner_id, subject, language, status, flagged, fallback_used)
values
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'Mathematics', 'isiZulu', 'reviewed', false, false),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222222', 'English', 'English', 'new', true, true),
  ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '33333333-3333-3333-3333-333333333333', 'Accounting', 'Afrikaans', 'in review', true, false)
on conflict do nothing;

insert into messages (conversation_id, sender_type, content, has_image)
values
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'learner', 'Ngicela usizo nge-quadratic equations.', false),
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'buddyai', 'Sizoxazulula kancane kancane: ax^2 + bx + c = 0.', false),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'learner', 'I keep getting confused by figurative language.', false),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'buddyai', 'I am not fully sure. Let me give a generic explanation.', false);

insert into onboarding_events (learner_id, step_name, event_status)
values
  ('11111111-1111-1111-1111-111111111111', 'consent', 'completed'),
  ('22222222-2222-2222-2222-222222222222', 'subjects', 'completed'),
  ('44444444-4444-4444-4444-444444444444', 'language', 'stuck');

insert into error_logs (learner_id, conversation_id, error_type, snippet, status, internal_note)
values
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Fallback response', 'Low confidence on figurative language', 'new', 'Review grade-level explanation.'),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Repeated learner confusion', 'Debtors ledger repeated confusion', 'in review', 'Need simpler bilingual examples.');

insert into system_settings (setting_key, setting_value)
values
  ('supported_languages', '["English","isiZulu","isiXhosa","Afrikaans","Sesotho","Setswana","Sepedi","Xitsonga","Tshivenda","siSwati","isiNdebele","Swahili"]'::jsonb),
  ('supported_subjects', '["Mathematics","English","Natural Sciences","Physical Sciences","Accounting","Economics","Life Sciences","History","Geography"]'::jsonb),
  ('grade_list', '["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"]'::jsonb)
on conflict (setting_key) do update set setting_value = excluded.setting_value;
