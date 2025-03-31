import { StudyGroupSection } from "@/components/study-group-section";

export default function StudyGroupsPage() {
  return (
    <div className="container py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-neutral-200">
          <h3 className="text-lg font-medium leading-6 text-neutral-900">Study Groups</h3>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">Create and join study groups with peers</p>
        </div>
        
        <div className="p-6">
          <StudyGroupSection />
        </div>
      </div>
    </div>
  );
}