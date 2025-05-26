"use client";
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from "next/image";
import google from "@/assets/google-icon.png";
import linkedin from "@/assets/linkedin-icon.png";


// zod defines form shape and fields
const formSchema = z.object({
  first: z.string().min(1).max(50),
  last: z.string().min(1).max(50),
  phone: z.string().min(10).max(15), // set phone number to not exceed ITU max digits of 15 (allow for country codes)
  birthday: z.string().date(),
  email: z.string().email(),
  password: z.string().min(8)
})


export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first: "",
      last: "",
      phone: "",
      birthday: "",
      email: "",
      password: "",
    },
    
  })
 
  // submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#B1D2F6] to-[#DFEDFB]">
      <div className="relative bg-white bg-opacity-60 shadow-md rounded-xl p-6 w-full max-w-3xl overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-md z-10"></div>
        <div className="relative z-20 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-800">Sign Up</h2>
            <p className="mt-4 text-xs text-gray-500">Create an account to continue!</p>
          </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="first"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="first name" {...field} className="bg-white rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="last name" {...field} className="bg-white rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="birthday"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="date" placeholder="birthday mm/dd/yyyy" {...field} className="bg-white rounded-lg block" />
                
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="phone number (xxx) xxx-xxxx" {...field} className="bg-white rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
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
        <Button type="submit" 
          className="w-full py-7 rounded-xl bg-[#735AFB] hover:bg-white text-white font-semibold">
          Register
        </Button>
      </form>
    </Form>
    <div className="flex items-center justify-center mt-6">
            <div className="border-t border-gray-300 flex-grow"></div>
            <span className="px-4 text-gray-500 text-xs">Or register with</span>
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
          <div className="mt-6 text-center text-gray-500 text-xs">
            Already have an account? <Link href="/login" className=" text-blue-500">Login</Link>
          </div>
    </div>
    </div>
    </div>
  )
}

