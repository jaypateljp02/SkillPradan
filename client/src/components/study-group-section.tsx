import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { 
  Users, Calendar, MessageCircle, Video, Plus, FileText, 
  Settings, FolderUp, Globe, Lock, Code, Hammer
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Example study group data
const exampleStudyGroups = [
  {
    id: 1,
    name: "IIT Delhi Coders",
    description: "Collaborative coding and algorithm challenges for IIT Delhi students",
    members: 24,
    isPublic: true,
    image: null
  },
  {
    id: 2,
    name: "Machine Learning Study Circle",
    description: "Discussing ML papers and implementing algorithms together",
    members: 18,
    isPublic: true,
    image: null
  },
  {
    id: 3,
    name: "Advanced Database Systems",
    description: "Private group for CS405 students",
    members: 12,
    isPublic: false,
    image: null
  }
];

// Example project team data
const exampleProjectTeams = [
  {
    id: 1,
    name: "Smart Campus Hackathon Team",
    description: "Building IoT solutions for the upcoming Smart Campus Hackathon",
    members: 5,
    deadline: "May 15, 2025",
    image: null
  },
  {
    id: 2,
    name: "Distributed Systems Assignment Group",
    description: "Collaborating on the final distributed systems project",
    members: 4,
    deadline: "April 10, 2025",
    image: null
  }
];

export function StudyGroupSection() {
  const [activeTab, setActiveTab] = useState("study-groups");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  
  const handleGroupClick = (groupId: number) => {
    setSelectedGroup(groupId);
    setSelectedTeam(null);
  };

  const handleTeamClick = (teamId: number) => {
    setSelectedTeam(teamId);
    setSelectedGroup(null);
  };

  const selectedGroupData = exampleStudyGroups.find(group => group.id === selectedGroup);
  const selectedTeamData = exampleProjectTeams.find(team => team.id === selectedTeam);
  
  return (
    <div>
      <Tabs defaultValue="study-groups" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="study-groups">Study Groups</TabsTrigger>
          <TabsTrigger value="team-projects">Team Projects</TabsTrigger>
        </TabsList>
        
        {/* Study Groups Tab */}
        <TabsContent value="study-groups" className="space-y-8">
          <div>
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-medium text-neutral-900">👥 Join Groups</h3>
                <p className="text-sm text-neutral-500 mt-1">Public/private groups for collaborative learning</p>
              </div>
              <Button className="flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                Create Group
              </Button>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {exampleStudyGroups.map(group => (
                <div 
                  key={group.id}
                  className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedGroup === group.id ? 'border-primary ring-2 ring-primary ring-opacity-30' : 'border-neutral-200 hover:border-primary'
                  }`}
                  onClick={() => handleGroupClick(group.id)}
                >
                  <div className={`h-24 ${group.isPublic ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-purple-500 to-pink-600'} flex items-center justify-center text-white`}>
                    {group.isPublic ? 
                      <Globe className="h-10 w-10" /> : 
                      <Lock className="h-10 w-10" />
                    }
                  </div>
                  <div className="p-4">
                    <div className="flex items-center">
                      <h4 className="font-medium text-neutral-900">{group.name}</h4>
                      {group.isPublic ? (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Public</span>
                      ) : (
                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">Private</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{group.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-neutral-500">{group.members} members</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedGroupData && (
            <div className="border border-neutral-200 rounded-lg">
              <div className="p-4 border-b border-neutral-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <h4 className="font-medium text-neutral-900">{selectedGroupData.name}</h4>
                    {selectedGroupData.isPublic ? (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Public</span>
                    ) : (
                      <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">Private</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{selectedGroupData.description}</p>
              </div>
              
              <div className="p-4">
                <div className="flex space-x-4">
                  <Button variant="outline" className="flex-1 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Group Chat
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center">
                    <Video className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center">
                    <FolderUp className="h-4 w-4 mr-2" />
                    Share Files
                  </Button>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-md font-medium text-neutral-900 mb-2">📂 Shared Files</h5>
                  <div className="space-y-2">
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="ml-2 text-sm font-medium">Data Structures Notes.pdf</span>
                      </div>
                      <span className="text-xs text-neutral-500">Shared 2 days ago</span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="ml-2 text-sm font-medium">Algorithms Cheat Sheet.docx</span>
                      </div>
                      <span className="text-xs text-neutral-500">Shared 1 week ago</span>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2 text-primary">
                      <Plus className="h-4 w-4 mr-1" />
                      Upload New File
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-md font-medium text-neutral-900 mb-2">Members ({selectedGroupData.members})</h5>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <UserAvatar 
                        key={i} 
                        name={`Member ${i+1}`} 
                        size="sm" 
                      />
                    ))}
                    {selectedGroupData.members > 5 && (
                      <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-600 font-medium">
                        +{selectedGroupData.members - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Team Projects Tab */}
        <TabsContent value="team-projects" className="space-y-8">
          <div>
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-medium text-neutral-900">🛠️ Form Teams</h3>
                <p className="text-sm text-neutral-500 mt-1">Work on hackathons and assignments together</p>
              </div>
              <Button className="flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                Create Team
              </Button>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleProjectTeams.map(team => (
                <div 
                  key={team.id}
                  className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedTeam === team.id ? 'border-primary ring-2 ring-primary ring-opacity-30' : 'border-neutral-200 hover:border-primary'
                  }`}
                  onClick={() => handleTeamClick(team.id)}
                >
                  <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                    <Hammer className="h-10 w-10" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-neutral-900">{team.name}</h4>
                    <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{team.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-neutral-500">{team.members} members</span>
                      <span className="text-xs font-medium text-primary">Deadline: {team.deadline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedTeamData && (
            <div className="border border-neutral-200 rounded-lg">
              <div className="p-4 border-b border-neutral-200">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-neutral-900">{selectedTeamData.name}</h4>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{selectedTeamData.description}</p>
                <div className="mt-2 flex items-center">
                  <Calendar className="h-4 w-4 text-neutral-500" />
                  <span className="ml-1 text-xs text-neutral-700">Deadline: {selectedTeamData.deadline}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h5 className="text-md font-medium text-neutral-900 mb-3">💬 Team Chat</h5>
                <div className="bg-neutral-50 rounded-md p-4 h-48 overflow-y-auto mb-4">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <UserAvatar name="Raj Kumar" size="sm" />
                      <div className="ml-2 bg-white p-2 rounded-md shadow-sm">
                        <div className="flex items-center">
                          <span className="text-xs font-medium">Raj Kumar</span>
                          <span className="ml-2 text-xs text-neutral-500">10:30 AM</span>
                        </div>
                        <p className="text-sm mt-1">I've completed the initial backend API endpoints. Take a look at the code I've shared.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <UserAvatar name="Priya Singh" size="sm" />
                      <div className="ml-2 bg-white p-2 rounded-md shadow-sm">
                        <div className="flex items-center">
                          <span className="text-xs font-medium">Priya Singh</span>
                          <span className="ml-2 text-xs text-neutral-500">10:45 AM</span>
                        </div>
                        <p className="text-sm mt-1">Great work! I'll start integrating the frontend components with these endpoints.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="flex-1 py-2 px-3 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                  />
                  <Button className="rounded-l-none">Send</Button>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-md font-medium text-neutral-900 mb-3">Shared Code & Resources</h5>
                  <div className="space-y-2">
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <Code className="h-5 w-5 text-emerald-600" />
                        <span className="ml-2 text-sm font-medium">API Endpoints Implementation</span>
                      </div>
                      <span className="text-xs text-neutral-500">Updated 3 hours ago</span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        <span className="ml-2 text-sm font-medium">Project Architecture.pdf</span>
                      </div>
                      <span className="text-xs text-neutral-500">Shared 2 days ago</span>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2 text-primary">
                      <Plus className="h-4 w-4 mr-1" />
                      Share New Resource
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-md font-medium text-neutral-900 mb-2">Team Members ({selectedTeamData.members})</h5>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: selectedTeamData.members }).map((_, i) => (
                      <UserAvatar 
                        key={i} 
                        name={`Teammate ${i+1}`} 
                        size="sm" 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}