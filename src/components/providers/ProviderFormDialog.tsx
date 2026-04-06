import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { Provider, PlanType, SyncStatus, DataOrigin } from "@/data/mockData";
import type { ProviderPayload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/i18n";

interface ProviderFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode: "create" | "edit";
  provider?: Provider;
  trigger?: ReactNode;
  onSubmit: (payload: ProviderPayload) => Promise<void> | void;
  isSubmitting?: boolean;
}

interface ProviderFormState {
  name: string;
  logo: string;
  category: string;
  plan: string;
  planType: PlanType;
  monthlyCost: string;
  includedQuota: string;
  quotaUnit: string;
  resetDate: string;
  daysUntilReset: string;
  consumed: string;
  syncStatus: SyncStatus;
  dataOrigin: DataOrigin;
}

const defaultState: ProviderFormState = {
  name: "",
  logo: "",
  category: "LLM / API",
  plan: "",
  planType: "monthly_quota",
  monthlyCost: "0",
  includedQuota: "0",
  quotaUnit: "tokens",
  resetDate: "",
  daysUntilReset: "30",
  consumed: "0",
  syncStatus: "manual",
  dataOrigin: "manual",
};

function toFormState(provider?: Provider): ProviderFormState {
  if (!provider) return defaultState;
  return {
    name: provider.name,
    logo: provider.logo,
    category: provider.category,
    plan: provider.plan,
    planType: provider.planType,
    monthlyCost: String(provider.monthlyCost ?? 0),
    includedQuota: String(provider.includedQuota ?? 0),
    quotaUnit: provider.quotaUnit,
    resetDate: provider.resetDate,
    daysUntilReset: String(provider.daysUntilReset ?? 30),
    consumed: String(provider.consumed ?? 0),
    syncStatus: provider.syncStatus,
    dataOrigin: provider.dataOrigin,
  };
}

export function ProviderFormDialog({
  open,
  onOpenChange,
  mode,
  provider,
  trigger,
  onSubmit,
  isSubmitting = false,
}: ProviderFormDialogProps) {
  const { t } = useI18n();
  const [internalOpen, setInternalOpen] = useState(false);
  const [form, setForm] = useState<ProviderFormState>(() => toFormState(provider));

  const actualOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    if (actualOpen) {
      setForm(toFormState(provider));
    }
  }, [actualOpen, provider]);

  const title = mode === "create" ? t.providerCreateTitle : t.providerEditTitle;
  const description = mode === "create" ? t.providerCreateDescription : t.providerEditDescription;
  const submitLabel = mode === "create" ? t.providerCreateSubmit : t.providerEditSubmit;

  const canSubmit = useMemo(() => {
    return form.name.trim() !== "" && form.plan.trim() !== "" && form.monthlyCost.trim() !== "";
  }, [form]);

  const updateField = <K extends keyof ProviderFormState>(key: K, value: ProviderFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: ProviderPayload = {
      name: form.name.trim(),
      logo: form.logo.trim(),
      category: form.category.trim() || "LLM / API",
      plan: form.plan.trim(),
      planType: form.planType,
      monthlyCost: Number(form.monthlyCost || 0),
      includedQuota: Number(form.includedQuota || 0),
      quotaUnit: form.quotaUnit.trim() || "tokens",
      resetDate: form.resetDate,
      daysUntilReset: Number(form.daysUntilReset || 0),
      consumed: Number(form.consumed || 0),
      syncStatus: form.syncStatus,
      dataOrigin: form.dataOrigin,
    };

    await onSubmit(payload);
  };

  return (
    <Dialog open={actualOpen} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provider-name">{t.providerFormName}</Label>
              <Input id="provider-name" value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder={t.providerFormNamePlaceholder} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-logo">{t.providerFormLogo}</Label>
              <Input id="provider-logo" maxLength={4} value={form.logo} onChange={(e) => updateField("logo", e.target.value.toUpperCase())} placeholder={t.providerFormLogoPlaceholder} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-category">{t.providerFormCategory}</Label>
              <Input id="provider-category" value={form.category} onChange={(e) => updateField("category", e.target.value)} placeholder="LLM / API" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-plan">{t.providerFormPlan}</Label>
              <Input id="provider-plan" value={form.plan} onChange={(e) => updateField("plan", e.target.value)} placeholder={t.providerFormPlanPlaceholder} />
            </div>
            <div className="space-y-2">
              <Label>{t.providerFormPlanType}</Label>
              <Select value={form.planType} onValueChange={(value: PlanType) => updateField("planType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly_quota">{t.badgeMonthly}</SelectItem>
                  <SelectItem value="prepaid_credits">{t.badgePrepaid}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-cost">{t.providerFormMonthlyCost}</Label>
              <Input id="provider-cost" type="number" step="0.01" value={form.monthlyCost} onChange={(e) => updateField("monthlyCost", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-included">{t.providerFormIncludedQuota}</Label>
              <Input id="provider-included" type="number" step="0.01" value={form.includedQuota} onChange={(e) => updateField("includedQuota", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-unit">{t.providerFormQuotaUnit}</Label>
              <Input id="provider-unit" value={form.quotaUnit} onChange={(e) => updateField("quotaUnit", e.target.value)} placeholder="tokens" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-reset-date">{t.providerFormResetDate}</Label>
              <Input id="provider-reset-date" type="date" value={form.resetDate} onChange={(e) => updateField("resetDate", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-days-until-reset">{t.providerFormDaysUntilReset}</Label>
              <Input id="provider-days-until-reset" type="number" value={form.daysUntilReset} onChange={(e) => updateField("daysUntilReset", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-consumed">{t.providerFormConsumed}</Label>
              <Input id="provider-consumed" type="number" step="0.01" value={form.consumed} onChange={(e) => updateField("consumed", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.thSync}</Label>
              <Select value={form.syncStatus} onValueChange={(value: SyncStatus) => updateField("syncStatus", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">{t.badgeManual}</SelectItem>
                  <SelectItem value="pending">{t.badgePending}</SelectItem>
                  <SelectItem value="synced">{t.badgeSynced}</SelectItem>
                  <SelectItem value="error">{t.badgeError}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t.thData}</Label>
              <Select value={form.dataOrigin} onValueChange={(value: DataOrigin) => updateField("dataOrigin", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">{t.badgeManual}</SelectItem>
                  <SelectItem value="auto">{t.badgeAuto}</SelectItem>
                  <SelectItem value="adjusted">{t.badgeAdjusted}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.providerFormCancel}
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? t.providerFormSaving : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
