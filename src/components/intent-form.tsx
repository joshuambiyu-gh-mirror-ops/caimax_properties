import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

import React from 'react'
import { Textarea } from "./ui/textarea";
import FormButton from "./form-button";
import { Label } from "./ui/label";

export default function IntentForm() {
  return (
    <div>
    <Popover>
      <PopoverTrigger asChild>
        <Button size="lg">Book Site Visit</Button>
      </PopoverTrigger>
      <PopoverContent>
        <form action="">
        <div className="flex flex-col gap-4 p-4 w-80">
          <h3 className="text-base font-extrabold ">Interested In the Property?</h3>
          <div>
            <Label>Name</Label>
            <Input
                name="name"
                placeholder="Name"
                className="w-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label >Phone No</Label>
            <Input
              name="phone"
              placeholder="Your Phone Number"
              className="w-60"
            />
          </div>

          <div>
            <Label >Message</Label>
            <Textarea
              name="message"
              placeholder="message"
              className="w-60"
            />
          </div>

        </div>
        <FormButton>SUBMIT</FormButton>
        </form>


      </PopoverContent>
    </Popover>

    </div>
  )
}


