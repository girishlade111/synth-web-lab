import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Github, Instagram, Linkedin, Mail, CodeIcon, Zap, Globe, Cpu, Shield, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const socialLinks = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/girish_lade_/",
      icon: Instagram,
      color: "hover:text-pink-500"
    },
    {
      name: "LinkedIn", 
      url: "https://www.linkedin.com/in/girish-lade-075bba201/",
      icon: Linkedin,
      color: "hover:text-blue-600"
    },
    {
      name: "GitHub",
      url: "https://github.com/girishlade111", 
      icon: Github,
      color: "hover:text-gray-400"
    },
    {
      name: "CodePen",
      url: "https://codepen.io/Girish-Lade-the-looper",
      icon: CodeIcon,
      color: "hover:text-green-500"
    },
    {
      name: "Email",
      url: "mailto:girishlade111@gmail.com",
      icon: Mail,
      color: "hover:text-red-500"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Code Generation",
      description: "Revolutionary AI code generation capabilities powered by advanced machine learning models for intelligent development assistance."
    },
    {
      icon: Globe,
      title: "Web-Based Development Environment", 
      description: "Complete browser-based IDE with no installation required, accessible from anywhere with internet connectivity."
    },
    {
      icon: Cpu,
      title: "Real-Time Code Execution",
      description: "Instant code compilation and execution with live preview functionality for rapid development iterations."
    },
    {
      icon: Shield,
      title: "Secure Cloud Infrastructure",
      description: "Enterprise-grade security with encrypted data transmission and secure cloud-based code storage solutions."
    },
    {
      icon: Rocket,
      title: "Performance Optimized",
      description: "High-performance architecture designed for scalability and lightning-fast development workflows."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Navigation Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CodeIcon className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Girish IDE
              </h1>
            </div>
            <Link to="/">
              <Button variant="outline">Back to IDE</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              Next-Generation Development Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
              About Girish IDE
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Revolutionary AI-powered Integrated Development Environment designed to transform how developers create, collaborate, and deploy applications in the modern web ecosystem.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-3xl">What is Girish IDE?</CardTitle>
                <CardDescription className="text-lg">
                  The future of web development is here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-lg leading-relaxed">
                <p>
                  <strong>Girish IDE</strong> represents a groundbreaking advancement in integrated development environments, specifically engineered for modern web development workflows. This cutting-edge <strong>AI-powered IDE</strong> combines the convenience of cloud-based development with the sophistication of artificial intelligence to deliver an unparalleled coding experience.
                </p>
                
                <p>
                  Our <strong>web-based IDE</strong> eliminates the traditional barriers of software installation and configuration, providing developers with instant access to a fully-featured development environment through any modern web browser. The <strong>Girish IDE platform</strong> leverages advanced machine learning algorithms to understand code patterns, suggest optimizations, and generate intelligent code completions that significantly accelerate the development process.
                </p>

                <p>
                  Built with scalability and performance in mind, <strong>Girish IDE</strong> supports multiple programming languages, frameworks, and libraries while maintaining lightning-fast response times. The platform's <strong>real-time collaboration features</strong> enable distributed teams to work seamlessly on projects, with live code sharing, synchronized editing, and integrated communication tools.
                </p>

                <p>
                  The <strong>AI code generation capabilities</strong> of Girish IDE set it apart from traditional development environments. By analyzing project context, coding patterns, and best practices, our AI assistant can generate complete functions, debug existing code, and suggest architectural improvements that enhance code quality and maintainability.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Key Features & Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex space-x-4 p-4 rounded-lg bg-secondary/20 border">
                      <feature.icon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-primary">Core Technologies</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• React 18+ with TypeScript</li>
                      <li>• Monaco Editor Integration</li>
                      <li>• Real-time WebSocket Communication</li>
                      <li>• Advanced AI Model Integration</li>
                      <li>• Cloud-native Architecture</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-primary">Platform Features</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Multi-language Support</li>
                      <li>• Live Code Preview</li>
                      <li>• Version Control Integration</li>
                      <li>• Project Management Tools</li>
                      <li>• Collaborative Development</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">Connect with Creator</CardTitle>
                <CardDescription>
                  Follow Girish Lade on social media platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 hover:border-primary/50 hover:bg-secondary/20 ${social.color}`}
                    >
                      <social.icon className="h-5 w-5" />
                      <span className="font-medium">{social.name}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">Why Choose Girish IDE?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm">Zero installation required - start coding instantly</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm">AI-powered code suggestions and generation</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm">Cross-platform compatibility</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm">Real-time collaboration features</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm">Enterprise-grade security</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Call to Action */}
        <section className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold">Experience the Future of Development</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers who have revolutionized their workflow with Girish IDE's AI-powered development environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="w-full sm:w-auto">
                Try Girish IDE Now
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Documentation
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-secondary/20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Girish IDE. Empowering developers with AI-driven innovation.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;