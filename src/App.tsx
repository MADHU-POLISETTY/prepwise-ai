import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Sparkles,
  Send,
  FileText,
  CheckCircle2,
  User,
  Home,
  Settings,
  Trash2,
  Play,
  ChevronRight,
  BarChart3,
  UploadCloud,
  Info,
  ArrowLeft,
  RefreshCw,
  X,
  AlertTriangle,
  PlusCircle,
  BookOpen,
  Check,
  HelpCircle,
  Activity,
  Globe,
  Compass,
  Briefcase,
  Star,
  Flame,
  UserCheck,
  CheckCircle,
  MessageCircle,
  TrendingUp,
  Sliders,
  AlertCircle,
  Eye,
  EyeOff,
  Pin,
  Search,
  Database,
  Download,
  Cpu,
  Cloud,
  Server,
  Layers,
  Terminal,
  Box,
  GitBranch,
  Network,
  ShieldCheck,
  Infinity,
  Layout,
  HardDrive
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, getDocs, query, orderBy, limit, doc, setDoc, where } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { db, auth, isFirebaseActive, handleFirestoreError, OperationType } from './lib/firebase';
import { exportEvaluationToPDF } from './utils/pdfExport';
import { CloudHub } from './components/CloudHub';

// Interfaces for State Management
interface InterviewQuestion {
  id: number;
  text: string;
}

interface AnswerInput {
  questionId: number;
  questionText: string;
  answerText: string;
  score?: number;
  feedback?: string;
  improvements?: string;
  idealAnswer?: string;
}

interface AssessmentMetrics {
  score: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  clarityScore: number;
  feedback: string;
}

interface InterviewSessionRecord {
  id?: string;
  category: string;
  role: string;
  difficulty: string;
  company: string;
  score: number;
  metrics: {
    communication: number;
    technical: number;
    confidence: number;
    problemSolving: number;
    clarity: number;
  };
  feedback: string;
  questions: AnswerInput[];
  createdAt: string;
}

interface ResumeAnalysisRecord {
  skills: string[];
  strengths: string[];
  improvements: string[];
  summary: string;
  atsScore: number;
  keywordMatches: { word: string; matched: boolean }[];
  missingSkills: string[];
  isSuitable: boolean;
  suitabilityVerdict: string;
  suitabilityExplanation: string;
  thingsToAddToResume: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: Date;
}

// Pre-populated premium initial records to give a gorgeous filled chart experience
const INITIAL_HISTORY: InterviewSessionRecord[] = [
  {
    id: "hist-1",
    category: "Technical",
    role: "Senior DevOps Engineer",
    difficulty: "Advanced",
    company: "Stripe",
    score: 88,
    metrics: {
      communication: 85,
      technical: 92,
      confidence: 84,
      problemSolving: 90,
      clarity: 89
    },
    feedback: `### Core Strengths:\n- Demonstrated flawless comprehension of event-driven synchronization.\n- Correctly specified idempotency constraints using transaction keys.\n\n### Suggestions for Improvement:\n- Consider expanding caching strategies for geo-distributed database clusters.\n- Quantify direct business outcomes of migration steps.\n\n### 4-Week Action Plan:\n- **Week 1:** Review Redis Cluster eviction mechanics.\n- **Week 2:** Practice microservice latency budget charts.\n- **Week 3:** Refine STAR results metrics.\n- **Week 4:** Mock interview with similar payment platforms.`,
    questions: [
      { questionId: 1, questionText: "How do you handle synchronous payment webhooks without data duplication?", answerText: "We introduce an idempotent routing database table that check keys on entry..." }
    ],
    createdAt: "2026-06-12T10:30:00Z"
  },
  {
    id: "hist-2",
    category: "Behavioral / HR",
    role: "Engineering Manager",
    difficulty: "Intermediate",
    company: "Google",
    score: 82,
    metrics: {
      communication: 90,
      technical: 75,
      confidence: 85,
      problemSolving: 80,
      clarity: 80
    },
    feedback: `### Core Strengths:\n- Excellent conflict resolution narrative demonstrating empathy.\n- Followed STAR methodology perfectly.\n\n### Areas for Improvement:\n- Be more direct on how engineering deadlines were renegotiated.\n- Add details regarding retrospectives.\n\n### 4-Week Plan:\n- **Week 1:** Read Crucial Conversations summaries.\n- **Week 2:** Refine management STAR stories focused on tech-debt.\n- **Week 3:** Perfect KPI tracking templates.\n- **Week 4:** Conduct mock behavioral drills with mentors.`,
    questions: [
      { questionId: 1, questionText: "Describe a conflict in engineering estimations with a peer leader.", answerText: "I scheduled a one-on-one session using shared technical data, adjusting sprints to reflect direct milestones..." }
    ],
    createdAt: "2026-06-14T14:15:00Z"
  },
  {
    id: "hist-3",
    category: "Technical",
    role: "Cloud DevOps Architect",
    difficulty: "Advanced",
    company: "Amazon Web Services",
    score: 91,
    metrics: {
      communication: 88,
      technical: 94,
      confidence: 90,
      problemSolving: 92,
      clarity: 91
    },
    feedback: `### Core Strengths:\n- Outstanding grasp of multi-region high availability architectures.\n- Clear explanation of IAM roles and least-privilege configurations.\n\n### Areas for Improvement:\n- Could expand cloud finance optimizations regarding underutilized node groups.\n\n### 4-Week Plan:\n- **Week 1:** Deep dive in Kubernetes horizontal pod scaling limits.\n- **Week 2:** Map multi-region database failovers.\n- **Week 3:** Practice system scaling estimations.\n- **Week 4:** Review advanced DNS routing records.`,
    questions: [
      { questionId: 1, questionText: "Define multi-region high availability setup parameters.", answerText: "We configure route 53 latency queues paired with active-active databases to support instant failovers..." }
    ],
    createdAt: "2026-06-16T18:45:00Z"
  }
];

function isGibberishOrInvalid(text: string): boolean {
  const clean = text.trim().toLowerCase();
  if (!clean) return true;
  if (clean.length < 5) return true;
  
  // Non-alphabetic character ratio is too high (e.g. mashing symbols or numbers)
  const lettersCount = (clean.match(/[a-z]/g) || []).length;
  if (lettersCount < clean.length * 0.3) return true;

  // Single character repetition (e.g., "aaaaaaaaa")
  if (/^(.)\1{3,}$/.test(clean.replace(/\s+/g, ''))) return true;

  // Repetitive patterns (e.g., "asdfasdfasdf")
  if (clean.length >= 8) {
    const half = clean.substring(0, clean.length / 2);
    if (clean === half + half) return true;
    const third = clean.substring(0, clean.length / 3);
    if (clean === third + third + third) return true;
  }

  // Common skip/lazy words
  const lazyWords = ["idk", "skip", "none", "nothing", "no idea", "asdf", "asdfgh", "qwer", "qwerty", "test", "hello", "hi", "placeholder"];
  if (lazyWords.includes(clean)) return true;

  // Consonants-only (excluding spaces)
  if (/^[bcdfghjklmnpqrstvwxyz\s]{5,}$/.test(clean)) return true;

  // Vowels-only (excluding spaces)
  if (/^[aeiou\s]{5,}$/.test(clean)) return true;

  return false;
}

function generateFallbackIdealAnswer(question: string): string {
  const q = question.toLowerCase();

  // Java Pool
  if (q.includes("core pillars of oop") || q.includes("encapsulation improve maintainability")) {
    return "The 4 main ideas of Object-Oriented Programming (OOP) in Java are:\n- **Encapsulation**: Keeping data safe inside a class by using private variables and public getter/setter methods. This stops other code from messing up your data.\n- **Inheritance**: Letting a new class copy features from an existing class to save time and reuse code.\n- **Polymorphism**: Letting different classes use the same method name but behave in their own way.\n- **Abstraction**: Hiding complex inner details and only showing what is needed.\nThese help you write clean, organized, and easy-to-fix code.";
  }
  if (q.includes("differences between list, set, and map") || (q.includes("hashmap") && q.includes("treemap"))) {
    return "In Java, we use List, Set, and Map to store collections of data:\n- **List**: Stores items in a specific order and allows duplicate items (like a shopping list). Example: ArrayList.\n- **Set**: Stores unique items in no specific order and does not allow duplicate items. Example: HashSet.\n- **Map**: Stores items as key-value pairs (like a dictionary where you look up a word/key to get its meaning/value). Example: HashMap.\nYou should choose HashMap because it is super fast for finding and saving things. Use TreeMap only if you want your keys to be automatically sorted, but note that it is slightly slower.";
  }
  if (q.includes("volatile variables") || q.includes("memory visibility in java")) {
    return "In Java multithreading (running multiple tasks at once), we use these to keep variables safe:\n- **Volatile**: A keyword that tells Java to read and write a variable directly from the main computer memory, not from a local cache. This makes sure all threads see changes instantly.\n- **Synchronized**: A block of code that only one thread can run at a time. It locks the resource so threads don't overwrite each other's work and cause bugs.";
  }
  if (q.includes("modern exception handling") || q.includes("checked and unchecked exceptions")) {
    return "Exceptions are errors that happen when your program runs. We handle them using try-catch blocks to prevent crashes:\n- **Checked Exceptions**: Errors the Java compiler forces you to handle before running the program (like missing files - IOException).\n- **Unchecked Exceptions**: Runtime errors that happen due to coding mistakes (like dividing by zero or NullPointerException). You don't have to declare these, but you should write code that avoids them.";
  }
  if (q.includes("jdbc") || q.includes("connection pooling")) {
    return "JDBC is how Java connects to databases to read or write data. Since opening a new connection for every single query is very slow, we use **Connection Pooling**. This keeps a small group (pool) of active connections open and ready to use. When your app needs to run a query, it borrows a connection from the pool and returns it immediately after, making database operations much faster.";
  }
  if (q.includes("spring boot") || q.includes("dependency injection")) {
    return "Spring Boot makes building Java apps much easier using two key features:\n- **Dependency Injection (DI)**: Letting Spring automatically create and handle objects for you using simple annotations like `@Autowired`, so you don't have to write `new Object()` everywhere.\n- **Auto-configuration**: Spring Boot automatically configures default settings (like a web server and database connections) based on the starter packages you add, so you can start writing code right away.";
  }
  if (q.includes("jvm") || q.includes("garbage collector")) {
    return "The Java Virtual Machine (JVM) is what runs your Java program. It has three main parts:\n- **Class Loader**: Loads your code files.\n- **Memory Areas (Stack and Heap)**: The Stack holds temporary local variables, while the Heap stores all created objects.\n- **Garbage Collector**: Automatically looks for objects on the Heap that are no longer being used and deletes them to free up computer memory.";
  }
  if (q.includes("heap vs. stack") || q.includes("outofmemoryerror")) {
    return "Java uses two types of memory:\n- **Stack**: Very fast, small memory used to store simple variables and active function calls.\n- **Heap**: Larger memory used to store all your actual objects.\nIf your app runs out of Heap space, you get an `OutOfMemoryError`. To avoid this, don't keep hold of objects you no longer need, avoid creating too many large objects inside loops, and let the Garbage Collector do its job.";
  }
  if (q.includes("java 8 features") || q.includes("streams api") || q.includes("lambda expressions")) {
    return "Java 8 added powerful features for modern coding:\n- **Lambda Expressions**: A shortcut way to write small, anonymous functions in a single line.\n- **Functional Interface**: An interface with only one method (perfect for Lambdas).\n- **Streams API**: A clean, beginner-friendly way to process lists of data (like filtering, sorting, or mapping items) without writing long, messy loops.";
  }
  if (q.includes("singleton or factory") || q.includes("design pattern")) {
    return "Design patterns are standard templates for solving common coding problems:\n- **Singleton Pattern**: Ensures a class can only ever have one single object (instance) created. We use this for shared resources like database connections.\n- **Factory Pattern**: A way to create objects without using the `new` keyword directly. Instead, you call a 'factory' helper method, which gives you the correct object, keeping your code flexible.";
  }

  // Python Pool
  if (q.includes("oop (object-oriented programming) in python") || q.includes("inheritance and polymorphism")) {
    return "Object-Oriented Programming (OOP) is a way to organize code into classes (blueprints) and objects (instances):\n- **Inheritance**: Letting a new child class copy methods and attributes from a parent class to reuse code.\n- **Polymorphism**: Letting different classes use the exact same function name but execute different actions.\n- **Encapsulation**: Hiding private data from external code using double underscores `__`.\n- **Abstraction**: Showing only the simple, necessary details.";
  }
  if (q.includes("decorators in python") || q.includes("custom decorator")) {
    return "A **Decorator** is a special Python feature that lets you modify or add behavior to a function without changing its actual code. It wraps the original function. For example, to make a custom decorator to measure execution time, you write a function that notes the start time, runs the target function, notes the end time, prints the difference, and returns the result.";
  }
  if (q.includes("python generators") || q.includes("memory-efficient compared to normal list returns")) {
    return "Python **Generators** are special functions that yield values one at a time using the `yield` keyword instead of returning a whole list at once. They are extremely memory-efficient. If you have a list of one million items, a standard list loads all of them into memory at once, which can crash your app. A generator only creates one item at a time as you ask for it, using almost zero memory.";
  }
  if (q.includes("list comprehension in python") || q.includes("squared_evens")) {
    return "A **List Comprehension** is a neat, one-line way to create new lists in Python. For example: `squared_evens = [x**2 for x in numbers if x % 2 == 0]`. It replaces a longer `for` loop and `if` statement. It also runs faster because Python optimizes it internally under the hood, making it both faster and cleaner.";
  }
  if (q.includes("vector operations") || q.includes("numpy array structures")) {
    return "**NumPy** is a popular Python library for math and data science. Unlike normal Python lists, NumPy arrays allow **vectorized operations**. This means you can add, subtract, or multiply entire arrays at once (like `A + B`) without using slow `for` loops. NumPy does this by running fast, pre-compiled C code in the background, making it extremely fast for handling large numbers.";
  }
  if (q.includes("pandas dataframes") || q.includes("missing values")) {
    return "A **Pandas DataFrame** is like an Excel table with rows and columns. To handle missing (null) values, you can use:\n- `df.dropna()` to delete rows with missing data.\n- `df.fillna(value)` to fill empty spaces with a default value (like 0 or the average).\nTo group and average data, use `df.groupby('column').mean()`, which groups your data and calculates the average for each category.";
  }
  if (q.includes("flask framework") || q.includes("simple rest api endpoint")) {
    return "**Flask** is a very lightweight and simple tool to build web apps in Python. To create a simple API endpoint:\n- Import Flask and jsonify.\n- Use `@app.route('/api', methods=['GET'])` to set up a web URL.\n- Inside the function, return your data as `jsonify(data)`.\nFlask automatically handles the web request and returns the data in a standard format (JSON) that other apps can understand.";
  }
  if (q.includes("django") || q.includes("mvt")) {
    return "**Django** is a powerful Python web framework that comes with everything built-in. It uses the **MVT (Model-View-Template)** layout:\n- **Model**: Defines your database tables and manages your data.\n- **View**: Contains the main logic, receives web requests, gets data from the Model, and sends it to the Template.\n- **Template**: The HTML page that the user sees on their screen.";
  }
  if (q.includes("try-except-finally blocks") || q.includes("custom exceptions")) {
    return "In Python, we handle errors using try-except blocks to stop our program from crashing:\n- **try**: Holds the code that might fail.\n- **except**: Catches and handles specific errors (like dividing by zero).\n- **finally**: Code that runs no matter what (like closing a database).\nYou can also create **Custom Exceptions** (your own error types) to make your code easier to read and debug.";
  }
  if (q.includes("deep copy and shallow copy") || q.includes("manage references")) {
    return "In Python, variables point to objects in memory:\n- **Shallow Copy**: Copies the main object, but keeps references to nested items. If you change a nested item in the copy, the original changes too.\n- **Deep Copy**: Copies absolutely everything, including all nested items. The copy is completely independent of the original.\nPython automatically cleans up memory using a reference counter to delete objects that are no longer used.";
  }

  // AWS Pool
  if (q.includes("amazon ec2") || q.includes("on-demand and spot instances")) {
    return "**Amazon EC2** is where you rent virtual computers in the cloud to run your applications.\n- **On-Demand Instances**: You pay a fixed price per hour with no commitments. You can start and stop them whenever you want.\n- **Spot Instances**: You bid on spare, unused AWS computers at a massive discount (up to 90%). However, AWS can take them back with a 2-minute warning if someone else needs them. Use Spot instances for tasks that can be paused safely.";
  }
  if (q.includes("amazon s3") || q.includes("bucket policies")) {
    return "**Amazon S3** is a simple, highly secure cloud storage system where you can upload files, images, and videos.\n- **Bucket Policies**: Rules that define who can view or modify your uploaded files.\n- **Versioning**: Saves older versions of your files so you can recover them if deleted by accident.\n- **Lifecycle Rules**: Automatically deletes old files or moves them to cheaper, long-term storage to save you money.";
  }
  if (q.includes("vpc") || q.includes("public and private subnets")) {
    return "A **VPC (Virtual Private Cloud)** is your own private network in AWS. To keep things secure, you split it into:\n- **Public Subnet**: Connected to the internet (e.g., for load balancers or public websites).\n- **Private Subnet**: Completely disconnected from the public internet to keep databases and backend servers safe. Outbound updates go through a secure NAT Gateway.";
  }
  if (q.includes("iam roles") || q.includes("least privilege in aws")) {
    return "**IAM** manages who can access your AWS resources:\n- **IAM Users**: Individual people or accounts with permanent passwords or keys.\n- **IAM Roles**: Temporary permissions that services or users can assume safely.\n- **Principle of Least Privilege**: A security rule that says you should only give users the absolute minimum permissions they need to do their job, preventing accidents or security leaks.";
  }
  if (q.includes("amazon rds") || q.includes("multi-az replication")) {
    return "**Amazon RDS** makes it easy to set up and run databases in the cloud. By enabling **Multi-AZ (Availability Zone)** replication, AWS automatically copies your database to a second database in a different physical location. If your main database goes down due to a power outage or error, RDS instantly switches to the backup database with zero downtime.";
  }
  if (q.includes("route 53") || q.includes("global dns resolution")) {
    return "**Amazon Route 53** is AWS's cloud DNS service. It translates human-friendly website names (like `mysite.com`) into computer IP addresses. It helps keep your app online by checking if your servers are healthy. If a server fails, Route 53 automatically redirects visitors to a healthy backup server in a different location.";
  }
  if (q.includes("application load balancers") || q.includes("distributing incoming application traffic")) {
    return "An **Application Load Balancer (ALB)** acts as a traffic cop. When thousands of users visit your website, the ALB distributes the traffic evenly across all your healthy servers so no single server gets overloaded. It also performs continuous health checks and automatically stops sending traffic to any server that is broken or offline.";
  }
  if (q.includes("aws auto scaling") || q.includes("adjust ec2 capacity")) {
    return "**AWS Auto Scaling** automatically adds or removes servers based on real-time traffic demand. For example, if your website suddenly gets a huge spike in visitors and CPU usage goes above 70%, Auto Scaling instantly launches new EC2 servers to handle the load. When visitors leave, it automatically shuts down the extra servers to save you money.";
  }
  if (q.includes("serverless computing on aws") || q.includes("aws lambda operates")) {
    return "**Serverless Computing** means you write and upload code without worrying about managing any servers or operating systems. **AWS Lambda** is a serverless service that runs your code only when triggered by an event (like a user uploading an image). You only pay for the exact milliseconds your code runs, and it automatically scales to handle any number of requests.";
  }
  if (q.includes("cloudwatch") || q.includes("monitor infrastructure metrics")) {
    return "**Amazon CloudWatch** is a tool that monitors your AWS resources (like CPU, memory, and database speed). You can set up **CloudWatch Alarms** that trigger when something goes wrong (for example, if a server's CPU is too high for 5 minutes). The alarm can automatically send you an email alert or trigger Auto Scaling to add another server.";
  }

  // DevOps Pool
  if (q.includes("ci/cd") && q.includes("continuous automated software delivery")) {
    return "**CI/CD** stands for Continuous Integration and Continuous Deployment.\n- **Continuous Integration (CI)**: Automatically compiles your code and runs tests every time you make a change, helping catch bugs early.\n- **Continuous Deployment (CD)**: Automatically deploys your tested code to your live website.\nThis saves developers from having to deploy code manually, prevents errors, and lets you release updates to users much faster.";
  }
  if (q.includes("jenkins") || q.includes("declarative pipelines")) {
    return "**Jenkins** is a popular automation tool used to build CI/CD pipelines. It uses a text file called a **Jenkinsfile** (written in simple, structured steps) to define how your code is built, tested, and deployed. It also securely stores your database passwords, SSH keys, and API credentials, injecting them safely during the deployment process without exposing them in your code.";
  }
  if (q.includes("docker image") && q.includes("running docker container")) {
    return "**Docker** makes it easy to run applications anywhere:\n- **Docker Image**: A frozen, read-only template containing your application code, libraries, and settings (like a recipe).\n- **Docker Container**: A live, running instance of that image (like the baked cake).\nDocker speeds up builds by caching unchanged layers, so it only rebuilds parts of your app that have actually changed.";
  }
  if (q.includes("kubernetes") && q.includes("pods, deployments, and services")) {
    return "**Kubernetes** is a tool that manages and coordinates your Docker containers:\n- **Pod**: The smallest unit, holding one or more containers.\n- **Deployment**: A manager that ensures the exact number of pods you want are always running and healthy.\n- **Service**: Gives your pods a single, permanent IP address so other parts of your app can talk to them easily.";
  }
  if (q.includes("terraform") && q.includes("state locking")) {
    return "**Terraform** is an Infrastructure as Code (IaC) tool that lets you set up cloud resources (like AWS servers) by writing simple text files. It tracks everything in a **state file**. To prevent two developers from running Terraform at the same time and messing up the cloud settings, it uses **state locking**, which temporarily locks the file until the current setup is finished.";
  }
  if (q.includes("git branching strategies") || q.includes("gitflow")) {
    return "Branching strategies help teams work on the same code without conflicts:\n- **GitFlow**: A structured setup where feature development happens on 'feature' branches, merged into a 'develop' branch, and finally put into the 'main' branch for release.\n- **Trunk-based Development**: A faster approach where developers push small, frequent updates directly to the main branch daily, relying on automated tests and feature toggles to keep things stable.";
  }
  if (q.includes("linux commands for diagnosing") || q.includes("cpu usage, memory bottlenecks")) {
    return "If your Linux server is running slowly, you can use these simple commands to troubleshoot:\n- `top` or `htop`: Shows real-time CPU and memory usage of running apps.\n- `free -m`: Shows how much RAM is free and used in megabytes.\n- `df -h`: Shows how much hard disk space is left.\n- `ps aux`: Lists all active tasks on the system.";
  }
  if (q.includes("proactive infrastructure monitoring") || q.includes("prometheus and grafana")) {
    return "Monitoring helps you fix server issues before users notice:\n- **Prometheus**: A tool that automatically collects and saves metrics (like RAM usage or page load times) at regular intervals.\n- **Grafana**: A beautiful dashboard tool that connects to Prometheus to show those metrics in simple, easy-to-read charts and sends alerts if a server goes offline.";
  }
  if (q.includes("ansible") || q.includes("agentless configuration")) {
    return "**Ansible** is an automation tool used to configure and set up servers. It is **agentless**, meaning you don't need to install any special software on your servers; it connects securely using standard SSH. You write your setup steps in simple, human-readable YAML files called **Playbooks** (e.g., 'install Node.js', 'copy config file').";
  }
  if (q.includes("infrastructure as code (iac)") || q.includes("benefits of infrastructure as code")) {
    return "**Infrastructure as Code (IaC)** means defining your cloud setup (servers, databases, networks) using simple text files instead of clicking around in a browser console. The key benefits are:\n- **Consistency**: You can spin up an identical test server in minutes with zero human error.\n- **Speed**: Automates hours of manual setup.\n- **Version Control**: You can track changes in Git and roll back if something breaks.";
  }

  // Cloud Computing Pool
  if (q.includes("iaas, paas, and saas")) {
    return "Cloud computing has three main models:\n- **IaaS (Infrastructure as a Service)**: You rent raw hardware and networks (like AWS EC2) and manage the operating system and apps yourself.\n- **PaaS (Platform as a Service)**: The cloud provider manages the servers and OS (like Heroku). You just upload your code.\n- **SaaS (Software as a Service)**: Ready-to-use software running in a browser (like Gmail or Google Docs).";
  }
  if (q.includes("virtualization in cloud") || q.includes("hypervisors")) {
    return "**Virtualization** is the core technology of the cloud. It lets you split one powerful physical computer into multiple virtual computers (VMs). This is done using software called a **Hypervisor**. The hypervisor allocates CPU, RAM, and storage to each VM, keeping them completely isolated so they can run different operating systems on the same physical machine.";
  }
  if (q.includes("public cloud, private cloud") || q.includes("hybrid cloud architectures")) {
    return "There are three main ways to deploy cloud resources:\n- **Public Cloud**: Shared infrastructure owned by a provider like AWS or Google Cloud. It's cheap, fast, and highly scalable.\n- **Private Cloud**: Dedicated hardware owned and used by only one company, offering maximum security.\n- **Hybrid Cloud**: A mix of both. Sensitive data is kept in the private cloud, while web traffic scales on the public cloud.";
  }
  if (q.includes("cloud security best practices") || q.includes("protecting data at rest")) {
    return "To keep cloud data safe:\n- **Data at Rest (on disk)**: Encrypt it using AES-256 (like locking it in a digital safe).\n- **Data in Transit (over network)**: Use secure HTTPS (TLS) connections so hackers can't intercept it.\n- **Access Control**: Enable Multi-Factor Authentication (MFA) and give users the absolute minimum permissions they need.";
  }
  if (q.includes("multi-region cloud") || q.includes("geographical disaster recovery")) {
    return "A **multi-region** setup means running your app in two or more physical locations (like US-East and Europe). If a natural disaster takes down the entire US data center, your traffic is automatically routed to Europe, keeping your app online. It also makes your app load faster for global users by serving them from the nearest location.";
  }
  if (q.includes("shared responsibility model") || q.includes("patching guest operating systems")) {
    return "The **Shared Responsibility Model** defines who is responsible for cloud security:\n- **The Provider (like AWS)**: Responsible for the physical data center security, physical servers, and hypervisors.\n- **The Customer (You)**: Responsible for your data, code, and configurations. For virtual servers, you are responsible for updating and patching the operating system.";
  }
  if (q.includes("horizontal scaling vs vertical scaling")) {
    return "Scaling means adding more power to handle more users:\n- **Vertical Scaling (Scaling Up)**: Making your existing server bigger (adding more RAM or CPU). This is easy but has physical limits.\n- **Horizontal Scaling (Scaling Out)**: Adding more identical servers to share the load. This is much better because it has no limit and keeps your app online if one server crashes.";
  }
  if (q.includes("content delivery networks") || q.includes("edge caching")) {
    return "A **Content Delivery Network (CDN)** speeds up websites by copying your static files (like images and videos) to edge servers all around the world. When a user visits your site, the CDN serves files from the nearest edge server instead of your main server, drastically reducing load times and saving your main server from getting overloaded.";
  }
  if (q.includes("cloud tenant isolation") || q.includes("multi-tenancy")) {
    return "**Tenant Isolation** is how cloud providers make sure different customers (tenants) sharing the same physical hardware cannot see or edit each other's data. It uses hypervisors to split CPU/RAM, private virtual networks (VPCs) to isolate web traffic, and separate encryption keys so each customer's data is completely private.";
  }

  // AI/ML Pool
  if (q.includes("supervised, unsupervised, and reinforcement")) {
    return "There are three main types of Machine Learning:\n- **Supervised Learning**: Training a model with labeled data (like showing it photos of cats labeled 'cat' so it learns to identify them).\n- **Unsupervised Learning**: Giving the model raw, unlabeled data and letting it find patterns or groups on its own (like grouping similar customers).\n- **Reinforcement Learning**: Training an AI agent through trial and error with rewards and penalties (like teaching a virtual robot to walk or play games).";
  }
  if (q.includes("deep learning") && q.includes("hierarchical representations")) {
    return "**Deep Learning** is a type of machine learning that uses layers of artificial neural networks (inspired by the human brain) to learn complex patterns. Each layer learns increasingly complicated features. For example, in face recognition, the first layer might find simple edges, the next layer finds shapes like eyes and noses, and the final layer recognizes the whole face.";
  }
  if (q.includes("convolutional neural network") || q.includes("cnn") || q.includes("convolutional layers")) {
    return "A **Convolutional Neural Network (CNN)** is a special deep learning network used for images. It uses **convolutional layers** that slide small math filters (like a magnifying glass) across an image to find patterns like lines, curves, and textures. It also uses **pooling layers** to shrink the data, making it incredibly good at recognizing objects in photos.";
  }
  if (q.includes("recurrent neural networks") || q.includes("lstms mitigate vanishing gradients")) {
    return "**Recurrent Neural Networks (RNNs)** are used for sequential data like text, speech, or time-series. They remember past steps to understand the current input. However, normal RNNs have a 'vanishing gradient' problem where they forget older information. **LSTM (Long Short-Term Memory)** networks solve this by using special 'gates' to choose what information to keep or forget over long periods.";
  }
  if (q.includes("natural language processing") || q.includes("tokenization and embedding")) {
    return "**Natural Language Processing (NLP)** helps computers understand human language. Since computers only understand numbers, text goes through:\n- **Tokenization**: Splitting a sentence into smaller pieces (words or word fragments called tokens) and mapping them to numbers.\n- **Embedding**: Converting those numbers into high-dimensional vectors that represent the meaning of the words mathematically, allowing the computer to understand synonyms.";
  }
  if (q.includes("large language models") || q.includes("transformer architecture") || q.includes("self-attention")) {
    return "**Large Language Models (LLMs)** are AI models trained on massive amounts of text to understand and generate human-like writing. They use the **Transformer architecture**, which relies on **self-attention**. Self-attention lets the model process all words in a sentence at the exact same time and connect related words together, regardless of how far apart they are.";
  }
  if (q.includes("gradient descent") || q.includes("learning rates")) {
    return "**Gradient Descent** is an optimization algorithm used to minimize a model's errors (loss) by slowly adjusting its weights. The **learning rate** is a small multiplier that controls how big of a step the algorithm takes. If the learning rate is too high, the model overshoots the target and fails to learn. If it is too low, training will be painfully slow.";
  }
  if (q.includes("overfitting") && (q.includes("regularization") || q.includes("dropout") || q.includes("early stopping"))) {
    return "**Overfitting** happens when an AI model learns the training data too well (including random noise) and fails to perform well on new, unseen data. To prevent this, we use:\n- **Regularization**: Adds a small penalty to keep weights small.\n- **Dropout**: Temporarily turns off random neurons during training to keep the network robust.\n- **Early Stopping**: Halts training as soon as the test performance begins to drop.";
  }
  if (q.includes("feature engineering") || q.includes("input representations")) {
    return "**Feature Engineering** is the process of converting raw, messy data into neat inputs that a machine learning model can understand easily. This is the most important step because a model's accuracy depends entirely on the quality of its inputs. It includes scaling numbers, converting text into vector embeddings, and creating new variables that highlight important trends.";
  }
  if (q.includes("evaluate machine learning models") || q.includes("precision, recall")) {
    return "To evaluate a model's performance, we look at different metrics:\n- **Accuracy**: The percentage of correct predictions (can be misleading if classes are imbalanced).\n- **Precision**: Out of all items the model predicted as positive, how many were actually correct?\n- **Recall**: Out of all actual positive items, how many did the model manage to catch?\n- **F1-Score**: A balanced average of both precision and recall.";
  }

  // Aptitude Pool
  if (q.includes("laptop is bought for $800") || q.includes("profit percentage")) {
    return "To find the profit percentage:\n1. Find the actual money profit: Selling Price - Cost Price = $1000 - $800 = $200.\n2. Divide the profit by the original cost price: $200 / $800 = 0.25.\n3. Multiply by 100 to make it a percentage: 0.25 * 100 = 25%.\nSo, the profit percentage is 25%. This corresponds to option C.";
  }
  if (q.includes("clock shows exactly 3:15") || q.includes("angle in degrees between the hour hand and the minute hand")) {
    return "At exactly 3:15, the minute hand points directly at the 3. But the hour hand has moved a tiny bit past the 3 because 15 minutes have passed.\n- In 1 hour (60 minutes), the hour hand moves 30 degrees (since 360 degrees / 12 hours = 30).\n- In 15 minutes, the hour hand moves: (15 / 60) * 30 = 7.5 degrees.\nSo, the angle between the hour hand and the minute hand is exactly 7.5 degrees. This corresponds to option B.";
  }
  if (q.includes("5 workers can build a wall") || q.includes("6 workers to build the same wall")) {
    return "To solve this:\n1. Find the total work required in terms of 'worker-days': 5 workers * 12 days = 60 worker-days.\n2. Now, we have 6 workers to do the same 60 worker-days of work.\n3. Divide the total work by the number of workers: 60 / 6 = 10 days.\nSo, it will take 6 workers exactly 10 days to build the wall. This corresponds to option B.";
  }
  if (q.includes("train travels at a speed of 60") || q.includes("travel in 2.5 hours")) {
    return "To find the distance:\n- Use the simple formula: Distance = Speed * Time.\n- The speed is 60 miles per hour, and the time is 2.5 hours.\n- Distance = 60 * 2.5 = 150 miles.\nSo, the train will travel a total of 150 miles. This corresponds to option B.";
  }
  if (q.includes("next number in the logical series: 2, 6, 12")) {
    return "Let's look at how the numbers grow:\n- From 2 to 6: We add +4.\n- From 6 to 12: We add +6.\n- From 12 to 20: We add +8.\n- From 20 to 30: We add +10.\nNotice that we add consecutive even numbers (+4, +6, +8, +10). The next even number to add must be +12.\n- 30 + 12 = 42.\nSo, the next number in the series is 42. This corresponds to option C.";
  }
  if (q.includes("pointing to a photograph, amit said")) {
    return "Let's trace the family tree step-by-step:\n1. 'My grandfather' means Amit's grandfather.\n2. 'The only son of my grandfather' must be Amit's father (since his grandfather has only one son).\n3. 'Her father' is this only son, meaning Amit's father is the father of the girl in the picture.\nSince Amit and the girl share the same father, the girl must be Amit's sister. This corresponds to option A.";
  }
  if (q.includes("odd one out") && q.includes("carrot")) {
    return "Let's look at the items:\n- Apple, Banana, and Grape are all sweet fruits that grow on trees or vines.\n- Carrot is a root vegetable that grows underground.\nSince Carrot is a vegetable and the others are fruits, Carrot is the odd one out. This corresponds to option C.";
  }
  if (q.includes("apple") && q.includes("eppla") && q.includes("grape")) {
    return "Let's look at the coding rule for 'APPLE' to 'EPPLA':\n- Swap the first letter 'A' and the last letter 'E' (putting 'E' at the front and 'A' at the back).\n- Keep the middle letters 'P', 'P', 'L' in their exact same spots.\nNow, let's do the same for 'GRAPE':\n- Swap the first letter 'G' and the last letter 'E' (putting 'E' at the front and 'G' at the back).\n- Keep the middle letters 'R', 'A', 'P' in their exact same spots.\nThe coded word is 'ERAPG'. This corresponds to option A.";
  }

  // Behavioral HR
  if (q.includes("challenge you faced during a project") || q.includes("what actions did you take to resolve it")) {
    return "Using the STAR framework, here is an easy way to structure your answer:\n- **Situation**: In a school project, our app load times were super slow (over 5 seconds).\n- **Task**: My goal was to reduce this load time to under 1 second.\n- **Action**: I used tool profiles, added database indexes, and set up Redis caching to store frequent queries.\n- **Result**: The load time dropped to 0.8 seconds, making the app feel super fast and responsive for our users.";
  }
  if (q.includes("conflict in your team") || q.includes("handle the situation, and what did you learn")) {
    return "Here is a simple, structured response using the STAR framework:\n- **Situation**: My team had a major disagreement on whether to build a complex backend or a simple one.\n- **Task**: I needed to resolve the conflict so we didn't miss our project deadline.\n- **Action**: I set up an open meeting where we listed the pros and cons of both based on our time limit. We agreed on a simple backend first, but structured it so we could expand it easily later.\n- **Result**: We resolved the tension, completed the project on time, and I learned that looking at factual pros and cons beats arguing.";
  }
  if (q.includes("showed leadership") || q.includes("guide others toward a successful")) {
    return "Here is an easy, beginner-friendly STAR answer:\n- **Situation**: During a team project, our main developer got sick two weeks before the deadline.\n- **Task**: I stepped up to coordinate the team and finish the project.\n- **Action**: I organized daily 10-minute standup meetings to divide the work, focused on finishing only the most important features, and personally helped integrate the payment screens.\n- **Result**: We finished and launched the app on time with all core features working, showing that great communication keeps a team stable.";
  }
  if (q.includes("project failure") || q.includes("crashed our main user checkout")) {
    return "Here is a simple STAR framework response:\n- **Situation**: In my first project, I pushed a small code change without testing, which crashed the app's checkout page for two hours.\n- **Task**: I had to fix the bug quickly and make sure it never happened again.\n- **Action**: I rolled back the change, analyzed why it failed, wrote automatic tests to catch it, and created a rule that all code must be reviewed.\n- **Result**: The app was fixed, and we had zero crashes after that. I learned that writing tests is always better than rushing.";
  }
  if (q.includes("adapt quickly to changing requirements") || q.includes("manage your tasks")) {
    return "Here is a clear, simple STAR answer:\n- **Situation**: One week before launching a client portal, the client changed the login requirement to require secure Google/GitHub login.\n- **Task**: I had to add this new login system without delaying the launch.\n- **Action**: I paused non-essential design updates, researched pre-made secure login libraries, and worked in short iterations to integrate the logins.\n- **Result**: We added the secure logins and launched the app on time, learning that being flexible and prioritizing tasks is key to success.";
  }

  // System Design
  if (q.includes("system scalability") || q.includes("trade-offs between horizontal")) {
    return "System scalability means making your application able to handle more users as it grows:\n- **Vertical Scaling (Scaling Up)**: Making a single server more powerful by adding more RAM and CPU. This is simple but has a physical limit and creates a single point of failure.\n- **Horizontal Scaling (Scaling Out)**: Adding more identical servers to share the load. This requires a load balancer but allows you to scale indefinitely and keeps your app online if one server crashes.";
  }
  if (q.includes("load balancers") && q.includes("round-robin")) {
    return "A Load Balancer acts like a friendly traffic cop. When thousands of users visit your website at once, it distributes the traffic evenly across all your healthy servers so no single server gets overloaded. It also checks if any server is offline and stops sending traffic to it. A common algorithm is **Round-Robin**, which sends request 1 to Server A, request 2 to Server B, request 3 to Server C, and then loops back.";
  }
  if (q.includes("relational databases differ from nosql") || q.includes("schema flexibility")) {
    return "Choosing a database depends on your data:\n- **Relational Databases (like PostgreSQL)**: Store data in strict, structured tables with predefined relationships. They are great for transactions and complex queries where accuracy is key.\n- **NoSQL Databases (like MongoDB)**: Store unstructured data (like documents or key-value pairs) with no strict layout. They are incredibly easy to scale horizontally and perfect for fast, massive data writes.";
  }
  if (q.includes("database caching") || q.includes("redis or memcached")) {
    return "**Database Caching** is like keeping your favorite books on your desk instead of walking to the library every time. Normal databases store data on slower disks. A cache (like Redis) stores frequently requested data directly in fast RAM memory. When your app needs data, it checks the cache first (cache hit) and returns it instantly, making your application load in microseconds.";
  }
  if (q.includes("cap theorem") || q.includes("consistency, availability, and partition")) {
    return "The **CAP Theorem** says a distributed system can only guarantee 2 out of 3 things:\n- **Consistency**: Every user sees the exact same data at the same time.\n- **Availability**: Every user gets a response even if some servers are offline.\n- **Partition Tolerance**: The system keeps working even if network connections drop.\nSince network drops are inevitable, databases must choose between being fully Consistent (CP) or fully Available (AP).";
  }
  if (q.includes("microservices") && q.includes("decoupling applications")) {
    return "**Microservices** means splitting a large, heavy application into small, independent services that talk to each other via lightweight APIs (e.g., separate services for Payments, Users, and Inventory). This makes building apps easier because teams can update and scale each service independently without affecting the entire application. If the Payment service crashes, users can still browse products.";
  }
  if (q.includes("asynchronous message queues") || q.includes("rabbitmq or kafka")) {
    return "**Message Queues** (like RabbitMQ or Kafka) let different services talk to each other asynchronously (without waiting for an instant response). Instead of service A calling service B directly, service A drops a message in the queue and goes back to work. Service B picks up and processes the message whenever it is ready. This prevents slow-downs and keeps data safe if a service goes offline.";
  }
  if (q.includes("api gateway in modern microservice") || q.includes("reverse proxy that acts as the single")) {
    return "An **API Gateway** acts as the single front door for your microservices. Instead of clients talking to dozens of different services directly, they talk only to the API Gateway. The gateway handles routing their requests to the right service, checking if they are logged in (authentication), and limiting how fast they can make requests (rate limiting) to keep the backend secure.";
  }
  if (q.includes("monitoring and alerting") || q.includes("dashboards help developers")) {
    return "**Monitoring** gives developers a live dashboard (like Grafana) showing how healthy their application is. It displays charts for server CPU, memory, error rates, and load times. If something goes wrong (like a database crash), **Alerting** instantly sends a notification (like an email or SMS) to the developer so they can fix it before users start complaining.";
  }
  if (q.includes("single points of failure") || q.includes("redundancy at every layer")) {
    return "A **Single Point of Failure (SPOF)** is any individual part of your system that, if it fails, brings down your entire application. To eliminate them, we use **Redundancy** (backups) at every layer:\n- Run multiple web servers behind a load balancer.\n- Set up database replication to a backup database in a different zone.\n- Use global failover routing so if one region goes down, traffic switches automatically.";
  }

  // -------------------------------------------------------------
  // SMART DYNAMIC FALLBACK GENERATOR FOR CUSTOM/UNKNOWN QUESTIONS
  // -------------------------------------------------------------
  
  // Extract key subjects from the question
  const cleanQ = question.replace(/[?.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
  const words = cleanQ.split(/\s+/);
  const stopWords = new Set([
    "what", "is", "are", "explain", "how", "does", "the", "and", "or", "in", "of", "to", "for", "with", "on", "a", "an", "when", "would", "you", "choose", "over", "difference", "differences", "between", "describe", "use", "using", "why", "it", "its", "at", "about", "your", "my", "our", "their", "where", "which"
  ]);
  
  const extracted: string[] = [];
  for (const word of words) {
    const lower = word.toLowerCase();
    if (lower.length > 3 && !stopWords.has(lower)) {
      const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
      if (!extracted.includes(capitalized)) {
        extracted.push(capitalized);
      }
    }
  }

  // Specialized dynamic templates based on category clues
  if (q.includes("a)") || q.includes("b)") || q.includes("c)") || q.includes("d)")) {
    return "To solve this aptitude problem, let's break it down: First, read the question and find the numbers or logical clues given. Next, use a simple formula or pattern to solve it step-by-step. Finally, check your answer against the multiple-choice options to choose the correct one.";
  }

  if (q.includes("tell me") || q.includes("describe") || q.includes("conflict") || q.includes("challenge") || q.includes("leadership") || q.includes("failure") || q.includes("adapt")) {
    return "To answer this behavioral question, use the simple **STAR** method:\n1. **Situation**: Describe the background or problem you faced.\n2. **Task**: Explain what your goal was.\n3. **Action**: Tell exactly what steps you took to solve it.\n4. **Result**: Share the successful outcome or what you learned.";
  }

  const s1 = extracted[0] || "this core technology";
  const s2 = extracted[1] || "industry best practices";
  const s3 = extracted[2] || "architectural patterns";

  return `To understand **${s1}**, here is a simple breakdown:
- **Core Concept**: It focuses on key benefits, simple setup, and easy workflows.
- **Why it matters**: Using **${s2}** alongside **${s3}** keeps things clean, fast, and organized.
- **Best Practices**: Start with a simple setup, test your code for errors, and monitor it to make sure it runs smoothly.

By following these simple steps, beginners can easily build and manage reliable programs!`;
}

export default function App() {
  // Launch Flow States
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('pw_is_logged_in') === 'true';
  });

  // Mobile app navigation state
  const [activeTab, setActiveTab] = useState<'home' | 'interview' | 'resume' | 'dashboard' | 'profile' | 'cloudhub'>('home');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true); // Forced full screen app container
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [isFirebaseUserReady, setIsFirebaseUserReady] = useState<boolean>(false);

  // User Profile configuration
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('pw_user_name') || 'James Manoj');
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('pw_user_email') || 'candidate.preview@prepwise.ai');
  const [userGoal, setUserGoal] = useState<string>(() => localStorage.getItem('pw_user_goal') || 'Cloud DevOps Engineer');
  
  // Login Form input bindings
  const [loginFormName, setLoginFormName] = useState<string>(() => localStorage.getItem('pw_user_name') || '');
  const [loginFormEmail, setLoginFormEmail] = useState<string>(() => localStorage.getItem('pw_user_email') || '');
  const [loginFormPassword, setLoginFormPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);

  const [streakCount, setStreakCount] = useState<number>(5);

  // Lists for dynamic additions
  const [interviewHistory, setInterviewHistory] = useState<InterviewSessionRecord[]>(() => {
    const local = localStorage.getItem('pw_interview_history');
    return local ? JSON.parse(local) : INITIAL_HISTORY;
  });

  // Active Toast Alerts
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Bottom drawer state tooltips
  const [viewingRecordDetail, setViewingRecordDetail] = useState<InterviewSessionRecord | null>(null);

  // Interactive Screen 1: Home States (Mentor Chat Assistant)
  const [mentorOpen, setMentorOpen] = useState<boolean>(false);
  const [mentorMessages, setMentorMessages] = useState<ChatMessage[]>([
    {
      id: "m-init",
      role: 'assistant',
      text: "Hello! I am **MS** (Mentor & Support), your personal AI advisor from Stripe, Linear, and Notion engineering backgrounds.\n\nHow can I help you accelerate your technical preparation or ATS resume score reviews today?\n\n- Try asking: **\"Stripe webhooks alignment\"**\n- Or: **\"Resume metrics tips\"**",
      createdAt: new Date()
    }
  ]);
  const [mentorInput, setMentorInput] = useState<string>('');
  const [mentorLoading, setMentorLoading] = useState<boolean>(false);
  const mentorEndRef = useRef<HTMLDivElement>(null);

  // Interactive Screen 2: Interview Tool Suite states
  const [interviewStep, setInterviewStep] = useState<'setup' | 'loading' | 'active_question' | 'evaluating' | 'completed'>('setup');
  const [mockDomain, setMockDomain] = useState<string>('Cloud Computing');
  const [customDomainText, setCustomDomainText] = useState<string>('');
  const [mockNumQuestions, setMockNumQuestions] = useState<number>(5);
  const [mockRole, setMockRole] = useState<string>(userGoal);
  const [mockDifficulty, setMockDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [mockCompany, setMockCompany] = useState<string>('Google');
  const [mockFocusTopic, setMockFocusTopic] = useState<string>('');
  const [generatedQuestions, setGeneratedQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<AnswerInput[]>([]);
  const [currentAnswerText, setCurrentAnswerText] = useState<string>('');
  const [latestEvaluation, setLatestEvaluation] = useState<InterviewSessionRecord | null>(null);
  const [isDictatingSimulated, setIsDictatingSimulated] = useState<boolean>(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState<boolean>(false);

  // Hybrid Question Bank State Extensions
  const [questionMode, setQuestionMode] = useState<'ai' | 'bank' | 'hybrid'>('hybrid');
  const [pinnedQuestions, setPinnedQuestions] = useState<string[]>([]);
  const [bankQuestions, setBankQuestions] = useState<string[]>([]);
  const [bankLoading, setBankLoading] = useState<boolean>(false);
  const [bankSearchQuery, setBankSearchQuery] = useState<string>('');
  const [bankSubTab, setBankSubTab] = useState<'vault' | 'custom'>('vault');
  const [customQuestionInput, setCustomQuestionInput] = useState<string>('');
  const [isDraggingQuestions, setIsDraggingQuestions] = useState<boolean>(false);

  // Fetch question bank questions for the currently selected domain
  useEffect(() => {
    const fetchBankQuestions = async () => {
      setBankLoading(true);
      try {
        const actualDomain = mockDomain === 'Custom' ? customDomainText : mockDomain;
        if (!actualDomain) {
          setBankQuestions([]);
          return;
        }
        const res = await fetch(`/api/question-bank?domain=${encodeURIComponent(actualDomain)}&customTopic=${encodeURIComponent(mockFocusTopic)}`);
        if (res.ok) {
          const data = await res.json();
          setBankQuestions(data.questions.map((q: any) => q.text) || []);
        } else {
          setBankQuestions([]);
        }
      } catch (err) {
        console.error("Error fetching question bank:", err);
        setBankQuestions([]);
      } finally {
        setBankLoading(false);
      }
    };
    fetchBankQuestions();
  }, [mockDomain, customDomainText, mockFocusTopic]);

  // Clear pinned questions on major domain changes to preserve isolation (exclude customDomainText to prevent keystroke wipeout)
  useEffect(() => {
    setPinnedQuestions([]);
  }, [mockDomain, mockFocusTopic]);

  // Interactive Screen 3: Resume Scan states
  const [resumeText, setResumeText] = useState<string>(() => localStorage.getItem('pw_resume_text') || '');
  const [targetJobRole, setTargetJobRole] = useState<string>(() => localStorage.getItem('pw_resume_target_role') || '');
  const [targetJobDesc, setTargetJobDesc] = useState<string>(() => localStorage.getItem('pw_resume_target_jd') || '');
  const [isScanningResume, setIsScanningResume] = useState<boolean>(false);
  const [activeResumeAnalysis, setActiveResumeAnalysis] = useState<ResumeAnalysisRecord | null>(() => {
    const local = localStorage.getItem('pw_resume_analysis');
    return local ? JSON.parse(local) : null;
  });
  const [resumeFileBase64, setResumeFileBase64] = useState<string | null>(() => localStorage.getItem('pw_resume_filebase64') || null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(() => localStorage.getItem('pw_resume_filename') || null);
  const [isDraggingResume, setIsDraggingResume] = useState<boolean>(false);

  // Pre-load Firebase Anonymous Auth for cloud writing rules alignment
  useEffect(() => {
    if (isFirebaseActive && auth) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsFirebaseUserReady(true);
          console.log("[PrepWise UI] Dynamic Auth initialized:", user.uid);
          // Sync existing records to Cloud Firestore if connected
          loadHistoryFromCloud();
        } else {
          signInAnonymously(auth).then(() => {
            setIsFirebaseUserReady(true);
          }).catch((err) => {
            console.error("Firebase auth failed: ", err);
          });
        }
      });
    }
  }, []);

  // Set Default State from User Goals
  useEffect(() => {
    setMockRole(userGoal);
  }, [userGoal]);

  // Auto-expire Splash Screen
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(splashTimer);
  }, []);

  // Helper to translate Firebase Authentication error codes to simple, beginner-friendly messages.
  const getFriendlyAuthErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/invalid-credential':
        return "Invalid email or password. Please verify your credentials and try again.";
      case 'auth/invalid-email':
        return "The email address you entered is not valid. Please check for typos (e.g., candidate@domain.com).";
      case 'auth/user-not-found':
        return "No account found with this email. Please sign up with a new email.";
      case 'auth/wrong-password':
        return "Incorrect password. Please try again.";
      case 'auth/email-already-in-use':
        return "This email is already registered. Logging you in with the provided password...";
      case 'auth/weak-password':
        return "The password is too weak. Please use at least 8 characters.";
      case 'auth/network-request-failed':
        return "Network error. Please check your internet connection and try again.";
      case 'auth/too-many-requests':
        return "Access to this account has been temporarily disabled due to too many failed login attempts. Please try again later.";
      default:
        return "Authentication failed. Please check your credentials and try again.";
    }
  };

  // Native Auth Form Submission Action
  const handleSignUpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginFormName.trim()) {
      showToast("Please enter your name", "error");
      return;
    }
    if (!loginFormEmail.trim()) {
      showToast("Please enter your email", "error");
      return;
    }

    // Password validation rules:
    // - Contain at least 8 characters
    // - Contain at least one letter (A-Z or a-z)
    // - Contain at least one number (0-9)
    // - No spaces allowed
    const password = loginFormPassword;
    if (password.length < 8) {
      showToast("Password must contain at least 8 characters.", "error");
      return;
    }
    if (!/[a-zA-Z]/.test(password)) {
      showToast("Password must contain at least one letter.", "error");
      return;
    }
    if (!/[0-9]/.test(password)) {
      showToast("Password must contain at least one number.", "error");
      return;
    }
    if (/\s/.test(password)) {
      showToast("Password must not contain any spaces.", "error");
      return;
    }

    const finalName = loginFormName.trim();
    const finalEmail = loginFormEmail.trim();

    if (isFirebaseActive && auth && db) {
      try {
        let userCredential;
        try {
          // Attempt user signup
          userCredential = await createUserWithEmailAndPassword(auth, finalEmail, password);
          
          // Store only: Full Name, Email, User ID (UID), Created Timestamp in Firestore "users" collection
          const userDocRef = doc(db, "users", userCredential.user.uid);
          await setDoc(userDocRef, {
            uid: userCredential.user.uid,
            email: finalEmail,
            fullName: finalName,
            createdAt: new Date().toISOString()
          });

          // Send verification email to candidate
          try {
            await sendEmailVerification(userCredential.user);
            showToast(`Profile created successfully! A verification email has been sent to ${finalEmail}.`, "success");
          } catch (verifErr) {
            console.warn("Could not dispatch email verification directly:", verifErr);
            showToast(`Profile created successfully for ${finalName}!`, "success");
          }
          
        } catch (authErr: any) {
          // If already in use, attempt logging in with the same email & password
          if (authErr.code === 'auth/email-already-in-use') {
            try {
              userCredential = await signInWithEmailAndPassword(auth, finalEmail, password);
              showToast(`Welcome back, ${finalName}! Profile synchronized.`, "success");
            } catch (signInErr: any) {
              throw signInErr;
            }
          } else {
            throw authErr;
          }
        }

        setUserName(finalName);
        setUserEmail(finalEmail);

        localStorage.setItem('pw_user_name', finalName);
        localStorage.setItem('pw_user_email', finalEmail);
        localStorage.setItem('pw_is_logged_in', 'true');
        setIsLoggedIn(true);
      } catch (err: any) {
        console.error("Authentication Error: ", err);
        const code = err.code || "";
        const friendlyMessage = getFriendlyAuthErrorMessage(code);
        showToast(friendlyMessage, "error");
      }
    } else {
      // Offline fallback mode
      setUserName(finalName);
      setUserEmail(finalEmail);

      localStorage.setItem('pw_user_name', finalName);
      localStorage.setItem('pw_user_email', finalEmail);
      localStorage.setItem('pw_is_logged_in', 'true');
      setIsLoggedIn(true);

      showToast(`Welcome back, ${finalName}! Portal synchronized (Offline Mode).`, "success");
    }
  };

  // Native Auth Form Forgot Password action
  const handleForgotPasswordAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = loginFormEmail.trim();
    if (!finalEmail) {
      showToast("Please enter your email address first to reset password.", "error");
      return;
    }
    if (isFirebaseActive && auth) {
      try {
        await sendPasswordResetEmail(auth, finalEmail);
        showToast(`Password reset link successfully sent to ${finalEmail}! Check your inbox.`, "success");
        setIsForgotPassword(false);
      } catch (err: any) {
        console.error("Password reset error: ", err);
        const friendlyMessage = getFriendlyAuthErrorMessage(err.code || "");
        showToast(friendlyMessage, "error");
      }
    } else {
      showToast("Offline Mode: Simulated sending password reset link successfully.", "info");
      setIsForgotPassword(false);
    }
  };

  // Sign out handler from Profile page
  const handleSignOut = () => {
    localStorage.removeItem('pw_is_logged_in');
    setIsLoggedIn(false);
    showToast("Session disconnected. Re-authenticate to access boards.", "info");
  };

  // Scroll to latest Mentor dialogue
  useEffect(() => {
    mentorEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mentorMessages, mentorOpen]);

  // Sync to localstorage helper
  const syncHistoryLocal = (updated: InterviewSessionRecord[]) => {
    setInterviewHistory(updated);
    localStorage.setItem('pw_interview_history', JSON.stringify(updated));
  };

  // Toast dispatch helper
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load History from Cloud Firestore
  const loadHistoryFromCloud = async () => {
    if (!isFirebaseActive || !db || !auth?.currentUser) return;
    try {
      const q = query(
        collection(db, "interviews"),
        where("uid", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const items: InterviewSessionRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Map document structure
        items.push({
          id: doc.id,
          category: data.category || 'Technical',
          role: data.role || 'Software Engineer',
          difficulty: data.difficulty || 'Intermediate',
          company: data.company || 'Standard',
          score: data.score || 0,
          metrics: data.metrics || { communication: 50, technical: 50, confidence: 50, problemSolving: 50, clarity: 50 },
          feedback: data.feedback || '',
          questions: data.questions || [],
          createdAt: data.createdAt || new Date().toISOString()
        });
      });

      if (items.length > 0) {
        // Merge with initial records to ensure no blank charts
        const merged = [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setInterviewHistory(merged);
        console.log("[PrepWise UI] Firestore Database results successfully synchronized.");
      }
    } catch (err) {
      console.warn("Could not query Firestore, continuing with local storage fallback state.", err);
    }
  };

  // Profile Save
  const handleSaveProfile = () => {
    localStorage.setItem('pw_user_name', userName);
    localStorage.setItem('pw_user_email', userEmail);
    localStorage.setItem('pw_user_goal', userGoal);
    showToast("Profile credentials synchronized globally", "success");
  };

  // Profile Reset
  const handleResetSystemCache = () => {
    localStorage.removeItem('pw_user_name');
    localStorage.removeItem('pw_user_email');
    localStorage.removeItem('pw_user_goal');
    localStorage.removeItem('pw_interview_history');
    localStorage.removeItem('pw_resume_text');
    localStorage.removeItem('pw_resume_target_jd');
    localStorage.removeItem('pw_resume_analysis');

    setUserName('James Manoj');
    setUserEmail('candidate.preview@prepwise.ai');
    setUserGoal('Senior Software Engineer');
    setInterviewHistory(INITIAL_HISTORY);
    setActiveResumeAnalysis(null);
    setResumeText('');
    setTargetJobDesc('');
    setStreakCount(1);
    showToast("App workspace and local database caches cleared", "info");
  };

  // "Ask MS" Chat Core API Integration
  const handleSendMentorMessage = async () => {
    if (!mentorInput.trim()) return;
    const userMsg: ChatMessage = {
      id: `m-usr-${Date.now()}`,
      role: 'user',
      text: mentorInput,
      createdAt: new Date()
    };

    setMentorMessages(prev => [...prev, userMsg]);
    const payloadQuery = mentorInput;
    setMentorInput('');
    setMentorLoading(true);

    try {
      // Gather last 3 messages as prompt dialogue chain
      const historyPayload = [...mentorMessages.slice(-4), userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/ask-ms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyPayload })
      });

      if (!res.ok) {
        throw new Error("Direct advisor node response was not 200 OK");
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `m-ai-${Date.now()}`,
        role: 'assistant',
        text: data.text || "I was unable to formulate a constructive insight. Please verify your internet connection.",
        createdAt: new Date()
      };
      setMentorMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Ask MS request failed:", err);
      // Client-side fallback if offline
      let mockReply = "Hello! My internal system modules are offline, or API keys are missing. Here is basic advice: prioritize practicing your STAR method logs!";
      if (payloadQuery.toLowerCase().includes("stripe")) {
        mockReply = "### Stripe System Interview Principles\n\nStripe targets technical depth:\n1. **Metrics First:** Detail real-time latency optimization, data sharding, or queue handling.\n2. **Clean APIs:** Propose exact query payloads before system layouts.\n3. **Idempotency:** Implement event check keys to eliminate duplicate transactions under heavy load.";
      } else if (payloadQuery.toLowerCase().includes("resume") || payloadQuery.toLowerCase().includes("cv")) {
        mockReply = "### Premium ATS Alignment Strategy\n\nTo raise your score:\n- Eliminate descriptive text and inject metrics. (e.g. \"Increased deployment throughput speed by 28%\")\n- List explicit technical nouns like TypeScript, Kubernetes, and Docker in single-column format.";
      }
      setMentorMessages(prev => [
        ...prev,
        {
          id: `m-ai-fallback-${Date.now()}`,
          role: 'assistant',
          text: mockReply,
          createdAt: new Date()
        }
      ]);
    } finally {
      setMentorLoading(false);
    }
  };

  // Launch pre-formulated templates for mentor
  const launchMentorSuggestion = (text: string) => {
    setMentorInput(text);
  };

  // Screen 2: INTERVIEW SETUP - Call Questions API
  const handleStartInterviewQuestions = async () => {
    setInterviewStep('loading');
    const actualDomain = mockDomain === 'Custom' ? customDomainText : mockDomain;
    try {
      let pastQuestionTexts = interviewHistory.flatMap(h => h.questions.map(q => q.questionText));

      // Fetch previously generated questions from Firestore
      if (isFirebaseActive && db) {
        try {
          const qSnap = await getDocs(
            query(
              collection(db, "questions"),
              where("userId", "==", auth.currentUser?.uid || "anonymous")
            )
          );
          qSnap.forEach(docSnap => {
            const data = docSnap.data();
            if (data && data.text && !pastQuestionTexts.includes(data.text)) {
              pastQuestionTexts.push(data.text);
            }
          });
        } catch (dbErr) {
          console.warn("Could not retrieve past questions from Firestore:", dbErr);
        }
      }

      const selectedDomain = actualDomain;
      const customTopic = mockFocusTopic;

      console.log("Fetching questions via generate-questions API...");
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          domain: selectedDomain,
          difficulty: mockDifficulty,
          numQuestions: mockNumQuestions,
          role: mockRole,
          company: mockCompany,
          customTopic: customTopic,
          questionMode: questionMode,
          pinnedQuestions: pinnedQuestions,
          previousQuestions: pastQuestionTexts
        })
      });

      if (!res.ok) throw new Error("Could not compile customized questions list");
      const list: InterviewQuestion[] = await res.json();
      console.log("Questions received:", list);

      // Store newly generated questions in Firestore
      if (isFirebaseActive && db) {
        try {
          for (const q of list) {
            await addDoc(collection(db, "questions"), {
              userId: auth.currentUser?.uid || "anonymous",
              text: q.text,
              domain: actualDomain,
              difficulty: mockDifficulty,
              createdAt: new Date().toISOString()
            });
          }
        } catch (dbErr) {
          console.warn("Could not save generated questions to Firestore:", dbErr);
        }
      }

      setGeneratedQuestions(list);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setCurrentAnswerText('');
      setInterviewStep('active_question');
      showToast("Questions compiled successfully!", "success");
    } catch (err) {
      console.error(err);
      setInterviewStep('setup');
      showToast("Failed to load questions. Please try again.", "error");
    }
  };

  // Next Question flow
  const handleNextQuestion = async (overrideAnswerText?: string) => {
    if (isEvaluatingAnswer) return; // Prevent duplicate submissions
    
    const currentQ = generatedQuestions[currentQuestionIndex];
    const answerTextTrimmed = overrideAnswerText !== undefined ? overrideAnswerText.trim() : currentAnswerText.trim();

    setIsEvaluatingAnswer(true);
    
    let evalResult = {
      score: 0,
      feedback: "No answer provided.",
      improvements: "Please write a response to receive feedback and suggestions.",
      idealAnswer: generateFallbackIdealAnswer(currentQ.text)
    };

    // Always call the evaluation API to get strict scoring and dynamic ideal answers
    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQ.text,
          answer: answerTextTrimmed
        })
      });
      if (response.ok) {
        evalResult = await response.json();
      } else {
        throw new Error("Evaluation response not ok");
      }
    } catch (err) {
      console.error("Failed to evaluate answer dynamically:", err);
      // Fallback simulation evaluation based on length & strict guidelines
      if (!answerTextTrimmed) {
        evalResult = {
          score: 0,
          feedback: "No answer provided.",
          improvements: "Please write a response to receive feedback and suggestions.",
          idealAnswer: generateFallbackIdealAnswer(currentQ.text)
        };
      } else {
        const lowercaseAns = answerTextTrimmed.toLowerCase();
        
        // Use programmatic gibberish checker helper
        const isObviousGibberish = isGibberishOrInvalid(answerTextTrimmed);

        if (isObviousGibberish) {
          evalResult = {
            score: 0,
            feedback: "The answer is invalid, meaningless, or unrelated to the question.",
            improvements: "Please write a meaningful professional response related to the question.",
            idealAnswer: generateFallbackIdealAnswer(currentQ.text)
          };
        } else if (answerTextTrimmed.length < 15) {
          evalResult = {
            score: 1,
            feedback: "Your response is extremely brief and does not address the question with any professional or conceptual depth.",
            improvements: "Please provide a structured, detailed answer of at least 2-3 sentences explaining your approach.",
            idealAnswer: generateFallbackIdealAnswer(currentQ.text)
          };
        } else if (answerTextTrimmed.length < 50) {
          evalResult = {
            score: 3,
            feedback: "Your response is brief and lacks specific details, technical terminologies, or structured context.",
            improvements: "Expand your answer with precise technical terms. Use the STAR methodology (Situation, Task, Action, Result) to format your answers.",
            idealAnswer: generateFallbackIdealAnswer(currentQ.text)
          };
        } else if (answerTextTrimmed.length < 100) {
          evalResult = {
            score: 5,
            feedback: "Decent start, but the response is too brief to show full professional mastery.",
            improvements: "Expand on the exact tools, architectures, and design trade-offs involved.",
            idealAnswer: generateFallbackIdealAnswer(currentQ.text)
          };
        } else {
          evalResult = {
            score: 8,
            feedback: "Solid technical explanation showing structured thinking and deep domain knowledge.",
            improvements: "Include more concrete business KPIs or numeric details to finalize your impact.",
            idealAnswer: generateFallbackIdealAnswer(currentQ.text)
          };
        }
      }
    }

    const newAnswer: AnswerInput = {
      questionId: currentQ.id,
      questionText: currentQ.text,
      answerText: answerTextTrimmed || "[No answer provided]",
      score: evalResult.score,
      feedback: evalResult.feedback,
      improvements: evalResult.improvements,
      idealAnswer: evalResult.idealAnswer
    };

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);
    setCurrentAnswerText('');
    setIsEvaluatingAnswer(false);

    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      compileOverallInterviewSession(updatedAnswers);
    }
  };

  // Skip Question flow (requests dynamic model answer from backend)
  const handleSkipQuestion = async () => {
    if (isEvaluatingAnswer) return;
    showToast("Skipping question... Generating model answer.", "info");
    await handleNextQuestion("");
  };

  // Compile overall interview results based on individual question evaluations
  const compileOverallInterviewSession = async (finalAnswers: AnswerInput[]) => {
    setInterviewStep('evaluating');
    
    // Brief delay for beautiful interactive compilation feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    const activeDomain = mockDomain === 'Custom' ? customDomainText : mockDomain;
    let overallScorePercent = 0;
    let comScore = 50;
    let techScore = 50;
    let confScore = 50;
    let solScore = 50;
    let clarScore = 50;
    let overallFeedback = "";

    try {
      const res = await fetch("/api/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: activeDomain,
          role: mockRole,
          answers: finalAnswers
        })
      });

      if (res.ok) {
        const results = await res.json();
        overallScorePercent = results.score;
        comScore = results.communicationScore;
        techScore = results.technicalScore;
        confScore = results.confidenceScore;
        solScore = results.problemSolvingScore;
        clarScore = results.clarityScore;
        overallFeedback = results.feedback;
      } else {
        throw new Error("Evaluation appraisal failed");
      }
    } catch (err) {
      console.warn("Failed to retrieve overall evaluation dynamically via Gemini:", err);
      // Fallback local calculations
      const totalScore = finalAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
      const maxPossibleScore = finalAnswers.length * 10;
      overallScorePercent = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

      comScore = Math.min(100, Math.max(10, overallScorePercent + Math.round(Math.random() * 4 - 2)));
      techScore = Math.min(100, Math.max(10, overallScorePercent + Math.round(Math.random() * 6 - 3)));
      confScore = Math.min(100, Math.max(10, overallScorePercent + Math.round(Math.random() * 4 - 2)));
      solScore = Math.min(100, Math.max(10, overallScorePercent + Math.round(Math.random() * 6 - 2)));
      clarScore = Math.min(100, Math.max(10, overallScorePercent + Math.round(Math.random() * 4 - 2)));

      overallFeedback = `### Overall Performance Summary\n\n`;
      if (overallScorePercent >= 85) {
        overallFeedback += `Outstanding performance! You achieved an impressive **${overallScorePercent}%** across this interview session. Your answers demonstrate a highly mature, structured, and deep technical understanding of **${activeDomain}**. You are exceptionally well-prepared for top-tier production standards.\n\n`;
      } else if (overallScorePercent >= 70) {
        overallFeedback += `Good job! You achieved a solid score of **${overallScorePercent}%**. You demonstrate a robust foundational grasp, but expanding on exact metrics, trade-offs, and deep technical architectures will help you secure senior or principal-level offers.\n\n`;
      } else {
        overallFeedback += `A constructive starting point. Your score is **${overallScorePercent}%**. To meet professional interview benchmarks, focus on refining your STAR structure and adding concrete technical definitions rather than brief descriptions.\n\n`;
      }

      overallFeedback += `\n### Detailed Question-by-Question Breakdown\n\n`;
      finalAnswers.forEach((ans, idx) => {
        overallFeedback += `#### Q${idx + 1}: ${ans.questionText}\n`;
        overallFeedback += `- **Score:** \`${ans.score}/10\`\n`;
        overallFeedback += `- **Your Answer:** *"${ans.answerText || '[No details provided]'}"*\n`;
        overallFeedback += `- **Feedback:** ${ans.feedback || 'No feedback details available.'}\n`;
        overallFeedback += `- **Suggestions for Improvement:** ${ans.improvements || 'Focus on articulating specific technical configurations.'}\n`;
        overallFeedback += `- **Model Answer (Perfect Score):** *${ans.idealAnswer || 'N/A'}*\n\n`;
        overallFeedback += `---\n\n`;
      });

      overallFeedback += `### Custom 4-Week Roadmap\n\n`;
      overallFeedback += `- **Week 1 (Concept Drills):** Target core ${activeDomain} configurations and systems that scored under 7/10.\n`;
      overallFeedback += `- **Week 2 (STAR Presentation):** Re-structure behavioral narratives specifically to clearly isolate Situation, Task, Action, and Result.\n`;
      overallFeedback += `- **Week 3 (Metrics Integration):** Practice injecting concrete business KPIs, latency bounds, or processing metrics into all standard scenarios.\n`;
      overallFeedback += `- **Week 4 (Timed Dry Runs):** Conduct simulated practice sessions to polish delivery brevity.\n`;
    }

    try {
      const newRecord: InterviewSessionRecord = {
        category: activeDomain,
        role: mockRole,
        difficulty: mockDifficulty,
        company: mockCompany,
        score: overallScorePercent,
        metrics: {
          communication: comScore,
          technical: techScore,
          confidence: confScore,
          problemSolving: solScore,
          clarity: clarScore
        },
        feedback: overallFeedback,
        questions: finalAnswers,
        createdAt: new Date().toISOString()
      };

      // Firestore cloud storage connection logic
      if (isFirebaseActive && db) {
        try {
          await addDoc(collection(db, "interviews"), {
            ...newRecord,
            uid: auth?.currentUser?.uid || "anon-guest"
          });
          console.log("[Firestore] Dynamic interview session saved securely to cloud database.");
        } catch (dbErr) {
          console.warn("[Firestore] Could not save interview to cloud database. Standard offline synchronization preserved.", dbErr);
          try {
            handleFirestoreError(dbErr, OperationType.WRITE, "interviews");
          } catch (handlerErr) {
            console.error("Handled Firestore error (non-fatal for user session):", handlerErr);
          }
        }
      }

      const nextHist = [...interviewHistory, newRecord];
      syncHistoryLocal(nextHist);
      setLatestEvaluation(newRecord);
      setInterviewStep('completed');
      setStreakCount(prev => prev + 1);
      showToast("Evaluation complete! Analytical scores saved.", "success");
    } catch (err) {
      console.error("Failed compiling overall interview:", err);
      showToast("Could not compile appraisal results.", "error");
      setInterviewStep('setup');
    }
  };

  // Inject beautiful premade sample STAR response
  const injectSTARResponseDemo = () => {
    const activeDomain = (mockDomain === 'Custom' ? customDomainText : mockDomain).toLowerCase();
    if (activeDomain.includes("aptitude")) {
      setCurrentAnswerText("We analyze the workload metrics. We isolate read and write requirements, predicting roughly 115 continuous requests per second with a peak multiplier of 5x. We plan memory allocations using small clustered nodes to avoid excessive sizing budgets.");
    } else if (activeDomain.includes("behavioral") || activeDomain.includes("hr")) {
      setCurrentAnswerText("S: A severe integration conflict occurred last winter when we had to restructure checkout flows under a critical launch gate.\nT: My clear accountability was to align team targets and prevent pipeline blockages.\nA: I led diagnostic architecture reviews, establishing clear REST parameters and sharding steps to resolve disputes.\nR: We met our deadlines smoothly, achieving an impressive 100% deployment uptime metric.");
    } else {
      setCurrentAnswerText(`At scale, we integrated premium distributed Redis nodes utilizing memory compaction pipelines for our ${mockDomain} system. This optimization directly minimized database query latency thresholds by 38% and supported 10k additional transactional logs per minute without system degradation.`);
    }
    showToast("Precision STAR response template injected", "info");
  };

  // Screen 3: RESUME SCANNERS
  const handleScanResumeATS = async () => {
    if (!resumeFileName && !resumeText.trim()) {
      showToast("Please upload a resume file (.pdf/.txt) or paste your resume text first.", "error");
      return;
    }
    setIsScanningResume(true);
    localStorage.setItem('pw_resume_text', resumeText);
    localStorage.setItem('pw_resume_target_role', targetJobRole);
    localStorage.setItem('pw_resume_target_jd', targetJobDesc);

    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textContent: resumeText,
          jobRole: targetJobRole || "AWS Cloud Engineer",
          jobDescription: targetJobDesc || "Standard Tech Industry Parameters",
          fileDataBase64: resumeFileBase64,
          mimeType: resumeFileName?.endsWith('.pdf') ? "application/pdf" : "text/plain"
        })
      });

      if (!res.ok) {
        let errMsg = "ATS score scanner returned failure code";
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        showToast(errMsg, "error");
        setIsScanningResume(false);
        return;
      }

      const analysis: ResumeAnalysisRecord = await res.json();
      setActiveResumeAnalysis(analysis);
      localStorage.setItem('pw_resume_analysis', JSON.stringify(analysis));
      showToast("ATS compliance scan accomplished!", "success");
    } catch (err) {
      console.error(err);
      // Fallback
      const fallbackAnalysis: ResumeAnalysisRecord = {
        skills: ["TypeScript", "React", "Node.js", "Express", "System Design", "Git", "Jest"],
        strengths: [
          "Demonstrates robust technical leading capacities.",
          "Solid history implementing asynchronous microservice pipelines."
        ],
        improvements: [
          "Format experiences strictly chronologically in single-column outlines.",
          "Avoid passive vocabulary like 'responsible for code checks', substitute with active metrics."
        ],
        summary: "An experienced, highly competent application builder with solid skills in full-stack setups, though resume formatting needs quantified impact parameters.",
        atsScore: 78,
        keywordMatches: [
          { word: "TypeScript", matched: true },
          { word: "Redis", matched: false },
          { word: "Kubernetes", matched: false },
          { word: "Idempotency", matched: true },
          { word: "System Design", matched: true },
          { word: "Kafka", matched: false }
        ],
        missingSkills: ["Redis Caching", "Docker Pipelines", "AWS IAM Policy setup"],
        isSuitable: true,
        suitabilityVerdict: "Highly Suitable",
        suitabilityExplanation: "Fallback assessment: The candidate profile aligns very well with typical software developer requirements, but lacks specific cloud-scale production metrics.",
        thingsToAddToResume: [
          "Quantify achievements in your professional experience bullet points.",
          "List experience with container orchestration and server deployments."
        ]
      };
      setActiveResumeAnalysis(fallbackAnalysis);
      localStorage.setItem('pw_resume_analysis', JSON.stringify(fallbackAnalysis));
      showToast("ATS scan accomplished (Simulation Mode)", "info");
    } finally {
      setIsScanningResume(false);
    }
  };

  // Handle adding custom question manually
  const handleAddManualQuestion = () => {
    const trimmed = customQuestionInput.trim();
    if (!trimmed) {
      showToast("Please write custom question text first.", "error");
      return;
    }
    if (trimmed.length < 5) {
      showToast("Question must be at least 5 characters.", "error");
      return;
    }
    setBankQuestions(prev => {
      if (prev.includes(trimmed)) return prev;
      return [trimmed, ...prev];
    });
    setPinnedQuestions(prev => {
      if (prev.includes(trimmed)) return prev;
      const newPinned = [...prev, trimmed];
      if (newPinned.length > mockNumQuestions) {
        setMockNumQuestions(newPinned.length);
      }
      return newPinned;
    });
    setCustomQuestionInput('');
    showToast("Custom question successfully added & pinned!", "success");
  };

  // Process text or json question lists
  const processUploadedQuestions = (text: string, fileName: string) => {
    if (!text.trim()) {
      showToast("The file is empty.", "error");
      return;
    }

    let parsedQuestions: string[] = [];

    if (fileName.toLowerCase().endsWith('.json')) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          parsedQuestions = parsed.map((item: any) => {
            if (typeof item === 'string') return item.trim();
            if (typeof item === 'object' && item !== null) {
              return (item.text || item.question || item.qText || "").trim();
            }
            return "";
          }).filter(q => q.length > 5);
        } else if (typeof parsed === 'object' && parsed !== null) {
          const possibleArray = parsed.questions || parsed.list || parsed.data || parsed.questionsList;
          if (Array.isArray(possibleArray)) {
            parsedQuestions = possibleArray.map((item: any) => {
              if (typeof item === 'string') return item.trim();
              if (typeof item === 'object' && item !== null) {
                return (item.text || item.question || item.qText || "").trim();
              }
              return "";
            }).filter(q => q.length > 5);
          }
        }
      } catch (err) {
        showToast("Failed to parse JSON file structure.", "error");
        return;
      }
    } else {
      // Treat as .txt or other text file
      parsedQuestions = text.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 5 && !l.startsWith('#') && !l.startsWith('//'));
    }

    if (parsedQuestions.length === 0) {
      showToast("No valid questions found in uploaded file (must be > 5 characters each).", "error");
      return;
    }

    setBankQuestions(prev => {
      const unique = parsedQuestions.filter(q => !prev.includes(q));
      return [...unique, ...prev];
    });

    setPinnedQuestions(prev => {
      const unique = parsedQuestions.filter(q => !prev.includes(q));
      const newPinned = [...prev, ...unique];
      if (newPinned.length > mockNumQuestions) {
        setMockNumQuestions(newPinned.length);
      }
      return newPinned;
    });

    showToast(`Uploaded and pinned ${parsedQuestions.length} custom questions!`, "success");
  };

  // File drop and select handlers for questions
  const handleQuestionsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processUploadedQuestions(content, file.name);
    };
    reader.readAsText(file);
  };

  // Drag and drop events for questions
  const handleQuestionsDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingQuestions(true);
  };

  const handleQuestionsDragLeave = () => {
    setIsDraggingQuestions(false);
  };

  const handleQuestionsDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingQuestions(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processUploadedQuestions(content, file.name);
    };
    reader.readAsText(file);
  };

  // File select and drag-drop handlers for Resume PDF/TXT
  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processResumeFile(file);
  };

  const handleResumeDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingResume(true);
  };

  const handleResumeDragLeave = () => {
    setIsDraggingResume(false);
  };

  const handleResumeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingResume(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processResumeFile(file);
  };

  const processResumeFile = (file: File) => {
    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    const isTXT = file.name.toLowerCase().endsWith('.txt');

    if (!isPDF && !isTXT) {
      showToast("Please upload a .pdf or .txt file only.", "error");
      return;
    }

    const reader = new FileReader();
    if (isPDF) {
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        setResumeFileBase64(base64Data);
        setResumeFileName(file.name);
        setResumeText(`[Uploaded PDF Resume: ${file.name}] Raw text analysis is bypassed. The PDF file is securely uplinked for multi-modal parsing.`);
        localStorage.setItem('pw_resume_filename', file.name);
        localStorage.setItem('pw_resume_filebase64', base64Data);
        localStorage.setItem('pw_resume_text', `[Uploaded PDF Resume: ${file.name}] Raw text analysis is bypassed. The PDF file is securely uplinked for multi-modal parsing.`);
        showToast(`Resume PDF "${file.name}" uploaded successfully! Ready for scanning.`, "success");
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setResumeText(text);
        setResumeFileBase64(null);
        setResumeFileName(file.name);
        localStorage.setItem('pw_resume_filename', file.name);
        localStorage.removeItem('pw_resume_filebase64');
        localStorage.setItem('pw_resume_text', text);
        showToast(`Resume text file "${file.name}" loaded successfully! Ready for scanning.`, "success");
      };
      reader.readAsText(file);
    }
  };

  const clearResumeFile = () => {
    setResumeFileBase64(null);
    setResumeFileName(null);
    setResumeText('');
    localStorage.removeItem('pw_resume_filename');
    localStorage.removeItem('pw_resume_filebase64');
    localStorage.removeItem('pw_resume_text');
    showToast("Uploaded resume cleared.", "info");
  };

  return (
    <div className={`min-h-screen bg-[#07090e] text-white font-sans selection:bg-indigo-500/80 antialiased relative flex flex-col ${themeMode === 'light' ? 'bg-neutral-50 text-[#07090e]' : ''}`}>
      
      {/* Decorative ambient blurred grid background logic */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.06),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-emerald-500/[0.02] filter blur-3xl pointer-events-none z-0" />

      {/* Floating global dynamic toast alert */}
      {toastMessage && (
        <div id="pw-global-toast" className={`fixed top-12 left-1/2 -translate-x-1/2 z-[9999] p-4 rounded-2xl shadow-2xl flex items-center space-x-3 transition-transform animate-fade-in text-xs max-w-sm border ${
          toastMessage.type === 'success' ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/30' :
          toastMessage.type === 'error' ? 'bg-red-950/95 text-red-301 border-red-500/30' : 'bg-indigo-950/95 text-indigo-300 border-indigo-500/30'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
          <span className="font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* 1. NATIVE IMMERSIVE SPLASH SCREEN FLOW */}
      {showSplash && (
        <div className="fixed inset-0 bg-[#07090e] flex flex-col items-center justify-center z-[99999] p-6 text-center select-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_70%)] pointer-events-none" />
          
          <div className="space-y-6 max-w-xs flex flex-col items-center">
            {/* Pulsing visual element mark */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/30 relative animate-pulse">
              <Sparkles className="w-10 h-10 text-white fill-white/10" />
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-[8.5px] font-mono font-black uppercase text-black px-1.5 py-0.5 rounded-md tracking-wider">PREP</span>
            </div>

            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-black tracking-tight text-white uppercase font-sans">PrepWise AI</h1>
              <p className="text-xs text-indigo-400 font-mono uppercase tracking-wider font-extrabold">AI-Powered Cloud & DevOps Interview Coach</p>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed max-w-[280px] mx-auto">
                Master AWS, Docker, Kubernetes, Terraform, Jenkins, Linux, and Cloud Security interviews with AI-powered practice sessions.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Syncing Recruiting Patterns...</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. AUTHENTICATION LOGIN & SIGNUP PORTAL SCREEN */}
      {!showSplash && !isLoggedIn && (
        <div className="min-h-screen w-full flex flex-col justify-center items-center p-6 bg-[#07090e] z-[999] overflow-y-auto animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(110,80,250,0.06),transparent_60%)] pointer-events-none" />
          
          <div className="w-full max-w-sm space-y-7 bg-[#0b0e14]/90 border border-zinc-900 rounded-[32px] p-6 md:p-8 shadow-2xl">
            {isForgotPassword ? (
              <>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto">
                    <HelpCircle className="w-6 h-6 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Reset Password</h2>
                  <p className="text-xs text-zinc-400">Enter your email and we'll send you a secure link to reset your account password.</p>
                </div>

                <form onSubmit={handleForgotPasswordAction} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-bold">Primary Email Address</label>
                    <input
                      type="email"
                      required
                      value={loginFormEmail}
                      onChange={(e) => setLoginFormEmail(e.target.value)}
                      placeholder="e.g. developer@prepwise.ai"
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-3 px-4 text-xs font-bold uppercase tracking-wider font-mono transition cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>Send Reset Email</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-2xl py-3 px-4 text-xs font-bold transition flex items-center justify-center space-x-1"
                  >
                    <span>Back to Sign In</span>
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Create PrepWise Profile</h2>
                  <p className="text-xs text-zinc-400">Configure your target credentials. Gemini uses these metadata filters to custom-compile all interviews.</p>
                </div>

                <form onSubmit={handleSignUpLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-bold">Candidate Full Name</label>
                    <input
                      type="text"
                      required
                      value={loginFormName}
                      onChange={(e) => setLoginFormName(e.target.value)}
                      placeholder="e.g. James Manoj"
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-bold">Primary Email Address</label>
                    <input
                      type="email"
                      required
                      value={loginFormEmail}
                      onChange={(e) => setLoginFormEmail(e.target.value)}
                      placeholder="e.g. developer@prepwise.ai"
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-bold">PASSWORD</label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-sans font-semibold transition"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginFormPassword}
                        onChange={(e) => setLoginFormPassword(e.target.value)}
                        placeholder="e.g. madhu3378"
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 pr-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-3 px-4 text-xs font-bold uppercase tracking-wider font-mono transition cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>Launch App Workspace</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserName("James Jane");
                      setUserGoal("Cloud DevOps Architect");
                      setUserEmail("guest.user@prepwise-sim.ai");
                      localStorage.setItem('pw_user_name', "James Jane");
                      localStorage.setItem('pw_user_goal', "Cloud DevOps Architect");
                      localStorage.setItem('pw_is_logged_in', 'true');
                      setIsLoggedIn(true);
                      showToast("Authenticated anonymously as Guest", "info");
                    }}
                    className="text-[10.5px] text-zinc-500 hover:text-indigo-400 transition"
                  >
                    Skip authentication and enter as guest
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. CORE APP INTERFACE VIEWER */}
      {!showSplash && isLoggedIn && (
        <div className="flex-1 w-full flex flex-col relative min-h-screen">
          
          {/* Edge-to-Edge Simulated Real Professional Status Indicator Bar */}
          <header className="sticky top-0 bg-[#07090e]/95 backdrop-blur-md border-b border-zinc-900/60 z-40 px-6 py-3.5 flex items-center justify-between text-left select-none shrink-0 font-sans">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-lg flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white fill-white/10" />
              </div>
              <div>
                <h1 className="text-xs font-black uppercase text-white tracking-widest">PrepWise AI</h1>
                <p className="text-[8px] font-mono text-zinc-500 tracking-wider">Candidate Control Center</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="flex items-center space-x-1.5 bg-zinc-900/80 p-1 px-2.5 rounded-full border border-zinc-850">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase">SYS ACTIVE</span>
              </div>
              <button 
                onClick={() => setActiveTab('profile')}
                className="w-7 h-7 rounded-full bg-zinc-850 hover:bg-zinc-805 text-zinc-400 flex items-center justify-center border border-zinc-800"
              >
                <User className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>

          {/* MAIN DYNAMIC SCREEN CONTENT VIEW CANVAS */}
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 text-left bg-gradient-to-b from-[#07090e] to-[#04060b] relative pb-32">
            
              
              {/* SCREEN 1: HOME PANEL */}
              {activeTab === 'home' && (
                <div className="space-y-5 pb-24 animate-fade-in">
                  
                  {/* Top Header Identity */}
                  <div className="flex justify-between items-center bg-indigo-950/15 p-4 rounded-3xl border border-indigo-900/20">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-indigo-400 font-extrabold uppercase tracking-widest block">Candidate Account</span>
                      <h2 className="text-xl font-bold tracking-tight text-white">{userName}</h2>
                      <div className="flex items-center space-x-1.5 pt-1">
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold">{userGoal}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center bg-indigo-950/40 p-2.5 rounded-2xl border border-indigo-500/10 min-w-[65px]">
                      <Flame className="w-5 h-5 text-orange-400 animate-pulse fill-orange-400" />
                      <span className="text-xs font-bold text-orange-400 mt-1">{streakCount} Days</span>
                      <span className="text-[7.5px] font-mono text-zinc-500 uppercase">Streak</span>
                    </div>
                  </div>

                  {/* Cloud Interview Prep Tagline Banner */}
                  <div className="bg-gradient-to-br from-indigo-950/30 via-[#0c0f18] to-black p-5 rounded-3xl border border-indigo-500/15 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_60%)] pointer-events-none" />
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6 animate-pulse text-indigo-400 fill-indigo-400/10" />
                      </div>
                      <div className="space-y-1.5">
                        <h2 className="text-sm font-extrabold text-white tracking-tight">
                          PrepWise AI – <span className="text-indigo-400">AI-Powered Cloud & DevOps Interview Coach</span>
                        </h2>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                          Master <span className="text-indigo-300 font-medium">AWS</span>, <span className="text-indigo-300 font-medium">Docker</span>, <span className="text-indigo-300 font-medium">Kubernetes</span>, <span className="text-indigo-300 font-medium">Terraform</span>, <span className="text-indigo-300 font-medium">Jenkins</span>, <span className="text-indigo-300 font-medium">Linux</span>, and <span className="text-indigo-300 font-medium">Cloud Security</span> interviews with AI-powered practice sessions.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Stats Dashboard Summary */}
                  <div className="bg-gradient-to-br from-indigo-900/30 to-[#0c0f18] border border-indigo-900/20 p-4 rounded-3xl space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-center border-b border-indigo-950/40 pb-2">
                      <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" /> Progress Metrics
                      </h3>
                      <span className="text-[10px] text-zinc-400">Current Rating</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-black/25 p-3 rounded-2xl border border-zinc-800/10">
                        <span className="text-[9px] text-zinc-500 block">Mock Session Index</span>
                        <span className="text-2xl font-black text-white">{interviewHistory.length}</span>
                        <span className="text-[8px] text-emerald-400 font-mono block mt-0.5">Ready to drill</span>
                      </div>
                      <div className="bg-black/25 p-3 rounded-2xl border border-zinc-800/10">
                        <span className="text-[9px] text-zinc-500 block">Avg Appraisal Rating</span>
                        <span className="text-2xl font-black text-indigo-400">
                          {interviewHistory.length > 0
                            ? `${Math.round(interviewHistory.reduce((sum, item) => sum + item.score, 0) / interviewHistory.length)}%`
                            : "0%"}
                        </span>
                        <span className="text-[8px] text-zinc-400 font-mono block mt-0.5">Target: 85%+</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>ATS Resume Score Ready</span>
                        <span className="font-mono text-indigo-400 font-bold">{activeResumeAnalysis ? `${activeResumeAnalysis.atsScore}%` : "Not scanned yet"}</span>
                      </div>
                      <div className="h-1 text-zinc-800 rounded bg-zinc-800">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded transition-all duration-500" style={{ width: activeResumeAnalysis ? `${activeResumeAnalysis.atsScore}%` : '5%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Launch actions */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-serif tracking-widest uppercase text-zinc-500 font-bold block">Start Preparation Units</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setActiveTab('interview')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl p-4 text-left transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/10 group flex flex-col justify-between min-h-[110px]"
                      >
                        <div className="bg-white/10 p-2 rounded-2xl self-start">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold block mb-0.5 group-hover:translate-x-1 transition-transform">Interactive Mock Drills</h4>
                          <span className="text-[10px] text-indigo-200">5-question scoring</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('resume')}
                        className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/30 text-white rounded-3xl p-4 text-left transition-all duration-200 cursor-pointer hover:bg-zinc-850/80 group flex flex-col justify-between min-h-[110px]"
                      >
                        <div className="bg-zinc-800 p-2 rounded-2xl self-start">
                          <UploadCloud className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold block mb-0.5 group-hover:translate-x-1 transition-transform font-sans">ATS Scanner</h4>
                          <span className="text-[10px] text-zinc-400">Optimize compliance</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('cloudhub')}
                        className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 text-white rounded-3xl p-4 text-left transition-all duration-200 cursor-pointer hover:bg-zinc-850/80 group flex flex-col justify-between min-h-[110px]"
                      >
                        <div className="bg-zinc-800 p-2 rounded-2xl self-start">
                          <Cpu className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold block mb-0.5 group-hover:translate-x-1 transition-transform font-sans">DevOps Hub</h4>
                          <span className="text-[10px] text-zinc-400">AWS Docker CI/CD</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Ask MS Assistant Trigger Banner */}
                  <div
                    onClick={() => setMentorOpen(true)}
                    className="bg-gradient-to-r from-indigo-950/40 via-[#101424]/60 to-[#0e1222] border border-indigo-500/20 p-4 rounded-3xl cursor-pointer hover:border-indigo-500/40 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className="relative">
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-400 rounded-full border border-black animate-ping" />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border border-black" />
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/20 text-indigo-400 flex items-center justify-center font-black">
                          MS
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1">
                          Talk with Lead Coach <Sparkles className="w-3 h-3 text-indigo-400" />
                        </h4>
                        <p className="text-[10px] text-zinc-400 leading-normal">Get instant technical reviews and interview checklists.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-500" />
                  </div>

                  {/* Recent activities tracker summary list */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] tracking-widest uppercase font-mono text-zinc-500">
                      <span>Recent Activity Feeds</span>
                      <span className="text-indigo-400 text-[9px] cursor-pointer" onClick={() => setActiveTab('dashboard')}>View Logs</span>
                    </div>

                    <div className="space-y-2">
                      {interviewHistory.slice(-3).map((item, index) => (
                        <div
                          key={item.id || index}
                          onClick={() => setViewingRecordDetail(item)}
                          className="p-3 bg-zinc-900/60 border border-zinc-800/20 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-zinc-850/80 hover:border-indigo-500/10 transition-all"
                        >
                          <div className="flex items-center space-x-3 text-left">
                            <div className="bg-[#111] p-2 rounded-xl text-zinc-400 border border-zinc-800 text-[10px] font-mono tracking-wider">
                              {item.category.slice(0, 3).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white truncate max-w-[170px]">{item.role}</h4>
                              <span className="text-[10px] text-zinc-400">{item.company} • {item.difficulty}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-black font-mono px-2 py-1 rounded-lg ${
                              item.score >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                              item.score >= 60 ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-500'
                            }`}>{item.score}%</span>
                            <ChevronRight className="w-4 h-4 text-zinc-600" />
                          </div>
                        </div>
                      ))}

                      {interviewHistory.length === 0 && (
                        <div className="bg-zinc-900/10 border border-zinc-800/10 rounded-2xl p-6 text-center">
                          <p className="text-xs text-zinc-500">No mock history saved yet. Begin your first session below.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* SCREEN 2: INTERVIEW WORKSPACE */}
              {activeTab === 'interview' && (
                <div className="space-y-5 pb-24 animate-fade-in text-left">
                  
                  {/* SELECTION SETUP STATE */}
                  {interviewStep === 'setup' && (
                    <div className="space-y-4">
                      <button
                        onClick={() => setActiveTab('home')}
                        className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-xl mb-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Home</span>
                      </button>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">Simulation Studio</span>
                        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Mock Interview Setup</h2>
                        <p className="text-[11px] text-zinc-400">Tailor your evaluation. Gemini will render customized professional queries.</p>
                      </div>

                      {/* Domain grid multi choice layout */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Session Focus domain</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            'Cloud Computing',
                            'AWS',
                            'GCP',
                            'Azure',
                            'Linux',
                            'Docker',
                            'Kubernetes',
                            'Terraform',
                            'Jenkins',
                            'Git & GitHub',
                            'Networking',
                            'Cloud Security',
                            'DevOps',
                            'STAR Behavioral',
                            'System Design',
                            'Custom'
                          ].map((dom) => {
                            const active = mockDomain === dom;
                            
                            // Render a relevant visual icon for each technology to improve visual scanability
                            const renderIcon = () => {
                              switch (dom) {
                                case 'Cloud Computing':
                                  return <Cloud className="w-3.5 h-3.5 text-sky-450 shrink-0" />;
                                case 'AWS':
                                  return <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
                                case 'GCP':
                                  return <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
                                case 'Azure':
                                  return <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
                                case 'Linux':
                                  return <Terminal className="w-3.5 h-3.5 text-zinc-300 shrink-0" />;
                                case 'Docker':
                                  return <Box className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
                                case 'Kubernetes':
                                  return <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
                                case 'Terraform':
                                  return <HardDrive className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
                                case 'Jenkins':
                                  return <Play className="w-3.5 h-3.5 text-red-400 shrink-0" />;
                                case 'Git & GitHub':
                                  return <GitBranch className="w-3.5 h-3.5 text-orange-400 shrink-0" />;
                                case 'Networking':
                                  return <Network className="w-3.5 h-3.5 text-teal-400 shrink-0" />;
                                case 'Cloud Security':
                                  return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
                                case 'DevOps':
                                  return <Infinity className="w-3.5 h-3.5 text-pink-400 shrink-0" />;
                                case 'STAR Behavioral':
                                  return <UserCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />;
                                case 'System Design':
                                  return <Layout className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
                                case 'Custom':
                                default:
                                  return <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
                              }
                            };

                            return (
                              <button
                                key={dom}
                                type="button"
                                onClick={() => {
                                  setMockDomain(dom);
                                  if (dom !== 'Custom') {
                                    setMockRole(dom);
                                  } else {
                                    setMockRole(customDomainText || 'Custom');
                                  }
                                }}
                                className={`p-2.5 rounded-2xl text-[11px] border text-left px-3 transition-all cursor-pointer font-bold flex justify-between items-center ${
                                  active
                                    ? 'bg-[#1e1a4a]/80 text-indigo-300 border-indigo-500 shadow-md scale-[1.01]'
                                    : 'bg-zinc-900 text-zinc-400 border-transparent hover:bg-zinc-850'
                                }`}
                              >
                                <div className="flex items-center space-x-2 overflow-hidden">
                                  {renderIcon()}
                                  <span className="truncate">{dom}</span>
                                </div>
                                {active && <Sparkles className="w-3 h-3 text-indigo-400 shrink-0 ml-1" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Domain Input Field (Visible only if Custom is selected) */}
                      {mockDomain === 'Custom' && (
                        <div className="animate-fade-in space-y-1">
                          <label className="text-[10px] font-mono uppercase text-zinc-500 block font-bold">Define Custom Technology / Domain</label>
                          <input
                            type="text"
                            value={customDomainText}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomDomainText(val);
                              setMockRole(val || 'Custom');
                            }}
                            placeholder="e.g. Go (Golang) Microservices, C++ Embedded"
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      )}

                      {/* Input Role form fields */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Target professional role</label>
                          <input
                            type="text"
                            value={mockRole}
                            onChange={(e) => setMockRole(e.target.value)}
                            placeholder="e.g. AWS Cloud Engineer, DevOps Lead, SRE"
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white uppercase font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Target company standard focus</label>
                          <input
                            type="text"
                            value={mockCompany}
                            onChange={(e) => setMockCompany(e.target.value)}
                            placeholder="e.g. Stripe, Netflix, Google"
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* select Difficulty level */}
                          <div>
                            <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Appraisal intensity level</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {['Easy', 'Medium', 'Hard'].map((lvl) => {
                                const active = mockDifficulty === lvl;
                                return (
                                  <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => setMockDifficulty(lvl as any)}
                                    className={`p-2 rounded-xl text-[10.5px] text-center border transition-all cursor-pointer ${
                                      active
                                        ? 'bg-zinc-850 text-white border-zinc-500 font-bold'
                                        : 'bg-zinc-900 text-zinc-500 border-transparent hover:bg-zinc-850'
                                    }`}
                                  >
                                    {lvl}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* select Question Count */}
                          <div>
                            <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Number of questions</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[3, 5, 10].map((num) => {
                                const active = mockNumQuestions === num;
                                return (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => {
                                      setMockNumQuestions(num);
                                      if (pinnedQuestions.length > num) {
                                        setPinnedQuestions(pinnedQuestions.slice(0, num));
                                      }
                                    }}
                                    className={`p-2 rounded-xl text-[10.5px] text-center border transition-all cursor-pointer ${
                                      active
                                        ? 'bg-zinc-850 text-white border-zinc-500 font-bold'
                                        : 'bg-zinc-900 text-zinc-500 border-transparent hover:bg-zinc-850'
                                    }`}
                                  >
                                    {num} Qs
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Question Generation Mode Selector */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Question Source Architecture</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'bank', name: 'Curated Bank', desc: 'Secure repository' },
                              { id: 'ai', name: 'Dynamic AI', desc: 'Custom Gemini scenario' },
                              { id: 'hybrid', name: 'Hybrid Mix', desc: 'Curated + dynamic AI' }
                            ].map((mode) => {
                              const active = questionMode === mode.id;
                              return (
                                <button
                                  key={mode.id}
                                  type="button"
                                  onClick={() => setQuestionMode(mode.id as any)}
                                  className={`p-2.5 rounded-2xl text-left border cursor-pointer transition-all flex flex-col justify-between h-[68px] ${
                                    active
                                      ? 'bg-indigo-650/10 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                                      : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:bg-zinc-850'
                                  }`}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span className={`text-[10.5px] font-bold ${active ? 'text-indigo-300' : 'text-zinc-300'}`}>
                                      {mode.name}
                                    </span>
                                    {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                                  </div>
                                  <span className="text-[8.5px] text-zinc-500 leading-tight block line-clamp-2">
                                    {mode.desc}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interactive Curated Question Bank Explorer */}
                        {(questionMode === 'bank' || questionMode === 'hybrid') && (
                          <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-3.5 space-y-3.5 mt-1.5">
                            <div className="flex justify-between items-center">
                              <div className="space-y-0.5">
                                <h4 className="text-[11.5px] font-bold text-white flex items-center space-x-1.5">
                                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Curated Database Explorer</span>
                                </h4>
                                <p className="text-[9.5px] text-zinc-400">
                                  Select, pin, or upload custom questions for your session.
                                </p>
                              </div>
                              <span className="text-[9px] font-mono bg-zinc-850 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                                {pinnedQuestions.length} / {mockNumQuestions} Pinned
                              </span>
                            </div>

                            {/* Vault / Custom Tabs */}
                            <div className="flex border-b border-zinc-800/80 gap-3">
                              <button
                                type="button"
                                onClick={() => setBankSubTab('vault')}
                                className={`pb-1.5 text-[10.5px] font-bold transition-all relative ${
                                  bankSubTab === 'vault' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-white'
                                }`}
                              >
                                Curated Vault
                              </button>
                              <button
                                type="button"
                                onClick={() => setBankSubTab('custom')}
                                className={`pb-1.5 text-[10.5px] font-bold transition-all relative ${
                                  bankSubTab === 'custom' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-white'
                                }`}
                              >
                                Upload / Add Custom
                              </button>
                            </div>

                            {bankSubTab === 'vault' ? (
                              <>
                                {/* Search bar for questions */}
                                <div className="relative">
                                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                                  <input
                                    type="text"
                                    value={bankSearchQuery}
                                    onChange={(e) => setBankSearchQuery(e.target.value)}
                                    placeholder="Search verified questions..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-1.5 pl-8 pr-3 text-[10.5px] text-white focus:outline-none focus:border-indigo-500"
                                  />
                                </div>

                                {/* Question List container */}
                                <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                                  {bankLoading ? (
                                    <div className="text-center py-6 text-zinc-550 text-[10px] font-mono flex items-center justify-center space-x-2">
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                      <span>Syncing question vault...</span>
                                    </div>
                                  ) : bankQuestions.length === 0 ? (
                                    <div className="text-center py-6 text-zinc-500 text-[10.5px]">
                                      No curated questions in vault for this topic. Define custom topic or search details.
                                    </div>
                                  ) : (
                                    bankQuestions
                                      .filter(text => text.toLowerCase().includes(bankSearchQuery.toLowerCase()))
                                      .map((qText, idx) => {
                                        const isPinned = pinnedQuestions.includes(qText);
                                        return (
                                          <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                              if (isPinned) {
                                                setPinnedQuestions(prev => prev.filter(item => item !== qText));
                                              } else {
                                                if (pinnedQuestions.length >= mockNumQuestions) {
                                                  // Auto-increase the total count if they pin more questions than requested
                                                  setMockNumQuestions(pinnedQuestions.length + 1);
                                                }
                                                setPinnedQuestions(prev => [...prev, qText]);
                                              }
                                            }}
                                            className={`w-full p-2.5 rounded-xl border text-left text-[10.5px] transition-all cursor-pointer flex items-start space-x-2.5 ${
                                              isPinned
                                                ? 'bg-indigo-650/10 border-indigo-500/80 text-white shadow-sm'
                                                : 'bg-zinc-900 border-zinc-850 hover:border-zinc-700 text-zinc-300'
                                            }`}
                                          >
                                            <div className="mt-0.5 shrink-0">
                                              {isPinned ? (
                                                <div className="w-3.5 h-3.5 rounded bg-indigo-500 flex items-center justify-center text-white">
                                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                </div>
                                              ) : (
                                                <div className="w-3.5 h-3.5 rounded border border-zinc-700 bg-zinc-950 flex items-center justify-center text-transparent hover:border-indigo-500">
                                                  <Pin className="w-2 h-2" />
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex-1 space-y-0.5">
                                              <p className="leading-relaxed font-sans">{qText}</p>
                                              {isPinned && (
                                                <span className="inline-flex items-center text-[8px] font-mono font-bold text-indigo-400 tracking-wider uppercase">
                                                  Pinned for Session
                                                </span>
                                              )}
                                            </div>
                                          </button>
                                        );
                                      })
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="space-y-3">
                                {/* File Drag and Drop Zone */}
                                <div
                                  onDragOver={handleQuestionsDragOver}
                                  onDragLeave={handleQuestionsDragLeave}
                                  onDrop={handleQuestionsDrop}
                                  onClick={() => document.getElementById('questions-file-upload-input')?.click()}
                                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                    isDraggingQuestions
                                      ? 'border-indigo-500 bg-indigo-500/10'
                                      : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/10'
                                  }`}
                                >
                                  <input
                                    type="file"
                                    id="questions-file-upload-input"
                                    accept=".txt,.json"
                                    onChange={handleQuestionsFileChange}
                                    className="hidden"
                                  />
                                  <UploadCloud className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
                                  <p className="text-[10.5px] font-bold text-white">Drag & drop questions file here</p>
                                  <p className="text-[9px] text-zinc-400 mt-0.5">Supports .txt (one per line) or .json list format</p>
                                </div>

                                {/* Manual Question Add input */}
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-mono uppercase text-zinc-400 block font-bold">Or Add Manually</label>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="text"
                                      value={customQuestionInput}
                                      onChange={(e) => setCustomQuestionInput(e.target.value)}
                                      placeholder="Type your own interview question to practice..."
                                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-1.5 px-3 text-[10.5px] text-white focus:outline-none focus:border-indigo-500"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleAddManualQuestion();
                                        }
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={handleAddManualQuestion}
                                      className="bg-indigo-650 hover:bg-indigo-600 text-white text-[10.5px] font-bold py-1.5 px-3.5 rounded-xl cursor-pointer shadow-sm transition-all shrink-0 active:scale-95"
                                    >
                                      Add & Pin
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Optional Topic details */}
                        <div>
                          <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Focus Topics / Key Skills (Optional)</label>
                          <input
                            type="text"
                            value={mockFocusTopic}
                            onChange={(e) => setMockFocusTopic(e.target.value)}
                            placeholder="e.g. Concurrency pipelines, system design"
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Launch Trigger Button */}
                      <button
                        onClick={handleStartInterviewQuestions}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-4 rounded-3xl text-sm font-extrabold cursor-pointer transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center space-x-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Compile Prep Session</span>
                      </button>
                    </div>
                  )}

                  {/* LOADING INTENSIFY PULSE WINDOW */}
                  {interviewStep === 'loading' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="relative">
                        <span className="absolute inset-0 h-16 w-16 bg-indigo-500/20 rounded-full animate-ping" />
                        <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500 text-indigo-400 flex items-center justify-center rounded-full">
                          <RefreshCw className="w-6 h-6 animate-spin" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-extrabold text-white">Deconstructing Recruiting Patterns</h3>
                        <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed mx-auto">Gemini is drafting {mockNumQuestions} tailored {mockDomain} questions referencing {mockCompany} standards...</p>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE QUESTION COMPONENT */}
                  {interviewStep === 'active_question' && generatedQuestions.length > 0 && (
                    <div className="space-y-4 animate-fade-in">
                      
                      <button
                        onClick={() => setInterviewStep('setup')}
                        className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-xl mb-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Setup</span>
                      </button>

                      {/* Session progress line */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400">
                          <span>{mockDomain} Coaching • {mockDifficulty}</span>
                          <span className="font-bold">Progress: {currentQuestionIndex + 1} / {generatedQuestions.length}</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded bg-zinc-805">
                          <div className="h-full bg-indigo-500 rounded transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / generatedQuestions.length) * 100}%` }} />
                        </div>
                      </div>

                      {/* Question panel Card */}
                      <div className="bg-zinc-900/80 border border-zinc-800/15 p-5 rounded-3xl text-left space-y-1 relative overflow-hidden">
                        <span className="text-[10px] font-mono text-indigo-400 font-extrabold">QUESTION CORE</span>
                        <p className="text-sm font-bold text-white leading-normal pt-1">{generatedQuestions[currentQuestionIndex].text}</p>
                      </div>

                      {/* Answer layout */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block font-bold">Your responses details</label>
                          
                          <button
                            onClick={injectSTARResponseDemo}
                            disabled={isEvaluatingAnswer}
                            className="bg-indigo-950/40 text-indigo-400 text-[9px] font-mono hover:bg-indigo-900/35 border border-indigo-500/15 p-1 px-2.5 rounded-lg transition disabled:opacity-50"
                          >
                            Demo STAR Draft
                          </button>
                        </div>

                        <textarea
                          rows={4}
                          value={currentAnswerText}
                          disabled={isEvaluatingAnswer}
                          onChange={(e) => setCurrentAnswerText(e.target.value)}
                          placeholder="Type your response here. For technical or behavioral questions, frame your narrative clearly. To skip this question and score 0/10, click 'Skip Question' below."
                          className="w-full bg-zinc-900/80 border border-zinc-855 rounded-2xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                        />
                      </div>

                      {/* Simulate dictation or helper voice indicators */}
                      <div className="bg-zinc-950/45 p-3 rounded-2xl flex items-center justify-between border border-zinc-850/50">
                        <div className="flex items-center space-x-2.5">
                          <span className={`h-2 w-2.5 rounded-full ${isDictatingSimulated ? 'bg-red-400 animate-pulse' : 'bg-indigo-400'}`} />
                          <span className="text-[10px] text-zinc-400">Oral Practice voice dictation simulation:</span>
                        </div>
                        <button
                          disabled={isEvaluatingAnswer}
                          onClick={() => {
                            setIsDictatingSimulated(p => !p);
                            if(!isDictatingSimulated) {
                              setCurrentAnswerText("At Netflix, our core database nodes reached CPU bottlenecks. I orchestrated partitioning of table logs based on tenant hashes. This result prevented data lockouts, sustaining our processing metrics by 99% during launch campaigns.");
                              showToast("Vocal synthesis input simulated completed", "success");
                            }
                          }}
                          className="bg-zinc-850 hover:bg-zinc-800 text-[10px] py-1 px-2 text-white border border-zinc-700/50 rounded-xl disabled:opacity-50"
                        >
                          {isDictatingSimulated ? "Stop Mic" : "Start Mic"}
                        </button>
                      </div>

                      {/* Action trigger Next / Submit / Skip */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleSkipQuestion}
                          disabled={isEvaluatingAnswer}
                          className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-3xl py-3 px-3 text-xs font-bold transition flex items-center justify-center space-x-1 disabled:opacity-50"
                        >
                          <span>Skip (0/10)</span>
                        </button>

                        <button
                          onClick={() => handleNextQuestion()}
                          disabled={isEvaluatingAnswer}
                          className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl py-3 px-4 text-xs font-extrabold cursor-pointer transition flex items-center justify-center space-x-2 disabled:opacity-70"
                        >
                          {isEvaluatingAnswer ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                              <span>Evaluating Answer...</span>
                            </>
                          ) : (
                            <>
                              <span>
                                {currentQuestionIndex === generatedQuestions.length - 1
                                  ? "Evaluate & Finish Sessions"
                                  : "Save & Continue Mock"}
                              </span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* EVALUATING WAITING VIEW */}
                  {interviewStep === 'evaluating' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center animate-pulse">
                      <div className="relative">
                        <span className="absolute inset-0 h-16 w-16 bg-emerald-500/20 rounded-full animate-ping" />
                        <div className="w-16 h-16 bg-emerald-600/10 border border-emerald-500 text-emerald-400 flex items-center justify-center rounded-full animate-bounce">
                          <Award className="w-8 h-8 animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-extrabold text-white">Synthesizing Appraisal Assessment</h3>
                        <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed mx-auto">Evaluating overall responses, computing criteria scores, and drafting custom roadmaps...</p>
                      </div>
                    </div>
                  )}

                  {/* COMPLETED APPRAISAL STATE */}
                  {interviewStep === 'completed' && latestEvaluation && (
                    <div className="space-y-5 animate-fade-in">
                      
                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 mb-1">
                        <button
                          onClick={() => setInterviewStep('setup')}
                          className="inline-flex items-center justify-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-xl cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back to Setup</span>
                        </button>

                        <button
                          onClick={() => exportEvaluationToPDF(latestEvaluation)}
                          className="inline-flex items-center justify-center space-x-1.5 text-xs text-white transition bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl font-bold cursor-pointer active:scale-95 shadow-sm shadow-indigo-500/10"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export PDF Report</span>
                        </button>
                      </div>

                      {/* Score circle badge */}
                      <div className="bg-gradient-to-tr from-indigo-950/40 via-[#121629] to-black border border-indigo-500/20 p-5 rounded-3xl text-center space-y-3 relative overflow-hidden">
                        
                        <div className="inline-flex items-center justify-center bg-indigo-600/10 border border-indigo-500/30 p-2.5 rounded-2xl mb-1 text-indigo-400">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-[10px] font-mono tracking-widest uppercase font-bold ml-1">EVALUATION FINISHED</span>
                        </div>

                        <div className="space-y-0.5">
                          <h3 className="text-4xl font-black text-white">{latestEvaluation.score}%</h3>
                          <span className="text-xs text-zinc-400">{mockRole} Mock Session Rating</span>
                        </div>

                        {/* Quick rating gauge bars */}
                        <div className="grid grid-cols-5 gap-1.5 pt-2">
                          {[
                            { label: 'COM', val: latestEvaluation.metrics.communication, color: 'bg-indigo-500' },
                            { label: 'TEC', val: latestEvaluation.metrics.technical, color: 'bg-emerald-500' },
                            { label: 'CON', val: latestEvaluation.metrics.confidence, color: 'bg-amber-400' },
                            { label: 'SOL', val: latestEvaluation.metrics.problemSolving, color: 'bg-pink-500' },
                            { label: 'CLA', val: latestEvaluation.metrics.clarity, color: 'bg-sky-500' }
                          ].map((b) => (
                            <div key={b.label} className="bg-black/40 p-1.5 rounded-lg border border-zinc-800/10 text-center">
                              <span className="text-[7.5px] text-zinc-500 block">{b.label}</span>
                              <span className="text-[10px] font-bold text-white font-mono">{b.val}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Feedback in raw markdown format */}
                      <div className="bg-[#0b0c10] border border-zinc-800/30 p-4 rounded-3xl space-y-3 max-h-[350px] overflow-y-auto leading-relaxed markdown-container" style={{ scrollbarWidth: 'none' }}>
                        <span className="text-[11px] font-mono text-zinc-400 block pb-1 border-b border-zinc-800 uppercase tracking-widest">Coaching Commentary Details</span>
                        <div className="text-xs text-zinc-300 space-y-3 prose prose-invert">
                          <ReactMarkdown>{latestEvaluation.feedback}</ReactMarkdown>
                        </div>
                      </div>

                      {/* Detailed per-question scorecard (FEATURE 2) */}
                      <div className="space-y-3.5">
                        <span className="text-[11px] font-mono text-indigo-400 block pb-1 uppercase tracking-widest font-bold">Question-by-Question breakdown</span>
                        {latestEvaluation.questions.map((q, idx) => (
                          <div key={idx} className="bg-zinc-900 border border-zinc-850 p-4 rounded-3xl space-y-3 text-left">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">QUESTION {idx + 1}</span>
                              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                                (q.score ?? 0) >= 8 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                (q.score ?? 0) >= 5 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                'bg-red-500/10 text-red-500 border border-red-500/20'
                              }`}>{q.score ?? 0}/10 Points</span>
                            </div>
                            <p className="text-xs text-white font-bold">{q.questionText}</p>
                            
                            <div className="bg-black/40 p-2.5 rounded-2xl border border-zinc-850/50 space-y-1">
                              <span className="text-[8px] font-mono text-zinc-500 uppercase font-bold block">Your Answer:</span>
                              <p className="text-[11px] text-zinc-300 italic leading-relaxed">"{q.answerText || '[No answer provided]'}"</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div className="space-y-1 text-left">
                                <span className="text-[9px] font-mono text-indigo-450 uppercase font-bold block text-indigo-400">Analysis & Feedback:</span>
                                <p className="text-[11px] text-zinc-400 leading-normal">{q.feedback || 'No feedback details available.'}</p>
                              </div>
                              <div className="space-y-1 text-left">
                                <span className="text-[9px] font-mono text-amber-450 uppercase font-bold block text-amber-400">Suggestions for Improvement:</span>
                                <p className="text-[11px] text-zinc-400 leading-normal">{q.improvements || 'Focus on elaborating on specific architectures and STAR results.'}</p>
                              </div>
                            </div>

                            <div className="bg-indigo-950/25 p-3 rounded-2xl border border-indigo-500/10 text-left space-y-1">
                              <span className="text-[9px] font-mono text-emerald-450 uppercase font-bold block text-emerald-400">Model Answer (Ideal perfect response):</span>
                              <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">{q.idealAnswer || 'N/A'}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Back button */}
                      <button
                        onClick={() => setInterviewStep('setup')}
                        className="w-full bg-zinc-850 hover:bg-zinc-800 text-white rounded-3xl py-3.5 px-4 text-xs font-bold transition border border-zinc-700/50"
                      >
                        Start Next Prep Session
                      </button>

                    </div>
                  )}

                </div>
              )}

              {/* SCREEN 3: RESUME SCANS */}
              {activeTab === 'resume' && (
                <div className="space-y-4 pb-24 animate-fade-in text-left">
                  
                  <button
                    onClick={() => setActiveTab('home')}
                    className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-xl mb-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                  </button>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">Candidate Optimization</span>
                    <h2 className="text-xl font-bold tracking-tight text-white font-sans">Resume ATS Auditor</h2>
                    <p className="text-[11px] text-zinc-400">Upload your CV to identify optimization gaps and compute target job keyword alignments.</p>
                  </div>

                  {/* Input areas */}
                  <div className="space-y-3">
                    {/* Drag and Drop CV File Upload */}
                    <div
                      onDragOver={handleResumeDragOver}
                      onDragLeave={handleResumeDragLeave}
                      onDrop={handleResumeDrop}
                      onClick={() => document.getElementById('resume-file-upload-input')?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4.5 text-center cursor-pointer transition-all ${
                        isDraggingResume
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
                      }`}
                    >
                      <input
                        type="file"
                        id="resume-file-upload-input"
                        accept=".pdf,.txt"
                        onChange={handleResumeFileChange}
                        className="hidden"
                      />
                      <UploadCloud className="w-7 h-7 text-indigo-400 mx-auto mb-2" />
                      {resumeFileName ? (
                        <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-[11px] font-mono text-indigo-300 font-bold max-w-[200px] truncate">
                              📄 {resumeFileName}
                            </span>
                            <button
                              type="button"
                              onClick={clearResumeFile}
                              className="text-zinc-550 hover:text-red-400 p-0.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[9px] text-zinc-400">
                            {resumeFileName.endsWith('.pdf') ? 'PDF file loaded. Multi-modal parsing is queued!' : 'Text file content loaded!'}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[11px] font-bold text-white">Drag & drop your Resume (CV) file here, or click to browse</p>
                          <p className="text-[9.5px] text-zinc-400 mt-1">Supports PDF or plain TXT files</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Or Paste Resume/CV Text</label>
                      <textarea
                        rows={5}
                        value={resumeText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResumeText(val);
                          localStorage.setItem('pw_resume_text', val);
                          if (val.trim() && !resumeFileName) {
                            setResumeFileName("Pasted Resume Text");
                            localStorage.setItem('pw_resume_filename', "Pasted Resume Text");
                          } else if (!val.trim() && resumeFileName === "Pasted Resume Text") {
                            setResumeFileName(null);
                            localStorage.removeItem('pw_resume_filename');
                          }
                        }}
                        placeholder="Paste plain text content of your resume/CV here..."
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Target Job Role / Title</label>
                      <input
                        type="text"
                        value={targetJobRole}
                        onChange={(e) => setTargetJobRole(e.target.value)}
                        placeholder="e.g. AWS Cloud Engineer, DevOps Engineer, SRE, Cloud Solutions Architect..."
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Target Job Description</label>
                      <textarea
                        rows={3}
                        value={targetJobDesc}
                        onChange={(e) => setTargetJobDesc(e.target.value)}
                        placeholder="Provide the target job description to verify index alignments..."
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Submit scan */}
                    <button
                      onClick={handleScanResumeATS}
                      disabled={isScanningResume}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-3xl text-sm font-extrabold cursor-pointer transition flex items-center justify-center space-x-2 shadow-lg"
                    >
                      {isScanningResume ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Auditing Profile Compliance...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Scan Resume ATS Score</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* SCAN RESULTS ACTIVE */}
                  {activeResumeAnalysis && !isScanningResume && (
                    <div className="space-y-4 pt-3 border-t border-indigo-950/20 animate-fade-in text-left">
                      
                      {/* Circle compliance dial */}
                      <div className="bg-gradient-to-tr from-indigo-950/30 via-zinc-900 to-[#101423] border border-indigo-900/15 p-4 rounded-3xl flex items-center justify-between">
                        <div className="space-y-1 text-left max-w-[210px]">
                          <span className="text-[9px] font-mono text-emerald-400 font-extrabold tracking-widest block uppercase">SCAN SCORE RESULTS</span>
                          <h4 className="text-sm font-bold text-white">Target ATS Match: {activeResumeAnalysis.atsScore}%</h4>
                          <p className="text-[10.5px] text-zinc-400 leading-normal">{activeResumeAnalysis.summary}</p>
                        </div>

                        {/* Simple SVG circle loader */}
                        <div className="relative h-16 w-16 shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="26" stroke="#1f2937" strokeWidth="4.5" fill="transparent" />
                            <circle cx="32" cy="32" r="26" stroke="#4f46e5" strokeWidth="4.5" fill="transparent"
                              strokeDasharray={2 * Math.PI * 26}
                              strokeDashoffset={2 * Math.PI * 26 * (1 - activeResumeAnalysis.atsScore / 100)}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-black font-mono">
                            {activeResumeAnalysis.atsScore}%
                          </div>
                        </div>
                      </div>

                      {/* Job Role Suitability Status */}
                      <div className={`p-4 rounded-3xl border transition-all ${
                        activeResumeAnalysis.isSuitable 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-white' 
                          : 'bg-amber-500/5 border-amber-500/20 text-white'
                      }`}>
                        <div className="flex items-center space-x-2.5 mb-2">
                          <div className={`p-1.5 rounded-xl ${
                            activeResumeAnalysis.isSuitable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {activeResumeAnalysis.isSuitable ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">Role Alignment Check</span>
                            <h4 className="text-xs font-bold font-sans">
                              Suitability Verdict: <span className={activeResumeAnalysis.isSuitable ? 'text-emerald-400' : 'text-amber-400'}>{activeResumeAnalysis.suitabilityVerdict}</span>
                            </h4>
                          </div>
                        </div>
                        <p className="text-[10.5px] text-zinc-350 leading-relaxed">{activeResumeAnalysis.suitabilityExplanation}</p>
                      </div>

                      {/* Things that must be added to the resume */}
                      {activeResumeAnalysis.thingsToAddToResume && activeResumeAnalysis.thingsToAddToResume.length > 0 && (
                        <div className="bg-zinc-900/40 border border-zinc-850/60 p-4 rounded-3xl space-y-2.5">
                          <div className="flex items-center space-x-2 text-indigo-400">
                            <PlusCircle className="w-4 h-4 shrink-0" />
                            <h4 className="text-[10px] uppercase font-mono tracking-wider font-bold">Things Needed to be Added to Resume</h4>
                          </div>
                          <div className="space-y-1.5">
                            {activeResumeAnalysis.thingsToAddToResume.map((item, i) => (
                              <div key={i} className="flex items-start space-x-2 bg-black/20 p-2.5 rounded-xl border border-zinc-850/30">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                                <p className="text-[10.5px] text-zinc-350 leading-normal">{item}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Keywords match check grids */}
                      <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-850/40 space-y-2">
                        <h4 className="text-[10.5px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Keyword Optimization matches</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {activeResumeAnalysis.keywordMatches.map((kw, i) => (
                            <div key={i} className="flex items-center space-x-2 text-[10px] bg-black/25 p-1.5 px-3 rounded-lg border border-zinc-850/20">
                              {kw.matched ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              )}
                              <span className={`truncate ${kw.matched ? 'text-zinc-300' : 'text-zinc-500 line-through'}`}>{kw.word}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Missing skills */}
                      {activeResumeAnalysis.missingSkills.length > 0 && (
                        <div className="p-3 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-1.5">
                          <h4 className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Missing industry keywords
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {activeResumeAnalysis.missingSkills.map((sk, i) => (
                              <span key={i} className="text-[9px] bg-orange-500/10 text-orange-300 font-mono p-1 px-2.5 rounded-lg border border-orange-500/15">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations split layout info panels */}
                      <div className="space-y-2">
                        <h4 className="text-[10.5px] uppercase font-mono text-zinc-450 block font-bold">Recommendations Details</h4>
                        
                        <div className="space-y-1.5">
                          {activeResumeAnalysis.improvements.map((str, i) => (
                            <div key={i} className="p-2.5 bg-[#0b0c10] border border-zinc-850/60 rounded-xl flex items-start space-x-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                              <p className="text-[10.5px] text-zinc-350 leading-normal">{str}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* SCREEN 4: DASHBOARDS */}
              {activeTab === 'dashboard' && (
                <div className="space-y-5 pb-24 animate-fade-in text-left">
                  
                  <button
                    onClick={() => setActiveTab('home')}
                    className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-xl mb-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                  </button>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block font-sans">Analytics Hub</span>
                    <h2 className="text-xl font-bold tracking-tight text-white font-sans">Appraisal Dashboard</h2>
                    <p className="text-[11px] text-zinc-450">Track historical performance dimensions and simulated STAR index trends.</p>
                  </div>

                  {/* Historical progress analytics chart */}
                  <div className="bg-gradient-to-b from-[#101423] to-[#04060b] border border-indigo-900/15 p-4 rounded-3xl space-y-3">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#818CF8] font-black">Performance Progression Curve</h4>
                    
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={interviewHistory.map((item, i) => ({
                            name: `T-${i + 1}`,
                            score: item.score
                          }))}
                          margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#52525b" fontSize={9} domain={[50, 100]} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', fontSize: 10 }} />
                          <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Areas for focus lists */}
                  <div className="bg-[#0c0f18] border border-indigo-950/20 p-4 rounded-3xl space-y-3">
                    <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">Aggregated Weakness Targets</span>
                    
                    <div className="space-y-2">
                      {[
                        { title: 'Convoluted Project STAR Results', desc: 'Missing active metrics quantifiers like runtime margins or cost parameters.' },
                        { title: 'Superficial Caching Definitions', desc: 'Verify knowledge of eviction policies under high concurrency patterns.' },
                        { title: 'Cluttered Resume Core layout', desc: 'Ensure strict chronological patterns without multi-column graphical dividers.' }
                      ].map((weak, idx) => (
                        <div key={idx} className="p-3 bg-black/30 border border-zinc-800/10 rounded-2xl">
                          <h4 className="text-xs font-bold text-white mb-0.5">{weak.title}</h4>
                          <span className="text-[10px] text-zinc-450 leading-relaxed block">{weak.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Full list of assessments */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest block font-serif">Historical Sessions Files</span>
                    
                    <div className="space-y-2">
                      {interviewHistory.map((item, index) => (
                        <div
                          key={item.id || index}
                          onClick={() => setViewingRecordDetail(item)}
                          className="p-3 bg-zinc-900/60 border border-zinc-800/20 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-zinc-850/80 transition"
                        >
                          <div className="flex items-center space-x-3 text-left">
                            <div className="bg-[#111] p-2 rounded-xl text-zinc-400 font-mono text-[9px]">
                              {item.category.slice(0, 3).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white truncate max-w-[190px]">{item.role}</h4>
                              <span className="text-[10px] text-zinc-450 block">{item.company} • {item.difficulty}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 p-1 px-2 rounded-xl">{item.score}%</span>
                            <ChevronRight className="w-4 h-4 text-zinc-650" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* SCREEN 4.5: CLOUD DEPLOYMENT & DEVOPS BLUEPRINTS */}
              {activeTab === 'cloudhub' && (
                <CloudHub onBack={() => setActiveTab('home')} showToast={showToast} />
              )}

              {/* SCREEN 5: WORKSPACE PROFILE EDITORS */}
              {activeTab === 'profile' && (
                <div className="space-y-4 pb-24 animate-fade-in text-left">
                  
                  <button
                    onClick={() => setActiveTab('home')}
                    className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-xl mb-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                  </button>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">System Identity</span>
                    <h2 className="text-xl font-bold tracking-tight text-white font-sans">Set Profile Settings</h2>
                    <p className="text-[11px] text-zinc-450">Track default profile structures customizable globally across interviews.</p>
                  </div>

                  {/* Avatar info */}
                  <div className="bg-zinc-900/80 p-4 border border-zinc-850 rounded-3xl flex items-center space-x-3 text-left">
                    <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-black rounded-2xl text-lg shadow-md">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{userName}</h4>
                      <span className="text-[10px] text-zinc-400 block">{userEmail}</span>
                    </div>
                  </div>

                  {/* Config settings */}
                  <div className="space-y-3 bg-zinc-900/30 p-4 border border-zinc-850/50 rounded-3xl">
                    <span className="text-[9.5px] uppercase font-mono tracking-widest text-zinc-500 font-extrabold block mb-2">Configure Parameters</span>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Your Display Name</label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Target Role Target</label>
                        <input
                          type="text"
                          value={userGoal}
                          onChange={(e) => setUserGoal(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Your Email</label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black py-2 rounded-xl mt-3 px-4 font-mono uppercase transition cursor-pointer shrink-0"
                    >
                      Save Profile Parameters
                    </button>
                  </div>

                  {/* Reset indicators */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono uppercase text-zinc-550 block font-bold">System Maintenance & Session</span>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full bg-[#1b223c] hover:bg-[#252f53] text-indigo-300 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Log Out / Switch Account</span>
                    </button>

                    <button
                      onClick={handleResetSystemCache}
                      className="w-full bg-red-500/10 border border-red-500/10 hover:bg-red-500/15 text-red-400 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Purge Local System Memory</span>
                    </button>
                  </div>

                </div>
              )}

            </main>

            {/* FLOATING GLASS INDIGO ASSISTANT DRAWER PANEL */}
            {mentorOpen && (
              <div className="absolute inset-x-0 bottom-0 top-16 bg-black/95 backdrop-blur-xl z-50 flex flex-col justify-between transition-all duration-300">
                
                {/* Drawer header */}
                <div className="bg-indigo-950/20 p-4 border-b border-zinc-850/60 flex items-center justify-between text-left">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        Ask MS System Coach
                      </h4>
                      <span className="text-[9px] text-emerald-400 font-mono tracking-widest uppercase">● Online</span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setMentorOpen(false)}
                    className="inline-flex items-center space-x-1 p-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs rounded-xl transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back</span>
                  </button>
                </div>

                {/* Live Message listings space */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-left" style={{ scrollbarWidth: 'none' }}>
                  {mentorMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 max-w-[85%] rounded-3xl text-xs leading-relaxed space-y-1.5 ${
                        msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-900/90 text-zinc-200 border border-zinc-850'
                      }`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                        <span className="text-[7.5px] font-mono text-zinc-500 block text-right">
                          {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {mentorLoading && (
                    <div className="p-2.5 bg-zinc-900 border border-zinc-850/50 rounded-2xl text-xs text-zinc-400 inline-flex items-center space-x-2">
                      <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
                      <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
                      <span>Synthesizing coaching checklist...</span>
                    </div>
                  )}
                  <div ref={mentorEndRef} />
                </div>

                {/* Suggestion items */}
                <div className="p-3 bg-zinc-950 border-t border-zinc-850/50 flex flex-nowrap gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {[
                    "Stripe webhooks alignment",
                    "Resume metrics checklist",
                    "STAR behavioral layout example"
                  ].map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => launchMentorSuggestion(sug)}
                      className="text-[10px] bg-zinc-900 hover:bg-zinc-850 text-indigo-300 border border-indigo-500/20 p-1.5 px-3 rounded-full whitespace-nowrap cursor-pointer transition shrink-0"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {/* Input block */}
                <div className="p-4 bg-zinc-950 border-t border-zinc-850/50 flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={mentorInput}
                    onChange={(e) => setMentorInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMentorMessage()}
                    placeholder="Ask MS advice on scaling or behavioralSTAR..."
                    className="flex-1 bg-zinc-900 rounded-2xl text-xs p-3 border border-zinc-850/80 text-white focus:outline-none"
                  />
                  <button
                    onClick={handleSendMentorMessage}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* FULL HISTORIC MODAL DETAIL OVERLAYS */}
            {viewingRecordDetail && (
              <div className="absolute inset-0 bg-black/95 z-50 flex flex-col justify-between transition-all duration-300">
                
                {/* Detail header */}
                <div className="bg-[#101423] p-4 border-b border-zinc-850 flex items-center justify-between text-left">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 text-white p-2 rounded-xl text-xs font-mono font-bold uppercase tracking-widest">
                      {viewingRecordDetail.category.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[170px]">{viewingRecordDetail.role}</h4>
                      <span className="text-[10px] text-zinc-455">{viewingRecordDetail.company} • {viewingRecordDetail.difficulty}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewingRecordDetail(null)}
                    className="inline-flex items-center space-x-1 p-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs rounded-xl transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back</span>
                  </button>
                </div>

                {/* Detail scrolling metrics body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left" style={{ scrollbarWidth: 'none' }}>
                  
                  {/* Score breakdown bar */}
                  <div className="bg-zinc-900 p-4 rounded-3xl border border-zinc-800 text-center space-y-2">
                    <span className="text-[9px] font-mono text-indigo-400 block tracking-widest uppercase">COMPOSITE RATING</span>
                    <h3 className="text-3xl font-black text-white">{viewingRecordDetail.score}%</h3>
                    <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-zinc-850/40">
                      {[
                        { label: 'COM', val: viewingRecordDetail.metrics.communication },
                        { label: 'TEC', val: viewingRecordDetail.metrics.technical },
                        { label: 'CON', val: viewingRecordDetail.metrics.confidence },
                        { label: 'SOL', val: viewingRecordDetail.metrics.problemSolving },
                        { label: 'CLA', val: viewingRecordDetail.metrics.clarity }
                      ].map((bar) => (
                        <div key={bar.label} className="bg-black/30 p-1 rounded-md text-center">
                          <span className="text-[8px] text-zinc-500 block">{bar.label}</span>
                          <span className="text-[9.5px] font-bold text-white">{bar.val}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback texts */}
                  <div className="bg-[#0b0c10] border border-zinc-850 p-4 rounded-3xl space-y-3 prose prose-invert overflow-auto text-xs text-zinc-300">
                    <ReactMarkdown>{viewingRecordDetail.feedback}</ReactMarkdown>
                  </div>

                  {/* Question & Answers logs */}
                  {viewingRecordDetail.questions && viewingRecordDetail.questions.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold block">Interview Transcript logs</span>
                      
                      <div className="space-y-3">
                        {viewingRecordDetail.questions.map((q, idx) => (
                          <div key={idx} className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-850/60 text-xs space-y-1.5">
                            <span className="text-[9.5px] font-mono font-bold text-indigo-400">Q{idx + 1}: {q.questionText}</span>
                            <p className="text-zinc-350 bg-black/35 p-2 rounded-xl border border-zinc-850/50 leading-relaxed font-sans">{q.answerText}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                <div className="p-4 bg-zinc-950 border-t border-zinc-850">
                  <button
                    onClick={() => setViewingRecordDetail(null)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl py-2 px-4 text-xs font-bold transition"
                  >
                    Dismiss Session logs
                  </button>
                </div>

              </div>
            )}


          {/* Real Full Screen Immersive Bottom Navigation Dock */}
          <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-[#080a0f]/95 backdrop-blur-md border border-zinc-850 rounded-[24px] py-1.5 px-3 flex items-center justify-between select-none z-45 shadow-[0_16px_40px_rgba(0,0,0,0.85)]">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'interview', label: 'Interview', icon: Play },
              { id: 'resume', label: 'Resume', icon: FileText },
              { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
              { id: 'profile', label: 'Profile', icon: User }
            ].map((navTab) => {
              const isActive = activeTab === navTab.id;
              const IconComp = navTab.icon;
              return (
                <button
                  key={navTab.id}
                  onClick={() => {
                    setActiveTab(navTab.id as any);
                  }}
                  className={`flex flex-col items-center flex-1 cursor-pointer transition-all py-1.5 group ${
                    isActive ? 'text-indigo-400 font-extrabold scale-105' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <IconComp className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400 fill-indigo-500/10' : ''}`} />
                  <span className="text-[9px] mt-0.5 tracking-tight">{navTab.label}</span>
                </button>
              );
            })}
          </nav>

        </div>
      )}

    </div>
  );
}
