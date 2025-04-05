import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../hooks/use-auth";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  university: z.string().min(2, "University must be at least 2 characters"),
});

// Types for forms
type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function FirebaseAuthForm() {
  const { firebaseLogin, firebaseRegister, loginMutation } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showDevLogin, setShowDevLogin] = useState(false);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      name: "",
      university: "",
    },
  });

  // Handle login submission
  async function onLoginSubmit(values: LoginFormValues) {
    console.log("Login form submitted:", values);
    setIsSubmitting(true);
    
    try {
      await firebaseLogin(values);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle register submission
  async function onRegisterSubmit(values: RegisterFormValues) {
    console.log("Register form submitted:", values);
    setIsSubmitting(true);
    
    try {
      await firebaseRegister(values);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Development mode login (while Firebase credentials are being set up)
  function loginWithDev(role: string) {
    setIsSubmitting(true);
    
    try {
      if (role === 'admin') {
        loginMutation.mutate({ username: 'admin', password: 'adminpass' });
      } else {
        loginMutation.mutate({ username: 'user1', password: 'userpass' });
      }
    } catch (error) {
      console.error("Dev login error:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="login" onValueChange={(value) => setAuthMode(value as "login" | "register")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        {/* Login Form */}
        <TabsContent value="login">
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-muted-foreground">
                Enter your email to sign in to your account
              </p>
            </div>
            
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
            
            {/* Development login option while Firebase is being set up */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center mb-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDevLogin(!showDevLogin)}
                >
                  {showDevLogin ? "Hide Development Login" : "Show Development Login"}
                </Button>
              </div>
              
              {showDevLogin && (
                <div className="flex flex-col space-y-2">
                  <p className="text-xs text-center text-muted-foreground mb-2">
                    For testing while Firebase configuration is pending
                  </p>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => loginWithDev('user')}
                    disabled={isSubmitting}
                  >
                    Login as Test User
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => loginWithDev('admin')}
                    disabled={isSubmitting}
                  >
                    Login as Admin
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Register Form */}
        <TabsContent value="register">
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">Create an Account</h2>
              <p className="text-muted-foreground">
                Enter your information to create an account
              </p>
            </div>
            
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be your unique identifier
                      </FormDescription>
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
                        <Input placeholder="John Doe" {...field} />
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
                      <FormLabel>University</FormLabel>
                      <FormControl>
                        <Input placeholder="Stanford University" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}