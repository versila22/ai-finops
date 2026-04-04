import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { adjustments, providers } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const Adjustments = () => {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Adjustment saved (demo mode)");
    setOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manual Adjustments</h1>
            <p className="text-sm text-muted-foreground mt-1">Review and add manual corrections to provider data</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Adjustment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Manual Adjustment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Adjustment type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit Adjustment</SelectItem>
                      <SelectItem value="usage">Usage Override</SelectItem>
                      <SelectItem value="cost">Cost Correction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" placeholder="e.g. -200 or 150" />
                </div>
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Textarea placeholder="Reason for this adjustment" />
                </div>
                <Button type="submit" className="w-full">Save Adjustment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Adjustment History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Applied By</TableHead>
                  <TableHead>Origin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs text-muted-foreground">{a.date}</TableCell>
                    <TableCell className="font-medium text-sm">{a.providerName}</TableCell>
                    <TableCell className="text-sm">{a.type}</TableCell>
                    <TableCell className={`text-right font-semibold ${a.amount < 0 ? "text-status-critical" : "text-status-healthy"}`}>
                      {a.amount > 0 ? "+" : ""}{a.amount}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[240px]">{a.note}</TableCell>
                    <TableCell className="text-xs">{a.appliedBy}</TableCell>
                    <TableCell><StatusBadge status="adjusted" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Adjustments;
