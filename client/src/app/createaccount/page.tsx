"use client";
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import Image from "next/image";
import placeholderUser from "@/assets/placeholderUser.png"
import { Textarea } from "@/components/ui/textarea"

// zod defines form shape and fields
const formSchema = z.object({
  // add proper form schema
  placeholder: z.string()
})


export default function CreateAccount() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // add default values
      placeholder: ""
    },
    
  })
 
  // submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
  }


  return (
    <Form {...form}>
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#B1D2F6] to-[#DFEDFB]">
      <Carousel className="w-2/5 flex justify-center items-center">
        <CarouselContent>
          <CarouselItem>
            <Card className="bg-white/60">
              <CardContent className="h-96 min-h-96 p-6">
                <ScrollArea className="h-full w-full rounded-md p-1">
                  <h2 className="text-2xl font-bold text-center p-4 text-title-basic">Are you...</h2>
                  <div className="flex justify-center gap-16 w-full h-full pt-2">
                    <Image className="w-1/3 h-fit rounded-lg" src={placeholderUser} alt="Student Icon"></Image>
                    <Image className="w-1/3 h-fit rounded-lg" src={placeholderUser} alt="Professional Icon"></Image>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </CarouselItem>
          <CarouselItem>
            <Card className="bg-white/60">
              <CardContent className="h-96 min-h-96 p-6">
                <ScrollArea className="h-full w-full rounded-md p-1">
                  <h2 className="text-2xl font-bold text-center p-4">Let us know a little more about you!</h2>
                  <div className="flex-col text-center items-center gap-10 w-full h-full">
                    <p className="text-md p-2 pl-16 pr-16">Your bio does not need to be work related and it is not mandatory to add a photo of yourself</p>
                    <div>
                      <textarea className="w-4/5 h-40 rounded-lg text-sm bg-white resize-none" placeholder={"begin writing a short bio here..."}></textarea>
                      <br></br>
                      <Button className="bg-white border-1 text-body-text">Add Profile Picture</Button>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </CarouselItem>
          <CarouselItem>
            <Card className="bg-white/60">
              <CardContent className="text-center p-6">

                <ScrollArea className="h-full w-full rounded-md p-1">
                  <h2 className="text-2xl font-bold text-center p-4">Fill out your experience here</h2>
                  <div className="flex-col text-center items-center gap-10 w-full h-full">
                    <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Education</AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-1 text-balance">
                        <p className="text-left">College or University</p>
                        <FormField
                          control={form.control}
                          name="placeholder"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} className="bg-white rounded-lg" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <p className="text-left">Program of Study</p>
                        <FormField
                          control={form.control}
                          name="placeholder"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} className="bg-white rounded-lg" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <p className="text-left">Graduation Year</p>
                        <FormField
                          control={form.control}
                          name="placeholder"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} className="bg-white rounded-lg w-1/4" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                            )}
                          />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Work Experience</AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-1 text-balance">
                        <p className="text-left">Organization</p>
                        <FormField
                          control={form.control}
                          name="placeholder"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} className="bg-white rounded-lg" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                            )}
                          />
                        <p className="text-left">Position</p>
                        <FormField
                          control={form.control}
                          name="placeholder"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} className="bg-white rounded-lg" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                            )}
                          />
                        <p className="text-left inline w-2/5">Start Date</p>
                        <FormField
                          control={form.control}
                          name="placeholder"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} className="bg-white rounded-lg w-2/5" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                            )}
                          />
                        <p className="text-left inline w-2/5">End Date</p>
                        <FormField
                          control={form.control}
                          name="placeholder"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} className="bg-white rounded-lg w-2/5" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                            )}
                          />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Extracurriculars</AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-4 text-balance">
                        
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Volunteering</AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-4 text-balance">
                        
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      </div>
    </Form>
  );
}
