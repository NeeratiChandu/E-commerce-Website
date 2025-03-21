import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { LogIn, UserPlus, ArrowRight, ShoppingCart } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" })
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof insertUserSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Create form instances
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      name: ""
    }
  });
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('redirect') === 'true') {
        navigate('/cart');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);
  
  // Form submission handlers
  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };
  
  const onRegisterSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };
  
  // If user is already logged in, don't render the page
  if (user) {
    return null;
  }

  return (
    <Container className="py-16">
      <div className="flex flex-col lg:flex-row rounded-lg overflow-hidden shadow-lg">
        {/* Hero Section */}
        <div className="lg:w-1/2 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 p-8 lg:p-12 text-white">
          <div className="h-full flex flex-col justify-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-white rounded-md shadow-lg">
                <ShoppingCart className="h-8 w-8 text-primary-700" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">Welcome to ShopSmart</h1>
            <p className="text-xl mb-6">The smartest way to shop online.</p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 mt-0.5 text-secondary-500" />
                <span>Browse thousands of products</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 mt-0.5 text-secondary-500" />
                <span>Secure checkout and fast delivery</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 mt-0.5 text-secondary-500" />
                <span>Personalized recommendations</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 mt-0.5 text-secondary-500" />
                <span>Track your orders in real-time</span>
              </li>
            </ul>
            
            <p className="text-sm text-primary-100">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
        
        {/* Auth Forms */}
        <div className="lg:w-1/2 bg-white p-8 lg:p-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="text-lg">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="text-lg">
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username or Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username or email" {...field} />
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
                          <Input type="password" placeholder="Enter your password" {...field} />
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
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
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
                          <Input type="email" placeholder="Enter your email" {...field} />
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
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
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
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Container>
  );
}
