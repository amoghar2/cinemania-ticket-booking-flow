
-- Fixed massive show expansion for Bengaluru - corrected syntax issues
-- This will create extensive showtimes for all movies with realistic variety

-- Generate shows for popular movies (6 shows per day per theatre)
WITH popular_movies AS (
    SELECT m.id AS movie_id, t.id AS theatre_id, m.title
    FROM movies m
    CROSS JOIN theatres t 
    WHERE t.city = 'Bengaluru'
    AND m.title IN ('Dune', 'Spider-Man: No Way Home', 'Top Gun: Maverick')
),
date_series AS (
    SELECT generate_series(
        '2024-06-15'::date, 
        '2024-06-28'::date, 
        '1 day'::interval
    )::date AS show_date
),
popular_showtimes AS (
    SELECT * FROM (VALUES
        ('09:30'::time, 220),
        ('12:45'::time, 280),
        ('16:00'::time, 320),
        ('19:30'::time, 380),
        ('22:45'::time, 420),
        ('10:15'::time, 240)
    ) AS t(show_time, base_price)
)
INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price)
SELECT 
    pm.movie_id,
    pm.theatre_id,
    ds.show_date,
    ps.show_time,
    CASE 
        WHEN EXTRACT(dow FROM ds.show_date) IN (0,6) THEN ps.base_price + 50  -- Weekend premium
        WHEN ps.show_time >= '19:00'::time THEN ps.base_price + 30           -- Evening premium
        ELSE ps.base_price
    END AS price
FROM popular_movies pm
CROSS JOIN date_series ds
CROSS JOIN popular_showtimes ps
ON CONFLICT DO NOTHING;

-- Generate shows for regular movies (4 shows per day per theatre)
WITH regular_movies AS (
    SELECT m.id AS movie_id, t.id AS theatre_id, m.title
    FROM movies m
    CROSS JOIN theatres t 
    WHERE t.city = 'Bengaluru'
    AND m.title NOT IN ('Dune', 'Spider-Man: No Way Home', 'Top Gun: Maverick')
),
date_series AS (
    SELECT generate_series(
        '2024-06-15'::date, 
        '2024-06-28'::date, 
        '1 day'::interval
    )::date AS show_date
),
regular_showtimes AS (
    SELECT * FROM (VALUES
        ('11:00'::time, 200),
        ('14:30'::time, 250),
        ('18:00'::time, 300),
        ('21:30'::time, 350)
    ) AS t(show_time, base_price)
)
INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price)
SELECT 
    rm.movie_id,
    rm.theatre_id,
    ds.show_date,
    rs.show_time,
    CASE 
        WHEN EXTRACT(dow FROM ds.show_date) IN (0,6) THEN rs.base_price + 40  -- Weekend premium
        WHEN rs.show_time >= '18:00'::time THEN rs.base_price + 25            -- Evening premium
        ELSE rs.base_price
    END AS price
FROM regular_movies rm
CROSS JOIN date_series ds
CROSS JOIN regular_showtimes rs
ON CONFLICT DO NOTHING;

-- Add special late night shows for weekends (Friday=5, Saturday=6)
WITH all_movies AS (
    SELECT m.id AS movie_id, t.id AS theatre_id
    FROM movies m
    CROSS JOIN theatres t 
    WHERE t.city = 'Bengaluru'
),
weekend_dates AS (
    SELECT show_date
    FROM (
        SELECT generate_series(
            '2024-06-15'::date, 
            '2024-06-28'::date, 
            '1 day'::interval
        )::date AS show_date
    ) dates
    WHERE EXTRACT(dow FROM show_date) IN (5,6)  -- Friday and Saturday
)
INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price)
SELECT 
    am.movie_id,
    am.theatre_id,
    wd.show_date,
    '23:59'::time AS show_time,
    480 AS price  -- Premium late night pricing
FROM all_movies am
CROSS JOIN weekend_dates wd
WHERE random() < 0.3  -- Only 30% of movies get late night shows
ON CONFLICT DO NOTHING;

-- Add early morning shows for weekdays (Monday=1 to Friday=5)
WITH all_movies AS (
    SELECT m.id AS movie_id, t.id AS theatre_id
    FROM movies m
    CROSS JOIN theatres t 
    WHERE t.city = 'Bengaluru'
),
weekday_dates AS (
    SELECT show_date
    FROM (
        SELECT generate_series(
            '2024-06-17'::date, 
            '2024-06-28'::date, 
            '1 day'::interval
        )::date AS show_date
    ) dates
    WHERE EXTRACT(dow FROM show_date) BETWEEN 1 AND 5  -- Monday to Friday
)
INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price)
SELECT 
    am.movie_id,
    am.theatre_id,
    wd.show_date,
    '07:30'::time AS show_time,
    199 AS price  -- Minimum pricing for early shows
FROM all_movies am
CROSS JOIN weekday_dates wd
WHERE random() < 0.4  -- Only 40% of movies get early morning shows
ON CONFLICT DO NOTHING;

-- Add random additional shows for variety
WITH random_additional AS (
    SELECT m.id AS movie_id, t.id AS theatre_id
    FROM movies m
    CROSS JOIN theatres t 
    WHERE t.city = 'Bengaluru'
),
random_dates AS (
    SELECT generate_series(
        '2024-06-15'::date, 
        '2024-06-30'::date, 
        '1 day'::interval
    )::date AS show_date
),
random_times AS (
    SELECT * FROM (VALUES
        ('08:00'::time, 210),
        ('13:15'::time, 270),
        ('15:45'::time, 290),
        ('17:15'::time, 310),
        ('20:00'::time, 360),
        ('23:30'::time, 450)
    ) AS t(show_time, price)
)
INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price)
SELECT 
    ra.movie_id,
    ra.theatre_id,
    rd.show_date,
    rt.show_time,
    rt.price
FROM random_additional ra
CROSS JOIN random_dates rd
CROSS JOIN random_times rt
WHERE random() < 0.15  -- Only 15% chance for each combination (creates variety)
ON CONFLICT DO NOTHING;
