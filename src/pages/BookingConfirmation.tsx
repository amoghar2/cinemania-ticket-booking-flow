
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Share, Home, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    movie, 
    theatre, 
    showtime, 
    selectedDate, 
    selectedSeats, 
    totalAmount, 
    userDetails, 
    bookingId 
  } = location.state || {};

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Booking not found</h1>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const downloadTicket = () => {
    // Simulate ticket download
    alert('Ticket downloaded successfully!');
  };

  const shareBooking = () => {
    // Simulate sharing
    if (navigator.share) {
      navigator.share({
        title: `Movie Ticket - ${movie.title}`,
        text: `I just booked tickets for ${movie.title} at ${theatre.name}!`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`I just booked tickets for ${movie.title} at ${theatre.name}! Booking ID: ${bookingId}`);
      alert('Booking details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your tickets have been booked successfully</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Ticket Card */}
          <Card className="mb-6 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{movie.title}</h2>
                  <p className="opacity-90">{movie.genre}</p>
                </div>
                <Badge variant="secondary" className="text-purple-900 font-bold">
                  {bookingId}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <h4 className="font-semibold">Theatre</h4>
                      <p className="text-gray-600">{theatre.name}</p>
                      <p className="text-sm text-gray-500">{theatre.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <h4 className="font-semibold">Date & Time</h4>
                      <p className="text-gray-600">{selectedDate}</p>
                      <p className="text-sm text-gray-500">{showtime.time}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <h4 className="font-semibold">Seats</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSeats.map(seat => (
                          <Badge key={seat.id} variant="outline">{seat.id}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <h4 className="font-semibold">Total Amount</h4>
                      <p className="text-2xl font-bold text-green-600">₹{totalAmount}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold mb-2">Customer Details</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name: </span>
                    <span>{userDetails.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email: </span>
                    <span>{userDetails.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone: </span>
                    <span>{userDetails.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Booking Date: </span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Button onClick={downloadTicket} variant="outline" className="flex items-center justify-center">
              <Download className="h-4 w-4 mr-2" />
              Download Ticket
            </Button>
            
            <Button onClick={shareBooking} variant="outline" className="flex items-center justify-center">
              <Share className="h-4 w-4 mr-2" />
              Share Booking
            </Button>
            
            <Button onClick={() => navigate('/my-bookings')} variant="outline" className="flex items-center justify-center">
              <Users className="h-4 w-4 mr-2" />
              My Bookings
            </Button>
          </div>

          {/* Important Information */}
          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Please arrive at least 15 minutes before the show time</li>
                <li>• Carry a valid photo ID along with this ticket</li>
                <li>• Outside food and beverages are not allowed</li>
                <li>• Tickets once booked cannot be cancelled or refunded</li>
                <li>• Children above 3 years require a separate ticket</li>
                <li>• Mobile phones should be switched off during the screening</li>
              </ul>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Button onClick={() => navigate('/')} className="flex items-center justify-center">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
