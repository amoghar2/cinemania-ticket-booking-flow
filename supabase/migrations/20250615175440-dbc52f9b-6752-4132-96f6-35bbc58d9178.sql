
-- Update existing movies' poster URLs in the movies table
UPDATE public.movies
  SET poster_url = 'https://cdn.marvel.com/content/1x/avengersendgame_lob_crd_05.jpg'
  WHERE lower(title) LIKE '%avengers: endgame%';

UPDATE public.movies
  SET poster_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_4QIAFckt_xyalsTvRHptsM3xTIuGpYjHrVluZIj9k1PyXlNk'
  WHERE lower(title) LIKE '%black panther%';

UPDATE public.movies
  SET poster_url = 'https://pics.filmaffinity.com/No_Time_to_Die-525355918-large.jpg'
  WHERE lower(title) LIKE '%no time to die%';

UPDATE public.movies
  SET poster_url = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCg...'
  WHERE lower(title) LIKE '%spider man no way home%';
