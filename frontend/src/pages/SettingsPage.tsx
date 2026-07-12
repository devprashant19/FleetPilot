import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, Settings as SettingsIcon } from 'lucide-react';
import { useToast } from '@/components/ui/toaster';

export function SettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    depotName: 'Gandhinagar Depot GJ4',
    currency: 'INR (Rs)',
    distanceUnit: 'Kilometers',
  });

  const handleSave = () => {
    toast({ title: 'Settings saved', description: 'Your general settings have been updated.', variant: 'success' });
  };

  const rbacData = [
    { role: 'Fleet Manager', fleet: '✓', drivers: '✓', trips: '-', fuel: '-', analytics: '✓' },
    { role: 'Dispatcher', fleet: 'view', drivers: '-', trips: '✓', fuel: '-', analytics: '-' },
    { role: 'Safety Officer', fleet: '-', drivers: '✓', trips: 'view', fuel: '-', analytics: '-' },
    { role: 'Financial Analyst', fleet: 'view', drivers: '-', trips: '-', fuel: '✓', analytics: '✓' },
  ];

  const renderCell = (value: string) => {
    if (value === '✓') return <Check className="h-4 w-4 text-muted-foreground mx-auto" />;
    if (value === 'view') return <span className="text-xs text-muted-foreground">view</span>;
    return <span className="text-muted-foreground">-</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 uppercase tracking-wide">
          <SettingsIcon className="h-6 w-6 text-primary" /> Settings
        </h1>
      </div>

      <div className="flex gap-12">
        {/* Left: General Settings */}
        <div className="w-[400px] space-y-6 shrink-0">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">GENERAL</h2>
          
          <div className="space-y-1.5">
            <Label className="text-xs uppercase text-muted-foreground font-semibold">DEPOT NAME</Label>
            <Input 
              value={form.depotName} 
              onChange={(e) => setForm({ ...form, depotName: e.target.value })} 
              className="bg-card/50"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs uppercase text-muted-foreground font-semibold">CURRENCY</Label>
            <Input 
              value={form.currency} 
              onChange={(e) => setForm({ ...form, currency: e.target.value })} 
              className="bg-card/50"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs uppercase text-muted-foreground font-semibold">DISTANCE UNIT</Label>
            <Input 
              value={form.distanceUnit} 
              onChange={(e) => setForm({ ...form, distanceUnit: e.target.value })} 
              className="bg-card/50"
            />
          </div>

          <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white shadow-md rounded-full px-6">
            Save changes
          </Button>
        </div>

        {/* Right: RBAC Table */}
        <div className="flex-1 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">ROLE-BASED ACCESS (RBAC)</h2>
          
          <div className="border border-border/50 rounded-lg overflow-hidden bg-card/20">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs uppercase font-semibold">ROLE</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-center">FLEET</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-center">DRIVERS</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-center">TRIPS</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-center">FUEL/EXP.</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-center">ANALYTICS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rbacData.map((row) => (
                  <TableRow key={row.role} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{row.role}</TableCell>
                    <TableCell className="text-center">{renderCell(row.fleet)}</TableCell>
                    <TableCell className="text-center">{renderCell(row.drivers)}</TableCell>
                    <TableCell className="text-center">{renderCell(row.trips)}</TableCell>
                    <TableCell className="text-center">{renderCell(row.fuel)}</TableCell>
                    <TableCell className="text-center">{renderCell(row.analytics)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
