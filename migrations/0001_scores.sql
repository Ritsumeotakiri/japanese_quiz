-- CREATE TABLE IF NOT EXISTS scores (
--   id TEXT PRIMARY KEY,
--   name TEXT NOT NULL,
--   level TEXT NOT NULL CHECK (level IN ('N4', 'N3')),
--   score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
--   total INTEGER NOT NULL,
--   created_at TEXT NOT NULL
-- );

-- CREATE INDEX IF NOT EXISTS scores_level_score_idx ON scores (level, score DESC, created_at ASC);

-- CREATE TABLE IF NOT EXISTS credits (
--   id TEXT PRIMARY KEY,
--   name TEXT NOT NULL,
--   contribution TEXT NOT NULL,
--   sort_order INTEGER NOT NULL
-- );

-- INSERT OR IGNORE INTO credits (id, name, contribution, sort_order) VALUES
--   ('say-sakphearith', 'Say Sakphearith', 'Everything · product, questions, engineering, and design', 1);

-- CREATE TABLE IF NOT EXISTS questions (
--   id TEXT PRIMARY KEY,
--   level TEXT NOT NULL CHECK (level IN ('N4', 'N3')),
--   type TEXT NOT NULL CHECK (type IN ('true-false', 'single')),
--   prompt TEXT NOT NULL,
--   translation TEXT NOT NULL,
--   options_json TEXT,
--   answer TEXT NOT NULL,
--   explanation TEXT NOT NULL,
--   created_at TEXT NOT NULL
-- );
