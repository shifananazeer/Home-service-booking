"use client";

import { Search, Calendar, Coffee } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Browse and select the service you need",
    description: "Choose from our wide range of professional home services",
    icon: Search,
  },
  {
    number: 2,
    title: "Schedule your time and date at your convenience",
    description: "Pick a time that works best for your schedule",
    icon: Calendar,
  },
  {
    number: 3,
    title: "Relax while our professionals do the job",
    description: "Our verified experts will take care of everything",
    icon: Coffee,
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4 text-white">How It Works</h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Get your home services done in three simple steps
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`relative group opacity-0 translate-y-5 animation-delay-${index} animate-fade-in-up`}
            >
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-10 h-10 text-blue-600" />
                </div>
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3 text-center text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
