
-- First, let's add some unique movies for each city
INSERT INTO public.movies (title, description, duration, genre, rating, poster_url, release_date) VALUES
-- Bengaluru movies (Tech/Modern themes)
('Silicon Dreams', 'A techno-thriller about AI ethics in modern India', 142, 'Thriller', '8.1', 'https://picsum.photos/300/450?random=101', '2024-06-01'),
('Bangalore Nights', 'A romantic comedy set in the IT capital of India', 128, 'Romance', '7.8', 'https://picsum.photos/300/450?random=102', '2024-05-15'),
('Code Red', 'Cyber crime investigation in the heart of Silicon Valley of India', 156, 'Crime', '8.3', 'https://picsum.photos/300/450?random=103', '2024-06-10'),

-- Delhi movies (Historical/Political themes)
('Delhi Durbar', 'Epic historical drama about the last Mughal emperor', 185, 'Historical', '8.7', 'https://picsum.photos/300/450?random=201', '2024-05-20'),
('Parliament House', 'Political thriller set in the corridors of power', 134, 'Political', '8.2', 'https://picsum.photos/300/450?random=202', '2024-06-05'),
('Red Fort Mysteries', 'Archaeological adventure in Old Delhi', 145, 'Adventure', '7.9', 'https://picsum.photos/300/450?random=203', '2024-06-12'),

-- Mumbai movies (Bollywood/Business themes)
('Bollywood Dreams', 'Musical drama about struggling actors in Mumbai', 165, 'Musical', '8.5', 'https://picsum.photos/300/450?random=301', '2024-05-25'),
('Marine Drive Nights', 'Urban romance along the Queen''s Necklace', 119, 'Romance', '7.6', 'https://picsum.photos/300/450?random=302', '2024-06-08'),
('Mumbai Mafia Chronicles', 'Crime saga in the financial capital', 178, 'Crime', '8.9', 'https://picsum.photos/300/450?random=303', '2024-06-15');

-- Now let's add theatres for each city if they don't exist
INSERT INTO public.theatres (name, city, address, total_seats) VALUES
-- Bengaluru theatres
('INOX Forum Mall', 'Bengaluru', 'Forum Mall, Koramangala, Bengaluru', 200),
('PVR Phoenix Marketcity', 'Bengaluru', 'Phoenix Marketcity, Whitefield, Bengaluru', 250),
('Cinepolis Nexus Mall', 'Bengaluru', 'Nexus Mall, Koramangala, Bengaluru', 180),

-- Delhi theatres  
('PVR Select City Walk', 'Delhi', 'Select City Walk, Saket, Delhi', 220),
('INOX CP', 'Delhi', 'Connaught Place, Delhi', 190),
('Cinepolis DLF Place', 'Delhi', 'DLF Place, Saket, Delhi', 210),

-- Mumbai theatres
('PVR Phoenix Lower Parel', 'Mumbai', 'Phoenix Mills, Lower Parel, Mumbai', 240),
('INOX R-City Mall', 'Mumbai', 'R-City Mall, Ghatkopar, Mumbai', 200),
('Cinepolis Andheri', 'Mumbai', 'Infiniti Mall, Andheri, Mumbai', 180);

-- Add shows for Bengaluru movies
INSERT INTO public.shows (movie_id, theatre_id, show_date, show_time, price)
SELECT 
    m.id as movie_id,
    t.id as theatre_id,
    '2024-06-16' as show_date,
    times.show_time,
    prices.price
FROM movies m
CROSS JOIN theatres t
CROSS JOIN (VALUES 
    ('10:00'::time, 250.00),
    ('13:30'::time, 300.00),
    ('17:00'::time, 350.00),
    ('20:30'::time, 400.00)
) AS times(show_time, price)
CROSS JOIN (VALUES (250.00), (300.00), (350.00), (400.00)) AS prices(price)
WHERE m.title IN ('Silicon Dreams', 'Bangalore Nights', 'Code Red')
AND t.city = 'Bengaluru'
AND times.price = prices.price;

-- Add shows for Delhi movies
INSERT INTO public.shows (movie_id, theatre_id, show_date, show_time, price)
SELECT 
    m.id as movie_id,
    t.id as theatre_id,
    '2024-06-16' as show_date,
    times.show_time,
    times.price
FROM movies m
CROSS JOIN theatres t
CROSS JOIN (VALUES 
    ('11:00'::time, 280.00),
    ('14:30'::time, 320.00),
    ('18:00'::time, 380.00),
    ('21:30'::time, 420.00)
) AS times(show_time, price)
WHERE m.title IN ('Delhi Durbar', 'Parliament House', 'Red Fort Mysteries')
AND t.city = 'Delhi';

-- Add shows for Mumbai movies
INSERT INTO public.shows (movie_id, theatre_id, show_date, show_time, price)
SELECT 
    m.id as movie_id,
    t.id as theatre_id,
    '2024-06-16' as show_date,
    times.show_time,
    times.price
FROM movies m
CROSS JOIN theatres t
CROSS JOIN (VALUES 
    ('09:30'::time, 300.00),
    ('13:00'::time, 350.00),
    ('16:30'::time, 400.00),
    ('20:00'::time, 450.00)
) AS times(show_time, price)
WHERE m.title IN ('Bollywood Dreams', 'Marine Drive Nights', 'Mumbai Mafia Chronicles')
AND t.city = 'Mumbai';

-- Generate seats for all the new shows
INSERT INTO public.seats (show_id, row_letter, seat_number, is_booked, is_locked)
SELECT 
    s.id as show_id,
    rows.row_letter,
    seats.seat_number,
    false as is_booked,
    false as is_locked
FROM shows s
CROSS JOIN (VALUES ('A'), ('B'), ('C'), ('D'), ('E'), ('F'), ('G'), ('H')) AS rows(row_letter)
CROSS JOIN (VALUES ('1'), ('2'), ('3'), ('4'), ('5'), ('6'), ('7'), ('8'), ('9'), ('10')) AS seats(seat_number)
WHERE s.show_date = '2024-06-16'
AND NOT EXISTS (
    SELECT 1 FROM seats seat WHERE seat.show_id = s.id
);
