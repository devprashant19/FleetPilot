import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2, ArrowLeft, Truck, Wrench, Fuel, DollarSign, Calendar, Navigation } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="p-8 text-center text-red-400">
        <p>Failed to load vehicle details.</p>
        <Button variant="link" onClick={() => navigate('/vehicles')}>Go Back</Button>
      </div>
    );
  }

  const STATUS_VARIANT: Record<string, any> = {
    AVAILABLE: 'success',
    ON_TRIP: 'blue',
    IN_SHOP: 'orange',
    RETIRED: 'gray',
  };

  const totalFuelCost = vehicle.fuelLogs?.reduce((sum: number, log: any) => sum + log.cost, 0) || 0;
  const totalMaintenanceCost = vehicle.maintenanceLogs?.reduce((sum: number, log: any) => sum + log.cost, 0) || 0;
  const totalExpenses = vehicle.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
  const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> {vehicle.registrationNumber}
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
            {vehicle.name} <Badge variant="outline" className="ml-2">{vehicle.type}</Badge>
            <Badge variant={STATUS_VARIANT[vehicle.status]}>{vehicle.status.replace('_', ' ')}</Badge>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-blue-400 bg-blue-500/15">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Odometer</p>
              <p className="text-xl font-bold">{vehicle.odometer.toLocaleString()} km</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-red-400 bg-red-500/15">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Op. Cost</p>
              <p className="text-xl font-bold">{formatCurrency(totalOperationalCost)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-amber-400 bg-amber-500/15">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Maintenance Logs</p>
              <p className="text-xl font-bold">{vehicle.maintenanceLogs?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-green-400 bg-green-500/15">
              <Fuel className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fuel Logs</p>
              <p className="text-xl font-bold">{vehicle.fuelLogs?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="h-4 w-4" /> Recent Trips
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {vehicle.trips?.length === 0 ? (
              <p className="text-muted-foreground text-sm p-6 text-center">No trips recorded</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicle.trips?.slice(0, 5).map((trip: any) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">
                        {trip.source} → {trip.destination}
                      </TableCell>
                      <TableCell>{trip.driver?.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{trip.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {formatDate(trip.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="p-4 border-t border-border/50 text-center">
              <Button variant="link" size="sm" onClick={() => navigate('/trips')}>View All Trips</Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Maintenance & Fuel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Recent Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {vehicle.maintenanceLogs?.length === 0 ? (
                <p className="text-muted-foreground text-sm p-6 text-center">No maintenance records</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicle.maintenanceLogs?.slice(0, 3).map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.description}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === 'OPEN' ? 'orange' : 'success'}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-red-400 font-medium">
                          {formatCurrency(log.cost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Fuel className="h-4 w-4" /> Recent Fuel Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {vehicle.fuelLogs?.length === 0 ? (
                <p className="text-muted-foreground text-sm p-6 text-center">No fuel records</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Liters</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicle.fuelLogs?.slice(0, 3).map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.date)}</TableCell>
                        <TableCell>{log.liters} L</TableCell>
                        <TableCell className="text-right text-red-400 font-medium">
                          {formatCurrency(log.cost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
