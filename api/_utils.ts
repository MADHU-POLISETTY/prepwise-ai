import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";



if (!process.env.VERCEL) {
  dotenv.config();
}

console.log("Gemini API Key exists:", !!process.env.GEMINI_API_KEY);

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("MY_GEMINI_API_KEY")) {
    console.warn("GEMINI_API_KEY is not configured or has dynamic default values. Serving via simulated mock backup modes.");
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

export function parseCleanJSON(raw: string): any {
  let text = raw.trim();
  text = text.replace(/^```json\s*/i, "");
  text = text.replace(/^```\s*/, "");
  text = text.replace(/```$/, "");
  return JSON.parse(text.trim());
}

export async function getEmbedding(client: GoogleGenAI, text: string): Promise<number[]> {
  try {
    const result = await client.models.embedContent({
      model: "text-embedding-004",
      contents: text,
    });
    if (result.embeddings && result.embeddings[0] && result.embeddings[0].values) {
      return result.embeddings[0].values;
    }
    throw new Error("Unable to extract embedding values from Gemini API response.");
  } catch (err) {
    console.error("Failed to get embedding:", err);
    throw err;
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }
  if (vecA.length !== vecB.length) {
    console.warn(`Embedding vectors length mismatch: ${vecA.length} vs ${vecB.length}`);
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function isGibberishOrInvalid(text: string): boolean {
  const clean = text.trim().toLowerCase();
  if (!clean) return true;
  if (clean.length < 5) return true;
  
  const lettersCount = (clean.match(/[a-z]/g) || []).length;
  if (lettersCount < clean.length * 0.3) return true;

  if (/^(.)\1{3,}$/.test(clean.replace(/\s+/g, ''))) return true;

  if (clean.length >= 8) {
    const half = clean.substring(0, clean.length / 2);
    if (clean === half + half) return true;
    const third = clean.substring(0, clean.length / 3);
    if (clean === third + third + third) return true;
  }

  const lazyWords = ["idk", "skip", "none", "nothing", "no idea", "asdf", "asdfgh", "qwer", "qwerty", "test", "hello", "hi", "placeholder"];
  if (lazyWords.includes(clean)) return true;

  if (/^[bcdfghjklmnpqrstvwxyz\s]{5,}$/.test(clean)) return true;
  if (/^[aeiou\s]{5,}$/.test(clean)) return true;

  return false;
}

export function generateFallbackIdealAnswer(question: string): string {
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
    return "An API Gateway acts as the single front door for your microservices. Instead of clients talking to dozens of different services directly, they talk only to the API Gateway. The gateway handles routing their requests to the right service, checking if they are logged in (authentication), and limiting how fast they can make requests (rate limiting) to keep the backend secure.";
  }
  if (q.includes("monitoring and alerting") || q.includes("dashboards help developers")) {
    return "Monitoring gives developers a live dashboard (like Grafana) showing how healthy their application is. It displays charts for server CPU, memory, error rates, and load times. If something goes wrong (like a database crash), **Alerting** instantly sends a notification (like an email or SMS) to the developer so they can fix it before users start complaining.";
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

export function getSimulatedSingleAnswerEvaluation(question: string, answer: string) {
  const clean = answer.trim();
  const lowercaseAns = clean.toLowerCase();

  let isMeaningful = true;
  let isRelevant = true;
  let isTechnicallyCorrect = true;
  let score = 5;
  let feedback = "Decent start, but the response is too brief to show full professional mastery.";
  let improvements = "Detail the exact actions you took and the toolsets utilized (e.g., specifying Docker, AWS RDS, or JVM garbage collectors).";

  if (!clean) {
    isMeaningful = false;
    isRelevant = false;
    isTechnicallyCorrect = false;
    score = 0;
    feedback = "No answer provided.";
    improvements = "Please write a response to receive feedback and suggestions.";
  } else {
    // Check if it looks like obvious gibberish or random input using the global helper
    const isObviousGibberish = isGibberishOrInvalid(clean);

    if (isObviousGibberish) {
      isMeaningful = false;
    } else if (lowercaseAns.includes("cricket") && question.toLowerCase().includes("gradient descent")) {
      isRelevant = false;
    }

    if (!isMeaningful) {
      score = 0;
      feedback = "The answer is invalid, meaningless, or unrelated to the question.";
      isRelevant = false;
      isTechnicallyCorrect = false;
      improvements = "Please write a meaningful professional response related to the question.";
    } else if (!isRelevant) {
      score = 0;
      feedback = "The answer is invalid, meaningless, or unrelated to the question.";
      isTechnicallyCorrect = false;
      improvements = "Please write a response that directly addresses the question asked.";
    } else {
      if (clean.length < 15) {
        score = 1;
        feedback = "Your response is extremely brief and does not address the question with any professional or conceptual depth.";
        improvements = "Please provide a structured, detailed answer of at least 2-3 sentences explaining your approach.";
        isTechnicallyCorrect = false;
      } else if (clean.length < 50) {
        score = 3;
        feedback = "Your response is brief and lacks specific details, technical terminologies, or structured context.";
        improvements = "Expand your answer with precise technical terms. Use the STAR methodology (Situation, Task, Action, Result) to format your answers.";
        isTechnicallyCorrect = false;
      } else if (clean.length > 120) {
        score = 8;
        feedback = "This is a strong answer that shows structured context and relevant terminology. Good job explaining the workflow.";
        improvements = "To make this answer perfect, include a direct business metric or quantitative result (e.g. 'reduced latency by 20%').";
      } else {
        score = 5;
        feedback = "Decent start, but the response is too brief to show full professional mastery.";
        improvements = "Detail the exact actions you took and the toolsets utilized (e.g., specifying Docker, AWS RDS, or JVM garbage collectors).";
      }
    }
  }

  return {
    isMeaningful,
    isRelevant,
    isTechnicallyCorrect,
    score,
    feedback,
    improvements,
    idealAnswer: generateFallbackIdealAnswer(question)
  };
}

export function getSimulatedEvaluation(category: string, role: string, answers: any[]) {
  // Calculate factual mathematical average of individual question scores
  const individualScoresSum = answers.reduce((sum: number, ans: any) => {
    const val = typeof ans.score === 'number' ? ans.score : parseInt(ans.score as any) || 0;
    return sum + val;
  }, 0);
  const maxScorePossible = answers.length * 10;
  const mathAvgScorePercent = maxScorePossible > 0 ? Math.round((individualScoresSum / maxScorePossible) * 100) : 0;

  // Calculate scores with subtle randomness but strictly bounded by quality
  const rawScore = mathAvgScorePercent;
  const communication = mathAvgScorePercent === 0 ? 0 : Math.min(100, Math.max(0, Math.round(rawScore + (Math.random() * 4 - 2))));
  const technical = mathAvgScorePercent === 0 ? 0 : Math.min(100, Math.max(0, Math.round(rawScore + (Math.random() * 6 - 3))));
  const confidence = mathAvgScorePercent === 0 ? 0 : Math.min(100, Math.max(0, Math.round(rawScore + (Math.random() * 4 - 2))));
  const problemSolving = mathAvgScorePercent === 0 ? 0 : Math.min(100, Math.max(0, Math.round(rawScore + (Math.random() * 6 - 2))));
  const clarity = mathAvgScorePercent === 0 ? 0 : Math.min(100, Math.max(0, Math.round(rawScore + (Math.random() * 4 - 2))));
  
  const finalScore = Math.round((communication + technical + confidence + problemSolving + clarity) / 5);

  let feedbackIntro = "";
  if (finalScore < 45) {
    feedbackIntro = `### Performance Warning: Superficial or Empty Submission\n\nYour session received a lower score of **${finalScore}%** because the submitted answers were either exceptionally brief, skipped, or contained inadequate technical substance. To qualify for senior or mid-level recruitment standards, answers must display structured analytical thinking, contextual key terms, and detailed STAR examples.`;
  } else {
    feedbackIntro = `### Core Strengths\n\n- **Consistent Response Structures:** Your answers show deliberate planning and effort.\n- **Refined Articulation:** You correctly incorporated relevant context as a ${role}, utilizing industry-appropriate definitions.`;
  }

  const markdownFeedback = `${feedbackIntro}

### Areas for Improvement

- **Framing with Real metrics:** Ensure every answer highlights measurable quantitative outputs (e.g. 'reduced processing overhead by 25%'). 
- **Structure and Sequence:** Use structural frameworks (like the **STAR framework** for behavioral tracks) to avoid jumping straight to solutions without specifying the constraints and tasks first.

### 4-Week Personalized Improvement Plan

- **Week 1 (Fundamentals & STAR Structure):** Re-structure all behavioral scenarios using the STAR framework. Frame your actions clearly with strong active verbs.
- **Week 2 (Technical Terminology & Metrics):** Review databases, API design patterns, and insert solid metrics (e.g., "reduced latency by 40%").
- **Week 3 (Mock Arena Under Time Constraints):** Run timed sandbox practices (Beginner & Intermediate) with 2-minute limits.
- **Week 4 (Articulation Polishing & Executive Presence):** Record and evaluate your answers, checking confidence traits and removing hesitation terms.

### Perfect Sample Answers

#### Proposed Perfect Answer: (General conflict handling)
*“In my previous engagement, we had a major architectural misalignment on data storage structures. I set up a timed proof-of-concept playground for both models, reviewed technical latency metrics objectively with the engineers, and aligned everyone on a unified choice. This approach resolved the conflict constructively and delivered a model that reduced database queries by 22%.”*`;

  return {
    score: finalScore,
    communicationScore: Math.min(100, Math.max(0, communication)),
    technicalScore: Math.min(100, Math.max(0, technical)),
    confidenceScore: Math.min(100, Math.max(0, confidence)),
    problemSolvingScore: Math.min(100, Math.max(0, problemSolving)),
    clarityScore: Math.min(100, Math.max(0, clarity)),
    feedback: markdownFeedback
  };
}

export function getSimulatedResumeAnalysis(text: string, jobDescription: string = "") {
  const dummySkills = ["React/Next.js", "TypeScript", "Cloud Firestore", "Tailwind CSS", "REST Architectures", "Secure Session Engineering", "Git & CI/CD Pipelines"];
  const dummyStrengths = [
    "High engineering consistency with fully typed interfaces and state safety.",
    "Proven background deploying interactive, responsive dashboards with data analytics capabilities.",
    "Strong technical writing, layout structure, and communication flow."
  ];
  const dummyImprovements = [
    "Incorporate concrete metrics for accomplishments (e.g., 'Optimized database loads by 35%').",
    "List specific Cloud security/compliance standards (e.g., HIPAA, GDPR, RBAC configurations) where relevant.",
    "Specify performance debugging tools or benchmark indicators utilized."
  ];

  let atsScore = 82;
  let keywordMatches = [
    { word: "React/Vite", matched: true },
    { word: "TypeScript", matched: true },
    { word: "REST API", matched: true },
    { word: "System Design", matched: false },
    { word: "Docker/Kubernetes", matched: false },
    { word: "Cloud Security", matched: false },
    { word: "State Management", matched: true }
  ];
  let missingSkills = ["System Design Patterns", "Docker/Kubernetes Architecture", "Cloud Security Best Practices"];

  if (jobDescription) {
    const jdLowerJoin = jobDescription.toLowerCase();
    if (jdLowerJoin.includes("senior") || jdLowerJoin.includes("lead")) {
      atsScore = 74;
    }
  }

  return {
    skills: dummySkills,
    strengths: dummyStrengths,
    improvements: dummyImprovements,
    summary: "A technically versatile profile exhibiting high-value front-end layout styling and back-end integration capabilities. The candidate is highly qualified to prep for premium full-stack or lead technical engineer interviews.",
    atsScore: atsScore,
    keywordMatches: keywordMatches,
    missingSkills: missingSkills
  };
}

export function getSimulatedAskMS(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("system") || q.includes("architecture") || q.includes("stripe") || q.includes("notion") || q.includes("scale")) {
    return `### Mastering System Design: Prime Checklist

As your Career Mentor, here is how you stand out when detailing architectures:

1. **Explicit API Specs First:** Never jump into sharding or caching layers. Draft the target REST or gRPC endpoint schemes explicitly.
2. **Back-of-the-Envelope Math:** Quantify the scale index. For instance, "10 million daily active users means roughly 115 requests per second average, peaking at 500."
3. **Database Paradigms:** Do not just say 'SQL'. Contrast write-heavy indexes vs. read-heavy caching with exact configurations (e.g., leveraging Redis clusters or partitioned tables).
4. **Resilience & Backpressure:** Highlight failover patterns, message queues (like Kafka or Pub/Sub), and token-bucket rate limiting.

Would you like to run a mock Technical Session right now to practice this?`;
  }
  if (q.includes("star") || q.includes("behavioral") || q.includes("hr")) {
    return `### The STAR Presentation Formula

To sound like a senior specialist at elite teams, format your narratives exactly like this:

- **S / Situation:** Highlight a specific, complex operational failure, tight timeline, or team alignment challenge (1-2 sentences).
- **T / Task:** State the core conflict or high-value deliverable you were directly accountable for.
- **A / Action:** Use strong active verbs. Mention *your* distinct engineering step, communication resolve, or metric evaluation.
- **R / Result:** Conclude with *quantifiable metrics* (e.g., "reduced latency by 24%", "increased container utilization by 15%").

How is your star story directory looking? Paste a draft here and let is analyze it.`;
  }
  if (q.includes("resume") || q.includes("cv") || q.includes("ats")) {
    return `### ATS Alignment Best Practices

To make your resume look like a perfect fit:

- **Context-Agnostic Vocabulary:** ATS scanners look for literal technology nouns matching the job posting (e.g., "TypeScript", "Docker", "Redux State").
- **Metrics, Not Actions:** Move away from vague claims like "responsible for system upgrades". Lead with the impact: *"Modernized core CI/CD pipelines, saving developers 12 minutes per pull request sequence."*
- **Layout Precision:** Avoid multi-column color designs which can break parsing engines. Stick to single-column, clean chronological structure.

You can upload your profile PDF into our **Resume Analyzer** workspace tab for a real-time compliance score.`;
  }
  
  return `### Hello! I am MS, your career mentor.

I am configured to act as your personalized system architect and narrative talent coach.

How can I help you accelerate your interview readiness today?

- **"STAR behavioral examples"**: How to structure soft-skill conflict questions.
- **"Stripe System Design framework"**: Best practices for scalable APIs.
- **"Resume keyword tips"**: Optimizing your CV for recruiter pipelines.
- **"Microservices trade-offs"**: Assessing state, storage, and synchronization.

Specify a topic, and let's craft your high-impact technical portfolio.`;
}

export function getQuestionBankPool(categoryOrDomain: string, role: string, difficulty: string, company: string = "Standard", customTopic: string = ""): string[] {
  const domain = (categoryOrDomain || "Technical").toLowerCase();
  const searchStr = `${domain} ${role} ${customTopic} ${company}`.toLowerCase();
  
  let pool: string[] = [];
  
  if (searchStr.includes("java")) {
    pool = [
      `What are the core pillars of OOP (Object-Oriented Programming) in Java, and how does encapsulation improve maintainability?`,
      `Explain the differences between List, Set, and Map in the Java Collections Framework. When would you choose a HashMap over a TreeMap?`,
      `How do volatile variables and synchronized blocks coordinate multithreading memory visibility in Java?`,
      `Explain Java's modern Exception Handling. What is the difference between checked and unchecked exceptions?`,
      `What is JDBC and how does connection pooling optimize database read/write latency in Java applications?`,
      `How does Spring Boot simplify dependency injection and configuration for enterprise Java services?`,
      `Explain the components of the JVM (Java Virtual Machine) and how the Garbage Collector recovers unused memory.`,
      `How is memory allocated in Java's Heap vs. Stack? How do you prevent OutOfMemoryError?`,
      `What are the major Java 8 features? Explain functional interfaces, lambda expressions, and the Streams API.`,
      `Describe how the Singleton or Factory Design Pattern is typically implemented and utilized in Java projects.`
    ];
  } else if (searchStr.includes("python")) {
    pool = [
      `Explain the concept of OOP (Object-Oriented Programming) in Python, including inheritance and polymorphism.`,
      `What are decorators in Python, and how do you write a custom decorator to measure function execution time?`,
      `How do Python generators work, and why are they highly memory-efficient compared to normal list returns?`,
      `Write a list comprehension in Python to filter and square even numbers from a collection, and explain its performance advantages.`,
      `How do you perform vector operations and matrix multiplications using NumPy array structures?`,
      `What are Pandas DataFrames, and how do you handle missing values or perform groupings on a dataset?`,
      `How do you design a simple REST API endpoint using the Flask framework in Python?`,
      `Explain the core architecture of Django, specifically focusing on the MVT (Model-View-Template) pattern.`,
      `How do you implement robust exception handling in Python using try-except-finally blocks, and what are custom exceptions?`,
      `What is the difference between deep copy and shallow copy in Python, and how does python manage references?`
    ];
  } else if (searchStr.includes("aws") || searchStr.includes("amazon")) {
    pool = [
      `How does Amazon EC2 provide resizable compute capacity, and what are the main differences between On-Demand and Spot instances?`,
      `What is Amazon S3, and how do you configure bucket policies, versioning, and lifecycle rules for storage optimization?`,
      `How do you securely configure a VPC with public and private subnets, NAT gateways, and internet gateways on AWS?`,
      `Explain IAM roles, users, and policies. How do you apply the principle of least privilege in AWS?`,
      `What are the advantages of using Amazon RDS (Relational Database Service) with multi-AZ replication for automated failover?`,
      `How does AWS Route 53 manage global DNS resolution and failover routing policies?`,
      `Explain the role of Application Load Balancers (ELB) in distributing incoming application traffic across target groups.`,
      `How does AWS Auto Scaling automatically adjust EC2 capacity based on dynamic demand metrics?`,
      `What is serverless computing on AWS? Explain how AWS Lambda operates and scales based on incoming events.`,
      `How do you monitor infrastructure metrics and set up custom alarms using Amazon CloudWatch?`
    ];
  } else if (searchStr.includes("devops") || searchStr.includes("pipeline") || searchStr.includes("terraform") || searchStr.includes("docker")) {
    pool = [
      `What is CI/CD, and why is it crucial for continuous automated software delivery pipelines?`,
      `Explain how Jenkins compiles, tests, and deploys applications securely using scripted or declarative Pipelines.`,
      `Explain the difference between a Docker image and a running Docker container, and how layers optimize caching.`,
      `What is Kubernetes? Explain the roles of Pods, Deployments, and Services in orchestrating containerized apps.`,
      `What is Terraform, and how does it manage infrastructure state locking to prevent deployment conflicts?`,
      `Explain the Git branching strategies (e.g. GitFlow or trunk-based development) used in professional engineering teams.`,
      `What are some essential Linux commands for diagnosing high CPU usage, memory bottlenecks, or open file descriptors?`,
      `Why is proactive infrastructure monitoring critical, and what are the roles of tools like Prometheus and Grafana?`,
      `Explain how Ansible provides agentless configuration management and automated playbook execution.`,
      `What are the core benefits of Infrastructure as Code (IaC) over manual environment configuration?`
    ];
  } else if (searchStr.includes("cloud computing") || searchStr.includes("gcp") || searchStr.includes("azure")) {
    pool = [
      `What are the key architectural differences and use cases for IaaS, PaaS, and SaaS cloud delivery models?`,
      `Explain the role of virtualization in cloud computing and how hypervisors enable multiple operating systems on physical hardware.`,
      `Compare Public Cloud, Private Cloud, and Hybrid Cloud architectures in terms of cost, security, and control.`,
      `What are standard cloud security best practices for protecting data at rest and in transit?`,
      `How does a multi-region cloud architecture provide high availability and geographical disaster recovery?`,
      `Explain the Shared Responsibility Model in cloud environments. Who is responsible for patching guest operating systems?`,
      `What is horizontal scaling vs vertical scaling in a cloud environment, and when is each appropriate?`,
      `How do Content Delivery Networks (CDNs) leverage edge caching to improve global latency?`,
      `What is cloud tenant isolation, and how do public cloud providers ensure secure multi-tenancy?`
    ];
  } else if (searchStr.includes("ai") || searchStr.includes("ml") || searchStr.includes("machine learning") || searchStr.includes("deep learning")) {
    pool = [
      `What is the difference between supervised, unsupervised, and reinforcement learning in Machine Learning?`,
      `Explain Deep Learning. How do multi-layer artificial neural networks learn complex hierarchical representations?`,
      `What is a Convolutional Neural Network (CNN), and how do convolutional layers extract local spatial features from images?`,
      `How do Recurrent Neural Networks (RNN) process sequential data, and how do LSTMs mitigate vanishing gradients?`,
      `What is Natural Language Processing (NLP), and what are the common tokenization and embedding steps?`,
      `Explain Large Language Models (LLMs) and the foundational self-attention mechanism in the Transformer architecture.`,
      `What is Gradient Descent, and how do learning rates determine the convergence speed of model optimization?`,
      `Explain overfitting. How do you prevent a model from overfitting using regularization, dropout, or early stopping?`,
      `What is Feature Engineering, and why is selecting the correct input representations crucial for model success?`,
      `How do you evaluate Machine Learning models using metrics like accuracy, precision, recall, and F1-score?`
    ];
  } else if (searchStr.includes("aptitude") || searchStr.includes("puzzle") || searchStr.includes("math")) {
    pool = [
      `If a laptop is bought for $800 and sold for $1000, what is the profit percentage?\nA) 15%\nB) 20%\nC) 25%\nD) 30%`,
      `A clock shows exactly 3:15. What is the angle in degrees between the hour hand and the minute hand?\nA) 0 degrees\nB) 7.5 degrees\nC) 30 degrees\nD) 90 degrees`,
      `If 5 workers can build a wall in 12 days, how many days will it take 6 workers to build the same wall, assuming the same efficiency?\nA) 8 days\nB) 10 days\nC) 12 days\nD) 15 days`,
      `A train travels at a speed of 60 mph. How far will it travel in 2.5 hours?\nA) 120 miles\nB) 150 miles\nC) 180 miles\nD) 200 miles`,
      `What is the next number in the logical series: 2, 6, 12, 20, 30, ...?\nA) 36\nB) 40\nC) 42\nD) 48`,
      `Pointing to a photograph, Amit said, "Her father is the only son of my grandfather." Whose photograph was Amit looking at?\nA) His sister's\nB) His daughter's\nC) His mother's\nD) His niece's`,
      `Find the odd one out from the following list:\nA) Apple\nB) Banana\nC) Carrot\nD) Grape`,
      `In a certain code language, "APPLE" is written as "EPPLA". How is "GRAPE" written in that language?\nA) ERAPG\nB) EPAQG\nC) ERPGA\nD) GEPAR`
    ];
  } else if (searchStr.includes("hr") || searchStr.includes("behavioral") || searchStr.includes("soft skills") || searchStr.includes("star")) {
    pool = [
      `Tell me about a challenge you faced during a project. What actions did you take to resolve it, and what was the outcome?`,
      `Describe a conflict in your team or group project. How did you handle the situation, and what did you learn?`,
      `Explain a time when you showed leadership. How did you guide others toward a successful project delivery?`,
      `Describe a project failure you experienced. What did you learn from it, and how did you apply that learning later?`,
      `Tell me about a time when you had to adapt quickly to changing requirements. How did you manage your tasks?`
    ];
  } else if (searchStr.includes("system design") || searchStr.includes("architecture")) {
    pool = [
      `What is system scalability, and what are the trade-offs between horizontal scaling and vertical scaling?`,
      `Explain how load balancers distribute traffic across a pool of servers, and describe round-robin routing.`,
      `How do relational databases differ from NoSQL databases in terms of schema flexibility and scalability?`,
      `What is database caching, and how do in-memory caches like Redis or Memcached speed up query performance?`,
      `Explain the CAP Theorem and how databases choose between Consistency, Availability, and Partition Tolerance.`,
      `What are microservices, and what are the benefits of decoupling applications into independent services?`,
      `How do asynchronous message queues like RabbitMQ or Kafka handle high-throughput communication between services?`,
      `Explain the role of an API Gateway in modern microservice architectures, including authentication and rate limiting.`,
      `Why is system monitoring and alerting critical, and how do dashboards help developers identify bottlenecks?`,
      `How do you achieve high availability and eliminate single points of failure in cloud-native applications?`
    ];
  } else if (customTopic) {
    pool = [
      `Explain the core concepts and principles of ${customTopic} that every software developer should know.`,
      `What are the common industry best practices and standards when implementing solutions using ${customTopic}?`,
      `Describe a typical challenge or error encountered when working with ${customTopic}, and how to debug it.`,
      `How does ${customTopic} integrate with existing modern software architectures and cloud services?`,
      `Compare ${customTopic} with its main alternatives. What are the key trade-offs in performance and ease of use?`
    ];
  } else {
    pool = [
      `Explain the core conceptual differences between SQL and NoSQL storage paradigms, and when to use them.`,
      `How do you secure server-side REST API endpoints from potential security threats and unauthorized access?`,
      `Walk me through how you would optimize a slow-performing database query or bottlenecked system pathway.`,
      `What are the trade-offs of using Microservices vs. Monolithic architecture, especially regarding deployment complexity?`,
      `Describe the lifecycle of an asynchronous execution queue, and how to deal with failures and retries.`
    ];
  }

  return pool;
}

export function getSimulatedQuestions(categoryOrDomain: string, role: string, difficulty: string, company: string = "Standard", customTopic: string = "", numQuestions: number = 5) {
  const domain = (categoryOrDomain || "Technical").toLowerCase();
  const searchStr = `${domain} ${role} ${customTopic} ${company}`.toLowerCase();
  
  let pool = getQuestionBankPool(categoryOrDomain, role, difficulty, company, customTopic);
  
  // Shuffle pool to ensure variety and uniqueness
  pool = [...pool].sort(() => Math.random() - 0.5);
  
  // Take the required number of questions, up to pool size
  const selectedQuestions = pool.slice(0, numQuestions);
  
  // If pool didn't have enough, fill with domain-safe distinct questions
  const defaultAptitude = [
    `Solve this problem: If 3 books cost $15, how much do 6 books cost?\nA) $20\nB) $25\nC) $30\nD) $35`,
    `A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?\nA) 120 metres\nB) 150 metres\nC) 324 metres\nD) 180 metres`,
    `Find the odd one out: 3, 5, 11, 14, 17, 21\nA) 14\nB) 17\nC) 21\nD) 11`,
    `A sum of money at simple interest amounts to $815 in 3 years and to $854 in 4 years. The sum is:\nA) $650\nB) $690\nC) $698\nD) $700`,
    `If a person walks at 14 km/hr instead of 10 km/hr, he would have walked 20 km more. The actual distance travelled by him is:\nA) 50 km\nB) 56 km\nC) 70 km\nD) 80 km`
  ];

  const defaultHR = [
    `Tell me about a situation where you had to work with a teammate whose working style was different from yours.`,
    `Describe a time when you faced a major obstacle at work and how you overcame it.`,
    `Why do you want to join our team, and how does your career vision align with this role?`,
    `Can you describe a time when you had to explain a complex technical concept to a non-technical stakeholder?`,
    `Tell me about a time when you made a mistake on a project. How did you handle it and what did you learn?`
  ];

  const defaultTechnical = [
    `As a ${role} working at ${company}, how do you ensure code quality, performance, and robustness for a ${difficulty} level feature?`,
    `What are your preferred strategies for debugging complex asynchronous failures or memory leaks in a production environment?`,
    `Describe a system architecture design pattern you frequently use when building scalable solutions as a ${role}.`,
    `How do you approach writing clean, maintainable, and well-tested code for enterprise projects?`,
    `Can you walk through your process for performing comprehensive code reviews within your engineering team?`
  ];

  let fallbackIdx = 0;
  while (selectedQuestions.length < numQuestions) {
    let nextQ = "";
    if (searchStr.includes("aptitude")) {
      nextQ = defaultAptitude[fallbackIdx % defaultAptitude.length];
    } else if (searchStr.includes("hr") || searchStr.includes("behavioral")) {
      nextQ = defaultHR[fallbackIdx % defaultHR.length];
    } else {
      nextQ = defaultTechnical[fallbackIdx % defaultTechnical.length];
    }

    if (!selectedQuestions.includes(nextQ)) {
      selectedQuestions.push(nextQ);
    } else {
      selectedQuestions.push(`${nextQ} (Vary: Option ${Math.floor(fallbackIdx / 5) + 1})`);
    }
    fallbackIdx++;
  }
  
  return selectedQuestions.map((text, index) => ({
    id: index + 1,
    text: text
  }));
}
