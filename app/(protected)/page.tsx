import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Search,
  FileSpreadsheet,
  Brain,
  Filter,
  FileText,
  BarChart,
  Zap,
  Users,
  Globe,
} from "lucide-react";
import Link from "next/link";

const Home = async () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              Dark Alpha Capital
              <span className="mt-2 block text-gray-600 dark:text-gray-300">
                Deal Origination
              </span>
            </h1>
            <p className="mb-10 text-xl text-gray-600 dark:text-gray-400">
              Streamline your deal flow management with AI-powered insights and
              efficient processes.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                className="transform rounded-full px-8 py-6 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
                asChild
              >
                <Link href="/raw-deals">
                  Explore Raw Deals
                  <Search className="ml-2 inline-block h-5 w-5" />
                </Link>
              </Button>
              <Button
                className="transform rounded-full px-8 py-6 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
                variant="secondary"
                asChild
              >
                <Link href="/import">
                  Add New Deal
                  <ArrowRight className="ml-2 inline-block h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Key Features
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={
                <FileSpreadsheet className="h-12 w-12 text-gray-600 dark:text-gray-300" />
              }
              title="Flexible Deal Addition"
              description="Add deals manually or bulk upload via Excel sheets for efficient data entry."
            />
            <FeatureCard
              icon={
                <Brain className="h-12 w-12 text-gray-600 dark:text-gray-300" />
              }
              title="AI-Powered Deal Inference"
              description="Leverage AI to structure raw deal information from various internet sources."
            />
            <FeatureCard
              icon={
                <Filter className="h-12 w-12 text-gray-600 dark:text-gray-300" />
              }
              title="Intelligent Deal Screening"
              description="Use AI-assisted questionnaires for efficient and thorough deal screening."
            />
            <FeatureCard
              icon={
                <FileText className="h-12 w-12 text-gray-600 dark:text-gray-300" />
              }
              title="CIM Management"
              description="Easily attach and manage Confidential Information Memorandums for deals."
            />
            <FeatureCard
              icon={
                <BarChart className="h-12 w-12 text-gray-600 dark:text-gray-300" />
              }
              title="Advanced Analytics"
              description="Gain insights with comprehensive deal flow analytics and reporting."
            />
            <FeatureCard
              icon={
                <Zap className="h-12 w-12 text-gray-600 dark:text-gray-300" />
              }
              title="Workflow Automation"
              description="Streamline processes with customizable workflows and integrations."
            />
          </div>
        </div>
      </section>

      {/* AI-Powered Deal Inference Section */}
      <FeatureSection
        title="AI-Powered Deal Inference"
        description="Leverage cutting-edge AI to structure and analyze raw deal information."
        icon={<Brain className="h-16 w-16 text-gray-600 dark:text-gray-300" />}
        reverse={false}
      >
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li>
            • Automatic extraction of key deal details from unstructured data
          </li>
          <li>
            • Integration with various internet sources for comprehensive deal
            insights
          </li>
          <li>
            • AI-driven categorization and tagging for improved searchability
          </li>
          <li>
            • Continuous learning capabilities to enhance inference accuracy
            over time
          </li>
        </ul>
      </FeatureSection>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            How It Works
          </h2>
          <div className="mx-auto max-w-3xl">
            <ol className="relative border-l border-gray-200 dark:border-gray-700">
              <TimelineItem number={1} title="Add Deals">
                Manually input deal information or bulk upload via Excel sheets.
              </TimelineItem>
              <TimelineItem number={2} title="AI Inference">
                Use AI to structure raw deal information from various sources.
              </TimelineItem>
              <TimelineItem number={3} title="Screening">
                Leverage AI-powered questionnaires for efficient deal screening.
              </TimelineItem>
              <TimelineItem number={4} title="Manage CIMs">
                Attach and organize Confidential Information Memorandums.
              </TimelineItem>
              <TimelineItem number={5} title="Analyze">
                Gain insights and make informed decisions based on comprehensive
                deal data.
              </TimelineItem>
            </ol>
          </div>
        </div>
      </section>

      {/* Intelligent Deal Screening Section */}
      <FeatureSection
        title="Intelligent Deal Screening"
        description="Streamline your deal evaluation process with AI-assisted screening."
        icon={<Filter className="h-16 w-16 text-gray-600 dark:text-gray-300" />}
        reverse={true}
      >
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li>• Custom questionnaire creation for tailored deal assessment</li>
          <li>
            • AI-powered RAG (Retrieval-Augmented Generation) pipelines for
            intelligent screening
          </li>
          <li>
            • Multiple screening iterations per deal for thorough evaluation
          </li>
          <li>
            • Automated risk assessment and deal scoring based on predefined
            criteria
          </li>
        </ul>
      </FeatureSection>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Why Choose Dark Alpha
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <BenefitCard
              icon={
                <Zap className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              }
              title="Increased Efficiency"
              description="Automate repetitive tasks and streamline your deal flow process."
            />
            <BenefitCard
              icon={
                <Brain className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              }
              title="AI-Driven Insights"
              description="Leverage artificial intelligence for deeper deal analysis and better decision-making."
            />
            <BenefitCard
              icon={
                <Users className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              }
              title="Improved Collaboration"
              description="Enhance team communication and coordination throughout the deal lifecycle."
            />
            <BenefitCard
              icon={
                <BarChart className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              }
              title="Data-Driven Decisions"
              description="Make informed choices based on comprehensive analytics and reporting."
            />
            <BenefitCard
              icon={
                <Globe className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              }
              title="Scalable Solution"
              description="Easily adapt to growing deal volumes and expanding team sizes."
            />
            <BenefitCard
              icon={
                <FileText className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              }
              title="Comprehensive Documentation"
              description="Maintain detailed records of all deal-related information in one centralized platform."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
            Ready to Optimize Your Deal Flow?
          </h2>
          <p className="mb-10 text-xl text-gray-600 dark:text-gray-300">
            Join Dark Alpha Capital and transform your deal origination process
            today.
          </p>
          <Button
            className="transform rounded-full bg-gray-900 px-8 py-6 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 dark:bg-white dark:text-gray-900"
            asChild
          >
            <Link href="/get-started">
              Get Started
              <ArrowRight className="ml-2 inline-block h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center rounded-lg bg-gray-50 p-6 text-center shadow-md dark:bg-muted">
    {icon}
    <h3 className="mb-2 mt-4 text-xl font-semibold text-gray-900 dark:text-white">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

const FeatureSection = ({
  title,
  description,
  icon,
  children,
  reverse,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  reverse: boolean;
}) => (
  <section className={`py-20 ${reverse ? "" : ""}`}>
    <div className="container mx-auto px-4">
      <div
        className={`flex flex-col items-center gap-8 md:flex-row ${reverse ? "md:flex-row-reverse" : ""}`}
      >
        <div className="md:w-1/2">
          <div className="flex flex-col items-center md:items-start">
            {icon}
            <h2 className="mb-4 mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mb-6 text-center text-xl text-gray-600 dark:text-gray-400 md:text-left">
              {description}
            </p>
            {children}
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="aspect-video rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  </section>
);

const TimelineItem = ({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) => (
  <li className="mb-10 ml-6">
    <span className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-4 ring-white dark:bg-gray-700 dark:ring-gray-900">
      <span className="font-semibold text-gray-800 dark:text-gray-200">
        {number}
      </span>
    </span>
    <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
      {title}
    </h3>
    <p className="text-base font-normal text-gray-500 dark:text-gray-400">
      {children}
    </p>
  </li>
);

const BenefitCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex items-start p-4">
    <div className="mr-4 flex-shrink-0">{icon}</div>
    <div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

export default Home;
