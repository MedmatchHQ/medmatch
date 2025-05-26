"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import google from "@/assets/google-icon.png";
import linkedin from "@/assets/linkedin-icon.png";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.boolean(),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = (values: LoginFormValues) => console.log(values);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#B1D2F6] to-[#DFEDFB]">
      <div className="relative bg-white bg-opacity-60 shadow-md rounded-xl p-6 w-full max-w-3xl overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-md z-10"></div>
        <div className="relative z-20 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-800">Login</h2>
            <p className="mt-4 text-xs text-gray-500">Enter your email and password below</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="email" {...field} className="bg-white rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="password" {...field} 
                          className="bg-white rounded-lg" 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} 
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-xs" >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox {...field} value={field.value ? "true" : "false"} />
                      </FormControl>
                      <FormLabel className="text-xs font-normal pb-2">Remember me</FormLabel>
                    </FormItem>
                  )}
                />
                <Link href="#" className="text-xs text-gray-500 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" 
                className="w-full py-7 rounded-xl bg-[#735AFB] hover:bg-white text-white font-semibold">
                Login
              </Button>
            </form>
          </Form>
          <div className="flex items-center justify-center mt-6">
            <div className="border-t border-gray-300 flex-grow"></div>
            <span className="px-4 text-gray-500 text-xs">Or login with</span>
            <div className="border-t border-gray-300 flex-grow"></div>
          </div>
          <div className="mt-4 flex justify-center space-x-4">
            <Button className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100">
              <Image className="w-5 h-5" src={google} alt="Google Icon" />
              Google
            </Button>
            <Button className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100">
              <Image className="w-5 h-5" src={linkedin} alt="LinkedIn Icon" />
              LinkedIn
            </Button>
          </div>
          <div className="mt-6 text-center text-gray-500 hover:text-blue-500 text-xs">
            <Link href="/signup">Don't have an account?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}