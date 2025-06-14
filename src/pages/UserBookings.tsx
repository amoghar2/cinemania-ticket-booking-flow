
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { mockBookings } from '@/data/mockData';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

const UserBookings = () => {
  const { user } = useAuth();

  // Get user's first name from user metadata
  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBookingStatus = (date: string) => {
    const bookingDate = new Date(date);
    const today = new Date();
    
    if (bookingDate < today) {
      return { status: 'Completed', color: 'bg-green-100 text-green-800' };
    } else if (bookingDate.toDateString() === today.toDateString()) {
      return { status: 'Today', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { status: 'Upcoming', color: 'bg-orange-100 text-orange-800' };
    }
  };

  const UserBookingsContent = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600">
            Welcome back, {firstName}! 
            Here are your movie ticket bookings.
          </p>
        </div>

        {mockBookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">You haven't booked any movie tickets yet.</p>
              <Link to="/">
                <Button>Book Your First Movie</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {mockBookings.map((booking) => {
              const { status, color } = getBookingStatus(booking.date);
              
              return (
                <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{booking.movieTitle}</h3>
                        <p className="text-gray-600">{booking.theatre}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={color}>
                          {status}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">#{booking.id}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-semibold">Show Date</p>
                            <p className="text-gray-600">{formatDate(booking.date)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-semibold">Show Time</p>
                            <p className="text-gray-600">{booking.showtime}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Users className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <p className="font-semibold">Seats</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {booking.seats.map((seat, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {seat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-semibold">Booked On</p>
                            <p className="text-gray-600">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold">Total Amount</p>
                          <p className="text-2xl font-bold text-green-600">₹{booking.totalAmount}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full">
                            <Ticket className="h-4 w-4 mr-2" />
                            View Ticket
                          </Button>
                          
                          {status === 'Upcoming' && (
                            <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700">
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Book New Movie Tickets
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                Download All Tickets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <UserBookingsContent />
    </ProtectedRoute>
  );
};

export default UserBookings;
