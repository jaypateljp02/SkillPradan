
import { useState, useEffect } from 'react';
import { PlusCircle, Users, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => {
        setGroups(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Study Groups</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>
        <div className="flex gap-2">
          <Input 
            type="search" 
            placeholder="Search groups..." 
            className="max-w-sm"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              setGroups(groups.filter(group => 
                group.name.toLowerCase().includes(searchTerm) ||
                group.description.toLowerCase().includes(searchTerm)
              ));
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group: any) => (
          <Card key={group.id} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{group.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{group.description}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Join Group</Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
