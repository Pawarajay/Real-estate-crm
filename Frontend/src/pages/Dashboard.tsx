import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Building2, DollarSign, Download, Filter, RefreshCw, Moon, Sun } from "lucide-react";
import CountUp from "react-countup";
import { getLeads } from "@/lib/leadsApi";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveAs } from "file-saver";
import Papa from "papaparse";

const Avatar = ({ name, size = 32 }) => {
  if (!name) return null;
  const initials = name.split(" ").map(s => s[0]).join("").slice(0,2).toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold mr-2"
      style={{ width: size, height: size, fontSize: size * 0.41 }}
    >
      {initials}
    </div>
  );
};

const COLORS = [
  "#4682B4", "#82ca9d", "#ff7300", "#bada55", "#8884d8", "#ffc658", "#d7263d"
];

function Loader() {
  return (
    <div className="flex items-center justify-center py-8 w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-b-2"></div>
    </div>
  );
}

// Responsive modal with dark mode
function DrilldownModal({ open, title, leads, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 w-full max-w-xl relative max-h-[85vh] overflow-y-auto shadow-lg">
        <h2 className="text-xl font-semibold mb-2 dark:text-white">{title} ({leads.length})</h2>
        <Button size="sm" variant="ghost" className="absolute top-2 right-3" onClick={onClose}>Close</Button>
        <div className="overflow-x-auto mt-2">
          {leads.length === 0 ?
            <div className="p-4 text-muted-foreground dark:text-gray-300">No leads found.</div> :
            <table className="w-full text-sm dark:text-gray-200">
              <thead>
                <tr><th>Name</th><th>Contact</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b dark:border-gray-700">
                    <td>{lead.name}</td>
                    <td>{lead.contact}</td>
                    <td>{lead.status}</td>
                    <td>{lead.createdAt ? format(parseISO(lead.createdAt), "yyyy-MM-dd") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [startDate, setStartDate] = useState(() => format(new Date(), "yyyy-MM-01"));
  const [endDate, setEndDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [drillTitle, setDrillTitle] = useState("");
  const [drillLeads, setDrillLeads] = useState([]);
  const [showDrill, setShowDrill] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dashboard-dark") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("dashboard-dark", darkMode ? "true" : "false");
  }, [darkMode]);

  useEffect(() => {
    let interval;
    function fetchData() {
      setLoading(true);
      getLeads()
        .then(res => { setLeads(res.data || []); setLoading(false); })
        .catch(() => { setLoading(false); toast.error("Failed to load leads!"); });
    }
    fetchData();
    if (autoRefresh) interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredLeads = leads.filter(lead => {
    if (!lead.createdAt) return false;
    const leadDate = parseISO(lead.createdAt);
    return isAfter(leadDate, parseISO(startDate))
      && isBefore(leadDate, parseISO(endDate + "T23:59:59"));
  });

  // Stats/Charts
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
  const followupsPending = filteredLeads.filter(l => l.status === "followup").length;
  const totalRevenue = filteredLeads.reduce((acc, lead) => acc + (lead.revenue || 0), 0);
  const pendingPayments = filteredLeads.filter(lead => lead.paymentStatus === "pending").length;
  const targetAmount = 8000000;
  const achievedAmount = totalRevenue || 6700000;
  const targetPercent = Math.round((achievedAmount / targetAmount) * 100);

  const leadFunnelData = [
    { name: "New Leads", value: newLeads },
    { name: "Contacted", value: contactedLeads },
    { name: "Site Visit", value: siteVisitLeads },
    { name: "Negotiation", value: negotiationLeads },
    { name: "Converted", value: convertedLeads },
  ];
  const lineDataByDay = (() => {
    const byDay = {};
    filteredLeads.forEach(lead => {
      if (lead.createdAt) {
        const day = format(parseISO(lead.createdAt), "MMM dd");
        byDay[day] = (byDay[day] || 0) + 1;
      }
    });
    return Object.entries(byDay).map(([day, count]) => ({ day, leads: count })).sort((a, b) => new Date(a.day) - new Date(b.day));
  })();
  const performanceData = (() => {
    const userCounts = {};
    filteredLeads.forEach(lead => {
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
    setDrillTitle(`Leads: ${status}`);
    setDrillLeads(filteredLeads.filter(l => l.status === status));
    setShowDrill(true);
  }
  function showLeadsForAgent(name) {
    setDrillTitle(`Converted Leads: ${name}`);
    setDrillLeads(filteredLeads.filter(l => l.status === "converted" && l.assignedTo === name));
    setShowDrill(true);
  }
  function handleExportCSV() {
    if (filteredLeads.length === 0) {
      toast.warning("No data to export!");
      return;
    }
    try {
      const csv = Papa.unparse(filteredLeads);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `leads_dashboard_${Date.now()}.csv`);
      toast.success("Exported leads to CSV!");
    } catch {
      toast.error("CSV Export failed!");
    }
  }

  return (
    <div className={`p-2 sm:p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-neutral-900 transition-colors min-h-screen`}>
      <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? "dark" : "colored"} />
      {/* Header row with dark mode toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold dark:text-white">CEO Dashboard</h1>
          <Button
            variant={darkMode ? "default" : "outline"}
            className="rounded-full"
            size="sm"
            onClick={() => setDarkMode(dm => !dm)}
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
          </Button>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row items-center">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium dark:text-gray-100">From:</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="rounded border p-1 dark:bg-neutral-800 dark:text-gray-200" />
            <label className="text-sm font-medium ml-2 dark:text-gray-100">To:</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rounded border p-1 dark:bg-neutral-800 dark:text-gray-200" />
          </div>
          <Button variant="outline" size="sm" onClick={()=>setLoading(true)}><Filter className="mr-2 h-4 w-4" /> Filter</Button>
          <Button variant="default" size="sm" onClick={handleExportCSV}><Download className="mr-2 h-4 w-4"/> Export CSV</Button>
          <Button variant={autoRefresh ? "default" : "outline"} size="sm" onClick={()=>setAutoRefresh(v=>!v)}>
            <RefreshCw className="mr-2 h-4 w-4"/>
            {autoRefresh ? "Auto-Refresh: ON" : "Auto-Refresh: OFF"}
          </Button>
        </div>
      </div>
      {loading && <Loader/>}

      {/* KPIs grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card className="bg-white dark:bg-neutral-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground dark:text-gray-300"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white"><CountUp end={totalLeads} duration={1.2} separator="," /></div>
            <p className="text-xs text-success flex items-center gap-1 dark:text-green-400"><TrendingUp className="h-3 w-3" /> +12.5% from last period</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-neutral-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Converted</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground dark:text-gray-300"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white"><CountUp end={convertedLeads} duration={1.2} separator="," /></div>
            <p className="text-xs text-success flex items-center gap-1 dark:text-green-400"><TrendingUp className="h-3 w-3"/> +18.2% from last period</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-neutral-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Site Visits</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground dark:text-gray-300"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white"><CountUp end={siteVisitLeads} duration={1.2} separator="," /></div>
            <p className="text-xs text-muted-foreground dark:text-gray-400"><CountUp end={contactedLeads} duration={1.2} separator="," /> contacted</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-neutral-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Lost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground dark:text-gray-300"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white"><CountUp end={lostLeads} duration={1.2} separator="," /></div>
            <div className="w-20 mx-auto mt-2"><CircularProgressbar value={targetPercent} text={`${targetPercent}%`} styles={buildStyles({textColor: "#198754",pathColor: "#0d6efd",trailColor: "#eee",backgroundColor: "#fff",})}/></div>
            <p className="text-xs text-warning text-center mt-2 dark:text-yellow-300">{pendingPayments} payments pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Responsive charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        {/* Line/area chart */}
        <Card className="bg-white dark:bg-neutral-800 transition-colors">
          <CardHeader>
            <CardTitle className="dark:text-white">Leads Added Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={lineDataByDay}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))"/>
                <YAxis stroke="hsl(var(--muted-foreground))"/>
                <Tooltip/>
                <Legend/>
                <Area type="monotone" dataKey="leads" stroke="#82ca9d" fillOpacity={0.8} fill="url(#colorLeads)" name="Leads Added"/>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Pie chart with drill-down */}
        <Card className="bg-white dark:bg-neutral-800 transition-colors">
          <CardHeader>
            <CardTitle className="dark:text-white">Lead Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={leadFunnelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={entry => showLeadsForStatus(entry.name.replace(" ", "-").toLowerCase())}
                >
                  {leadFunnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-xs text-muted-foreground mt-2 dark:text-gray-400">Click segment to view leads</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance mobile grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        <Card className="bg-white dark:bg-neutral-800 transition-colors">
          <CardHeader>
            <CardTitle className="dark:text-white">Top 5 Performing Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={performanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                <XAxis type="number" stroke="hsl(var(--muted-foreground))"/>
                <YAxis dataKey="name"
                  type="category"
                  width={140}
                  stroke="hsl(var(--muted-foreground))"
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <foreignObject x={-36} y={-14} width={130} height={28}>
                        <div className="flex items-center"><Avatar name={payload.value} size={28}/><span className="dark:text-white">{payload.value}</span></div>
                      </foreignObject>
                    </g>
                  )}/>
                <Tooltip/>
                <Bar dataKey="deals" fill="#4682B4" name="Deals Closed" onClick={data => showLeadsForAgent(data.name)} />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-xs text-muted-foreground mt-2 dark:text-gray-400">Click agent bar for drill-down</div>
          </CardContent>
        </Card>
        {/* Monthly Target */}
        <Card className="bg-white dark:bg-neutral-800 transition-colors">
          <CardHeader>
            <CardTitle className="dark:text-white">Monthly Sales Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium dark:text-gray-100">Target: ₹80 Lakhs</span>
                <span className="text-sm font-medium dark:text-gray-100">Achieved: ₹67 Lakhs</span>
              </div>
              <div className="w-full bg-secondary dark:bg-gray-700 rounded-full h-3">
                <div className="bg-primary dark:bg-blue-800 h-3 rounded-full" style={{ width: `${targetPercent}%` }}></div>
              </div>
              <p className="text-sm text-muted-foreground mt-1 dark:text-gray-400">{targetPercent}% of monthly target</p>
            </div>
            <div className="space-y-3 pt-4">
              <div className="flex justify-between items-center p-3 bg-secondary dark:bg-gray-700 rounded-lg">
                <span className="text-sm dark:text-gray-100">New Bookings</span>
                <span className="font-semibold dark:text-white">{convertedLeads}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary dark:bg-gray-700 rounded-lg">
                <span className="text-sm dark:text-gray-100">Site Visits</span>
                <span className="font-semibold dark:text-white">{siteVisitLeads}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary dark:bg-gray-700 rounded-lg">
                <span className="text-sm dark:text-gray-100">Follow-ups Pending</span>
                <span className="font-semibold text-warning dark:text-yellow-300">{followupsPending}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Drill-down Modal */}
      <DrilldownModal open={showDrill} title={drillTitle} leads={drillLeads} onClose={() => setShowDrill(false)} />
    </div>
  );
}
