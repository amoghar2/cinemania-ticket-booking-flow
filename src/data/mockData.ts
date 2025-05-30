
export const mockCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];

export const mockMovies = [
  {
    id: '1',
    title: 'Galactic Warriors',
    genre: 'Sci-Fi Action',
    duration: '2h 15m',
    rating: 8.5,
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop',
    description: 'An epic space adventure that takes you to the far reaches of the galaxy.',
    director: 'Alex Rodriguez',
    cast: ['Chris Evans', 'Zoe Saldana', 'Michael Shannon'],
    releaseDate: '2024-01-15'
  },
  {
    id: '2',
    title: 'Love in Paris',
    genre: 'Romance',
    duration: '1h 45m',
    rating: 7.8,
    poster: 'https://images.unsplash.com/photo-1489754715775-e30e9dc808e0?w=400&h=600&fit=crop',
    description: 'A heartwarming love story set against the beautiful backdrop of Paris.',
    director: 'Sophie Laurent',
    cast: ['Emma Stone', 'Ryan Gosling', 'Marion Cotillard'],
    releaseDate: '2024-02-14'
  },
  {
    id: '3',
    title: 'The Mystery Detective',
    genre: 'Thriller',
    duration: '2h 5m',
    rating: 8.2,
    poster: 'https://images.unsplash.com/photo-1489954420113-1d1adb1f9aca?w=400&h=600&fit=crop',
    description: 'A gripping thriller that will keep you on the edge of your seat.',
    director: 'David Fincher',
    cast: ['Benedict Cumberbatch', 'Rooney Mara', 'Oscar Isaac'],
    releaseDate: '2024-03-01'
  },
  {
    id: '4',
    title: 'Comedy Central',
    genre: 'Comedy',
    duration: '1h 55m',
    rating: 7.5,
    poster: 'https://images.unsplash.com/photo-1489754715775-e30e9dc808e0?w=400&h=600&fit=crop',
    description: 'A hilarious comedy that will have you laughing from start to finish.',
    director: 'Judd Apatow',
    cast: ['Steve Carell', 'Amy Poehler', 'Will Ferrell'],
    releaseDate: '2024-03-15'
  },
  {
    id: '5',
    title: 'Dragon Quest',
    genre: 'Fantasy Adventure',
    duration: '2h 30m',
    rating: 8.7,
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop',
    description: 'An epic fantasy adventure with dragons, magic, and heroes.',
    director: 'Peter Jackson',
    cast: ['Tom Hiddleston', 'Cate Blanchett', 'Ian McKellen'],
    releaseDate: '2024-04-01'
  },
  {
    id: '6',
    title: 'Speed Racer',
    genre: 'Action',
    duration: '2h 10m',
    rating: 7.9,
    poster: 'https://images.unsplash.com/photo-1489954420113-1d1adb1f9aca?w=400&h=600&fit=crop',
    description: 'High-octane racing action with stunning visual effects.',
    director: 'Denis Villeneuve',
    cast: ['Tom Hardy', 'Charlize Theron', 'Oscar Isaac'],
    releaseDate: '2024-04-15'
  }
];

export const mockTheatres = [
  {
    id: '1',
    name: 'PVR Cinemas',
    location: 'Phoenix Mall',
    distance: '2.5 km',
    amenities: ['Dolby Atmos', 'Recliner Seats', 'Food Court']
  },
  {
    id: '2',
    name: 'INOX Megaplex',
    location: 'City Center',
    distance: '3.2 km',
    amenities: ['IMAX', 'Premium Seats', 'Parking']
  },
  {
    id: '3',
    name: 'Cineplex Gold',
    location: 'Mall of Dreams',
    distance: '5.1 km',
    amenities: ['4DX', 'VIP Lounge', 'Valet Parking']
  }
];

export const mockShowtimes = [
  { time: '10:00 AM', type: 'Morning Show', price: 150 },
  { time: '1:30 PM', type: 'Matinee', price: 200 },
  { time: '4:45 PM', type: 'Evening', price: 250 },
  { time: '8:15 PM', type: 'Night Show', price: 300 },
  { time: '11:30 PM', type: 'Late Night', price: 200 }
];

export const generateSeatLayout = () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 12;
  const seats = [];
  
  for (const row of rows) {
    for (let i = 1; i <= seatsPerRow; i++) {
      const seatNumber = `${row}${i}`;
      const isBooked = Math.random() < 0.3; // 30% chance of being booked
      seats.push({
        id: seatNumber,
        row,
        number: i,
        isBooked,
        isSelected: false,
        price: row <= 'C' ? 400 : row <= 'F' ? 300 : 200
      });
    }
  }
  
  return seats;
};

export const mockBookings = [
  {
    id: 'BK001',
    movieTitle: 'Galactic Warriors',
    theatre: 'PVR Cinemas - Phoenix Mall',
    showtime: '8:15 PM',
    date: '2024-01-20',
    seats: ['E5', 'E6'],
    totalAmount: 600,
    bookingDate: '2024-01-18'
  },
  {
    id: 'BK002',
    movieTitle: 'Love in Paris',
    theatre: 'INOX Megaplex - City Center',
    showtime: '4:45 PM',
    date: '2024-02-14',
    seats: ['F7', 'F8'],
    totalAmount: 500,
    bookingDate: '2024-02-12'
  }
];
