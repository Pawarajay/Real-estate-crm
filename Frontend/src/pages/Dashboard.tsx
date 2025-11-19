

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  Moon,
  Sun,
} from "lucide-react";
import CountUp from "react-countup";
import { getLeads } from "@/lib/leadsApi";
import { format, parseISO, subDays, isAfter, isBefore } from "date-fns";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { useUser } from "../lib/UserContext";

const Avatar = ({ name, size = 32 }) => {
  if (!name) return null;
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold mr-2 select-none"
      style={{ width: size, height: size, fontSize: size * 0.41 }}
      title={name}
    >
      {initials}
    </div>
  );
};

const COLORS = [
  "#4682B4",
  "#82ca9d",
  "#ff7300",
  "#bada55",
  "#8884d8",
  "#ffc658",
  "#d7263d",
];

function Loader() {
  return (
    <div className="flex items-center justify-center py-12 w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-b-4"></div>
    </div>
  );
}

function DrilldownModal({ open, title, leads, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-xl relative max-h-[85vh] overflow-y-auto shadow-lg scroll-smooth">
        <h2
          id="modal-title"
          className="text-2xl font-semibold mb-4 dark:text-white select-none"
        >
          {title} ({leads.length})
        </h2>
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-4 right-4"
          onClick={onClose}
          aria-label="Close Modal"
        >
          Close
        </Button>
        <div className="overflow-x-auto rounded-md border border-gray-300 dark:border-gray-700">
          {leads.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground dark:text-gray-300 select-none">
              No leads found.
            </div>
          ) : (
            <table className="w-full text-sm dark:text-gray-200 border-collapse">
              <thead className="bg-gray-100 dark:bg-neutral-800">
                <tr>
                  <th className="py-2 px-3 sticky top-0 border-b border-gray-300 dark:border-gray-700 text-left">
                    Name
                  </th>
                  <th className="py-2 px-3 sticky top-0 border-b border-gray-300 dark:border-gray-700 text-left">
                    Contact
                  </th>
                  <th className="py-2 px-3 sticky top-0 border-b border-gray-300 dark:border-gray-700 text-left">
                    Status
                  </th>
                  <th className="py-2 px-3 sticky top-0 border-b border-gray-300 dark:border-gray-700 text-left">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-default transition-colors"
                  >
                    <td className="py-2 px-3">{lead.name}</td>
                    <td className="py-2 px-3">{lead.contact}</td>
                    <td className="py-2 px-3 capitalize">{lead.status}</td>
                    <td className="py-2 px-3">
                      {lead.createdAt
                        ? format(parseISO(lead.createdAt), "yyyy-MM-dd")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  // Defaults to last 7 days
  const [startDate, setStartDate] = useState(() => format(subDays(new Date(), 6), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [drillTitle, setDrillTitle] = useState("");
  const [drillLeads, setDrillLeads] = useState([]);
  const [showDrill, setShowDrill] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dashboard-dark") === "true";
    }
    return false;
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      document.body.style.backgroundColor = "#121212";
    } else {
      document.body.classList.remove("dark");
      document.body.style.backgroundColor = "#f9fafb";
    }
    localStorage.setItem("dashboard-dark", darkMode ? "true" : "false");
  }, [darkMode]);

  useEffect(() => {
    let interval;
    const fetchData = () => {
      setRefreshing(true);
      getLeads()
        .then((res) => {
          setLeads(res.data || []);
          setLoading(false);
          setRefreshing(false);
          toast.dismiss();
        })
        .catch(() => {
          setLoading(false);
          setRefreshing(false);
          toast.error("Failed to load leads!");
        });
    };
    fetchData();
    if (autoRefresh) interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter for agent vs admin
  const assignedLeads = user?.role === "agent"
    ? leads.filter((l) => l.assignedTo && l.assignedTo === user.displayName)
    : leads;

  // Date filter (last 7 days by default, user override allowed)
  const filteredLeads = assignedLeads.filter((lead) => {
    if (!lead.createdAt) return false;
    const leadDate = parseISO(lead.createdAt);
    return (
      (isAfter(leadDate, parseISO(startDate)) || leadDate.getTime() === parseISO(startDate).getTime()) &&
      (isBefore(leadDate, parseISO(endDate + "T23:59:59")) || leadDate.getTime() === parseISO(endDate + "T23:59:59").getTime())
    );
  });

  const totalLeads = filteredLeads.length;
  const statusSummary = filteredLeads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});
  const newLeads = statusSummary["new"] || 0;
  const contactedLeads = statusSummary["contacted"] || 0;
  const siteVisitLeads = statusSummary["site-visit"] || 0;
  const negotiationLeads = statusSummary["negotiation"] || 0;
  const convertedLeads = statusSummary["converted"] || 0;
  const lostLeads = statusSummary["lost"] || 0;
  const followupsPending = filteredLeads.filter((l) => l.status === "followup").length;
  const totalRevenue = filteredLeads.reduce((acc, lead) => acc + (lead.revenue || 0), 0);
  const pendingPayments = filteredLeads.filter((lead) => lead.paymentStatus === "pending").length;
  const targetAmount = 8000000;
  const achievedAmount = totalRevenue || 6700000;
  const targetPercent = Math.min(Math.round((achievedAmount / targetAmount) * 100), 100);

  const leadFunnelData = [
    { name: "New Leads", value: newLeads },
    { name: "Contacted", value: contactedLeads },
    { name: "Site Visit", value: siteVisitLeads },
    { name: "Negotiation", value: negotiationLeads },
    { name: "Converted", value: convertedLeads },
  ];
  const lineDataByDay = (() => {
    const byDay = {};
    filteredLeads.forEach((lead) => {
      if (lead.createdAt) {
        const day = format(parseISO(lead.createdAt), "MMM dd");
        byDay[day] = (byDay[day] || 0) + 1;
      }
    });
    return Object.entries(byDay)
      .map(([day, count]) => ({ day, leads: count }))
      .sort((a, b) => new Date(`${a.day} 2025`) - new Date(`${b.day} 2025`));
  })();
  const performanceData = (() => {
    const userCounts = {};
    filteredLeads.forEach((lead) => {
      if (lead.assignedTo && lead.status === "converted") {
        userCounts[lead.assignedTo] = (userCounts[lead.assignedTo] || 0) + 1;
      }
    });
    return Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, deals]) => ({ name, deals }))
      .slice(0, 5);
  })();

  function showLeadsForStatus(status) {
    setDrillTitle(`Leads: ${status.replace("-", " ")}`);
    setDrillLeads(filteredLeads.filter((l) => l.status === status));
    setShowDrill(true);
  }
  function showLeadsForAgent(name) {
    setDrillTitle(`Converted Leads: ${name}`);
    setDrillLeads(filteredLeads.filter((l) => l.status === "converted" && l.assignedTo === name));
    setShowDrill(true);
  }
  function handleExportCSV() {
    if (filteredLeads.length === 0) {
      toast.warning("No data to export!");
      return;
    }
    try {
      const csv = Papa.unparse(filteredLeads);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `leads_dashboard_${Date.now()}.csv`);
      toast.success("Exported leads to CSV!");
    } catch {
      toast.error("CSV Export failed!");
    }
  }

  return (
    <div
      className={`min-h-screen p-4 md:p-6 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 transition-colors duration-500`}
    >
      <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? "dark" : "colored"} />
      <div className="flex items-center w-full py-3 mb-2">
        <div className="w-full text-center bg-blue-100 dark:bg-blue-900 rounded-xl py-2 text-blue-900 dark:text-blue-100  font-semibold shadow">
          This is Last 7 days lead dashboard
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight select-none">CEO Dashboard</h1>
          <Button
            variant={darkMode ? "default" : "outline"}
            className="rounded-full transition hover:scale-105 shadow-md"
            size="sm"
            onClick={() => setDarkMode((dm) => !dm)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-pressed={darkMode}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex gap-3 items-center flex-wrap">
            <label htmlFor="start-date" className="text-sm font-medium select-none">
              From:
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded border border-gray-300 p-2 dark:bg-neutral-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              max={endDate}
            />
            <label htmlFor="end-date" className="text-sm font-medium select-none ml-2">
              To:
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded border border-gray-300 p-2 dark:bg-neutral-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              min={startDate}
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLoading(true)}
            className="flex items-center gap-2 whitespace-nowrap hover:bg-blue-100 dark:hover:bg-blue-900 transition-shadow shadow-sm"
            title="Apply date filter to leads"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2 whitespace-nowrap hover:shadow-lg transition-shadow"
            title="Export filtered leads data as CSV"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh((v) => !v)}
            className="flex items-center gap-2 whitespace-nowrap hover:shadow-lg transition-shadow"
            title="Toggle auto-refresh every 10 seconds"
            aria-pressed={autoRefresh}
          >
            <RefreshCw className="w-4 h-4 animate-[spin_2s_linear_infinite]" style={{ animationPlayState: refreshing ? "running" : "paused" }} />
            {autoRefresh ? "Auto-Refresh: ON" : "Auto-Refresh: OFF"}
          </Button>
        </div>
      </div>
      {loading && <Loader />}
      {/* REMAINDER OF DASHBOARD: charts/cards/drilldown as in previous code */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI cards (unchanged, see previous code block) */}
        {[
          {
            title: "Total Leads",
            icon: <Users className="h-5 w-5 text-muted-foreground dark:text-gray-300" />,
            count: totalLeads,
            trend: "+12.5%",
            trendColor: "text-green-500 dark:text-green-400",
            trendIcon: <TrendingUp className="h-4 w-4" />,
            tooltip: "Leads recorded in the selected range",
          },
          {
            title: "Converted",
            icon: <DollarSign className="h-5 w-5 text-muted-foreground dark:text-gray-300" />,
            count: convertedLeads,
            trend: "+18.2%",
            trendColor: "text-green-500 dark:text-green-400",
            trendIcon: <TrendingUp className="h-4 w-4" />,
            tooltip: "Leads successfully converted to customers",
          },
          {
            title: "Site Visits",
            icon: <Building2 className="h-5 w-5 text-muted-foreground dark:text-gray-300" />,
            count: siteVisitLeads,
            extraText: `${contactedLeads} contacted`,
            tooltip:
              "Leads who visited the site in range, and number contacted for follow-up",
          },
          {
            title: "Lost",
            icon: <DollarSign className="h-5 w-5 text-muted-foreground dark:text-gray-300" />,
            count: lostLeads,
            extraComponent: (
              <div className="w-20 mx-auto mt-3">
                <CircularProgressbar
                  value={targetPercent}
                  text={`${targetPercent}%`}
                  styles={buildStyles({
                    textColor: "#198754",
                    pathColor: "#0d6efd",
                    trailColor: "#eee",
                    backgroundColor: "#fff",
                  })}
                />
              </div>
            ),
            extraText: `${pendingPayments} payments pending`,
            extraTextClass: "text-center mt-2 text-yellow-600 dark:text-yellow-400 font-semibold",
            tooltip:
              "Number of lost leads and percentage of sales target achieved",
          },
        ].map(({ title, icon, count, trend, trendColor, trendIcon, extraText, extraComponent, extraTextClass, tooltip }, idx) => (
          <Card
            className="bg-white dark:bg-neutral-800 shadow-md transition-shadow rounded-lg cursor-default hover:shadow-xl"
            key={idx}
            title={tooltip}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">{title}</CardTitle>
              {icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{count}</div>
              {trend && (
                <p className={`text-xs flex items-center gap-1 ${trendColor}`}>
                  {trendIcon}
                  {trend} from last period
                </p>
              )}
              {extraComponent}
              {extraText && <p className={`text-sm ${extraTextClass}`}>{extraText}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold dark:text-white select-none">Leads Added Trend</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineDataByDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderRadius: 8, borderColor: darkMode ? "#374151" : "#ddd" }}
                  itemStyle={{ color: "#82ca9d" }}
                />
                <Legend wrapperStyle={{ color: darkMode ? "#d1d5db" : "#555" }} />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#82ca9d"
                  fillOpacity={0.8}
                  fill="url(#colorLeads)"
                  name="Leads Added"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold dark:text-white select-none">Lead Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 260 }} className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={leadFunnelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  cursor="pointer"
                  onClick={(entry) =>
                    showLeadsForStatus(entry.name.replace(" ", "-").toLowerCase())
                  }
                  isAnimationActive={true}
                >
                  {leadFunnelData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      aria-label={`${entry.name}: ${entry.value}`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderRadius: 6, borderColor: darkMode ? "#374151" : "#ddd" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-xs text-muted-foreground mt-3 dark:text-gray-400 select-none">
              Click segment to view leads
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold dark:text-white select-none">Top 5 Performing Agents</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={140}
                  stroke="hsl(var(--muted-foreground))"
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <foreignObject x={-36} y={-14} width={140} height={28}>
                        <div className="flex items-center select-none">
                          <Avatar name={payload.value} size={28} />
                          <span className="dark:text-white ml-2 font-medium">{payload.value}</span>
                        </div>
                      </foreignObject>
                    </g>
                  )}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderRadius: 6, borderColor: darkMode ? "#374151" : "#ddd" }}
                />
                <Bar
                  dataKey="deals"
                  fill="#4682B4"
                  name="Deals Closed"
                  onClick={(data) => showLeadsForAgent(data.name)}
                  cursor="pointer"
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-xs text-muted-foreground mt-2 dark:text-gray-400 select-none">
              Click agent bar for drill-down
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold dark:text-white select-none">Monthly Sales Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3 select-none">
                <span className="text-md font-medium text-gray-700 dark:text-gray-200">
                  Target: ₹80 Lakhs
                </span>
                <span className="text-md font-medium text-gray-700 dark:text-gray-200">
                  Achieved: ₹{(achievedAmount / 100000).toFixed(2)} Lakhs
                </span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-5 overflow-hidden shadow-inner">
                <div
                  className="bg-blue-600 dark:bg-blue-800 h-5 rounded-full transition-width duration-1000 ease-in-out"
                  style={{ width: `${targetPercent}%` }}
                  aria-label={`Monthly target progress: ${targetPercent}%`}
                  role="progressbar"
                  aria-valuenow={targetPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2 dark:text-gray-400 select-none">
                {targetPercent}% of monthly target achieved
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
                <span className="text-sm font-semibold dark:text-gray-100 select-none">
                  New Bookings
                </span>
                <span className="font-semibold dark:text-white">{convertedLeads}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
                <span className="text-sm font-semibold dark:text-gray-100 select-none">
                  Site Visits
                </span>
                <span className="font-semibold dark:text-white">{siteVisitLeads}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
                <span className="text-sm font-semibold dark:text-gray-100 select-none">
                  Follow-ups Pending
                </span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {followupsPending}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <DrilldownModal
        open={showDrill}
        title={drillTitle}
        leads={drillLeads}
        onClose={() => setShowDrill(false)}
      />
    </div>
  );
}
