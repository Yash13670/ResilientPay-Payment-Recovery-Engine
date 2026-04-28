import { motion } from "framer-motion";
import { PipelineResult } from "@/lib/mockScenarios";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle, Info, Clock, Activity, Fingerprint, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface OutputDashboardProps {
  result: PipelineResult;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function OutputDashboard({ result }: OutputDashboardProps) {
  const { toast } = useToast();
  const [copiedHash, setCopiedHash] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    toast({ description: "Hash copied to clipboard", duration: 2000 });
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isSuccess = result.status === "SUCCESS";
  const isFailed = result.status === "FAILED";
  const isRetrying = result.status === "RETRYING";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Time Saved", value: `${result.timeSaved}m`, icon: Clock, color: "text-blue-400" },
          { label: "Effort Reduced", value: `${result.effortReduced}%`, icon: Activity, color: "text-emerald-400" },
          { label: "SLA Breaches Avoided", value: result.slaAvoided, icon: ShieldCheckIcon, color: "text-purple-400" },
          { label: "Funds Recovered", value: `$${result.amount.toLocaleString()}`, icon: TrendingUpIcon, color: "text-amber-400" },
        ].map((metric, i) => (
          <motion.div variants={itemVariants} key={i}>
            <Card className="p-4 border-white/10 bg-card/40 backdrop-blur-md flex flex-col gap-2 relative overflow-hidden group hover:border-white/20 transition-colors">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                <metric.icon className="h-4 w-4" />
                {metric.label}
              </div>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Status */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className={`p-6 border-white/10 bg-card/40 backdrop-blur-md h-full relative overflow-hidden border-t-2 ${isSuccess ? 'border-t-emerald-500' : isFailed ? 'border-t-destructive' : 'border-t-amber-500'}`}>
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              {isSuccess ? <CheckCircle2 className="w-32 h-32 text-emerald-500" /> : isFailed ? <XCircle className="w-32 h-32 text-destructive" /> : <RefreshCw className="w-32 h-32 text-amber-500" />}
            </div>
            
            <div className="flex flex-col h-full z-10 relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Recovery Outcome</p>
                  <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    {result.status}
                    {isRetrying && <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />}
                  </h2>
                </div>
                <Badge variant={isSuccess ? "default" : isFailed ? "destructive" : "secondary"} className="text-sm px-3 py-1">
                  {result.route}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-auto">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Recovered Amount</p>
                  <p className="text-2xl font-mono text-white">${result.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Execution Latency</p>
                  <p className="text-2xl font-mono text-white">{result.latency}ms</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Blockchain Proof */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-white/10 bg-card/40 backdrop-blur-md h-full flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-primary" />
              Audit Proof
            </h3>
            
            <div className="flex flex-col gap-4 mt-auto">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Network</p>
                <Badge variant="outline" className="bg-white/5 border-white/10">{result.network}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Block Confirmed</p>
                <p className="font-mono text-sm text-white">{result.block}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Transaction Hash</p>
                <div className="flex items-center gap-2 bg-black/40 p-2 rounded-md border border-white/5">
                  <span className="font-mono text-xs text-white truncate w-full">
                    {result.hash}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => copyToClipboard(result.hash)}>
                    {copiedHash ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-white/10 bg-card/40 backdrop-blur-md h-full">
            <h3 className="text-lg font-semibold text-white mb-4">System Alerts</h3>
            <div className="flex flex-col gap-3">
              {result.alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.severity === 'Critical' ? 'border-destructive/30 bg-destructive/10' : alert.severity === 'Warning' ? 'border-amber-500/30 bg-amber-500/10' : 'border-blue-500/30 bg-blue-500/10'}`}>
                  {alert.severity === 'Critical' ? <XCircle className="h-5 w-5 text-destructive shrink-0" /> : alert.severity === 'Warning' ? <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" /> : <Info className="h-5 w-5 text-blue-500 shrink-0" />}
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${alert.severity === 'Critical' ? 'text-destructive' : alert.severity === 'Warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                      {alert.severity}
                    </div>
                    <p className="text-sm text-white/90">{alert.message}</p>
                  </div>
                </div>
              ))}
              {result.alerts.length === 0 && (
                <div className="text-sm text-muted-foreground italic text-center p-4">No alerts generated.</div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Audit Log */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-white/10 bg-card/40 backdrop-blur-md h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Action Timeline</h3>
            <div className="relative pl-4 space-y-6">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-white/10" />
              {result.auditLog.map((log, i) => (
                <div key={log.id} className="relative z-10">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary">{log.agent}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-white/80">{log.action}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

    </motion.div>
  );
}

function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
