import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Phone, Mail, TrendingUp } from "lucide-react";

const employeesData = [
  { id: 1, name: "Rajesh Kumar", role: "Sales Manager", department: "Sales", contact: "+91 98765 11111", email: "rajesh@company.com", attendance: 95, deals: 12, salary: "₹85,000" },
  { id: 2, name: "Priya Sharma", role: "Senior Sales Executive", department: "Sales", contact: "+91 98765 22222", email: "priya@company.com", attendance: 92, deals: 10, salary: "₹65,000" },
  { id: 3, name: "Amit Patel", role: "Sales Executive", department: "Sales", contact: "+91 98765 33333", email: "amit@company.com", attendance: 88, deals: 8, salary: "₹55,000" },
  { id: 4, name: "Sneha Reddy", role: "Marketing Head", department: "Marketing", contact: "+91 98765 44444", email: "sneha@company.com", attendance: 97, deals: 7, salary: "₹75,000" },
  { id: 5, name: "Vikram Singh", role: "Telecaller", department: "Tele-sales", contact: "+91 98765 55555", email: "vikram@company.com", attendance: 90, deals: 6, salary: "₹35,000" },
];

const getInitials = (name: string) => {
  return name.split(" ").map(n => n[0]).join("");
};

const getAttendanceColor = (attendance: number) => {
  if (attendance >= 95) return "text-success";
  if (attendance >= 85) return "text-warning";
  return "text-destructive";
};

export default function Employees() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">Manage team members, attendance, and performance</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">26</div>
            <p className="text-xs text-muted-foreground">92.9% attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">2</div>
            <p className="text-xs text-muted-foreground">Medical & personal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">8.6/10</div>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +0.8 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Directory */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employeesData.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">{employee.role}</div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {employee.contact}
                      </span>
                      <span className="text-xs flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <Badge variant="outline">{employee.department}</Badge>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getAttendanceColor(employee.attendance)}`}>
                      {employee.attendance}%
                    </div>
                    <div className="text-xs text-muted-foreground">Attendance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{employee.deals}</div>
                    <div className="text-xs text-muted-foreground">Deals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{employee.salary}</div>
                    <div className="text-xs text-muted-foreground">Salary</div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Calendar Note */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <p className="mb-2">Attendance calendar view coming soon</p>
              <p className="text-sm">Track daily attendance, leaves, and field location tagging</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
