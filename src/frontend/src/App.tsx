import { ClinicTab } from "@/components/ClinicTab";
import { MedicinesTab } from "@/components/MedicinesTab";
import { ReceptionTab } from "@/components/ReceptionTab";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetAllPatients } from "@/hooks/useQueries";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClipboardList, Pill, RefreshCw, Stethoscope } from "lucide-react";

const queryClient = new QueryClient();

function SyncIndicator() {
  const { isFetching } = useGetAllPatients();
  return (
    <div className="flex items-center gap-1.5">
      {isFetching && (
        <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin" />
      )}
      <div
        className={`h-2 w-2 rounded-full transition-colors ${
          isFetching ? "bg-amber-400" : "bg-green-400"
        }`}
      />
    </div>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none">Matru Clinic</p>
              <p className="text-xs text-muted-foreground">
                Dr. Dhairya Bhatt · Patient Management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SyncIndicator />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-none text-foreground">
                  Dr. Dhairya Bhatt
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Physician
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live sync every 3s
          </p>
        </div>

        <Tabs defaultValue="clinic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-card border border-border h-11">
            <TabsTrigger
              value="clinic"
              className="flex items-center gap-1.5 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="clinic.tab"
            >
              <Stethoscope className="h-3.5 w-3.5" />
              Clinic
            </TabsTrigger>
            <TabsTrigger
              value="reception"
              className="flex items-center gap-1.5 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="reception.tab"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Reception
            </TabsTrigger>
            <TabsTrigger
              value="medicines"
              className="flex items-center gap-1.5 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="medicines.tab"
            >
              <Pill className="h-3.5 w-3.5" />
              Medicines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clinic" className="mt-0">
            <ClinicTab />
          </TabsContent>
          <TabsContent value="reception" className="mt-0">
            <ReceptionTab />
          </TabsContent>
          <TabsContent value="medicines" className="mt-0">
            <MedicinesTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-auto">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
