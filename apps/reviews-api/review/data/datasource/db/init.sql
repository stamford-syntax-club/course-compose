-- For Testing Purposes
CREATE TABLE "Course" (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(255) UNIQUE,
  full_name     VARCHAR(255),
  prerequisites VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[],
  reviews       INTEGER[]
);

CREATE TABLE "Profile" (
  id         UUID PRIMARY KEY,
  username   VARCHAR(255),
  "isActive"   BOOLEAN DEFAULT false
);

CREATE TABLE "Review" (
  id            SERIAL PRIMARY KEY,
  academic_year INTEGER,
  description   TEXT,
  rating        FLOAT,
  votes         INTEGER,
  status        VARCHAR(255),
  course_id     INTEGER,
  user_id       UUID,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP,
  CONSTRAINT fk_review_course_id FOREIGN KEY (course_id) REFERENCES "Course"(id),
  CONSTRAINT fk_review_user_id FOREIGN KEY (user_id) REFERENCES "Profile"(id)
);

INSERT INTO "Course" (code, full_name, prerequisites) VALUES
  ('CSCI101', 'Introduction to Computer Science', '{}'),
  ('MATH201', 'Calculus I', '{}'),
  ('PHYS101', 'Physics for Engineers', '{"MATH201"}'),
  ('NOREVIEW101', 'Course without reviews', '{}');

-- Inserting data into the Profile table
INSERT INTO "Profile" (id, "isActive", username) VALUES
  ('8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d', true, NULL),
  ('2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f', true, NULL),
  ('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', false, NULL),
  ('d5a59cb2-1f22-4e23-8ef0-7108e54f842b', true, NULL),
  ('6c7b1dd2-aa9d-4f5e-8a98-2c7c2895a95e', true, NULL),
  ('8b84c3b5-5b87-4c9b-832d-60d0966d4f7d', true, NULL),
  ('3f9e87a9-6d27-4a09-8a0a-20e58d609315', true, NULL);
