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
  Database
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
    role: "Senior Full-Stack Engineer",
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
    return "The four core pillars of Object-Oriented Programming (OOP) in Java are Encapsulation, Inheritance, Polymorphism, and Abstraction. Encapsulation is the practice of wrapping data (variables) and code (methods) together as a single unit. In Java, we achieve this by making class variables private and exposing them through public getter and setter methods. Encapsulation improves maintainability by hiding the internal state of an object and restricting direct access. This prevents external code from accidentally corrupting the object's state and allows you to change the internal implementation without breaking other parts of the application. For example, you can add validation logic inside a setter method to ensure data integrity.";
  }
  if (q.includes("differences between list, set, and map") || (q.includes("hashmap") && q.includes("treemap"))) {
    return "In the Java Collections Framework, List, Set, and Map serve different purposes. A List is an ordered collection that allows duplicate elements (e.g., ArrayList). A Set is an unordered collection that prohibits duplicate elements (e.g., HashSet). A Map stores key-value pairs where each unique key maps to a single value (e.g., HashMap). You would choose a HashMap over a TreeMap when you need fast, constant-time performance (O(1)) for basic operations like insert, delete, and locate, and do not care about the order of the keys. In contrast, TreeMap maintains its keys in sorted order but has a higher time complexity of O(log n) for these operations.";
  }
  if (q.includes("volatile variables") || q.includes("memory visibility in java")) {
    return "In Java multithreading, volatile variables and synchronized blocks ensure memory visibility and thread coordination. By default, threads may cache variables locally for performance. Marking a variable as volatile guarantees that every read and write goes directly to main memory, ensuring all threads see the most up-to-date value instantly. However, volatile only ensures visibility, not atomicity. For operations that require multiple steps to be executed safely, synchronized blocks are used. A synchronized block locks an object, allowing only one thread to execute the code at a time. This guarantees both visibility and atomicity, preventing race conditions when multiple threads modify shared resources.";
  }
  if (q.includes("modern exception handling") || q.includes("checked and unchecked exceptions")) {
    return "Java's exception handling uses try, catch, finally, and throw blocks to handle runtime errors gracefully. Exceptions are divided into checked and unchecked exceptions. Checked exceptions are checked at compile-time. The compiler forces you to handle them using a try-catch block or declare them in the method signature using the 'throws' keyword. Examples include IOException and SQLException. Unchecked exceptions, also called runtime exceptions, inherit from RuntimeException and are not checked at compile-time. They usually occur due to programming mistakes, such as NullPointerException or ArrayIndexOutOfBoundsException. You do not have to declare or catch unchecked exceptions, but it is good practice to write code that avoids them.";
  }
  if (q.includes("jdbc") || q.includes("connection pooling")) {
    return "JDBC (Java Database Connectivity) is a standard Java API that allows applications to connect to and interact with relational databases. Opening and closing a database connection for every query is extremely slow and resource-heavy because of the network handshake. Connection pooling solves this issue by creating a cache of reusable database connections when the application starts. When a query needs to run, the application borrows an active connection from the pool, runs the query, and returns the connection to the pool. This eliminates the delay of creating new connections, reducing database read/write latency and improving overall application performance. Popular connection pooling libraries include HikariCP.";
  }
  if (q.includes("spring boot") || q.includes("dependency injection")) {
    return "Spring Boot simplifies Java enterprise development through dependency injection (DI) and auto-configuration. Dependency injection allows the Spring container to automatically manage and inject objects (beans) into your classes using annotations like @Autowired, reducing manual object creation. Spring Boot goes a step further by offering auto-configuration, which automatically sets up your application based on the starter dependencies (like spring-boot-starter-web) added to your project. It configures default settings, such as an embedded Tomcat server, database connections, and security, removing the need for complex XML configurations. This allows developers to focus entirely on writing business logic quickly.";
  }
  if (q.includes("jvm") || q.includes("garbage collector")) {
    return "The Java Virtual Machine (JVM) consists of three main components: the Class Loader, the Runtime Data Areas (Memory), and the Execution Engine. The Class Loader loads Java classes into memory. The Runtime Data Areas divide memory into the Stack (for thread-specific local variables) and the Heap (for objects). The Execution Engine runs the compiled bytecode. The Garbage Collector (GC) is part of the Execution Engine and automatically manages memory on the Heap. It identifies which objects are still in use by tracking active references. Objects that are no longer referenced are marked as garbage and deleted to free up memory, preventing memory leaks and manual memory management.";
  }
  if (q.includes("heap vs. stack") || q.includes("outofmemoryerror")) {
    return "In Java, memory is divided into the Heap and the Stack. The Stack is used for static memory allocation and thread execution. It stores primitive variables and references to objects, with memory allocated and freed in a LIFO (Last In, First Out) order. The Heap is used for dynamic memory allocation, storing all actual objects created during runtime. To prevent OutOfMemoryError, you should avoid holding references to objects that are no longer needed, allowing the Garbage Collector to clean them up. Additionally, you should avoid creating unnecessary large objects in loops, use streaming instead of loading whole datasets into memory, and configure appropriate JVM memory sizes using arguments like -Xmx.";
  }
  if (q.includes("java 8 features") || q.includes("streams api") || q.includes("lambda expressions")) {
    return "Java 8 introduced major features to support functional programming. A functional interface is an interface that contains exactly one abstract method, such as Runnable or Predicate. Lambda expressions provide a clear and concise way to implement these functional interfaces without writing anonymous classes. The Streams API was introduced to process collections of objects in a declarative manner. It allows developers to perform operations like filtering, mapping, and sorting on data sequences efficiently and concurrently. Together, these features make Java code much more readable, reduce boilerplate code, and make parallel data processing extremely simple to write.";
  }
  if (q.includes("singleton or factory") || q.includes("design pattern")) {
    return "In Java, design patterns help solve common software design problems. The Singleton pattern ensures a class has only one instance and provides a global point of access to it. It is implemented by making the constructor private and providing a public static method that returns the single instance, often using double-checked locking for thread safety. The Factory pattern is a creational pattern used to create objects without exposing the instantiation logic to the client. Instead of using the 'new' keyword directly, the client calls a factory method, which returns an instance of a shared interface. This promotes loose coupling and simplifies object creation.";
  }

  // Python Pool
  if (q.includes("oop (object-oriented programming) in python") || q.includes("inheritance and polymorphism")) {
    return "Object-Oriented Programming (OOP) in Python organizes code around objects and classes. A class is a blueprint, and an object is an instance of that blueprint. Python supports inheritance, which allows a new child class to adopt the attributes and methods of an existing parent class, promoting code reuse. Polymorphism allows different classes to have methods with the same name but different behaviors, so the correct method is called automatically based on the object. Python also supports encapsulation to protect data by prefixing attributes with double underscores to make them private, and abstraction to hide complex details using abstract classes from the abc module.";
  }
  if (q.includes("decorators in python") || q.includes("custom decorator")) {
    return "A decorator in Python is a design pattern that allows you to modify or extend the behavior of a function or method without changing its actual code. Decorators wrap another function, executing code before and after the wrapped function runs. To write a custom decorator to measure execution time, you import the time module, define a nested wrapper function inside the decorator, record the start time, execute the original function, record the end time, calculate the difference, print it, and return the function's result. This is extremely useful for logging, authentication, and performance monitoring.";
  }
  if (q.includes("python generators") || q.includes("memory-efficient compared to normal list returns")) {
    return "Python generators are special functions that return an iterator and generate values on the fly, one at a time, instead of storing them all in memory. They are defined using the 'yield' keyword instead of 'return'. When a generator function is called, it pauses its execution and saves its state, resuming from that exact spot the next time a value is requested. This makes generators highly memory-efficient because they do not build and keep the entire list in memory. For example, iterating over a list of a million items requires substantial memory, whereas a generator only consumes memory for a single item at any given time.";
  }
  if (q.includes("list comprehension in python") || q.includes("squared_evens")) {
    return "A list comprehension in Python offers a concise syntax to create lists. To filter and square even numbers, you can write: `squared_evens = [x**2 for x in numbers if x % 2 == 0]`. This single line replaces a multi-line loop. Its performance advantage comes from the fact that list comprehensions are optimized internally in C-level Python bytecode. They avoid the overhead of repeatedly calling the list's append method inside a standard for-loop, resulting in faster execution times. It also makes the code much more readable and pythonic when dealing with simple mapping and filtering tasks.";
  }
  if (q.includes("vector operations") || q.includes("numpy array structures")) {
    return "NumPy is a powerful Python library designed for scientific computing. Unlike standard Python lists, NumPy arrays support vectorized operations, which allow you to perform arithmetic operations element-wise on entire arrays without using slow loops. For instance, adding two arrays `A + B` automatically adds corresponding elements. For matrix multiplication, NumPy provides the `@` operator or the `np.dot()` function. NumPy achieves high performance through 'vectorization' and 'broadcasting', executing operations in compiled C-code underneath. This makes numerical computations and data processing on large datasets incredibly fast and memory-efficient.";
  }
  if (q.includes("pandas dataframes") || q.includes("missing values")) {
    return "A Pandas DataFrame is a two-dimensional, tabular data structure with labeled rows and columns, similar to an Excel sheet or SQL table. To handle missing values, Pandas provides methods like `df.dropna()` to remove rows with null values, or `df.fillna(value)` to replace missing cells with a default value or column mean. To perform groupings and aggregate data, you use `df.groupby('column_name').mean()`. This groups the rows by a specific category and calculates a statistic (like average or sum) for each group, making data analysis and exploration simple and efficient.";
  }
  if (q.includes("flask framework") || q.includes("simple rest api endpoint")) {
    return "Flask is a lightweight micro-framework in Python. To design a simple REST API endpoint, you import Flask and jsonify, initialize the app, and define a route using the `@app.route` decorator, specifying the HTTP method (e.g., GET or POST). Inside the associated function, you fetch or process your data and return it wrapped in `jsonify(data)` along with an HTTP status code, such as 200 for success. Finally, you run the application. Flask handles routing and response serialization automatically, making it easy to build simple, modular microservices in a clean and understandable way.";
  }
  if (q.includes("django") || q.includes("mvt")) {
    return "Django is a high-level Python framework that follows the Model-View-Template (MVT) architectural pattern. The Model represents the data structure and interacts with the database using Django's built-in Object-Relational Mapper (ORM). The View handles the business logic, receives HTTP requests, interacts with the Model to fetch data, and determines which template to render. The Template is the presentation layer, containing HTML and special template tags to display dynamic data to the user. Django routes incoming URLs to the appropriate View, which coordinates the Model and Template to return a complete response, promoting clean separation of concerns.";
  }
  if (q.includes("try-except-finally blocks") || q.includes("custom exceptions")) {
    return "In Python, we handle runtime errors using try-except-finally blocks to keep the application from crashing. The 'try' block contains the code that might throw an error. The 'except' block catches and handles specific exceptions, such as ValueError or ZeroDivisionError. The 'finally' block executes cleanup code that must run regardless of whether an exception occurred, like closing a database connection. Custom exceptions are user-defined error classes that inherit from Python's built-in Exception class. Creating custom exceptions improves code readability by providing domain-specific error messages that explain exactly what went wrong in your application.";
  }
  if (q.includes("deep copy and shallow copy") || q.includes("manage references")) {
    return "In Python, variables are references to objects in memory. When you copy an object, you can perform a shallow copy or a deep copy. A shallow copy creates a new outer object, but copies references to any nested objects inside it. This means changes to a nested object in the copy will affect the original. A deep copy, created using `copy.deepcopy()`, recursively copies the outer object and all nested objects, making them completely independent. Python manages memory using reference counting and a garbage collector to delete objects when their reference count drops to zero, preventing memory leaks.";
  }

  // AWS Pool
  if (q.includes("amazon ec2") || q.includes("on-demand and spot instances")) {
    return "Amazon Elastic Compute Cloud (EC2) provides secure, resizable virtual servers in the cloud, allowing you to launch and scale instances within minutes. On-Demand instances charge a fixed rate per second or hour with no long-term commitment, making them perfect for unpredictable workloads. Spot instances allow you to bid on spare AWS compute capacity at discounts of up to 90% off On-Demand prices. However, Spot instances can be terminated by AWS with a 2-minute warning if the capacity is needed elsewhere. You should use Spot instances for flexible, fault-tolerant tasks like batch processing or data analysis.";
  }
  if (q.includes("amazon s3") || q.includes("bucket policies")) {
    return "Amazon Simple Storage Service (S3) is an object storage service offering industry-leading scalability, data availability, and security. Bucket policies are JSON documents that define access permissions, controlling who can read or write objects. Versioning keeps multiple historical versions of an object in the same bucket, protecting against accidental deletions or overwrites. Lifecycle rules optimize storage costs by automatically moving objects to cheaper storage classes (like S3 Glacier) or deleting them after a specified period. This helps organize data efficiently while reducing monthly cloud hosting costs.";
  }
  if (q.includes("vpc") || q.includes("public and private subnets")) {
    return "To securely configure a Virtual Private Cloud (VPC), you split its network range into public and private subnets. Public subnets host resources that must be directly accessible from the internet, such as load balancers, and are connected to an Internet Gateway. Private subnets host sensitive backend resources like databases and application servers. To allow private subnet resources to securely download updates without exposing them to incoming internet traffic, you route their outbound traffic through a NAT Gateway placed in a public subnet. Security groups and network ACLs are configured to restrict traffic to only authorized ports.";
  }
  if (q.includes("iam roles") || q.includes("least privilege in aws")) {
    return "AWS Identity and Access Management (IAM) controls access to AWS resources. An IAM User represents a specific person or application with static credentials like passwords or API keys. An IAM Role has no permanent credentials and is assumed temporarily by services or users to perform tasks securely. IAM Policies are JSON documents that define permissions (actions allowed or denied on resources). To apply the principle of least privilege, you grant only the minimum permissions necessary for a user or role to complete their task, avoiding broad administrator access and ensuring secure access control.";
  }
  if (q.includes("amazon rds") || q.includes("multi-az replication")) {
    return "Amazon Relational Database Service (RDS) simplifies database administration tasks like patching, backups, and scaling. Configuring RDS with Multi-AZ (Availability Zone) replication provides high availability and disaster recovery. AWS automatically creates a primary database instance and synchronously replicates data to a standby instance in a different Availability Zone. If the primary instance fails, experiences a network outage, or undergoes maintenance, RDS automatically fails over to the standby instance without manual intervention or data loss. This keeps your application running smoothly with minimal downtime.";
  }
  if (q.includes("route 53") || q.includes("global dns resolution")) {
    return "Amazon Route 53 is a highly available and scalable Domain Name System (DNS) web service. It translates human-readable domain names into IP addresses. Route 53 manages global DNS resolution using routing policies. For high availability, you can configure a Failover Routing Policy. This routes traffic to a primary resource (such as an active load balancer) as long as it is healthy. Route 53 constantly monitors the primary resource using health checks. If the primary resource fails a health check, Route 53 automatically redirects DNS queries to a healthy standby resource in another region, ensuring continuous application availability.";
  }
  if (q.includes("application load balancers") || q.includes("distributing incoming application traffic")) {
    return "An Application Load Balancer (ALB) operates at the application layer (Layer 7) of the OSI model. Its primary role is to distribute incoming HTTP and HTTPS traffic across multiple targets, such as EC2 instances, containers, and IP addresses, grouped into Target Groups. ALB performs health checks on these targets, automatically routing traffic only to healthy instances. It supports advanced routing features, such as path-based routing (e.g., routing `/api` traffic to a different target group than `/images`) and host-based routing, helping you build highly scalable and fault-tolerant microservice architectures.";
  }
  if (q.includes("aws auto scaling") || q.includes("adjust ec2 capacity")) {
    return "AWS Auto Scaling monitors your applications and automatically adjusts Amazon EC2 capacity to maintain steady, predictable performance at the lowest possible cost. You define an Auto Scaling Group (ASG) with a minimum, maximum, and desired number of EC2 instances. You then configure scaling policies based on dynamic demand metrics from CloudWatch, such as average CPU utilization. If CPU usage exceeds 70%, Auto Scaling launches new EC2 instances to share the load. When demand drops and CPU usage falls, it terminates excess instances, saving money while ensuring your application remains responsive.";
  }
  if (q.includes("serverless computing on aws") || q.includes("aws lambda operates")) {
    return "Serverless computing allows developers to build and run applications without managing underlying servers or operating systems. AWS Lambda is a serverless compute service that runs your code in response to events, such as file uploads to S3, updates to DynamoDB tables, or API requests through API Gateway. Lambda operates on a pay-as-you-go model, charging only for the exact milliseconds your code runs. It scales automatically by launching separate execution environments for each incoming request. This ensures high performance during traffic spikes and scales down to zero when there is no activity.";
  }
  if (q.includes("cloudwatch") || q.includes("monitor infrastructure metrics")) {
    return "Amazon CloudWatch is a monitoring and management service designed for AWS resources and applications. It automatically collects and visualizes metrics like CPU usage, network activity, and disk reads from services such as EC2 and RDS. To monitor your system proactively, you can set up custom CloudWatch Alarms. You define thresholds for specific metrics, such as a CPU usage exceeding 80% for five minutes. When the threshold is crossed, the alarm triggers and automatically sends a notification through Amazon SNS (Simple Notification Service) or initiates an auto-scaling action to resolve the issue.";
  }

  // DevOps Pool
  if (q.includes("ci/cd") && q.includes("continuous automated software delivery")) {
    return "CI/CD stands for Continuous Integration and Continuous Deployment. Continuous Integration is the practice of automatically merging code changes from multiple developers into a shared repository, running automated tests to catch bugs early. Continuous Deployment automatically deploys those tested changes to production. This pipeline is crucial because it eliminates slow, manual deployment errors, shortens the software release cycle, and provides instant feedback to developers. It ensures that the production application is always in a stable, deployable state, allowing teams to deliver updates and hotfixes to users quickly and reliably.";
  }
  if (q.includes("jenkins") || q.includes("declarative pipelines")) {
    return "Jenkins is an open-source automation server used to build CI/CD pipelines. It uses a file called a 'Jenkinsfile' written in either Declarative or Scripted syntax to define the pipeline steps. In a typical pipeline, Jenkins pulls the latest code from Git, compiles the application, runs automated unit and integration tests, and packages the app. For secure deployments, Jenkins uses its Credentials Manager to store passwords, API keys, and SSH keys encrypted. These keys are injected into the pipeline at runtime without exposing them in the source code. This ensures safe and secure deployments to cloud platforms or servers.";
  }
  if (q.includes("docker image") && q.includes("running docker container")) {
    return "A Docker image is a read-only template that contains the application code, libraries, and dependencies needed to run an application. A Docker container is a live, running instance of that image, created by adding a thin read-write layer on top of the read-only image layers. Docker images are built in sequential layers specified by a Dockerfile. When you rebuild an image, Docker caches each layer. If a layer and the ones before it haven't changed, Docker reuses the cached layer instead of rebuilding it. This optimization speeds up the build process and reduces bandwidth and storage usage.";
  }
  if (q.includes("kubernetes") && q.includes("pods, deployments, and services")) {
    return "Kubernetes is an open-source container orchestration platform designed to automate deploying, scaling, and managing containerized applications. A Pod is the smallest deployable unit in Kubernetes, hosting one or more closely related containers that share storage and network resources. A Deployment is a controller that manages the lifecycle of Pods, ensuring the desired number of replicas are always running and handling zero-downtime updates. A Service defines a logical set of Pods and a policy to access them, providing a stable IP address and load balancing to route traffic to the correct healthy containers.";
  }
  if (q.includes("terraform") && q.includes("state locking")) {
    return "Terraform is an open-source Infrastructure as Code (IaC) tool that allows developers to define and provision cloud resources using a simple declarative configuration language. Terraform tracks the state of your real-world resources in a state file (`terraform.tfstate`). To prevent multiple team members from running configurations at the same time and causing deployment conflicts, Terraform uses state locking. When a developer starts a deployment, Terraform acquires a lock on the state file (usually stored in a secure backend like Amazon S3 or Consul). Other developers cannot make changes until the lock is released, ensuring data integrity.";
  }
  if (q.includes("git branching strategies") || q.includes("gitflow")) {
    return "Git branching strategies help teams manage code changes efficiently. In GitFlow, developers work on dedicated feature branches, which are merged into a 'develop' branch. Releases are prepared on 'release' branches before being merged into the 'main' branch for production. This is highly structured and great for scheduled releases. In trunk-based development, developers merge small, frequent updates directly into a single central branch called 'trunk' or 'main'. This strategy relies heavily on automated testing and feature flags to keep the main branch deployable, promoting rapid integration, faster feedback loops, and continuous deployment.";
  }
  if (q.includes("linux commands for diagnosing") || q.includes("cpu usage, memory bottlenecks")) {
    return "To diagnose system performance issues on Linux, developers use several essential commands. The `top` or `htop` command displays real-time CPU and memory usage, showing which processes are consuming the most resources. The `free -m` command shows total, used, and available physical memory in megabytes. To investigate disk space and read/write bottlenecks, `df -h` and `iostat` are used. For network and file issues, `lsof` lists open files and network connections, helping identify leaked file descriptors, while `ps aux` provides a snapshot of all active processes. These commands help administrators troubleshoot and resolve system slowdowns quickly.";
  }
  if (q.includes("proactive infrastructure monitoring") || q.includes("prometheus and grafana")) {
    return "Proactive monitoring is critical because it helps developers detect and resolve infrastructure issues before they affect end users. Prometheus is a powerful open-source monitoring tool that collects and stores metrics (such as CPU usage, database query times, and memory consumption) as time-series data at regular intervals. Grafana is a visualization tool that connects to Prometheus to display these metrics in beautifully designed, real-time dashboards. Together, they allow engineering teams to monitor system health, identify performance bottlenecks early, and configure automated alerts to notify team members when metrics cross safe thresholds.";
  }
  if (q.includes("ansible") || q.includes("agentless configuration")) {
    return "Ansible is an open-source configuration management and automation tool. It is 'agentless', meaning you do not need to install any special software or daemons on the target servers it manages. Instead, Ansible connects to target servers securely over standard SSH (for Linux) or WinRM (for Windows). Ansible uses simple, human-readable YAML files called 'Playbooks' to define the desired state of your infrastructure. When you execute a Playbook, Ansible pushes small programs (modules) to the servers, runs the defined tasks sequentially (like installing packages or creating users), and removes them, ensuring consistent, automated system configuration.";
  }
  if (q.includes("infrastructure as code (iac)") || q.includes("benefits of infrastructure as code")) {
    return "Infrastructure as Code (IaC) replaces manual, error-prone cloud environment setup with machine-readable definition files. The core benefits include consistency, speed, and version control. Since environments are defined in code, you can easily replicate identical environments (e.g., Development, Testing, and Production), eliminating the 'it works on my machine' problem. IaC allows you to spin up complex cloud resources in minutes instead of hours. Additionally, because IaC files are stored in Git, you can track changes over time, perform code reviews, and roll back to previous stable configurations instantly in case of an error.";
  }

  // Cloud Computing Pool
  if (q.includes("iaas, paas, and saas")) {
    return "Cloud computing offers three main delivery models. Infrastructure as Service (IaaS) provides virtualized computing resources, storage, and networking over the internet. Users manage the operating system, middleware, and applications (e.g., AWS EC2). Platform as a Service (PaaS) provides a pre-configured platform, allowing developers to deploy applications without managing servers or operating systems (e.g., Heroku). Software as a Service (SaaS) delivers complete, fully managed applications directly over the internet through a web browser (e.g., Google Workspace). Use IaaS for maximum control, PaaS for fast development, and SaaS for ready-to-use software.";
  }
  if (q.includes("virtualization in cloud") || q.includes("hypervisors")) {
    return "Virtualization is the foundational technology of cloud computing, allowing a single physical server to be split into multiple independent virtual machines (VMs). This is achieved using a software layer called a Hypervisor. The hypervisor runs directly on the physical hardware (Type 1) or on top of an operating system (Type 2). It allocates CPU, memory, and storage from the physical server to each virtual machine, ensuring complete isolation. This allows multiple different operating systems to run on the same physical hardware simultaneously, maximizing resource utilization, reducing hardware costs, and enabling the rapid scaling required by modern cloud providers.";
  }
  if (q.includes("public cloud, private cloud") || q.includes("hybrid cloud architectures")) {
    return "Public, Private, and Hybrid clouds offer different balances of cost and control. Public Cloud resources (like AWS or GCP) are owned and operated by a third-party provider, offering low upfront costs and high scalability, but with shared infrastructure. Private Cloud infrastructure is dedicated solely to one organization, offering maximum security, privacy, and control, but with high maintenance and hardware costs. Hybrid Cloud combines both, allowing data and applications to move between public and private clouds. This enables organizations to keep highly sensitive data secure in their private cloud while using the public cloud for scalable web applications.";
  }
  if (q.includes("cloud security best practices") || q.includes("protecting data at rest")) {
    return "Protecting data in the cloud requires robust encryption for both data at rest and data in transit. Data at rest (stored on disks or databases) should be protected using strong encryption standards like AES-256. Cloud providers manage this easily through Key Management Services (KMS). Data in transit (moving over the network) must be encrypted using Transport Layer Security (TLS/HTTPS) to prevent interception. Additionally, standard security practices include implementing Multi-Factor Authentication (MFA), enforcing the principle of least privilege using Identity and Access Management (IAM), performing regular security audits, and setting up firewalls to restrict public network access.";
  }
  if (q.includes("multi-region cloud") || q.includes("geographical disaster recovery")) {
    return "A multi-region architecture deploys applications across separate geographic locations (regions), such as US-East and EU-West. This provides high availability and disaster recovery by ensuring that if a natural disaster, power outage, or network failure takes down an entire cloud region, traffic is automatically routed to a healthy region using global DNS services like Route 53. Additionally, placing resources in multiple regions improves performance by serving users from the closest geographic location, reducing latency. Databases are synchronized using active-passive or active-active replication, ensuring data is preserved and accessible even during a major regional outage.";
  }
  if (q.includes("shared responsibility model") || q.includes("patching guest operating systems")) {
    return "The Shared Responsibility Model defines the security obligations of the cloud provider and the customer. Generally, the provider is responsible for security 'of' the cloud, which includes the physical security of data centers, virtualization software, and physical hardware. The customer is responsible for security 'in' the cloud, protecting their data, configuring firewalls, and managing access. For patching the guest operating system on a virtual server (like AWS EC2), the customer is responsible. However, in serverless or fully managed services (like AWS Lambda or RDS), the cloud provider automatically handles operating system patching and updates.";
  }
  if (q.includes("horizontal scaling vs vertical scaling")) {
    return "Horizontal scaling (scaling out) adds more servers or instances to your resource pool to share the load. This is appropriate for modern, stateless web applications because it allows for unlimited scaling and provides high fault tolerance by distributing traffic. Vertical scaling (scaling up) adds more power (CPU, RAM) to an existing server. This is appropriate for databases or applications that are difficult to partition, but it has a physical limit and creates a single point of failure. Cloud architectures favor horizontal scaling because auto-scaling groups can automatically add or remove instances based on real-time traffic demand.";
  }
  if (q.includes("content delivery networks") || q.includes("edge caching")) {
    return "Content Delivery Networks (CDNs) improve website loading times by storing copies of static files (like images, CSS, and videos) in multiple geographic locations called Edge Servers or Points of Presence (PoPs). When a user requests a file, the CDN automatically routes the request to the closest edge server. If the file is cached there, it is delivered instantly, bypassing the main origin server. This edge caching reduces global latency, saves bandwidth, and prevents the main server from becoming overloaded, ensuring a fast, reliable user experience regardless of where the user is located in the world.";
  }
  if (q.includes("cloud tenant isolation") || q.includes("multi-tenancy")) {
    return "Cloud tenant isolation ensures that different customers (tenants) sharing the same physical hardware cannot access or modify each other's data and applications. Public cloud providers achieve secure multi-tenancy through multiple layers of isolation. At the hardware level, hypervisors partition physical CPU and memory, ensuring strict boundary limits for virtual machines. At the network level, virtual networks (VPCs) isolate tenant traffic using private subnets, security groups, and routing tables. Additionally, databases and storage services use robust encryption keys managed separately for each tenant, ensuring complete data privacy and security in a shared environment.";
  }

  // AI/ML Pool
  if (q.includes("supervised, unsupervised, and reinforcement")) {
    return "Supervised, unsupervised, and reinforcement learning are the three main types of machine learning. Supervised learning trains a model using labeled data, meaning each input comes with the correct output (e.g., identifying spam emails). Unsupervised learning trains a model using unlabeled data, meaning the model finds hidden patterns or groups within the data on its own (e.g., customer segmentation). Reinforcement learning trains an agent to make decisions through trial and error. The agent receives feedback in the form of rewards or penalties, learning to maximize its reward over time, commonly used in game-playing or robotics.";
  }
  if (q.includes("deep learning") && q.includes("hierarchical representations")) {
    return "Deep Learning is a subset of machine learning based on artificial neural networks with multiple hidden layers. These deep networks learn complex representations by processing data through a hierarchy of abstraction. Each layer of the network extracts increasingly complex features. For example, in image recognition, the first layer might detect simple edges, the middle layers might combine those edges to detect shapes like circles or squares, and the final layers might identify complex objects like faces or cars. The network learns by passing inputs forward, calculating the error, and adjusting its weights backward using backpropagation.";
  }
  if (q.includes("convolutional neural network") || q.includes("cnn") || q.includes("convolutional layers")) {
    return "A Convolutional Neural Network (CNN) is a type of deep neural network designed for processing visual data like images. Unlike standard networks, CNNs use convolutional layers that apply small mathematical filters (kernels) to slide across the input image. As the filter slides, it performs matrix multiplications to detect local spatial features, such as horizontal lines, vertical edges, and color patterns, while preserving the spatial relationships between pixels. Pooling layers are then used to reduce the size of the data. This allows the network to learn translation-invariant features, making CNNs exceptionally powerful for image classification and object detection.";
  }
  if (q.includes("recurrent neural networks") || q.includes("lstms mitigate vanishing gradients")) {
    return "Recurrent Neural Networks (RNNs) are designed to process sequential data, such as text, audio, or time-series data, where the order of inputs matters. RNNs achieve this by maintaining a 'hidden state' that acts as a memory, carrying information from previous steps to the current step. However, standard RNNs struggle with long sequences due to the 'vanishing gradient' problem, where errors shrink exponentially during training, causing the network to forget long-term dependencies. Long Short-Term Memory (LSTM) networks solve this by introducing cell states and gating mechanisms (forget, input, and output gates) to selectively store and update information over long periods.";
  }
  if (q.includes("natural language processing") || q.includes("tokenization and embedding")) {
    return "Natural Language Processing (NLP) is a branch of artificial intelligence that helps computers understand, interpret, and generate human language. Because computers can only process numbers, text must undergo tokenization and embedding. Tokenization breaks down raw text into smaller pieces called tokens (which can be words, characters, or subwords). These tokens are then mapped to unique numerical IDs. Word embeddings (such as Word2Vec or modern Transformer embeddings) translate these IDs into high-dimensional vectors. These vectors represent words in a continuous semantic space, allowing the model to capture the meaning and relationships between different words mathematically.";
  }
  if (q.includes("large language models") || q.includes("transformer architecture") || q.includes("self-attention")) {
    return "Large Language Models (LLMs) are deep learning models trained on massive amounts of text to understand and generate human-like content. LLMs are built on the Transformer architecture, which relies on the self-attention mechanism. Unlike older sequential models, self-attention allows the model to process all words in a sentence simultaneously and weigh the importance of other words relative to the current word, regardless of their distance. For example, in 'the bank of the river', self-attention helps the model connect 'bank' to 'river' rather than a financial institution, capturing deep contextual relationships and producing highly coherent language generation.";
  }
  if (q.includes("gradient descent") || q.includes("learning rates")) {
    return "Gradient Descent is an optimization algorithm used to minimize a machine learning model's error (loss function) by iteratively adjusting its weights. The algorithm calculates the gradient, which shows the direction of the steepest increase in error, and moves the weights in the opposite direction. The learning rate is a small step-size multiplier that controls how large of an adjustment is made in each iteration. If the learning rate is too high, the model may overshoot the minimum and fail to converge. If the learning rate is too low, training will be extremely slow, taking too long to reach the optimal solution.";
  }
  if (q.includes("overfitting") && (q.includes("regularization") || q.includes("dropout") || q.includes("early stopping"))) {
    return "Overfitting occurs when a machine learning model learns the training data too well, including its noise and random fluctuations. As a result, the model performs exceptionally on training data but fails to generalize to new, unseen testing data. To prevent overfitting, you can use several techniques. Regularization (L1 or L2) adds a penalty to the loss function to keep weights small. Dropout temporarily disables random neurons during training, forcing the network to learn robust, redundant representations. Early stopping monitors the validation error and halts training as soon as the validation performance begins to degrade, ensuring optimal generalizability.";
  }
  if (q.includes("feature engineering") || q.includes("input representations")) {
    return "Feature Engineering is the process of transforming raw, unstructured data into meaningful features that better represent the underlying problem to the machine learning model. This is crucial because a model's performance depends heavily on the quality of its inputs. Even the most advanced algorithms cannot learn effectively if the inputs contain irrelevant, noisy, or poorly structured data. Feature engineering steps include normalizing numbers, converting text into vector embeddings, handling missing values, and combining variables to highlight key patterns. Good feature engineering simplifies the learning process, improves model accuracy, and significantly reduces the training time needed.";
  }
  if (q.includes("evaluate machine learning models") || q.includes("precision, recall")) {
    return "Evaluating a model depends on the type of problem. Accuracy measures the percentage of correct predictions out of all predictions, but it can be misleading in imbalanced datasets. Precision measures the ratio of true positive predictions to all predicted positives, answering: 'Of those predicted positive, how many were correct?'. Recall measures the ratio of true positives to all actual positives, answering: 'How many actual positives did we catch?'. The F1-score is the harmonic mean of precision and recall, providing a balanced evaluation metric when dealing with imbalanced classes, ensuring both false positives and false negatives are minimized.";
  }

  // Aptitude Pool
  if (q.includes("laptop is bought for $800") || q.includes("profit percentage")) {
    return "To find the profit percentage, first calculate the actual profit made. The profit is the selling price minus the cost price: $1000 - $800 = $200. Next, divide this profit by the original cost price: $200 / $800 = 0.25. To convert this value into a percentage, multiply by 100: 0.25 * 100 = 25%. Therefore, the profit percentage is 25%. This corresponds to option C.";
  }
  if (q.includes("clock shows exactly 3:15") || q.includes("angle in degrees between the hour hand and the minute hand")) {
    return "At exactly 3:15, the minute hand points directly at the 3 (which represents 15 minutes, or 90 degrees from the top). However, the hour hand has moved slightly past the 3 because 15 minutes have passed. In one hour (60 minutes), the hour hand moves 30 degrees (since 360 / 12 = 30). In 15 minutes, the hour hand moves (15 / 60) * 30 = 7.5 degrees. Therefore, the hour hand is at 90 + 7.5 = 97.5 degrees. The difference between the hands is 97.5 - 90 = 7.5 degrees. This corresponds to option B.";
  }
  if (q.includes("5 workers can build a wall") || q.includes("6 workers to build the same wall")) {
    return "To solve this problem, we use the inverse relationship between the number of workers and the time taken. First, calculate the total amount of work in terms of 'worker-days'. Since 5 workers build the wall in 12 days, the total work required is 5 * 12 = 60 worker-days. If we now have 6 workers performing the same total work, we divide the total worker-days by the number of workers: 60 worker-days / 6 workers = 10 days. Therefore, it will take 6 workers exactly 10 days to build the wall. This corresponds to option B.";
  }
  if (q.includes("train travels at a speed of 60") || q.includes("travel in 2.5 hours")) {
    return "To calculate the distance traveled, use the formula: Distance = Speed * Time. In this problem, the speed of the train is given as 60 miles per hour (mph), and the time of travel is 2.5 hours. Multiplying these values together: Distance = 60 mph * 2.5 hours = 150 miles. Therefore, the train will travel a total distance of 150 miles in 2.5 hours. This corresponds to option B.";
  }
  if (q.includes("next number in the logical series: 2, 6, 12")) {
    return "To find the next number in the series, look at the difference between consecutive numbers: From 2 to 6, the difference is +4; From 6 to 12, the difference is +6; From 12 to 20, the difference is +8; From 20 to 30, the difference is +10. The differences form a clear sequence of even numbers: +4, +6, +8, +10. The next difference must be +12. Adding 12 to the last number: 30 + 12 = 42. This corresponds to option C.";
  }
  if (q.includes("pointing to a photograph, amit said")) {
    return "Let's break down the relationships step-by-step: 'My grandfather' refers to Amit's grandfather. 'The only son of my grandfather' refers to Amit's father (since his grandfather has only one son). 'Her father' is this only son, which means the girl's father is Amit's father. Since Amit and the girl in the photograph share the same father, the girl must be Amit's sister. Therefore, Amit was looking at a photograph of his sister. This corresponds to option A.";
  }
  if (q.includes("odd one out") && q.includes("carrot")) {
    return "To find the odd one out, look at the categories of the items: Apple is a fruit. Banana is a fruit. Carrot is a root vegetable. Grape is a fruit. Since Apple, Banana, and Grape are all sweet fruits growing on trees or vines, while Carrot is a vegetable that grows underground, Carrot is the odd one out. This corresponds to option C.";
  }
  if (q.includes("apple") && q.includes("eppla") && q.includes("grape")) {
    return "Let's analyze the coding pattern of 'APPLE' turning into 'EPPLA': The first letter 'A' and the last letter 'E' are swapped, so 'A' moves to the end and 'E' moves to the front. The middle letters 'P', 'P', 'L' remain in their exact positions. Applying this exact rule to 'GRAPE': Swap the first letter 'G' and the last letter 'E', putting 'E' at the front and 'G' at the end. Keep the middle letters 'R', 'A', 'P' in their exact positions. The resulting coded word is 'ERAPG'. This corresponds to option A.";
  }

  // Behavioral HR
  if (q.includes("challenge you faced during a project") || q.includes("what actions did you take to resolve it")) {
    return "In a previous project, we encountered a critical database latency issue where page loads took over five seconds during peak hours. Using the STAR framework, the task was to reduce this latency to under one second. I took action by setting up APM tools to profile queries, identifying missing indexes on our tables, and caching heavy queries using Redis. Additionally, I optimized several complex JOIN operations. As a result, database response time dropped by 80%, page load time went down to 800ms, and our cloud database hosting costs decreased by 15%, delivering a fast experience for our users.";
  }
  if (q.includes("conflict in your team") || q.includes("handle the situation, and what did you learn")) {
    return "During a group project, we had a major conflict regarding which framework to use. Two engineers wanted a complex microservices architecture, while others wanted a simple monolith. As the team lead, my task was to align everyone on a decision. I took action by organizing a technical meeting where we objectively listed the pros and cons of both architectures against our project timeline. We agreed to build a modular monolith for speed, but designed it with clean boundaries to allow easy microservice separation later. This resolved the conflict, we delivered the project on time, and I learned that objective data beats personal opinions.";
  }
  if (q.includes("showed leadership") || q.includes("guide others toward a successful")) {
    return "During our final semester project, our lead backend developer unexpectedly fell ill two weeks before the deadline. My task was to step in, coordinate the remaining development, and ensure a successful release. I took action by organizing a daily standup meeting to redistribute the backend workload among the remaining team members, focusing strictly on core features. I personally took over the API deployment and integrated the payment gateway. By prioritizing task tracking and unblocking team bottlenecks, we launched the application on schedule with 95% of planned features, proving that collaborative and agile leadership can overcome unexpected crises.";
  }
  if (q.includes("project failure") || q.includes("crashed our main user checkout")) {
    return "In my first internship, I pushed a minor code change directly to the production branch without writing tests, which crashed our main user checkout page for two hours. My task was to debug the error, roll back the code immediately, and prevent future occurrences. I took action by creating a post-mortem report to identify the root cause, building a local staging environment, and writing comprehensive integration tests. I learned that speed should never override quality. In my next project, I insisted on a mandatory code review process and automated testing pipeline, resulting in zero production incidents.";
  }
  if (q.includes("adapt quickly to changing requirements") || q.includes("manage your tasks")) {
    return "One week before launching a client portal, our client changed their authentication requirements from a simple email login to a strict OAuth integration. My task was to pivot our authentication module without delaying the launch. I took action by holding an emergency meeting to postpone non-critical UI polishing, researching standard OAuth libraries, and setting up secure Google and GitHub redirect routes. By working in short iterations and testing early, we integrated the new secure authentication system on time, proving that adaptability, strong task prioritization, and clear communication can successfully handle rapid requirements shifts.";
  }

  // System Design
  if (q.includes("system scalability") || q.includes("trade-offs between horizontal")) {
    return "System scalability is the ability of an application to handle an increasing volume of requests by expanding its computing resources. Vertical scaling (scaling up) means adding more power (CPU, RAM) to a single server. It is simple to implement but has a physical hardware limit and creates a single point of failure. Horizontal scaling (scaling out) means adding more servers to share the load. It requires an active load balancer and stateless application design, but offers unlimited scaling potential and high availability. Modern cloud architectures prefer horizontal scaling because it ensures that single server failures do not bring down the entire application.";
  }
  if (q.includes("load balancers") && q.includes("round-robin")) {
    return "A Load Balancer is a hardware or software device that sits between users and your backend servers. Its primary role is to distribute incoming application traffic evenly across a pool of healthy servers to prevent any single server from becoming a bottleneck. Load balancers constantly perform health checks to detect and avoid routing traffic to offline servers. A common routing algorithm is Round-Robin. In Round-Robin, the load balancer distributes incoming requests sequentially down the list of servers. For example, request 1 goes to Server A, request 2 to Server B, request 3 to Server C, and request 4 loops back to Server A.";
  }
  if (q.includes("relational databases differ from nosql") || q.includes("schema flexibility")) {
    return "Relational databases (like PostgreSQL) store data in structured tables with strict schemas and predefined relationships. They are highly structured, support ACID transactions for data consistency, and scale vertically by upgrading server hardware. NoSQL databases (like MongoDB or DynamoDB) store unstructured or semi-structured data as key-value pairs, documents, or columns. They offer massive schema flexibility, allowing you to add new attributes dynamically without migrating tables. NoSQL databases scale horizontally by distributing data across multiple servers (sharding). Choose relational databases for complex queries and consistency, and NoSQL databases for massive write volume and scaling.";
  }
  if (q.includes("database caching") || q.includes("redis or memcached")) {
    return "Database caching is the process of storing copy of frequently accessed data in a fast, temporary storage layer. Standard relational databases store data on slower solid-state or hard disks, making complex queries slow. In-memory caches like Redis store data directly in RAM, which allows for microsecond read and write response times. When an application needs data, it checks the cache first (a cache hit). If the data exists, it is returned instantly. If not (a cache miss), the application queries the database, returns the data, and saves it in the cache for future requests, drastically reducing database load and latency.";
  }
  if (q.includes("cap theorem") || q.includes("consistency, availability, and partition")) {
    return "The CAP Theorem states that a distributed database system can guarantee at most two out of three core properties: Consistency (every read receives the most recent write), Availability (every request receives a non-error response), and Partition Tolerance (the system continues to operate despite network messages being dropped). Since network partitions are inevitable in real-world systems, databases must choose between Consistency and Availability (CP or AP). A CP database (like Google Spanner) blocks updates during a network partition to guarantee consistent data, while an AP database (like Cassandra) remains fully available but allows temporary data divergence, resolving consistency later.";
  }
  if (q.includes("microservices") && q.includes("decoupling applications")) {
    return "Microservices is an architectural style that structures an application as a collection of small, loosely coupled, and independently deployable services. Each service focuses on a single business capability (such as Payments, Users, or Inventory) and communicates with other services using lightweight APIs. Decoupling applications into microservices offers several benefits. It allows teams to work, deploy, and scale services independently using different technologies. It also improves fault isolation: if the Payments service goes down, users can still browse products, preventing a complete system failure and making the overall application much more resilient.";
  }
  if (q.includes("asynchronous message queues") || q.includes("rabbitmq or kafka")) {
    return "Message queues act as temporary buffers that enable asynchronous communication between services. Instead of service A calling service B directly and waiting for a response (synchronous), service A publishes a message to a queue (like RabbitMQ) or log partition (like Kafka) and immediately continues its work. Service B consumes messages from the queue at its own pace. This design handles high-throughput spikes by absorbing bursts of traffic, decoupling services, and preventing slow down. If the receiving service crashes, messages remain safely stored in the queue, ensuring zero data loss and robust communication.";
  }
  if (q.includes("api gateway in modern microservice") || q.includes("reverse proxy that acts as the single")) {
    return "An API Gateway is a reverse proxy that acts as the single entry point for all external client requests entering a microservices architecture. Instead of clients calling dozens of individual services directly, they call the API Gateway. The gateway handles routing requests to the appropriate service, performing centralized authentication (checking API keys or JWT tokens), SSL termination, and rate limiting to protect backend resources from denial-of-service attacks. This simplifies the client code, centralizes security rules, and prevents individual microservices from having to implement authentication and security overhead themselves.";
  }
  if (q.includes("monitoring and alerting") || q.includes("dashboards help developers")) {
    return "System monitoring and alerting are critical because they provide real-time visibility into the health and performance of your applications. Without proper monitoring, developers only learn about crashes or latency spikes when users complain. Dashboards (like those built in Grafana) collect and display vital metrics—such as CPU utilization, memory consumption, HTTP error rates, and database response times—in highly readable charts. This allows developers to quickly identify bottlenecks, such as a database query taking too long or a server running out of memory, and configure automated alerts to notify engineers to resolve the issue before it causes downtime.";
  }
  if (q.includes("single points of failure") || q.includes("redundancy at every layer")) {
    return "Achieving high availability requires eliminating single points of failure (SPOF) throughout your entire system. A SPOF is any individual component that, if it fails, brings down the whole application. To eliminate them, you introduce redundancy at every layer. On the routing layer, use global DNS failover. For web servers, deploy multiple instances across separate Availability Zones behind an Active Load Balancer. For databases, set up multi-AZ replication with automatic failover and read replicas. Finally, store static assets in highly redundant object storage like S3, ensuring your system remains fully operational even if specific hardware components fail.";
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
    return "To solve this aptitude problem, we analyze the given conditions. First, we identify the key numerical values or logical relationships in the question. Next, we apply the appropriate mathematical formula or logical pattern to solve it step-by-step. By performing the calculations carefully, we verify the results against the provided choices and select the correct option. This systematic approach ensures accuracy and helps students master quantitative reasoning.";
  }

  if (q.includes("tell me") || q.includes("describe") || q.includes("conflict") || q.includes("challenge") || q.includes("leadership") || q.includes("failure") || q.includes("adapt")) {
    return "To answer this behavioral question successfully, we use the STAR (Situation, Task, Action, Result) methodology. First, describe the Situation and Task to give context. Next, explain the specific Actions you took, highlighting your soft skills and decision-making. Finally, share the quantifiable Result of your efforts. This structured format helps interviewers easily understand your problem-solving abilities and teamwork.";
  }

  const s1 = extracted[0] || "this core technology";
  const s2 = extracted[1] || "industry best practices";
  const s3 = extracted[2] || "architectural patterns";

  return `To understand the core concepts of ${s1}, we focus on its key benefits and implementation workflows. In a production environment, leveraging ${s2} alongside ${s3} helps optimize system throughput and minimize latency.

First, developers set up the foundational configurations and secure connections. Second, they perform rigorous validations to identify any memory bottlenecks or query flaws. Finally, they configure real-time monitoring and alert thresholds to ensure high availability.

By adopting these standard guidelines, students and professionals can build scalable applications, improve security, and resolve complex challenges efficiently.`;
}

export default function App() {
  // Launch Flow States
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('pw_is_logged_in') === 'true';
  });

  // Mobile app navigation state
  const [activeTab, setActiveTab] = useState<'home' | 'interview' | 'resume' | 'dashboard' | 'profile'>('home');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true); // Forced full screen app container
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [isFirebaseUserReady, setIsFirebaseUserReady] = useState<boolean>(false);

  // User Profile configuration
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('pw_user_name') || 'James Manoj');
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('pw_user_email') || 'candidate.preview@prepwise.ai');
  const [userGoal, setUserGoal] = useState<string>(() => localStorage.getItem('pw_user_goal') || 'Senior Software Engineer');
  
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
  const [mockDomain, setMockDomain] = useState<string>('DevOps');
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

  // Clear pinned questions on domain changes to preserve isolation
  useEffect(() => {
    setPinnedQuestions([]);
  }, [mockDomain, customDomainText, mockFocusTopic]);

  // Interactive Screen 3: Resume Scan states
  const [resumeText, setResumeText] = useState<string>(() => localStorage.getItem('pw_resume_text') || '');
  const [targetJobDesc, setTargetJobDesc] = useState<string>(() => localStorage.getItem('pw_resume_target_jd') || '');
  const [isScanningResume, setIsScanningResume] = useState<boolean>(false);
  const [activeResumeAnalysis, setActiveResumeAnalysis] = useState<ResumeAnalysisRecord | null>(() => {
    const local = localStorage.getItem('pw_resume_analysis');
    return local ? JSON.parse(local) : null;
  });

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

      console.log("Fetching questions...");
      const res = await fetch(`/api/question-bank?domain=${encodeURIComponent(selectedDomain)}&customTopic=${encodeURIComponent(customTopic)}`);

      if (!res.ok) throw new Error("Could not download customized questions list");
      const data = await res.json();
      console.log("Questions received:", data);

      const list: InterviewQuestion[] = data.questions || [];

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
        } else if (answerTextTrimmed.length > 100) {
          evalResult = {
            score: 8,
            feedback: "Solid technical explanation showing structured thinking and deep domain knowledge.",
            improvements: "Include more concrete business KPIs or numeric details.",
            idealAnswer: generateFallbackIdealAnswer(currentQ.text)
          };
        } else {
          evalResult = {
            score: 5,
            feedback: "Decent start, but the response is too brief to show full professional mastery.",
            improvements: "Expand on the exact tools, architectures, and design trade-offs involved.",
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
    if (!resumeText.trim()) {
      showToast("Please provide CV draft text contents first.", "error");
      return;
    }
    setIsScanningResume(true);
    localStorage.setItem('pw_resume_text', resumeText);
    localStorage.setItem('pw_resume_target_jd', targetJobDesc);

    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textContent: resumeText,
          jobDescription: targetJobDesc || "Standard Tech Industry Parameters"
        })
      });

      if (!res.ok) throw new Error("ATS score scanner returned failure code");
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
        missingSkills: ["Redis Caching", "Docker Pipelines", "AWS IAM Policy setup"]
      };
      setActiveResumeAnalysis(fallbackAnalysis);
      localStorage.setItem('pw_resume_analysis', JSON.stringify(fallbackAnalysis));
      showToast("ATS scan accomplished (Simulation Mode)", "info");
    } finally {
      setIsScanningResume(false);
    }
  };

  // Pre-load demo resumes for client scanning
  const loadDemoResume = (type: 'senior' | 'junior' | 'marketing') => {
    let text = "";
    let jd = "";

    if (type === 'senior') {
      text = `Manoj P\nSenior Software Architect\n\nEXPERIENCE:\n- Worked with complex payment architectures, coordinating high-performance Stripe integration APIs across multi-region server clusters.\n- Implemented strict concurrency rules, reducing payload bottlenecks by 42%.\n- Mentored 12 back-end engineers on REST specs and relational database synchronization.\n\nSKILLS:\nJavaScript, TypeScript, Express, PostgreSQL, Redis, Docker, System Design, Unit Testing.`;
      jd = `Senior Level Tech Developer\nRequirements: Must have strong system design capabilities, experience with payment gateway APIs, cluster scaling orchestration, and a background in microservice caching systems.`;
    } else if (type === 'junior') {
      text = `John Doe\nJunior Web Enthusiast\n\nEXPERIENCE:\n- Responsible for checking bugs and helping with styled UI screens.\n- Maintained project tasks and made coffee.\n- Did minor front-end changes occasionally.\n\nSKILLS:\nHTML, Basic CSS, JS, React, Tailwind, Microsoft Word.`;
      jd = `Software Developer - Advanced full-stack engineer with expertise in database scaling, security protocols, AWS Cloud Architecture, and Docker deployments.`;
    }

    setResumeText(text);
    setTargetJobDesc(jd);
    showToast("Template demo uploaded successfully", "info");
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

            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-white uppercase font-sans">PrepWise AI</h1>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Mobile Core Engine v3.0</p>
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
                      setUserGoal("Lead Product Developer");
                      setUserEmail("guest.user@prepwise-sim.ai");
                      localStorage.setItem('pw_user_name', "James Jane");
                      localStorage.setItem('pw_user_goal', "Lead Product Developer");
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveTab('interview')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl p-4 text-left transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/10 group flex flex-col justify-between min-h-[110px]"
                      >
                        <div className="bg-white/10 p-2 rounded-2xl self-start">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold block mb-0.5 group-hover:translate-x-1 transition-transform">Interactive Mock Drills</h4>
                          <span className="text-[10px] text-indigo-200">5-question comprehensive scoring</span>
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
                          <h4 className="text-sm font-bold block mb-0.5 group-hover:translate-x-1 transition-transform font-sans">ATS Resume Scanner</h4>
                          <span className="text-[10px] text-zinc-400">Optimize keywords and compliance</span>
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
                            'Java',
                            'Python',
                            'DevOps',
                            'AWS',
                            'Cloud Computing',
                            'AI/ML',
                            'Aptitude',
                            'STAR Behavioral',
                            'System Design',
                            'Custom'
                          ].map((dom) => {
                            const active = mockDomain === dom;
                            return (
                              <button
                                key={dom}
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
                                <span>{dom}</span>
                                {active && <Sparkles className="w-3 h-3 text-indigo-400" />}
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
                            placeholder="e.g. Senior Backend Engineer"
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
                                    onClick={() => setMockNumQuestions(num)}
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
                          <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-3.5 space-y-3 mt-1.5">
                            <div className="flex justify-between items-center">
                              <div className="space-y-0.5">
                                <h4 className="text-[11.5px] font-bold text-white flex items-center space-x-1.5">
                                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Curated Database Explorer</span>
                                </h4>
                                <p className="text-[9.5px] text-zinc-400">
                                  Select/Pin custom questions to include them in your session.
                                </p>
                              </div>
                              <span className="text-[9px] font-mono bg-zinc-850 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                                {pinnedQuestions.length} / {mockNumQuestions} Pinned
                              </span>
                            </div>

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
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">Candidate Optimization</span>
                    <h2 className="text-xl font-bold tracking-tight text-white font-sans">Resume ATS Auditor</h2>
                    <p className="text-[11px] text-zinc-400">Upload your CV to identify optimization gaps and compute target job keyword alignments.</p>
                  </div>

                  {/* File Mock Trigger button layouts */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-zinc-450 block font-bold">Fast-track Demo CV Uplink</label>
                    <div className="grid grid-cols-2 gap-2 pb-1 bg-[#101321] p-2 rounded-2xl border border-indigo-900/10">
                      <button
                        onClick={() => loadDemoResume('senior')}
                        className="text-[10.5px] p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:text-indigo-300 hover:border-indigo-500/20 transition cursor-pointer"
                      >
                        📄 Preload Senior CV
                      </button>
                      <button
                        onClick={() => loadDemoResume('junior')}
                        className="text-[10.5px] p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:text-indigo-300 hover:border-indigo-500/20 transition cursor-pointer"
                      >
                        📄 Preload Junior CV
                      </button>
                    </div>
                  </div>

                  {/* Input areas */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Paste Resume/CV Text</label>
                      <textarea
                        rows={5}
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste plain text content of your resume/CV here..."
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

              {/* SCREEN 5: WORKSPACE PROFILE EDITORS */}
              {activeTab === 'profile' && (
                <div className="space-y-4 pb-24 animate-fade-in text-left">
                  
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
                    onClick={() => setMentorOpen(false)}
                    className="p-1 px-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs"
                  >
                    Close Dialog
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
                    className="p-1 px-2 bg-zinc-800 text-zinc-200 text-xs rounded-lg"
                  >
                    Close Details
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
