
import { StudyGroupSection } from '@/components/study-group-section';
import { GroupChat } from '@/components/group-chat';
import { Route, Switch } from 'wouter';

export default function GroupsPage() {
  return (
    <Switch>
      <Route path="/groups" component={StudyGroupSection} />
      <Route path="/groups/:groupId/chat" component={GroupChat} />
      <Route path="/groups/:groupId">
        {(params) => <GroupDetail groupId={params.groupId} />}
      </Route>
    </Switch>
  );
}

// Simple group detail component for the main group view
function GroupDetail({ groupId }: { groupId: string }) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Team Project Details</h2>
        <p className="text-muted-foreground">This is a placeholder for the team project details page.</p>
        <p className="text-muted-foreground">You're viewing team project ID: {groupId}</p>
      </div>
      <p>Navigate to specific features:</p>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li><a href={`/groups/${groupId}/chat`} className="text-primary hover:underline">Group Chat</a></li>
        <li><a href={`/groups/${groupId}/files`} className="text-primary hover:underline">Files</a></li>
        <li><a href={`/groups/${groupId}/events`} className="text-primary hover:underline">Events</a></li>
        <li><a href={`/groups/${groupId}/members`} className="text-primary hover:underline">Members</a></li>
      </ul>
    </div>
  );
}
