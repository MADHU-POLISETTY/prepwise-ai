export const awsQuestions = [
  {
    id: 1,
    question: "What is AWS?",
    answer: "AWS (Amazon Web Services) is a highly secure, reliable, and widely adopted cloud computing platform provided by Amazon. It offers over 200 fully featured on-demand services (such as compute, database, storage, and networking) with pay-as-you-go pricing."
  },
  {
    id: 2,
    question: "What is Cloud Computing?",
    answer: "Cloud Computing is the on-demand delivery of computing power, databases, storage, applications, and other IT resources over the internet. Instead of buying and maintaining physical data servers, you rent resources as needed from a cloud provider with pay-as-you-go billing."
  },
  {
    id: 3,
    question: "What is Amazon EC2?",
    answer: "Amazon EC2 (Elastic Compute Cloud) is an AWS service that provides scalable virtual servers in the cloud, known as 'EC2 Instances'. It allows you to configure operating systems, memory, storage, and networking to run applications easily."
  },
  {
    id: 4,
    question: "What is Amazon S3?",
    answer: "Amazon S3 (Simple Storage Service) is a highly scalable, high-speed object storage service. It stores data as 'objects' inside folders called 'buckets', making it ideal for hosting images, videos, backups, and static website files."
  },
  {
    id: 5,
    question: "What is an AWS Region?",
    answer: "An AWS Region is a physical, geographical location in the world (such as 'us-east-1' or 'eu-west-1') where AWS operates multiple isolated clusters of physical data centers to ensure low latency and high availability."
  },
  {
    id: 6,
    question: "What is an AWS Availability Zone (AZ)?",
    answer: "An Availability Zone is one or more highly secure physical data centers inside a specific AWS Region. Each AZ is designed to be completely independent in terms of power, cooling, and networking to ensure disaster tolerance and redundancy."
  },
  {
    id: 7,
    question: "What is AWS IAM?",
    answer: "AWS IAM (Identity and Access Management) is a free service that helps you securely control access to all of your AWS resources. It allows you to define who is authenticated (signed in) and authorized (has permissions) to perform actions on specific services."
  },
  {
    id: 8,
    question: "What is the difference between an IAM User and an IAM Role?",
    answer: "An IAM User is a permanent identity with login credentials representing a specific person or application. An IAM Role is a temporary identity without permanent credentials that can be assumed by any authorized user, service (like an EC2 instance), or resource for short-term access."
  },
  {
    id: 9,
    question: "What is Amazon RDS?",
    answer: "Amazon RDS (Relational Database Service) is a managed database service that makes it easy to set up, operate, and scale relational databases in the cloud. It supports engines like PostgreSQL, MySQL, MariaDB, Oracle, and Microsoft SQL Server, handles automated backups, updates, and scaling."
  },
  {
    id: 10,
    question: "What is Amazon DynamoDB?",
    answer: "Amazon DynamoDB is a fully managed, serverless NoSQL database service that provides high performance, seamless scalability, and consistent, single-digit millisecond latency at any scale."
  },
  {
    id: 11,
    question: "What is serverless computing on AWS, and what is its main service?",
    answer: "Serverless computing is an execution model where developers write code without having to provision, configure, or manage any physical or virtual servers. AWS handles all server scaling and maintenance. The main serverless service is AWS Lambda."
  },
  {
    id: 12,
    question: "What is Amazon VPC?",
    answer: "Amazon VPC (Virtual Private Cloud) is a service that lets you provision a logically isolated, private section of the AWS cloud. You have complete control over this virtual network environment, including custom IP address ranges, subnets, and route tables."
  },
  {
    id: 13,
    question: "What is the difference between a public subnet and a private subnet in a VPC?",
    answer: "A public subnet has a route to an Internet Gateway, allowing resources inside it (like web servers) to communicate directly with the internet. A private subnet does not have a route to the internet, keeping databases or secure backends isolated and protected."
  },
  {
    id: 14,
    question: "What is an AWS Security Group?",
    answer: "An AWS Security Group acts as a virtual firewall for your EC2 instances to control incoming (inbound) and outgoing (outbound) network traffic. It is stateful, meaning if you permit inbound traffic on a port, outbound response traffic is automatically allowed."
  },
  {
    id: 15,
    question: "What is Amazon Route 53?",
    answer: "Amazon Route 53 is a highly available and scalable cloud Domain Name System (DNS) web service. It translates human-friendly domain names (like www.google.com) into numeric IP addresses so computers can connect to each other."
  },
  {
    id: 16,
    question: "What is an Application Load Balancer (ALB) in AWS?",
    answer: "An ALB is a service that automatically distributes incoming web traffic across multiple targets (like EC2 instances or containers) in different Availability Zones, preventing any single server from becoming overloaded and ensuring high application availability."
  },
  {
    id: 17,
    question: "What is AWS Auto Scaling?",
    answer: "AWS Auto Scaling is a service that monitors your applications and automatically adjusts virtual server capacity (adding or removing EC2 instances) to maintain steady, predictable performance at the lowest possible cost based on traffic demand."
  },
  {
    id: 18,
    question: "What is Amazon CloudWatch?",
    answer: "Amazon CloudWatch is a monitoring and management service that collects metrics, logs, and events from your AWS resources, allowing you to track CPU usage, network activity, and trigger automated alerts or alarms when thresholds are crossed."
  },
  {
    id: 19,
    question: "What is AWS CloudTrail?",
    answer: "AWS CloudTrail is an auditing service that records and logs every API call and user action made within your AWS account. It helps you track who made changes, from where, and when for security and compliance audits."
  },
  {
    id: 20,
    question: "What is Amazon CloudFront?",
    answer: "Amazon CloudFront is a fast content delivery network (CDN) service that securely delivers data, videos, applications, and APIs to users globally with low latency by caching copies of files at edge locations closer to the users."
  },
  {
    id: 21,
    question: "What is the AWS Shared Responsibility Model?",
    answer: "It is a framework defining security obligations. AWS is responsible for security 'of' the cloud (protecting global infrastructure, data centers, hardware, virtualization). The customer is responsible for security 'in' the cloud (securing their data, managing users, patching guest operating systems, and configuring firewalls)."
  },
  {
    id: 22,
    question: "What is Amazon ECS (Elastic Container Service)?",
    answer: "Amazon ECS is a highly scalable, high-performance container orchestration and management service that allows you to easily run and manage Docker containers on AWS servers."
  },
  {
    id: 23,
    question: "What is AWS Fargate?",
    answer: "AWS Fargate is a serverless compute engine for containers. It works with ECS and EKS, allowing you to run Docker containers directly without needing to provision, manage, or scale any underlying EC2 instances."
  },
  {
    id: 24,
    question: "What is AWS Elastic Beanstalk?",
    answer: "AWS Elastic Beanstalk is an easy-to-use platform-as-a-service (PaaS) that automates the deployment, provisioning, load balancing, and scaling of web applications (developed in Node.js, Python, Java, Docker, etc.) based on your uploaded application code."
  },
  {
    id: 25,
    question: "What is Amazon SQS (Simple Queue Service)?",
    answer: "Amazon SQS is a fully managed, secure message queuing service that enables you to decouple and integrate microservices, serverless apps, and distributed backend systems, ensuring smooth asynchronous message transmission."
  },
  {
    id: 26,
    question: "What is Amazon SNS (Simple Notification Service)?",
    answer: "Amazon SNS is a fully managed pub/sub (publish/subscribe) messaging service that allows you to send notifications, SMS, emails, or trigger serverless endpoints (like AWS Lambda) from your applications."
  },
  {
    id: 27,
    question: "What is AWS Lambda and what is its pricing model?",
    answer: "AWS Lambda is a serverless compute service that lets you run code in response to events without managing servers. You only pay for the exact compute time you consume, measured in milliseconds, with no idle charges."
  },
  {
    id: 28,
    question: "What is AWS CloudFormation?",
    answer: "AWS CloudFormation is an Infrastructure as Code (IaC) service that allows you to define, provision, and update all of your AWS resources using JSON or YAML configuration templates."
  },
  {
    id: 29,
    question: "What is an Amazon S3 Bucket Policy?",
    answer: "An S3 Bucket Policy is an IAM policy document attached directly to an S3 bucket. It defines precise access rules specifying who (users or accounts) can perform which actions (like reading or writing) on the objects inside that bucket."
  },
  {
    id: 30,
    question: "What is Amazon EBS (Elastic Block Store)?",
    answer: "Amazon EBS provides persistent, high-performance block-level storage volumes designed for use with Amazon EC2 instances, behaving like physical hard drives or SSDs attached to your virtual servers."
  },
  {
    id: 31,
    question: "What is the primary difference between Amazon EBS and Amazon S3?",
    answer: "Amazon EBS is block-level storage attached directly to a single EC2 instance for fast read/writes (like an OS drive). Amazon S3 is object storage accessible globally via the internet, designed for unlimited general files, images, and backups."
  },
  {
    id: 32,
    question: "What is Amazon EFS (Elastic File System)?",
    answer: "Amazon EFS is a managed, scalable network file storage service that can be mounted and shared simultaneously by multiple EC2 instances, containers, or on-premises servers."
  },
  {
    id: 33,
    question: "What is an AWS NAT Gateway?",
    answer: "A NAT (Network Address Translation) Gateway is a managed service that allows resources in a private subnet (such as secure backend servers or databases) to connect outbound to the internet, while preventing the internet from initiating inbound connections to them."
  },
  {
    id: 34,
    question: "What is Amazon Redshift?",
    answer: "Amazon Redshift is a fully managed, fast, petabyte-scale data warehouse service in the cloud. It is highly optimized for running complex SQL queries on massive datasets for business intelligence and data analytics."
  },
  {
    id: 35,
    question: "What is the purpose of AWS Key Management Service (KMS)?",
    answer: "AWS KMS is a managed service that makes it easy for you to create, control, and manage cryptographic keys used to encrypt and decrypt your data across AWS services and custom applications."
  },
  {
    id: 36,
    question: "What is Amazon Cognito?",
    answer: "Amazon Cognito is a service that handles secure user sign-up, sign-in, and access control for your web and mobile applications, supporting standard emails/passwords as well as social logins (like Google, Facebook, or Apple)."
  },
  {
    id: 37,
    question: "What is AWS Secrets Manager?",
    answer: "AWS Secrets Manager is a service designed to securely store, retrieve, rotate, and manage sensitive application credentials, database passwords, API keys, and other secrets throughout their lifecycle."
  },
  {
    id: 38,
    question: "What is the main difference between Security Groups and Network ACLs (NACLs)?",
    answer: "Security Groups are stateful virtual firewalls that operate at the individual EC2 instance level. Network ACLs (NACLs) are stateless firewalls that operate at the subnet level, controlling inbound and outbound traffic for all resources in that subnet."
  },
  {
    id: 39,
    question: "What is an AWS Internet Gateway?",
    answer: "An Internet Gateway is a horizontally scaled, redundant, highly available VPC component that enables communication between resources in your VPC (like web servers in a public subnet) and the public internet."
  },
  {
    id: 40,
    question: "What is a Route Table in Amazon VPC?",
    answer: "A Route Table is a set of rules (called routes) that determines where network traffic from your subnets or gateways should be directed (e.g., routing internet-bound traffic to an Internet Gateway)."
  },
  {
    id: 41,
    question: "What is Amazon Aurora?",
    answer: "Amazon Aurora is a fully managed, highly durable, cloud-native relational database engine designed by AWS that is fully compatible with MySQL and PostgreSQL, delivering up to 5x the speed of standard databases."
  },
  {
    id: 42,
    question: "What is Amazon ElastiCache?",
    answer: "Amazon ElastiCache is a fully managed in-memory data store and cache service. It supports popular open-source engines Redis and Memcached, helping to significantly speed up database response times by caching frequently accessed data."
  },
  {
    id: 43,
    question: "How do you distinguish between AWS CloudTrail and Amazon CloudWatch?",
    answer: "CloudWatch is for monitoring system health, collecting metrics, and viewing application logs. CloudTrail is for security auditing, tracking and recording API actions, user logins, and configuration changes inside your AWS account."
  },
  {
    id: 44,
    question: "What is AWS Step Functions?",
    answer: "AWS Step Functions is a low-code visual workflow orchestrator used to build and coordinate distributed microservices, serverless applications, and data pipelines using state machines."
  },
  {
    id: 45,
    question: "What is Amazon VPC Peering?",
    answer: "VPC Peering is a private network connection between two Virtual Private Clouds (VPCs) that enables resources in either VPC to communicate with each other securely using private IP addresses as if they were in the same network."
  },
  {
    id: 46,
    question: "What is the AWS Command Line Interface (CLI)?",
    answer: "The AWS CLI is an open-source command-line tool that enables you to manage, control, and automate your AWS services and resources directly from your computer's terminal using scripts or commands."
  },
  {
    id: 47,
    question: "What is the AWS Well-Architected Framework?",
    answer: "It is a set of architectural best practices designed by AWS to help cloud architects build secure, high-performing, resilient, and efficient infrastructure, structured around six pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability."
  },
  {
    id: 48,
    question: "What is the difference between Horizontal and Vertical Scaling in AWS?",
    answer: "Horizontal scaling (scaling out/in) means adding or removing virtual servers (e.g., adding more EC2 instances). Vertical scaling (scaling up/down) means increasing or decreasing the physical size/resources of an existing server (e.g., upgrading an EC2 instance from t2.micro to t2.large)."
  },
  {
    id: 49,
    question: "What is AWS Budgets?",
    answer: "AWS Budgets is a financial planning and tracking tool that allows you to set custom cost and usage limits, sending you automated alerts (via email or SMS) when your actual or forecasted cloud spend exceeds your budgeted amounts."
  },
  {
    id: 50,
    question: "What is the AWS Free Tier?",
    answer: "The AWS Free Tier is a program that offers free access to a wide variety of popular cloud services (such as EC2, S3, RDS, and Lambda) under specific monthly usage limits, helping beginners and startups learn and test the platform for free."
  },
  {
    id: 51,
    question: "What is Amazon ECS (Elastic Container Service)?",
    answer: "Amazon ECS is a highly scalable, fast container management service used to run, stop, and manage Docker containers on a cluster of EC2 instances or serverless using AWS Fargate."
  },
  {
    id: 52,
    question: "What is AWS Fargate?",
    answer: "AWS Fargate is a serverless compute engine for containers that works with both Amazon ECS and EKS. It allows you to run containers without having to manage or provision the underlying virtual servers (EC2)."
  },
  {
    id: 53,
    question: "What is Amazon EKS (Elastic Kubernetes Service)?",
    answer: "Amazon EKS is a managed Kubernetes service that makes it easy for you to run and scale Kubernetes container orchestration applications on AWS without needing to install or operate your own Kubernetes control plane."
  },
  {
    id: 54,
    question: "What is AWS Elastic Beanstalk?",
    answer: "AWS Elastic Beanstalk is an easy-to-use Platform as a Service (PaaS) used for deploying and scaling web applications and services. You simply upload your code, and Beanstalk automatically handles provisioning, load balancing, auto-scaling, and health monitoring."
  },
  {
    id: 55,
    question: "What is AWS CodePipeline?",
    answer: "AWS CodePipeline is a fully managed continuous delivery service that helps you automate your release pipelines for fast and reliable application and infrastructure updates."
  },
  {
    id: 56,
    question: "What is AWS CodeBuild?",
    answer: "AWS CodeBuild is a fully managed build service in the cloud that compiles your source code, runs unit tests, and produces deployable software packages, charging you only for the build minutes you use."
  },
  {
    id: 57,
    question: "What is AWS CodeDeploy?",
    answer: "AWS CodeDeploy is a deployment service that automates application deployments to any instance, including EC2, serverless Lambda functions, ECS containers, or on-premises servers."
  },
  {
    id: 58,
    question: "What is Amazon Route 53?",
    answer: "Amazon Route 53 is a highly available and scalable cloud Domain Name System (DNS) web service that routes user requests to internet applications by translating user-friendly domain names (like example.com) into numerical IP addresses."
  },
  {
    id: 59,
    question: "What is an AWS Transit Gateway?",
    answer: "AWS Transit Gateway is a network transit hub that simplifies VPC and on-premises network connections, acting as a cloud router where every new network connection is only made once to the transit hub."
  },
  {
    id: 60,
    question: "What is Amazon CloudFront?",
    answer: "Amazon CloudFront is a fast Content Delivery Network (CDN) service that securely delivers data, videos, applications, and APIs to users globally with low latency and high transfer speeds using edge locations."
  },
  {
    id: 61,
    question: "What is an AWS Edge Location?",
    answer: "An Edge Location is a specialized data center facility used by Amazon CloudFront to cache copies of your content closer to your users around the world for rapid, low-latency delivery."
  },
  {
    id: 62,
    question: "What is AWS WAF (Web Application Firewall)?",
    answer: "AWS WAF is a web application firewall that helps protect your web applications or APIs against common web exploits, SQL injections, cross-site scripting (XSS), and automated bots."
  },
  {
    id: 63,
    question: "What is AWS Shield?",
    answer: "AWS Shield is a managed Distributed Denial of Service (DDoS) protection service that safeguards applications running on AWS. Standard shield is enabled automatically for all customers for free."
  },
  {
    id: 64,
    question: "What is Amazon Inspector?",
    answer: "Amazon Inspector is an automated vulnerability management and security assessment service that continually scans AWS workloads (like EC2 instances and container images) for software vulnerabilities and unintended network exposure."
  },
  {
    id: 65,
    question: "What is AWS Trusted Advisor?",
    answer: "AWS Trusted Advisor is an online tool that acts as a customized cloud expert, analyzing your AWS environment and recommending best practices across five categories: Cost Optimization, Security, Fault Tolerance, Performance, and Service Limits."
  },
  {
    id: 66,
    question: "What is AWS Systems Manager (SSM)?",
    answer: "AWS Systems Manager is a management service that gives you complete visibility and control over your AWS resources, allowing you to automate tasks, view operational data, and patch operating systems securely."
  },
  {
    id: 67,
    question: "What is the AWS Pricing Calculator?",
    answer: "The AWS Pricing Calculator is a web-based planning tool that lets you estimate the monthly cost of AWS services based on your expected resource usage and architectural configurations."
  },
  {
    id: 68,
    question: "What is the AWS Cost Explorer?",
    answer: "AWS Cost Explorer is an analytics tool that lets you visualize, understand, and manage your historical and forecasted AWS costs and usage over time."
  },
  {
    id: 69,
    question: "What is an AWS Organization?",
    answer: "AWS Organizations is an account management service that enables you to consolidate and centrally manage multiple AWS accounts under a single administrative umbrella, supporting consolidated billing and unified access policies."
  },
  {
    id: 70,
    question: "What is Consolidated Billing in AWS?",
    answer: "Consolidated Billing is a feature of AWS Organizations that aggregates the charges from multiple AWS accounts into a single monthly invoice, allowing you to receive volume discount pricing benefits easily."
  },
  {
    id: 71,
    question: "What is an AWS Service Control Policy (SCP)?",
    answer: "An SCP is an organization-level policy used in AWS Organizations to specify the absolute maximum permissions available to accounts within your organization, setting guards that even root users in child accounts cannot override."
  },
  {
    id: 72,
    question: "What is Amazon Kinesis?",
    answer: "Amazon Kinesis is a platform of fully managed services designed to collect, process, and analyze real-time, streaming data (such as financial transactions, video feeds, or IoT logs) at massive scales."
  },
  {
    id: 73,
    question: "What is Amazon Athena?",
    answer: "Amazon Athena is an interactive, serverless query service that makes it easy to analyze data stored directly in Amazon S3 using standard SQL, without needing to load the data into a database first."
  },
  {
    id: 74,
    question: "What is Amazon Glue?",
    answer: "AWS Glue is a serverless data integration and ETL (Extract, Transform, and Load) service that makes it easy to discover, prepare, move, and integrate data from multiple sources for analytics."
  },
  {
    id: 75,
    question: "What is the AWS Shared Responsibility Model?",
    answer: "It is a security framework defining that AWS is responsible for the security 'of' the cloud (infrastructure, hardware, global networks), while the customer is responsible for security 'in' the cloud (customer data, access management, operating systems)."
  }
];
