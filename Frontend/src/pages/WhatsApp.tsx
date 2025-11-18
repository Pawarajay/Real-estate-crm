import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, CheckCheck, Clock, XCircle } from "lucide-react";

const templates = [
  { id: 1, name: "Follow-up After Site Visit", active: true },
  { id: 2, name: "Payment Reminder", active: true },
  { id: 3, name: "New Lead Welcome", active: true },
  { id: 4, name: "Project Update", active: false },
];

const activityLog = [
  { id: 1, customer: "Arjun Mehta", message: "Follow-up after site visit", status: "delivered", time: "2 hours ago" },
  { id: 2, customer: "Kavya Iyer", message: "Payment reminder", status: "read", time: "3 hours ago" },
  { id: 3, customer: "Rahul Gupta", message: "New lead welcome", status: "delivered", time: "5 hours ago" },
  { id: 4, customer: "Deepa Reddy", message: "Follow-up after site visit", status: "read", time: "1 day ago" },
  { id: 5, customer: "Sandeep Singh", message: "Payment reminder", status: "failed", time: "1 day ago" },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "read":
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    case "delivered":
      return <CheckCheck className="h-4 w-4 text-muted-foreground" />;
    case "sent":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return null;
  }
};

export default function WhatsApp() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Integration</h1>
          <p className="text-muted-foreground">Automated follow-ups and customer communication</p>
        </div>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          Send Broadcast
        </Button>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="font-semibold">WhatsApp Business API Connected</div>
                <div className="text-sm text-muted-foreground">Phone: +91 98765 99999</div>
              </div>
            </div>
            <Badge className="bg-success text-success-foreground">Active</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Message Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Message Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{template.name}</span>
                </div>
                <Switch checked={template.active} />
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              Create New Template
            </Button>
          </CardContent>
        </Card>

        {/* Test Message */}
        <Card>
          <CardHeader>
            <CardTitle>Test Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Type your message here..." 
                rows={6}
                defaultValue="Hi {name}, Thank you for visiting {project}! We'd love to assist you further. Please reply if you have any questions."
              />
            </div>
            <Button className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Send Test Message
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <div className="font-medium">Send follow-up 1 day after site visit</div>
                <div className="text-sm text-muted-foreground">Automatically triggered for all leads</div>
              </div>
              <Switch checked={true} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <div className="font-medium">Send payment reminder 3 days before due date</div>
                <div className="text-sm text-muted-foreground">For customers with pending payments</div>
              </div>
              <Switch checked={true} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <div className="font-medium">Welcome message for new leads</div>
                <div className="text-sm text-muted-foreground">Sent immediately when lead is created</div>
              </div>
              <Switch checked={true} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityLog.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  {getStatusIcon(activity.status)}
                  <div>
                    <div className="font-medium">{activity.customer}</div>
                    <div className="text-sm text-muted-foreground">{activity.message}</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
