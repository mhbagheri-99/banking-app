"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { authFormSchema } from "@/lib/utils";
import CustomFormInput from "./CustomFormInput";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/user.actions";

const AuthForm = ({ type }: { type: string }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const formSchema = authFormSchema(type);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      if (type === "sign-in") {
        // const response = await signIn(values.email, values.password);
        // if (response) {
        //   router.push("/");
        // }
      }
      if (type === "sign-up") {
        // const newUser = await signUp(values);
        // setUser(newUser);
      }
      console.log(values);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="cursor-pointer items-center flex gap-1">
          <Image
            src="/icons/logo.svg"
            alt="Horizon Logo"
            width={32}
            height={32}
          />
          <h1 className="font-ibm-plex-serif font-bold text-black-1 text-26">
            Horizon
          </h1>
        </Link>
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 ls:text-36 font-semibold text-gray-900">
            {user ? "Link Account" : type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>
          <p className="text-16 font-normal text-gray-600">
            {user
              ? "Link your account to Horizon to continue"
              : "Please enter your details"}
          </p>
        </div>
      </header>
      {user ? (
        <div className="flex flex-col gap-4"></div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {type === "sign-up" && (
                <>
                  <div className="flex gap-4">
                    <CustomFormInput
                      control={form.control}
                      name="firstName"
                      label="First Name"
                      placeholder="ex. John"
                    />
                    <CustomFormInput
                      control={form.control}
                      name="lastName"
                      label="Last Name"
                      placeholder="ex. Doe"
                    />
                  </div>
                  <CustomFormInput
                    control={form.control}
                    name="address1"
                    label="Address"
                    placeholder="Enter your residency address"
                  />
                  <CustomFormInput
                    control={form.control}
                    name="city"
                    label="City"
                    placeholder="Enter your city"
                  />
                  <div className="flex gap-4">
                    <CustomFormInput
                      control={form.control}
                      name="state"
                      label="State"
                      placeholder="Enter your state"
                    />
                    <CustomFormInput
                      control={form.control}
                      name="postalCode"
                      label="Postal Code"
                      placeholder="ex. 35101"
                    />
                  </div>

                  <div className="flex gap-4">
                    <CustomFormInput
                      control={form.control}
                      name="dateOfBirth"
                      label="Date of Birth"
                      placeholder="YYYY-MM-DD"
                    />
                    <CustomFormInput
                      control={form.control}
                      name="ssn"
                      label="SSN"
                      placeholder="Enter your fiscal code or SSN"
                    />
                  </div>
                </>
              )}
              <CustomFormInput
                control={form.control}
                name="email"
                label="E-mail"
                placeholder="Enter your e-mail"
              />
              <CustomFormInput
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
              />
              <div className="flex flex-col gap-4">
                <Button type="submit" className="form-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      &nbsp; Loading...
                    </>
                  ) : type === "sign-in" ? (
                    "Sign In"
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type === "sign-in"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="form-link cursor-pointer"
            >
              {type === "sign-in" ? "Sign Up" : "Sign In"}
            </Link>
          </footer>
        </>
      )}
    </section>
  );
};

export default AuthForm;
