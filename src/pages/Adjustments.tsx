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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

const Adjustments = () => {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t.adjustmentSaved);
    setOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.adjustmentsTitle}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.adjustmentsSubtitle}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{t.addAdjustment}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.newAdjustment}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.thProvider}</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder={t.selectProvider} /></SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t.thType}</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder={t.adjustmentType} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">{t.creditAdjustment}</SelectItem>
                      <SelectItem value="usage">{t.usageOverride}</SelectItem>
                      <SelectItem value="cost">{t.costCorrection}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t.amount}</Label>
                  <Input type="number" placeholder={t.amountPlaceholder} />
                </div>
                <div className="space-y-2">
                  <Label>{t.note}</Label>
                  <Textarea placeholder={t.notePlaceholder} />
                </div>
                <Button type="submit" className="w-full">{t.saveAdjustment}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t.adjustmentHistory}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.thDate}</TableHead>
                  <TableHead>{t.thProvider}</TableHead>
                  <TableHead>{t.thType}</TableHead>
                  <TableHead className="text-right">{t.amount}</TableHead>
                  <TableHead>{t.thNote}</TableHead>
                  <TableHead>{t.thAppliedBy}</TableHead>
                  <TableHead>{t.thOrigin}</TableHead>
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
