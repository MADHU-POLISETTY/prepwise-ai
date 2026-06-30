export const dockerQuestions = [
  {
    id: 1,
    question: "What is Docker?",
    answer: "Docker is a containerization platform that allows developers to package applications and all their dependencies into a standardized, lightweight unit called a container. This ensures that the application runs consistently across different computing environments."
  },
  {
    id: 2,
    question: "What is a Docker Container?",
    answer: "A Docker container is a runtime instance of a Docker image. It is a lightweight, standalone, and executable package of software that includes everything needed to run an application, including code, runtime, system tools, libraries, and settings."
  },
  {
    id: 3,
    question: "What is a Docker Image?",
    answer: "A Docker image is a read-only, multi-layered template containing the instructions to build a Docker container. It is created using a Dockerfile and serves as the blueprint for creating containers."
  },
  {
    id: 4,
    question: "What is the main difference between a Docker Image and a Docker Container?",
    answer: "A Docker image is a passive, read-only template (like a class in programming), while a Docker container is an active, running instance of that image (like an object in programming). You can run multiple containers from a single image."
  },
  {
    id: 5,
    question: "What is a Dockerfile?",
    answer: "A Dockerfile is a text document containing all the commands and instructions (such as FROM, COPY, RUN, and CMD) that a user can run on the command line to assemble a Docker image."
  },
  {
    id: 6,
    question: "What is Docker Compose?",
    answer: "Docker Compose is a tool used for defining and running multi-container Docker applications. It uses a YAML file (typically docker-compose.yml) to configure the application's services, networks, and volumes, allowing you to start all services with a single command: docker compose up."
  },
  {
    id: 7,
    question: "What is Docker Hub?",
    answer: "Docker Hub is a cloud-based registry service provided by Docker. It allows users to store, share, and find container images, hosting thousands of official public and private repositories."
  },
  {
    id: 8,
    question: "What is a Docker Volume and why is it used?",
    answer: "A Docker volume is a mechanism for persisting data generated and used by Docker containers. Since containers are temporary and delete their data when destroyed, volumes store data securely on the host machine and allow sharing between containers."
  },
  {
    id: 9,
    question: "What is the difference between Docker and a Virtual Machine (VM)?",
    answer: "Docker containers share the host operating system's kernel, making them extremely lightweight, fast to start, and highly efficient. Virtual Machines include a full guest operating system, which requires more resources, storage, and take longer to boot."
  },
  {
    id: 10,
    question: "What is a Docker Registry?",
    answer: "A Docker registry is a centralized system used to store and distribute Docker images. Examples include Docker Hub, Amazon Elastic Container Registry (ECR), and Google Container Registry (GCR)."
  },
  {
    id: 11,
    question: "What is the purpose of the 'docker ps' command?",
    answer: "The 'docker ps' command lists all currently running Docker containers, showing their container IDs, images used, creation times, status, ports, and names. Adding the '-a' flag lists all containers, both running and stopped."
  },
  {
    id: 12,
    question: "What is the difference between the COPY and ADD instructions in a Dockerfile?",
    answer: "Both copy files from the host into the container. However, COPY is simple and preferred for copying local files. ADD has extra features: it can fetch files from remote URLs and automatically extract compressed archives (like .tar files)."
  },
  {
    id: 13,
    question: "How do you stop a running Docker container?",
    answer: "You stop a running container by executing the command 'docker stop <container_id_or_name>'. This sends a standard SIGTERM signal, followed by a SIGKILL if the container does not shut down within the grace period."
  },
  {
    id: 14,
    question: "What is the purpose of the '-d' flag in the 'docker run' command?",
    answer: "The '-d' (detached) flag runs the container in the background, freeing up the terminal window so you can continue running other commands while the container executes."
  },
  {
    id: 15,
    question: "What is a multi-stage build in Docker?",
    answer: "A multi-stage build allows developers to use multiple FROM statements in a single Dockerfile. This enables copying build artifacts from one stage to another, keeping the final production image small by leaving out build-time dependencies."
  },
  {
    id: 16,
    question: "What is the purpose of the 'docker exec' command?",
    answer: "The 'docker exec' command allows you to run new commands inside an already running container. It is commonly used with '-it' (interactive terminal) to open a shell inside the container for debugging."
  },
  {
    id: 17,
    question: "How do you remove a stopped Docker container and an unused Docker image?",
    answer: "You remove a container using 'docker rm <container_id_or_name>' and an image using 'docker rmi <image_id_or_name>'. To clean up all stopped containers, unused networks, and dangling images at once, you can run 'docker system prune'."
  },
  {
    id: 18,
    question: "What is the purpose of port mapping in Docker?",
    answer: "Port mapping (using the '-p' flag, e.g., -p 8080:80) maps a port on the host machine to a port inside the Docker container. This allows external users to access the application running inside the container through the host's network."
  },
  {
    id: 19,
    question: "What is Docker Swarm?",
    answer: "Docker Swarm is Docker's native clustering and orchestration tool. It allows you to manage a cluster of Docker engines (nodes) as a single virtual system, handling container scaling, updates, and high availability."
  },
  {
    id: 20,
    question: "What is a Docker network and what is its default type?",
    answer: "A Docker network enables containers to communicate with each other and with the outside world. The default network type is the 'bridge' network, which is used for standalone containers running on the same host."
  },
  {
    id: 21,
    question: "What is the .dockerignore file?",
    answer: "The .dockerignore file tells Docker which local files and directories (like node_modules or .git) to ignore when building an image. This speeds up the build process and keeps the image size smaller."
  },
  {
    id: 22,
    question: "What is a Docker run command?",
    answer: "The docker run command is used to create and start a new container from a specified Docker image. It combines the creation (docker create) and starting (docker start) steps into one."
  },
  {
    id: 23,
    question: "What is the difference between ENTRYPOINT and CMD in a Dockerfile?",
    answer: "ENTRYPOINT defines the main command that will always run when the container starts and is hard to override. CMD provides default arguments or commands that can be easily overridden when starting the container from the command line."
  },
  {
    id: 24,
    question: "What is the purpose of the 'docker logs' command?",
    answer: "The docker logs command retrieves and displays the console output (stdout and stderr) generated by a specific running or stopped container, which is useful for debugging issues."
  },
  {
    id: 25,
    question: "What is a Docker host?",
    answer: "The Docker host is the physical computer or virtual machine that runs the Docker daemon, manages the containers, and provides the system resources (CPU, RAM, storage) they need to execute."
  },
  {
    id: 26,
    question: "What does the EXPOSE instruction do in a Dockerfile?",
    answer: "The EXPOSE instruction serves as documentation to indicate which ports the container will listen on at runtime. It does not actually publish or open ports on the host machine; that still requires port mapping (-p)."
  },
  {
    id: 27,
    question: "What is the difference between system prune and volume prune?",
    answer: "docker system prune cleans up stopped containers, unused networks, and dangling build caches/images. However, it does not delete volumes by default. docker volume prune is used specifically to delete all unused volumes to reclaim disk space."
  },
  {
    id: 28,
    question: "What is the purpose of the 'docker inspect' command?",
    answer: "The docker inspect command returns detailed, low-level configuration and state information about Docker objects (such as containers, images, volumes, or networks) in JSON format."
  },
  {
    id: 29,
    question: "What is a dangling image in Docker?",
    answer: "A dangling image (often shown as <none>:<none>) is an image that is no longer associated with any tagged image, usually created when you rebuild an image with the same name and tag."
  },
  {
    id: 30,
    question: "What is a bind mount and how is it different from a volume?",
    answer: "A bind mount links any specific folder or file on the host machine's filesystem directly to a path inside the container. Docker volumes are managed entirely by Docker in a dedicated storage area on the host."
  },
  {
    id: 31,
    question: "What is the difference between 'docker stop' and 'docker kill'?",
    answer: "docker stop sends a SIGTERM signal to let the container shut down gracefully. docker kill sends a SIGKILL signal to immediately and forcefully terminate the container process."
  },
  {
    id: 32,
    question: "What is the purpose of 'docker-compose down'?",
    answer: "The docker-compose down command stops and removes the containers, networks, and volumes that were created by the docker compose up command for that specific application."
  },
  {
    id: 33,
    question: "How does Docker cache layers during image builds?",
    answer: "Docker builds images instruction-by-instruction. If an instruction and the files it references haven't changed since the last build, Docker reuses the cached layer, significantly speeding up subsequent builds."
  },
  {
    id: 34,
    question: "What is the purpose of the WORKDIR instruction in a Dockerfile?",
    answer: "The WORKDIR instruction sets the working directory inside the container for any subsequent instructions (like RUN, CMD, ENTRYPOINT, COPY, or ADD). If the directory doesn't exist, Docker creates it automatically."
  },
  {
    id: 35,
    question: "What is the Docker Daemon?",
    answer: "The Docker Daemon (dockerd) is the background service running on the host that listens for Docker API requests and manages Docker objects like images, containers, networks, and volumes."
  },
  {
    id: 36,
    question: "What is the Docker Client?",
    answer: "The Docker Client (docker) is the command-line interface tool that developers use to interact with the Docker Daemon. When you run a command like docker run, the client sends the command to the daemon to execute."
  },
  {
    id: 37,
    question: "What is the ENV instruction in a Dockerfile?",
    answer: "The ENV instruction defines environment variables that will be available inside the container during both the build phase and when the container is running."
  },
  {
    id: 38,
    question: "What is the ARG instruction in a Dockerfile?",
    answer: "The ARG instruction defines variables that users can pass to Docker at build-time using the --build-arg flag. Unlike environment variables, ARG variables are not available once the container is running."
  },
  {
    id: 39,
    question: "What is the difference between host networking and bridge networking?",
    answer: "In bridge networking (default), containers run in an isolated network environment mapped to the host's ports. In host networking, the container shares the host's network namespace directly, using the host's IP and ports without isolation."
  },
  {
    id: 40,
    question: "What is a multi-container application?",
    answer: "A multi-container application is an app that uses separate containers for different parts of its stack (e.g., one container for the frontend web server, one for the backend API, and another for the database) working together."
  },
  {
    id: 41,
    question: "What is Docker Desktop?",
    answer: "Docker Desktop is an easy-to-install application for Mac, Windows, or Linux environments that enables you to build, run, and share containerized applications and microservices with a user-friendly graphical interface."
  },
  {
    id: 42,
    question: "How do you check the resource usage (CPU, Memory, Network) of running Docker containers?",
    answer: "You can use the 'docker stats' command to get a live, real-time data stream of CPU usage, memory consumption, network I/O, and block I/O for all of your running containers."
  },
  {
    id: 43,
    question: "What is a tmpfs mount in Docker?",
    answer: "A tmpfs mount is a temporary storage mount that is stored only in the host machine's system memory (RAM). Unlike volumes or bind mounts, it never writes files to the host's actual disk, making it fast and secure for sensitive temporary data."
  },
  {
    id: 44,
    question: "What is the purpose of the 'docker build' command?",
    answer: "The 'docker build' command reads a Dockerfile and creates a new Docker image from the instructions inside it. You use the '-t' flag with this command to give your newly built image a name and a tag."
  },
  {
    id: 45,
    question: "What is the purpose of the 'docker pull' command?",
    answer: "The 'docker pull' command downloads a specific Docker image from a registry (like Docker Hub) to your local machine so that you can run containers from it."
  },
  {
    id: 46,
    question: "What is the purpose of the 'docker push' command?",
    answer: "The 'docker push' command uploads a locally built Docker image to a remote container registry (like Docker Hub) so that other developers or deployment servers can pull and use it."
  },
  {
    id: 47,
    question: "What does the '--rm' flag do in 'docker run'?",
    answer: "The '--rm' flag tells Docker to automatically delete the container and its temporary filesystem as soon as it exits, which is great for keeping your system clean during quick one-off tasks."
  },
  {
    id: 48,
    question: "How do you share files between two running Docker containers?",
    answer: "You can share files between containers by mounting the exact same Docker volume to both containers. Any files written to that volume by one container will instantly be readable by the other."
  },
  {
    id: 49,
    question: "What is a base image in a Dockerfile?",
    answer: "A base image is the starting point for your custom image, specified using the 'FROM' instruction (for example, 'FROM node:18' or 'FROM ubuntu:latest'). It provides the operating system shell and basic utilities your application needs."
  },
  {
    id: 50,
    question: "What is the purpose of 'docker-compose.yml' file?",
    answer: "The 'docker-compose.yml' file is a configuration file written in YAML that describes all the services, databases, networks, and storage volumes required to run a multi-container application together."
  },
  {
    id: 51,
    question: "What is the difference between the 'docker run' and 'docker start' commands?",
    answer: "'docker run' is used to create and start a brand-new container from an image. 'docker start' is used to restart an existing container that was previously stopped without losing its configuration or data."
  },
  {
    id: 52,
    question: "How do you rename an existing Docker container?",
    answer: "You can rename an existing container using the command 'docker rename <old_name> <new_name>'."
  },
  {
    id: 53,
    question: "What is the 'docker compose ps' command used for?",
    answer: "The 'docker compose ps' command lists all the running and stopped containers associated with the current Docker Compose file, along with their status and ports."
  },
  {
    id: 54,
    question: "What is the default storage driver used by modern Docker?",
    answer: "Modern Docker installations typically use the 'overlay2' storage driver on Linux, which is highly optimized for performance and handles image layering efficiently."
  },
  {
    id: 55,
    question: "What is the 'docker compose logs' command used for?",
    answer: "The 'docker compose logs' command displays the aggregated, combined console logs of all the services running inside your current multi-container Docker Compose application."
  },
  {
    id: 56,
    question: "What is the purpose of the 'docker login' command?",
    answer: "The 'docker login' command authenticates your Docker CLI with a container registry (like Docker Hub or a private registry) so that you can pull private images or push your own images."
  },
  {
    id: 57,
    question: "What does the '--restart' flag do in 'docker run'?",
    answer: "The '--restart' flag configures the restart policy for a container, letting Docker automatically restart the container if it crashes (using '--restart on-failure') or if the host system reboots (using '--restart always')."
  },
  {
    id: 58,
    question: "How can you copy a file from your host machine into a running container?",
    answer: "You can copy files back and forth using the 'docker cp' command. For example, 'docker cp my-file.txt my-container:/app/my-file.txt' copies a file from your host machine into the container."
  },
  {
    id: 59,
    question: "What is the difference between a tag and an image ID in Docker?",
    answer: "An image ID is a unique, long SHA256 hash value that represents the exact contents of the image. A tag (like 'latest' or 'v1.0') is a friendly, human-readable nickname or label pointed to that image ID."
  },
  {
    id: 60,
    question: "What does the 'docker version' command show?",
    answer: "The 'docker version' command shows detailed information about the version of the Docker client and daemon running on your computer, which is helpful for troubleshooting compatibility issues."
  },
  {
    id: 61,
    question: "What are the different states of a Docker container?",
    answer: "A Docker container can be in one of several states: created, running, paused, restarting, removing, exited, or dead."
  },
  {
    id: 62,
    question: "What is the purpose of the 'docker history' command?",
    answer: "The 'docker history' command shows the history of an image, including the individual layers created, the commands run for each layer, and their sizes."
  },
  {
    id: 63,
    question: "What is the purpose of a HEALTHCHECK instruction in a Dockerfile?",
    answer: "The HEALTHCHECK instruction tells Docker how to test a container to check if it is still working properly. For example, it can check if a web server inside the container is responding to requests."
  },
  {
    id: 64,
    question: "What is the default user when a Docker container starts, and how can you change it?",
    answer: "By default, Docker containers run as the 'root' user. You can change this to a non-root user for better security using the 'USER' instruction in your Dockerfile or the '--user' flag in 'docker run'."
  },
  {
    id: 65,
    question: "What is the difference between Docker Swarm and Kubernetes?",
    answer: "Docker Swarm is Docker's native clustering tool which is easy to set up and great for simple applications. Kubernetes is a more powerful, complex, and feature-rich orchestration platform suited for large-scale, enterprise systems."
  },
  {
    id: 66,
    question: "What is the 'docker compose build' command used for?",
    answer: "The 'docker compose build' command builds or rebuilds services defined in your docker-compose.yml file that have a 'build' block, ensuring the images are up to date."
  },
  {
    id: 67,
    question: "What is the purpose of the 'docker network ls' command?",
    answer: "The 'docker network ls' command lists all networks created on your Docker host, showing their IDs, names, driver types (e.g., bridge, host, none), and scopes."
  },
  {
    id: 68,
    question: "What is a Docker bridge network?",
    answer: "A bridge network is the default private network created by Docker on a host. Containers connected to the same bridge network can communicate with each other easily using their internal IP addresses."
  },
  {
    id: 69,
    question: "What is a Docker overlay network?",
    answer: "An overlay network is used to connect multiple Docker daemons across different host machines, allowing containers running on different servers to communicate securely as if they were on the same network."
  },
  {
    id: 70,
    question: "How can you view the metadata or environment variables of a running container?",
    answer: "You can view all metadata and environment variables of a container by running the command 'docker inspect <container_id_or_name>'."
  },
  {
    id: 71,
    question: "What is the purpose of the 'docker top' command?",
    answer: "The 'docker top' command displays the active, running processes inside a specific container, much like the standard Linux 'top' command."
  },
  {
    id: 72,
    question: "How do you create a Docker volume manually?",
    answer: "You can create a standalone Docker volume manually by running the command 'docker volume create <volume_name>'."
  },
  {
    id: 73,
    question: "What is the difference between virtual machines and containers regarding resource allocation?",
    answer: "Virtual machines require you to pre-allocate a fixed amount of CPU, RAM, and disk space. Containers allocate and share host system resources dynamically, using only what they actually need at any given moment."
  },
  {
    id: 74,
    question: "What is a 'dangling volume' in Docker?",
    answer: "A dangling volume is a storage volume that is no longer associated with or mounted to any existing Docker container. These can be safely cleaned up using 'docker volume prune'."
  },
  {
    id: 75,
    question: "What is the purpose of the LABEL instruction in a Dockerfile?",
    answer: "The LABEL instruction adds metadata (key-value pairs) to an image. It can be used to organize images, record licensing information, or document contact details for the maintainer."
  },
  {
    id: 76,
    question: "What is the 'docker diff' command?",
    answer: "The 'docker diff' command inspects changes made to a container's filesystem since it was created, listing added (A), deleted (D), or modified (C) files."
  },
  {
    id: 77,
    question: "Can a paused container consume CPU resources?",
    answer: "No, a paused container has its processes suspended using the cgroups freezer, so it does not consume CPU cycles, though it still holds onto its allocated memory (RAM)."
  },
  {
    id: 78,
    question: "What is the difference between 'docker rm' and 'docker rmi'?",
    answer: "The 'docker rm' command is used to delete stopped containers, whereas 'docker rmi' is used to delete Docker images from your local system."
  },
  {
    id: 79,
    question: "How do you run a command inside a running container as the root user if the default user is different?",
    answer: "You can run a command as root by using 'docker exec -u root -it <container_id_or_name> <command>'."
  },
  {
    id: 80,
    question: "What is the purpose of a .dockerignore file compared to a .gitignore file?",
    answer: "A .gitignore file tells Git which files to exclude from version control, while a .dockerignore file tells the Docker client which files to exclude from the build context sent to the Docker daemon."
  },
  {
    id: 81,
    question: "What is the Docker Build Context?",
    answer: "The build context is the set of local files and directories specified when you run 'docker build' (usually defined by a path like '.'). All files in this context are sent to the Docker daemon, so it can find files to copy inside the image."
  },
  {
    id: 82,
    question: "What is the difference between RUN, CMD, and ENTRYPOINT in a Dockerfile?",
    answer: "'RUN' executes commands and creates a new image layer during the build phase. 'CMD' provides default commands or arguments to run when a container starts, which can be easily overridden. 'ENTRYPOINT' configures the primary command that will always run when the container starts."
  },
  {
    id: 83,
    question: "What is the purpose of Docker Swarm Manager and Worker Nodes?",
    answer: "Manager nodes in Docker Swarm handle cluster management, scheduling of containers, and maintaining the swarm's desired state. Worker nodes are responsible for executing the actual containers and services assigned to them by the manager."
  },
  {
    id: 84,
    question: "What is the role of cgroups (control groups) in Docker?",
    answer: "cgroups (control groups) is a Linux kernel feature that limits, accounts for, and isolates the physical resource usage (such as CPU, memory, disk I/O, and network) of a collection of processes, preventing any single container from consuming all host resources."
  },
  {
    id: 85,
    question: "What is the role of namespaces in Docker?",
    answer: "Namespaces provide the primary layer of isolation in Docker. They ensure that processes running inside a container cannot see or affect processes, network interfaces, mount points, or user IDs in other containers or on the host machine."
  },
  {
    id: 86,
    question: "What is the purpose of the 'docker volume ls' command?",
    answer: "The 'docker volume ls' command lists all storage volumes currently registered and managed by Docker on the host machine."
  },
  {
    id: 87,
    question: "Can you run Windows containers on a Linux host?",
    answer: "No, you cannot run native Windows containers directly on a Linux host because containers share the underlying operating system's kernel. However, you can run Linux containers on Windows using virtualization layers like WSL2."
  },
  {
    id: 88,
    question: "What was the purpose of the '--link' flag in Docker?",
    answer: "The '--link' flag was an older method used to allow one container to securely communicate with another by adding host entries. It is now deprecated in favor of user-defined bridge networks, which provide automatic service discovery."
  },
  {
    id: 89,
    question: "How does Docker ensure container isolation?",
    answer: "Docker achieves container isolation by utilizing native Linux kernel features: Namespaces (for workspace isolation like network, process, and mounts) and Control Groups / cgroups (for physical resource limits like CPU and memory)."
  },
  {
    id: 90,
    question: "What is the purpose of the 'docker events' command?",
    answer: "The 'docker events' command listens to and displays a real-time stream of events from the Docker daemon, such as containers starting, stopping, being created, or images being pulled."
  },
  {
    id: 91,
    question: "What is the difference between a Virtual Machine Hypervisor and Docker?",
    answer: "A Hypervisor (like VMware or VirtualBox) manages and runs entire Virtual Machines, each containing a complete guest OS. Docker runs directly on the host OS kernel, using namespaces and cgroups to isolate applications without needing a hypervisor or guest OS."
  },
  {
    id: 92,
    question: "What is the difference between Docker official images and community images?",
    answer: "Official images (like 'node' or 'ubuntu') are curated, optimized, and regularly maintained by Docker and the software authors for security and best practices. Community images are created and published by individual users or organizations and may vary in quality and safety."
  },
  {
    id: 93,
    question: "How do you find the port mapping of a container using the command line?",
    answer: "You can find the active port mapping of a container using the command 'docker port <container_id_or_name>', or by looking under the PORTS column in 'docker ps'."
  },
  {
    id: 94,
    question: "What is the difference between 'docker compose up' and 'docker compose start'?",
    answer: "'docker compose up' builds, creates, starts, and attaches to containers for a service, creating networks and volumes if needed. 'docker compose start' only restarts existing, stopped containers without creating or modifying anything."
  },
  {
    id: 95,
    question: "What is the 'docker save' command used for?",
    answer: "The 'docker save' command exports one or more Docker images to a compressed tar archive file. This is useful for transferring images to machines without an internet connection or container registry."
  },
  {
    id: 96,
    question: "What is the 'docker load' command used for?",
    answer: "The 'docker load' command imports a Docker image from a compressed tar archive file (created using 'docker save') back into your local Docker registry."
  },
  {
    id: 97,
    question: "What is the 'docker export' command used for?",
    answer: "The 'docker export' command exports a container's entire file system as a tar archive, discarding all image layer history and metadata to create a flat, single-layer filesystem backup."
  },
  {
    id: 98,
    question: "What is the 'docker import' command used for?",
    answer: "The 'docker import' command creates a new, flat Docker image from a container's filesystem tar archive (created using 'docker export'). All original layer history is lost in this process."
  },
  {
    id: 99,
    question: "What is a Docker secret?",
    answer: "A Docker secret is a secure way to store and transmit sensitive data (like passwords, API keys, and SSL certificates) to containers in a Swarm cluster, encrypting the data both in transit and at rest."
  },
  {
    id: 100,
    question: "How do you check the version of Docker Compose?",
    answer: "You can check the installed version of Docker Compose by running the command 'docker compose version' or the older 'docker-compose --version'."
  }
];
