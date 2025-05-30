
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockMovies, mockTheatres, mockShowtimes } from '@/data/mockData';
import Navigation from '@/components/Navigation';

const MovieDetails = () => {
  const { id } = useParams();
  const movie = mockMovies.find(m => m.id === id);
  const [selectedDate, setSelectedDate] = useState('2024-01-20');

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

  const dates = [
    { date: '2024-01-20', day: 'Today' },
    { date: '2024-01-21', day: 'Tomorrow' },
    { date: '2024-01-22', day: 'Mon' },
    { date: '2024-01-23', day: 'Tue' },
    { date: '2024-01-24', day: 'Wed' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10"></div>
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-96 object-cover"
        />
        
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center text-white mb-6 hover:text-purple-300 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Movies
            </Link>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h1 className="text-5xl font-bold text-white mb-4">{movie.title}</h1>
                <div className="flex items-center space-x-6 text-white mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="font-bold">{movie.rating}/10</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-1" />
                    <span>{movie.duration}</span>
                  </div>
                  <Badge variant="secondary">{movie.genre}</Badge>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">{movie.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">About the Movie</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-600">Director</h3>
                <p className="text-lg">{movie.director}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600">Release Date</h3>
                <p className="text-lg">{movie.releaseDate}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-600 mb-2">Cast</h3>
              <div className="flex flex-wrap gap-2">
                {movie.cast.map((actor, index) => (
                  <Badge key={index} variant="outline">{actor}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Calendar className="h-6 w-6 mr-2" />
            Select Date
          </h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {dates.map((dateObj) => (
              <Button
                key={dateObj.date}
                variant={selectedDate === dateObj.date ? 'default' : 'outline'}
                onClick={() => setSelectedDate(dateObj.date)}
                className="min-w-fit"
              >
                <div className="text-center">
                  <div className="font-semibold">{dateObj.day}</div>
                  <div className="text-sm">{dateObj.date.split('-')[2]}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Theatres and Showtimes */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <MapPin className="h-6 w-6 mr-2" />
            Choose Theatre & Time
          </h2>
          
          <div className="space-y-6">
            {mockTheatres.map((theatre) => (
              <Card key={theatre.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                  <CardTitle className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{theatre.name}</h3>
                      <p className="text-gray-600">{theatre.location} • {theatre.distance}</p>
                    </div>
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {theatre.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {mockShowtimes.map((showtime, index) => (
                      <Link
                        key={index}
                        to={`/showtime/${movie.id}/${theatre.id}/${showtime.time.replace(/[:\s]/g, '')}`}
                        state={{ movie, theatre, showtime, selectedDate }}
                      >
                        <Button
                          variant="outline"
                          className="w-full hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                        >
                          <div className="text-center">
                            <div className="font-semibold">{showtime.time}</div>
                            <div className="text-xs text-gray-500">{showtime.type}</div>
                            <div className="text-xs font-semibold text-green-600">₹{showtime.price}</div>
                          </div>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
