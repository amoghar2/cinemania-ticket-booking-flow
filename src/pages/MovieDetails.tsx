
import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { apiService } from '@/services/api';

const MovieDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city') || 'Bengaluru';
  
  const [movie, setMovie] = useState(null);
  const [allShows, setAllShows] = useState([]);
  const [shows, setShows] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('Fetching movie details for ID:', id, 'City:', city);
        
        // Fetch movie details
        const movieData = await apiService.getMovie(id);
        console.log('Movie data received:', movieData);
        setMovie(movieData);
        
        // Fetch ALL shows for this movie in the selected city (without date filter)
        const allShowsData = await apiService.getMovieShows(id, city);
        console.log('All shows data received for', city, ':', allShowsData);
        setAllShows(allShowsData);
        
        // Extract unique available dates from the shows
        const uniqueDates = [...new Set(allShowsData.map(show => show.show_date))].sort();
        console.log('Available dates extracted:', uniqueDates);
        setAvailableDates(uniqueDates);
        
        // Set the first available date as selected, or empty if no dates
        if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]);
          // Filter shows for the first available date
          const filteredShows = allShowsData.filter(show => show.show_date === uniqueDates[0]);
          setShows(filteredShows);
          console.log('Shows for first available date:', uniqueDates[0], ':', filteredShows);
        } else {
          setSelectedDate('');
          setShows([]);
          console.log('No available dates found');
        }
      } catch (error) {
        console.error('Failed to fetch movie data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id, city]);

  // Handle date change
  useEffect(() => {
    if (selectedDate && allShows.length > 0) {
      console.log('Filtering shows for selected date:', selectedDate);
      const filteredShows = allShows.filter(show => show.show_date === selectedDate);
      console.log('Filtered shows for date', selectedDate, ':', filteredShows);
      setShows(filteredShows);
    }
  }, [selectedDate, allShows]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading movie details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format dates for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return { day: 'Today', dayNumber: date.getDate() };
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return { day: 'Tomorrow', dayNumber: date.getDate() };
    } else {
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate()
      };
    }
  };

  // Group shows by theatre with enhanced null checks
  const showsByTheatre = shows.reduce((acc, show) => {
    if (!show || !show.theatre || !show.theatre.id) {
      console.warn('Show missing theatre data:', show);
      return acc;
    }
    
    const theatreId = show.theatre.id;
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatre,
        shows: []
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10"></div>
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-96 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://picsum.photos/1200/400?random=' + movie.id;
          }}
        />
        
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4">
            <Link to={`/?city=${city}`} className="inline-flex items-center text-white mb-6 hover:text-purple-300 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Movies
            </Link>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h1 className="text-5xl font-bold text-white mb-4">{movie.title}</h1>
                <div className="flex items-center space-x-6 text-white mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="font-bold">{movie.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-1" />
                    <span>{movie.duration} mins</span>
                  </div>
                  <Badge variant="secondary">{movie.genre}</Badge>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">{movie.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Date Selection */}
        {availableDates.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Select Date
            </h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {availableDates.map((dateString) => {
                const { day, dayNumber } = formatDateForDisplay(dateString);
                return (
                  <Button
                    key={dateString}
                    variant={selectedDate === dateString ? 'default' : 'outline'}
                    onClick={() => setSelectedDate(dateString)}
                    className="min-w-fit"
                  >
                    <div className="text-center">
                      <div className="font-semibold">{day}</div>
                      <div className="text-sm">{dayNumber}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              No Shows Available
            </h2>
            <p className="text-gray-600">No show dates are currently available for this movie in {city}.</p>
          </div>
        )}

        {/* Theatres and Showtimes */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <MapPin className="h-6 w-6 mr-2" />
            Theatres in {city}
          </h2>
          
          {Object.keys(showsByTheatre).length === 0 ? (
            <div className="text-center py-12">
              {availableDates.length === 0 ? (
                <div>
                  <p className="text-gray-600 text-lg">No shows available for this movie in {city}.</p>
                  <p className="text-gray-500">This movie may not be currently playing in this city.</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 text-lg">No shows available for {selectedDate} in {city}.</p>
                  <p className="text-gray-500">Try selecting a different date.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.values(showsByTheatre).map((theatreData: any) => (
                <Card key={theatreData.theatre.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{theatreData.theatre.name}</h3>
                        <p className="text-gray-600">{theatreData.theatre.address}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {theatreData.shows.map((show: any) => (
                        <Link
                          key={show.id}
                          to={`/showtime/${show.id}`}
                          state={{ movie, theatre: theatreData.theatre, show, selectedDate, city }}
                        >
                          <Button
                            variant="outline"
                            className="w-full hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                          >
                            <div className="text-center">
                              <div className="font-semibold">{show.show_time}</div>
                              <div className="text-xs font-semibold text-green-600">₹{show.price}</div>
                            </div>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
