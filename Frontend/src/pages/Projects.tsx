import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Home, CheckCircle2, Clock } from "lucide-react";

const projectsData = [
  { 
    id: 1, 
    name: "Skyline Residency", 
    location: "Banjara Hills, Hyderabad", 
    totalUnits: 48, 
    available: 12, 
    booked: 32, 
    hold: 4,
    type: "Apartment"
  },
  { 
    id: 2, 
    name: "Green Valley Villas", 
    location: "Whitefield, Bangalore", 
    totalUnits: 24, 
    available: 8, 
    booked: 14, 
    hold: 2,
    type: "Villa"
  },
  { 
    id: 3, 
    name: "Ocean Pearl Tower", 
    location: "Bandra West, Mumbai", 
    totalUnits: 72, 
    available: 28, 
    booked: 40, 
    hold: 4,
    type: "Apartment"
  },
  { 
    id: 4, 
    name: "Royal Gardens", 
    location: "Jubilee Hills, Hyderabad", 
    totalUnits: 36, 
    available: 15, 
    booked: 18, 
    hold: 3,
    type: "Villa"
  },
];

export default function Projects() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects & Inventory</h1>
          <p className="text-muted-foreground">Manage your real estate projects and unit availability</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {projectsData.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader className="bg-primary/5">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{project.location}</span>
                  </div>
                </div>
                <Badge variant="outline">{project.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <Home className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-2xl font-bold">{project.totalUnits}</div>
                  <div className="text-xs text-muted-foreground">Total Units</div>
                </div>
                <div className="text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-success" />
                  <div className="text-2xl font-bold text-success">{project.booked}</div>
                  <div className="text-xs text-muted-foreground">Booked</div>
                </div>
                <div className="text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
                  <div className="text-2xl font-bold text-warning">{project.hold}</div>
                  <div className="text-xs text-muted-foreground">On Hold</div>
                </div>
                <div className="text-center">
                  <Home className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold text-primary">{project.available}</div>
                  <div className="text-xs text-muted-foreground">Available</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Occupancy Rate</span>
                  <span className="font-medium">
                    {Math.round((project.booked / project.totalUnits) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: `${(project.booked / project.totalUnits) * 100}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <Button variant="default" className="flex-1">View Details</Button>
                <Button variant="outline" className="flex-1">Edit Inventory</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Add Section */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Plus className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Add New Project</h3>
          <p className="text-sm text-muted-foreground mb-4">Upload project details, brochures, and floor plans</p>
          <Button>Get Started</Button>
        </CardContent>
      </Card>
    </div>
  );
}
