-- Community Schema Update
-- 1. Add forum_type to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS forum_type TEXT DEFAULT 'student';

-- 2. Update existing posts to 'student' forum by default unless they have tutor-specific categories
UPDATE posts SET forum_type = 'tutor' WHERE category IN ('Tutor Hub', 'Tutor Resources');

-- 3. Add triggers to keep votes_score and comments_count in sync (safety if triggers missing)
-- (Assuming these are handled by app logic, but SQL is safer)

-- UPVOTE/DOWNVOTE TRIGGER
CREATE OR REPLACE FUNCTION update_post_votes_score()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE posts SET votes_score = COALESCE(votes_score, 0) + NEW.vote_type WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE posts SET votes_score = COALESCE(votes_score, 0) - OLD.vote_type + NEW.vote_type WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE posts SET votes_score = COALESCE(votes_score, 0) - OLD.vote_type WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_post_votes_score ON post_votes;
CREATE TRIGGER tr_update_post_votes_score
AFTER INSERT OR UPDATE OR DELETE ON post_votes
FOR EACH ROW EXECUTE FUNCTION update_post_votes_score();

-- COMMENTS COUNT TRIGGER
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE posts SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE posts SET comments_count = COALESCE(comments_count, 0) - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_post_comments_count ON comments;
CREATE TRIGGER tr_update_post_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
