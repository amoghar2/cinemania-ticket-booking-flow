
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateSeatLayout } from '@/data/mockData';
import Navigation from '@/components/Navigation';

const Showtime = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, theatre, showtime, selectedDate } = location.state || {};
  
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    setSeats(generateSeatLayout());
  }, []);

  const handleSeatClick = (seatId) => {
    if (seats.find(seat => seat.id === seatId)?.isBooked) return;
    
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const getSeatClass = (seat) => {
    if (seat.isBooked) return 'bg-red-500 cursor-not-allowed';
    if (selectedSeats.includes(seat.id)) return 'bg-green-500 border-green-600';
    return 'bg-gray-200 hover:bg-purple-200 border-gray-300';
  };

  const totalAmount = selectedSeats.reduce((sum, seatId) => {
    const seat = seats.find(s => s.id === seatId);
    return sum + (seat?.price || 0);
  }, 0);

  const proceedToBooking = () => {
    if (selectedSeats.length === 0) return;
    
    const selectedSeatDetails = seats.filter(seat => selectedSeats.includes(seat.id));
    navigate('/booking', {
      state: {
        movie,
        theatre,
        showtime,
        selectedDate,
        selectedSeats: selectedSeatDetails,
        totalAmount
      }
    });
  };

  if (!movie || !theatre || !showtime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid booking details</h1>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Movie Info Header */}
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{movie.title}</h1>
                  <p className="opacity-90">{theatre.name} - {theatre.location}</p>
                  <p className="opacity-90">{selectedDate} • {showtime.time}</p>
                </div>
                <Badge variant="secondary" className="text-purple-900">
                  {movie.genre}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Seat Layout */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Select Your Seats</CardTitle>
                <div className="flex justify-center items-center space-x-2 py-4">
                  <Monitor className="h-8 w-8 text-gray-600" />
                  <span className="text-sm text-gray-600 font-medium">SCREEN</span>
                </div>
                <div className="w-full h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-8"></div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 mb-6">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(row => (
                    <div key={row} className="flex items-center justify-center space-x-2">
                      <span className="w-6 text-center font-semibold text-gray-600">{row}</span>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(number => {
                        const seat = seats.find(s => s.row === row && s.number === number);
                        if (!seat) return null;
                        
                        return (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat.id)}
                            className={`w-8 h-8 rounded border-2 text-xs font-medium transition-all duration-200 ${getSeatClass(seat)}`}
                            disabled={seat.isBooked}
                          >
                            {number}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 border border-green-600 rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Selected Seats</h4>
                  {selectedSeats.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(seatId => (
                        <Badge key={seatId} variant="outline">{seatId}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No seats selected</p>
                  )}
                </div>

                {selectedSeats.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Seats ({selectedSeats.length})</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Convenience Fee</span>
                      <span>₹{Math.round(totalAmount * 0.1)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{totalAmount + Math.round(totalAmount * 0.1)}</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  disabled={selectedSeats.length === 0}
                  onClick={proceedToBooking}
                >
                  Proceed to Book ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Showtime;
