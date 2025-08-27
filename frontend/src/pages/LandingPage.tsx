import { Link } from 'react-router-dom'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { CalendarClock, Clock, Repeat, Zap, CheckCircle, CheckCircle2, ArrowRight, Star, Shield, BarChart3, Settings, Upload, Play, Users } from 'lucide-react'
import { currentTheme, brandAssets } from '@/lib/themes'

export default function LandingPage() {
  const { BrandIcon, brandName } = brandAssets

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <a className="flex items-center justify-center" href="#">
            <BrandIcon className={`h-6 w-6 ${currentTheme.text.primary}`} />
            <span className="ml-2 text-lg font-bold">{brandName}</span>
          </a>
          <nav className="flex-1 flex justify-center gap-4 sm:gap-6">
            <a className={`text-sm font-medium hover:underline underline-offset-4 hover:${currentTheme.text.primary}`} href="#features">
              Features
            </a>
            <a className={`text-sm font-medium hover:underline underline-offset-4 hover:${currentTheme.text.primary}`} href="#how-it-works">
              How It Works
            </a>
            <a className={`text-sm font-medium hover:underline underline-offset-4 hover:${currentTheme.text.primary}`} href="#pricing">
              Pricing
            </a>
            <a className={`text-sm font-medium hover:underline underline-offset-4 hover:${currentTheme.text.primary}`} href="#faq">
              FAQ
            </a>
          </nav>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" className={`${currentTheme.backgrounds.primary} ${currentTheme.backgrounds.primaryHover}`} asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className={`w-full py-12 md:py-24 lg:py-32 xl:py-48 ${currentTheme.backgrounds.gradient}`}>
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="secondary" className="mb-4">
                  <Zap className="w-3 h-3 mr-1" />
                  Schedule Reddit Posts Like a Pro
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Never Miss the Perfect
                  <span className={`${currentTheme.text.primary}`}> Reddit Moment</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Schedule your Reddit posts for optimal engagement. Set up recurring campaigns, one-time posts, and never worry about timing again.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className={`${currentTheme.backgrounds.primary} ${currentTheme.backgrounds.primaryHover}`} asChild>
                  <Link to="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Free 14-day trial • No credit card required • 2,000+ happy users
              </p>
              <div className="w-full max-w-4xl mt-8">
                <img
                  src={`/schedularr-dashboard-${currentTheme.name}.png`}
                  alt="Reddit Scheduler Dashboard"
                  width={800}
                  height={400}
                  className="rounded-lg shadow-2xl border"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features and Benefits Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline">Features & Benefits</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need to Dominate Reddit
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Powerful scheduling tools designed specifically for Reddit success.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-8">
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <Clock className={`h-10 w-10 ${currentTheme.text.primary}`} />
                  <CardTitle>One-Time Scheduling</CardTitle>
                  <CardDescription>
                    Schedule individual posts for the perfect moment when your audience is most active.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Optimal timing suggestions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Multiple subreddit support
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Preview before posting
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className={`relative overflow-hidden ${currentTheme.accents.border}`}>
                <Badge className={`absolute top-4 right-4 ${currentTheme.accents.badge}`}>Most Popular</Badge>
                <CardHeader>
                  <Repeat className={`h-10 w-10 ${currentTheme.text.primary}`} />
                  <CardTitle>Recurring Posts</CardTitle>
                  <CardDescription>
                    Set up recurring campaigns with flexible scheduling options and automatic posting.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Daily, weekly, monthly cycles
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Custom intervals & end dates
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Infinite campaigns option
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <BarChart3 className={`h-10 w-10 ${currentTheme.text.primary}`} />
                  <CardTitle>Smart Analytics</CardTitle>
                  <CardDescription>
                    Track performance, optimize timing, and grow your Reddit presence with detailed insights.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Engagement tracking
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Best time recommendations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Performance reports
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <Users className={`h-10 w-10 ${currentTheme.text.primary}`} />
                  <CardTitle>Multi-Account Support</CardTitle>
                  <CardDescription>
                    Manage multiple Reddit accounts from a single dashboard with ease.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Multiple account management
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Unified dashboard
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Account switching
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <CalendarClock className={`h-10 w-10 ${currentTheme.text.primary}`} />
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>
                    Visualize your posting schedule with an intuitive calendar interface.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Monthly view
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Drag and drop scheduling
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Visual timeline
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <CheckCircle2 className={`h-10 w-10 ${currentTheme.text.primary}`} />
                  <CardTitle>Post Verification</CardTitle>
                  <CardDescription>
                    Confirm successful posting with automated notifications and status updates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Automated notifications
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Status tracking
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Error handling
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline">How It Works</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Get Started in 3 Simple Steps
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From setup to success in minutes, not hours.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${currentTheme.accents.iconBg}`}>
                  <Shield className={`h-8 w-8 ${currentTheme.accents.iconText}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">1. Connect Your Account</h3>
                  <p className="text-gray-500">
                    Securely connect your Reddit account with OAuth. Your credentials are never stored.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${currentTheme.accents.iconBg}`}>
                  <Upload className={`h-8 w-8 ${currentTheme.accents.iconText}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">2. Create Your Posts</h3>
                  <p className="text-gray-500">
                    Write your content, select subreddits, and choose between one-time or recurring schedules.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${currentTheme.accents.iconBg}`}>
                  <Settings className={`h-8 w-8 ${currentTheme.accents.iconText}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">3. Set & Forget</h3>
                  <p className="text-gray-500">
                    Schedule your posts and let our system handle the rest. Monitor performance from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof/Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline">Testimonials</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Loved by Reddit Power Users
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See what our users are saying about RedditScheduler.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    "RedditScheduler has completely transformed my content strategy. My posts now consistently hit the front page because I'm posting at optimal times!"
                  </p>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Sarah Martinez</p>
                      <p className="text-xs text-gray-500">Content Creator</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    "The recurring post feature is a game-changer. I set up my weekly AMAs once and they post automatically. Saved me hours every week!"
                  </p>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>DJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">David Johnson</p>
                      <p className="text-xs text-gray-500">Business Owner</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    "Finally, a tool that understands Reddit! The analytics help me understand what works and when to post for maximum engagement."
                  </p>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>EL</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Emily Liu</p>
                      <p className="text-xs text-gray-500">Marketing Manager</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline">Pricing</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that fits your Reddit strategy.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <CardDescription>Perfect for individuals getting started</CardDescription>
                  <div className="text-3xl font-bold">$9<span className="text-sm font-normal">/month</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Up to 50 scheduled posts/month
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      5 subreddit connections
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Basic analytics
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Email support
                    </li>
                  </ul>
                  <Button className="w-full mt-6" variant="outline" asChild>
                    <Link to="/signup">Start Free Trial</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className={`${currentTheme.accents.border} relative`}>
                <Badge className={`absolute top-4 right-4 ${currentTheme.accents.badge}`}>Most Popular</Badge>
                <CardHeader>
                  <CardTitle>Professional</CardTitle>
                  <CardDescription>For serious Reddit marketers</CardDescription>
                  <div className="text-3xl font-bold">$29<span className="text-sm font-normal">/month</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Up to 200 scheduled posts/month
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Unlimited subreddit connections
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Advanced analytics & insights
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Recurring post campaigns
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Priority support
                    </li>
                  </ul>
                  <Button className={`w-full mt-6 ${currentTheme.backgrounds.primary} ${currentTheme.backgrounds.primaryHover}`} asChild>
                    <Link to="/signup">Start Free Trial</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For teams and agencies</CardDescription>
                  <div className="text-3xl font-bold">$99<span className="text-sm font-normal">/month</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Unlimited scheduled posts
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Team collaboration tools
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      White-label reporting
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      API access
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Dedicated account manager
                    </li>
                  </ul>
                  <Button className="w-full mt-6" variant="outline">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline">FAQ</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to know about RedditScheduler.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl py-12">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How does recurring scheduling work?</AccordionTrigger>
                  <AccordionContent>
                    You can set up posts to repeat daily, weekly, monthly, or at custom intervals. You can choose to set an end date for the campaign or let it run indefinitely. Each recurring post can be customized with different content variations to keep your audience engaged.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is my Reddit account safe?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely. We use Reddit's official OAuth system, which means we never store your password. You can revoke access at any time through your Reddit account settings. All data is encrypted and we follow industry-standard security practices.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Can I schedule posts to multiple subreddits?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can schedule the same post to multiple subreddits simultaneously, or create different versions for different communities. Our system respects each subreddit's posting rules and rate limits.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>What happens if Reddit is down when my post is scheduled?</AccordionTrigger>
                  <AccordionContent>
                    Our system automatically retries failed posts and will attempt to post again once Reddit is back online. You'll receive notifications about any posting issues, and you can manually reschedule if needed.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Can I edit or cancel scheduled posts?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can edit, reschedule, or cancel any scheduled post before it goes live. For recurring posts, you can modify the entire campaign or individual instances within the series.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>Do you offer refunds?</AccordionTrigger>
                  <AccordionContent>
                    We offer a 14-day free trial so you can test all features before committing. If you're not satisfied within the first 30 days of your paid subscription, we'll provide a full refund, no questions asked.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className={`w-full py-12 md:py-24 lg:py-32 ${currentTheme.backgrounds.cta}`}>
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to Dominate Reddit?
                </h2>
                <p className={`mx-auto max-w-[600px] ${currentTheme.text.ctaLight} md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed`}>
                  Join thousands of successful Redditors who are already scheduling their way to the front page. Start your free trial today.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" variant="secondary" className={`bg-white ${currentTheme.text.ctaButton} hover:bg-gray-100`} asChild>
                  <Link to="/signup">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className={`border-white ${currentTheme.text.ctaButton} hover:bg-white hover:${currentTheme.text.ctaButton}`}>
                  Schedule a Demo
                </Button>
              </div>
              <div className={`flex items-center gap-4 text-sm ${currentTheme.text.ctaLight}`}>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  14-day free trial
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 sm:px-6 lg:px-8 border-t bg-gray-50">
        <div className="flex items-center">
          <BrandIcon className={`h-5 w-5 ${currentTheme.text.primary} mr-2`} />
          <span className="font-semibold">{brandName}</span>
        </div>
        <p className="text-xs text-gray-500 sm:ml-4">
          {`© 2025 ${brandName}. All rights reserved.`}
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy Policy
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Contact Support
          </a>
        </nav>
      </footer>
    </div>
  )
}
