import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Users, Calendar, MessageCircle, Video, Plus, FileText, Settings } from "lucide-react";

// Example group data
const exampleGroups = [
  {
    id: 1,
    name: "Data Structures Study Group",
    description: "Weekly sessions covering advanced data structures and algorithms",
    members: 8,
    nextMeeting: "Tomorrow, 3:00 PM",
    image: null
  },
  {
    id: 2,
    name: "Machine Learning Enthusiasts",
    description: "Discussing ML papers and implementing algorithms together",
    members: 12,
    nextMeeting: "Friday, 5:30 PM",
    image: null
  },
  {
    id: 3,
    name: "Web Development Workshop",
    description: "Hands-on practice with modern web frameworks and tools",
    members: 6,
    nextMeeting: "Saturday, 10:00 AM",
    image: null
  }
];

export function StudyGroupSection() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  
  const handleGroupClick = (groupId: number) => {
    setSelectedGroup(groupId);
  };

  const selectedGroupData = exampleGroups.find(group => group.id === selectedGroup);
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-neutral-900">Your Study Groups</h3>
        <Button className="flex items-center">
          <Plus className="w-4 h-4 mr-1" />
          Create Group
        </Button>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {exampleGroups.map(group => (
          <div 
            key={group.id}
            className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedGroup === group.id ? 'border-primary ring-2 ring-primary ring-opacity-30' : 'border-neutral-200 hover:border-primary'
            }`}
            onClick={() => handleGroupClick(group.id)}
          >
            <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
              <Users className="h-10 w-10" />
            </div>
            <div className="p-4">
              <h4 className="font-medium text-neutral-900">{group.name}</h4>
              <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{group.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-500">{group.members} members</span>
                <span className="text-xs font-medium text-primary">{group.nextMeeting}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedGroupData && (
        <div className="mt-8 border border-neutral-200 rounded-lg">
          <div className="p-4 border-b border-neutral-200">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-neutral-900">{selectedGroupData.name}</h4>
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
                <FileText className="h-4 w-4 mr-2" />
                Resources
              </Button>
            </div>
            
            <div className="mt-4">
              <h5 className="text-sm font-medium text-neutral-900">Next Meeting</h5>
              <div className="mt-2 bg-neutral-50 p-3 rounded-md">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-neutral-500" />
                  <span className="ml-2 text-sm text-neutral-700">{selectedGroupData.nextMeeting}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 className="text-sm font-medium text-neutral-900 mb-2">Members ({selectedGroupData.members})</h5>
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
      
      <div className="mt-8">
        <h3 className="text-lg font-medium text-neutral-900">Recommended Groups</h3>
        <div className="mt-4 space-y-3">
          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-medium text-neutral-800">Mobile App Development Group</h4>
                <p className="text-sm text-neutral-500">16 members • React Native and Flutter</p>
              </div>
              <Button>Join</Button>
            </div>
          </div>
          
          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-medium text-neutral-800">UI/UX Design Workshop</h4>
                <p className="text-sm text-neutral-500">24 members • Design principles and tools</p>
              </div>
              <Button>Join</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}