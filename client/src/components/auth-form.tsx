import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { User, Mail, Lock, School, Image } from "lucide-react";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthForm() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      email: "",
      university: "",
      avatar: "",
    },
  });

  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  }

  function onRegisterSubmit(data: RegisterFormValues) {
    // Remove confirmPassword as it's not in the API schema
    const { confirmPassword, ...registrationData } = data;
    registerMutation.mutate(registrationData);
  }

  return (
    <Card className="w-full">
      <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <CardDescription className="pt-4">
            {activeTab === "login" 
              ? "Sign in to your SkillSwap account"
              : "Create a new SkillSwap account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TabsContent value="login" className="space-y-4">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                          <Input 
                            {...field} 
                            className="pl-10" 
                            placeholder="Enter your username" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                          <Input 
                            {...field} 
                            type="password" 
                            className="pl-10" 
                            placeholder="Enter your password" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                          <Input 
                            {...field} 
                            className="pl-10" 
                            placeholder="Choose a username" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                          <Input 
                            {...field} 
                            className="pl-10" 
                            placeholder="Enter your full name" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                          <Input 
                            {...field} 
                            type="email" 
                            className="pl-10" 
                            placeholder="Enter your email" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="university"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <School className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                          <Input 
                            {...field} 
                            className="pl-10" 
                            placeholder="Enter your university" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Image className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                          <Input 
                            {...field} 
                            className="pl-10" 
                            placeholder="Enter avatar URL" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                          <Input 
                            {...field} 
                            type="password" 
                            className="pl-10" 
                            placeholder="Create a password" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                          <Input 
                            {...field} 
                            type="password" 
                            className="pl-10" 
                            placeholder="Confirm your password" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-4">
          <div className="text-sm text-neutral-500 text-center">
            {activeTab === "login" 
              ? "Don't have an account?" 
              : "Already have an account?"}
            <button 
              onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
              className="ml-1 text-primary hover:underline"
            >
              {activeTab === "login" ? "Register" : "Login"}
            </button>
          </div>
        </CardFooter>
      </Tabs>
    </Card>
  );
}
