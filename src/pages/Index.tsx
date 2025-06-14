
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { apiService } from '@/services/api';

const Index = () => {
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cities] = useState([
    'Mumbai', 'Delhi', 'Bengaluru', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
    'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'San Francisco', 'Columbus',
    'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'Nashville'
  ]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        console.log('Fetching movies for city:', selectedCity);
        const moviesData = await apiService.getMovies(selectedCity);
        console.log('Received movies data:', moviesData);
        setMovies(moviesData);
        setFilteredMovies(moviesData);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
        setMovies([]);
        setFilteredMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedCity]);

  useEffect(() => {
    const filtered = movies.filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMovies(filtered);
  }, [searchQuery, movies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading movies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 animate-fade-in">
              Book Your Perfect Movie Experience
            </h1>
            <p className="text-xl opacity-90">
              Discover the latest movies and book your seats instantly
            </p>
          </div>
          
          {/* Search Section */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-white/70" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  {cities.map(city => (
                    <option key={city} value={city} className="text-gray-900">{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-5 w-5 text-white/70" />
                <Input
                  placeholder="Search movies, genres..."
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/70 focus:border-white/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movies Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Now Showing in {selectedCity}
          </h2>
          <span className="text-gray-600">{filteredMovies.length} movies found</span>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No movies found for {selectedCity}.</p>
            <p className="text-gray-500">Try selecting a different city or check back later.</p>
            <p className="text-gray-400 text-sm mt-2">Debug: Total movies loaded: {movies.length}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <Link key={movie.id} to={`/movie/${movie.id}?city=${selectedCity}`}>
                <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
                  <div className="relative overflow-hidden">
                    <img
                      src={movie.poster_url || movie.poster}
                      alt={movie.title}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://picsum.photos/300/450?random=' + movie.id;
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-yellow-500 text-black font-bold">
                        <Star className="w-3 h-3 mr-1" />
                        {movie.rating}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <Badge variant="secondary" className="mb-2">{movie.genre}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 transition-colors">
                      {movie.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="w-4 h-4 mr-1" />
                      {movie.duration} mins
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{movie.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
