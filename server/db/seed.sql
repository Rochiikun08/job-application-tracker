-- Development seed data. Not for production.

INSERT INTO users (email, password_hash)
VALUES ('dev@example.com', 'not-a-real-hash')
ON CONFLICT (email) DO NOTHING;

INSERT INTO applications (user_id, company, role, status, date_applied)
SELECT u.id, v.company, v.role, v.status, v.date_applied
FROM users u,
(VALUES
  ('Atlassian',   'Software Engineer Intern', 'applied',           DATE '2026-11-10'),
  ('Canva',       'Frontend Intern',          'online_assessment', DATE '2026-11-12'),
  ('Airwallex',   'Backend Intern',           'interview',         DATE '2026-11-05'),
  ('Culture Amp', 'Software Engineer Intern', 'wishlist',          NULL),
  ('Displayr',    'Full Stack Intern',        'applied',           DATE '2026-11-14')
) AS v(company, role, status, date_applied)
WHERE u.email = 'dev@example.com'
ON CONFLICT DO NOTHING;