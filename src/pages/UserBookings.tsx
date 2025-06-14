
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { Loader, Ticket, Clock, MapPin, QrCode, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";
import QRCode from "qrcode.react";

const UserBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const user = await apiService.getCurrentUser();
        if (!user) throw new Error("Not authenticated");
        const result = await apiService.getUserBookings(user.id);
        setBookings(result);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to fetch bookings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Ticket className="w-10 h-10 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold">No Tickets Found</h2>
          <p className="text-gray-500 mb-4">You have not booked any tickets yet.</p>
          <Button onClick={() => navigate("/")}>Book Now</Button>
        </div>
      </div>
    );
  }

  // Helper to create a "random" QR string for each booking
  function buildQRCodeVal(booking: any) {
    return `TICKET-${booking.id}-${booking.created_at}`;
  }

  // Helper to nicely show seat codes
  function getSeatCodes(booking: any) {
    if (!booking.booking_seats) return "";
    return booking.booking_seats
      .map((bs: any) =>
        bs.seat
          ? `${bs.seat.row_letter}${bs.seat.seat_number}`
          : "?"
      )
      .join(", ");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Ticket className="h-7 w-7" />
          My Tickets
        </h1>
        <div className="grid md:grid-cols-2 gap-8">
          {bookings.map((booking) => {
            const show = booking.show;
            const movie = show?.movie || {};
            const theatre = show?.theatre || {};
            // fallback for seat, showtime, etc
            return (
              <Card key={booking.id} className="shadow-xl relative">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <CardTitle className="flex justify-between items-center">
                    <span>{movie.title || "Movie"}</span>
                    <Badge variant="secondary" className="font-bold text-purple-900">
                      {booking.id.slice(0, 8)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col md:flex-row gap-8">
                  {/* QR and Info */}
                  <div className="flex flex-col items-center justify-center w-full md:w-1/3">
                    <QRCode
                      value={buildQRCodeVal(booking)}
                      size={96}
                      fgColor="#6D28D9"
                      bgColor="#fff"
                      includeMargin
                    />
                    <span className="font-mono text-xs mt-2 text-purple-600">
                      Scan for details
                    </span>
                  </div>
                  {/* Ticket Details */}
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <div className="flex gap-2 items-center">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>
                        {theatre.name}, {theatre.city}
                        {theatre.address ? <> — {theatre.address}</> : null}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>
                        {show?.show_date || "Date"} • {show?.show_time || "Time"}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>
                        Seats:{" "}
                        <span className="font-semibold text-purple-800">
                          {getSeatCodes(booking) || "—"}
                        </span>
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="font-bold text-green-600 text-lg">
                        ₹{booking.total_amount}
                      </span>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Booking Info Copied ✔️",
                            description: "Details have been copied to clipboard.",
                          });
                          const str = `
Ticket: ${movie.title}
Theatre: ${theatre.name}, ${theatre.city}
Seats: ${getSeatCodes(booking)}
Show time: ${show?.show_date} • ${show?.show_time}
Booking ID: ${booking.id}
Total: ₹${booking.total_amount}
                          `.trim();
                          navigator.clipboard.writeText(str);
                        }}
                      >
                        Copy Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserBookings;

