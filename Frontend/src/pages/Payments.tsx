import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const paymentsData = [
  { id: 1, customer: "Arjun Mehta", project: "Skyline Residency", unit: "A-301", total: 8500000, paid: 6800000, pending: 1700000, nextDue: "2025-11-15", status: "on-track" },
  { id: 2, customer: "Kavya Iyer", project: "Green Valley Villas", unit: "V-12", total: 12000000, paid: 12000000, pending: 0, nextDue: "-", status: "completed" },
  { id: 3, customer: "Rahul Gupta", project: "Ocean Pearl Tower", unit: "B-505", total: 9500000, paid: 4750000, pending: 4750000, nextDue: "2025-11-10", status: "overdue" },
  { id: 4, customer: "Deepa Reddy", project: "Royal Gardens", unit: "V-08", total: 15000000, paid: 9000000, pending: 6000000, nextDue: "2025-11-20", status: "on-track" },
  { id: 5, customer: "Sandeep Singh", project: "Skyline Residency", unit: "A-402", total: 8500000, paid: 2550000, pending: 5950000, nextDue: "2025-11-12", status: "on-track" },
];

const collectionData = [
  { name: "Collected", value: 35100000, color: "hsl(var(--success))" },
  { name: "Pending", value: 18400000, color: "hsl(var(--warning))" },
];

const statusColors: Record<string, string> = {
  "on-track": "bg-blue-100 text-blue-800 hover:bg-blue-100",
  "overdue": "bg-red-100 text-red-800 hover:bg-red-100",
  "completed": "bg-green-100 text-green-800 hover:bg-green-100",
};

export default function Payments() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment & Collection Tracking</h1>
          <p className="text-muted-foreground">Monitor payments and manage collections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="default" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹53.5 Cr</div>
            <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Amount Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹35.1 Cr</div>
            <p className="text-xs text-muted-foreground mt-1">65.6% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">₹18.4 Cr</div>
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              3 payments overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Table */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Collection Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={collectionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `₹${(value / 10000000).toFixed(1)}Cr`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {collectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `₹${(value / 10000000).toFixed(2)} Cr`}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Payment Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Customer</th>
                    <th className="text-left py-3 px-2 font-medium">Project / Unit</th>
                    <th className="text-right py-3 px-2 font-medium">Total</th>
                    <th className="text-right py-3 px-2 font-medium">Paid</th>
                    <th className="text-right py-3 px-2 font-medium">Pending</th>
                    <th className="text-left py-3 px-2 font-medium">Next Due</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsData.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{payment.customer}</td>
                      <td className="py-3 px-2">
                        <div className="text-xs text-muted-foreground">{payment.project}</div>
                        <div className="font-medium">{payment.unit}</div>
                      </td>
                      <td className="py-3 px-2 text-right">₹{(payment.total / 100000).toFixed(1)}L</td>
                      <td className="py-3 px-2 text-right text-success">₹{(payment.paid / 100000).toFixed(1)}L</td>
                      <td className="py-3 px-2 text-right text-warning">₹{(payment.pending / 100000).toFixed(1)}L</td>
                      <td className="py-3 px-2">{payment.nextDue}</td>
                      <td className="py-3 px-2">
                        <Badge className={statusColors[payment.status]}>
                          {payment.status.replace("-", " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
