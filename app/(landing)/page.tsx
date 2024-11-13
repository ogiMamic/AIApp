import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, FileSearch, Cog, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <Zap className="h-6 w-6" />
          <span className="sr-only">AI Automation Inc</span>
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          <Link href="/sign-in">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Signup</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Revolutionize Your Workflow with AI Agents
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Create intelligent agents, analyze files effortlessly, and
                  automate complex processes with our cutting-edge AI platform.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/sign-up">
                  <Button>Start Automating</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Key Capabilities
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <div className="p-2 bg-black bg-opacity-50 rounded-full">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">AI Agent Creation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Design and deploy custom AI agents tailored to your specific
                  business needs.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <div className="p-2 bg-black bg-opacity-50 rounded-full">
                  <FileSearch className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Intelligent File Analysis</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Extract insights and automate document processing with
                  advanced AI algorithms.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <div className="p-2 bg-black bg-opacity-50 rounded-full">
                  <Cog className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Process Automation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Streamline workflows and reduce manual tasks with intelligent
                  automation.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Transform Your Business with AI
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join innovative companies leveraging our AI platform to boost
                  productivity and drive growth.
                </p>
              </div>
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 AI Automation Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
