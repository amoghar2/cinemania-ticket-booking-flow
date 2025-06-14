
-- 1. Enforce min price ₹199 for all existing shows
UPDATE shows SET price = 199 WHERE price < 199;

-- 2. Add more showtimes for Bengaluru movies (Silicon Dreams, Bangalore Nights, Code Red)
-- Add new showtimes on the same date for variety
WITH bengaluru_movies AS (
    SELECT m.id AS movie_id, t.id AS theatre_id
    FROM movies m
    JOIN theatres t ON t.city = 'Bengaluru'
    WHERE m.title IN ('Silicon Dreams', 'Bangalore Nights', 'Code Red')
)
INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price)
SELECT
    bm.movie_id,
    bm.theatre_id,
    '2024-06-16'::date,
    times.show_time,
    times.price
FROM bengaluru_movies bm
CROSS JOIN (VALUES
    ('09:00'::time, 250),
    ('12:00'::time, 275),
    ('15:00'::time, 350),
    ('18:00'::time, 400),
    ('22:15'::time, 450)
) AS times (show_time, price);

-- Add another date for more future show variety
WITH bengaluru_movies AS (
    SELECT m.id AS movie_id, t.id AS theatre_id
    FROM movies m
    JOIN theatres t ON t.city = 'Bengaluru'
    WHERE m.title IN ('Silicon Dreams', 'Bangalore Nights', 'Code Red')
)
INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price)
SELECT
    bm.movie_id,
    bm.theatre_id,
    '2024-06-17'::date,
    times.show_time,
    times.price
FROM bengaluru_movies bm
CROSS JOIN (VALUES
    ('10:30'::time, 300),
    ('14:00'::time, 320),
    ('17:30'::time, 350),
    ('21:00'::time, 400)
) AS times (show_time, price);
