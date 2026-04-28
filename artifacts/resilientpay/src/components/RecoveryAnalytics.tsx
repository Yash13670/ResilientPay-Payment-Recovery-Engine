import { useMemo } from "react";
import { PipelineResult } from "@/lib/mockScenarios";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, BarChart, Bar } from "recharts";
import { Activity, Clock, ShieldCheck, TrendingUp } from "lucide-react";

interface RecoveryAnalyticsProps {
  history: PipelineResult[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

export function RecoveryAnalytics({ history }: RecoveryAnalyticsProps) {
  const stats = useMemo(() => {
    let totalRecovered = 0;
    let totalLatency = 0;
    let totalSlaAvoided = 0;
    let successCount = 0;

    history.forEach(r => {
      if (r.status === "SUCCESS") {
        totalRecovered += r.amount;
        successCount++;
      }
      totalLatency += r.latency;
      totalSlaAvoided += r.slaAvoided;
    });

    return {
      totalRecovered,
      avgLatency: history.length ? Math.round(totalLatency / history.length) : 0,
      successRate: history.length ? Math.round((successCount / history.length) * 100) : 0,
      totalSlaAvoided,
    };
  }, [history]);

  const chartData = useMemo(() => {
    return [...history].reverse().map((r, i) => ({
      index: i + 1,
      successRate: r.status === "SUCCESS" ? 100 : r.status === "RETRYING" ? 50 : 0,
      latency: r.latency,
      status: r.status,
      route: r.route,
    }));
  }, [history]);

  const routeData = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach(r => counts[r.route] = (counts[r.route] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [history]);

  const outcomeData = useMemo(() => {
    const counts = { SUCCESS: 0, RETRYING: 0, FAILED: 0 };
    history.forEach(r => {
      if (r.status === "SUCCESS") counts.SUCCESS++;
      else if (r.status === "RETRYING") counts.RETRYING++;
      else counts.FAILED++;
    });
    return [
      { name: "Success", value: counts.SUCCESS, fill: "#10b981" },
      { name: "Retrying", value: counts.RETRYING, fill: "#f59e0b" },
      { name: "Failed", value: counts.FAILED, fill: "#f43f5e" }
    ];
  }, [history]);

  if (history.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Recovery Analytics</h3>
          <p className="text-sm text-muted-foreground">Aggregated across this session ({history.length} runs)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Recovered", value: `$${stats.totalRecovered.toLocaleString()}`, icon: TrendingUp, color: "text-amber-400" },
          { label: "Avg Recovery Time", value: `${stats.avgLatency}ms`, icon: Clock, color: "text-blue-400" },
          { label: "Success Rate", value: `${stats.successRate}%`, icon: Activity, color: "text-emerald-400" },
          { label: "SLA Breaches Avoided", value: stats.totalSlaAvoided, icon: ShieldCheck, color: "text-purple-400" },
        ].map((metric, i) => (
          <Card key={i} className="p-4 border-white/10 bg-card/40 backdrop-blur-md">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
              <metric.icon className="h-4 w-4" />
              {metric.label}
            </div>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 border-white/10 bg-card/40 backdrop-blur-md h-[250px] flex flex-col">
          <h4 className="text-sm font-semibold text-white mb-4">Recovery Rate Trend</h4>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="index" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="successRate" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSuccess)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 border-white/10 bg-card/40 backdrop-blur-md h-[250px] flex flex-col">
          <h4 className="text-sm font-semibold text-white mb-4">Route Distribution</h4>
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={routeData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {routeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white">{history.length}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-white/10 bg-card/40 backdrop-blur-md h-[250px] flex flex-col">
          <h4 className="text-sm font-semibold text-white mb-4">Latency per Run</h4>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="index" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 border-white/10 bg-card/40 backdrop-blur-md h-[250px] flex flex-col">
          <h4 className="text-sm font-semibold text-white mb-4">Outcomes Breakdown</h4>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomeData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
