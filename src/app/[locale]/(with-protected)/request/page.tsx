"use client";

import FormWizard from "@/components/domain/request/FormWizard";
import ProgressBar from "@/components/domain/request/ProgressBar";
import DefaultLayout from "@/components/layout/DefaultLayout";
import Header from "@/components/layout/Header";
import { useState } from "react";

export default function EstimateRequestPage() {
   const [currentStep, setCurrentStep] = useState(0);
   const [isPending, setIsPending] = useState(true);

   return (
      <div className="bg-bg-200 min-h-screen">
         <Header>
            {!isPending && <ProgressBar currentStep={currentStep} />}
         </Header>
         <DefaultLayout>
            <div className="bg-bg-200 flex h-fit w-full flex-col pb-15 lg:px-65 lg:pb-54">
               <FormWizard
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  isPending={isPending}
                  setIsPending={setIsPending}
               />
            </div>
         </DefaultLayout>
      </div>
   );
}
