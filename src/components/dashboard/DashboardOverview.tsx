"use client";
import { DollarSign, FileText, CheckCircle2, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const barData = [
  { month: "Jan", income: 320, expenses: 180 },
  { month: "Feb", income: 450, expenses: 220 },
  { month: "Mar", income: 380, expenses: 190 },
  { month: "Apr", income: 520, expenses: 280 },
  { month: "May", income: 410, expenses: 210 },
  { month: "Jun", income: 600, expenses: 340 },
];

const pieData = [
  { name: "Completed", value: 65 },
  { name: "In Progress", value: 20 },
  { name: "Pending", value: 15 },
];

const PIE_COLORS = [
  "hsl(152, 69%, 40%)",
  "hsl(25, 95%, 53%)",
  "hsl(38, 92%, 50%)",
];

const upcomingPayments = [
  { name: "Site Inspection", type: "Service", date: "Mar 20", amount: "₦45,000", status: "Due" },
  { name: "Steel Bars Order", type: "Product", date: "Mar 22", amount: "₦285,000", status: "Pending" },
  { name: "Cement Bulk x50", type: "Product", date: "Mar 25", amount: "₦190,000", status: "Upcoming" },
  { name: "Interior Painting", type: "Service", date: "Mar 28", amount: "₦120,000", status: "Upcoming" },
];

const DashboardOverview = () => {
  const { profile } = useAuth();

  const stats = [
    { label: "Total Revenue", value: "₦6,600", change: "+18%", icon: DollarSign, color: "primary" },
    { label: "Request In Request", value: "6", change: "+3", icon: FileText, color: "warning" },
    { label: "Subscription Confirmed", value: "4", change: "+2", icon: CheckCircle2, color: "success" },
    { label: "Closed Request", value: "4", change: "-1", icon: Clock, color: "accent" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome, {profile?.full_name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === "primary"
                    ? "bg-primary/10"
                    : stat.color === "warning"
                    ? "bg-warning/10"
                    : stat.color === "success"
                    ? "bg-success/10"
                    : "bg-accent/10"
                }`}
              >
                <stat.icon
                  className={`w-5 h-5 ${
                    stat.color === "primary"
                      ? "text-primary"
                      : stat.color === "warning"
                      ? "text-warning"
                      : stat.color === "success"
                      ? "text-success"
                      : "text-accent"
                  }`}
                  strokeWidth={1}
                />
              </div>
            </div>
            <p className="font-display text-xl lg:text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 card-elevated p-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Total Salary</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0 0% 100%)",
                    border: "1px solid hsl(220 13% 91%)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px -4px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="income" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="hsl(173, 58%, 39%)" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card-elevated p-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Task Summary</h2>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="ml-auto font-semibold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Payments Table */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground">Upcoming Payments</h2>
          <Button variant="ghost" size="sm" className="text-primary text-xs">
            View All <ArrowUpRight className="w-4 h-4 ml-1" strokeWidth={1} />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Description</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">Type</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Amount</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingPayments.map((p, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td className="py-3 px-2 font-medium text-foreground">{p.name}</td>
                  <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{p.type}</td>
                  <td className="py-3 px-2 text-muted-foreground">{p.date}</td>
                  <td className="py-3 px-2 text-right font-semibold text-foreground">{p.amount}</td>
                  <td className="py-3 px-2 text-right hidden sm:table-cell">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      p.status === "Due" ? "bg-destructive/10 text-destructive" :
                      p.status === "Pending" ? "bg-warning/10 text-warning" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
