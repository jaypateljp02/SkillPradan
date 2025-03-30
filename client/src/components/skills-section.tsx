import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skill, InsertSkill } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SkillTag } from "@/components/ui/skill-tag";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const skillFormSchema = z.object({
  name: z.string().min(2, "Skill name must be at least 2 characters"),
  isTeaching: z.boolean(),
  proficiencyLevel: z.string().optional(),
});

type SkillFormValues = z.infer<typeof skillFormSchema>;

export function SkillsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: skills = [], isLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });
  
  const teachingSkills = skills.filter(skill => skill.isTeaching);
  const learningSkills = skills.filter(skill => !skill.isTeaching);
  
  const addSkillMutation = useMutation({
    mutationFn: async (skillData: Omit<InsertSkill, "userId">) => {
      const res = await apiRequest("POST", "/api/skills", skillData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
      toast({
        title: "Skill added",
        description: "Your skill has been added successfully",
      });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add skill",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: "",
      isTeaching: true,
      proficiencyLevel: "beginner",
    },
  });
  
  function onSubmit(data: SkillFormValues) {
    addSkillMutation.mutate({
      name: data.name,
      userId: user!.id,
      isTeaching: data.isTeaching,
      proficiencyLevel: data.proficiencyLevel || "beginner",
      isVerified: false,
    });
  }
  
  const renderSkillDialog = () => (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="skill-tag inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 text-neutral-500 border border-dashed border-neutral-300 hover:bg-neutral-200">
          <Plus className="w-4 h-4 mr-1" />
          Add Skill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Skill</DialogTitle>
          <DialogDescription>
            Add a skill you can teach or want to learn
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. JavaScript, Design, Photography" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isTeaching"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(value === "teaching")}
                      defaultValue={field.value ? "teaching" : "learning"}
                    >
                      <SelectTrigger className="bg-white text-neutral-900">
                        <SelectValue placeholder="Select skill type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teaching">I can teach this</SelectItem>
                        <SelectItem value="learning">I want to learn this</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("isTeaching") && (
              <FormField
                control={form.control}
                name="proficiencyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proficiency Level</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="bg-white text-neutral-900">
                          <SelectValue placeholder="Select proficiency level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit" disabled={addSkillMutation.isPending}>
                {addSkillMutation.isPending ? "Adding..." : "Add Skill"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-neutral-900">My Skills</h3>
        <p className="text-sm text-neutral-500">Skills you can teach others</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {teachingSkills.map((skill) => (
            <SkillTag
              key={skill.id}
              name={skill.name}
              verified={skill.isVerified}
              color={skill.name === "Web Development" ? "primary" : skill.name === "React" ? "secondary" : skill.name === "JavaScript" ? "accent" : "neutral"}
            />
          ))}
          {renderSkillDialog()}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-neutral-900">Skills I Want to Learn</h3>
        <p className="text-sm text-neutral-500">Skills you're interested in learning from others</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {learningSkills.map((skill) => (
            <SkillTag
              key={skill.id}
              name={skill.name}
              color="neutral"
            />
          ))}
          {renderSkillDialog()}
        </div>
      </div>
    </div>
  );
}
