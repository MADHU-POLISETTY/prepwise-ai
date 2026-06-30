export const linuxQuestions = [
  {
    id: 1,
    question: "What is Linux?",
    answer: "Linux is an open-source, Unix-like operating system kernel. It serves as the core foundation for many operating systems (called distributions) such as Ubuntu, Debian, CentOS, and Fedora, managing the system's hardware and resources."
  },
  {
    id: 2,
    question: "What is the Linux kernel?",
    answer: "The Linux kernel is the central, core component of the operating system. It acts as a bridge between the software applications and the physical computer hardware, managing CPU, memory, disk drives, and network interfaces."
  },
  {
    id: 3,
    question: "What is a Shell in Linux?",
    answer: "A Shell is a command-line interpreter that acts as an interface between the user and the operating system. It accepts user commands as text input, translates them for the kernel, and executes them (examples include Bash, Zsh, and Sh)."
  },
  {
    id: 4,
    question: "What is the difference between an absolute path and a relative path?",
    answer: "An absolute path is the complete path starting from the root directory '/' (e.g., /home/user/documents/file.txt). A relative path is the path starting from your current working directory (e.g., ./documents/file.txt)."
  },
  {
    id: 5,
    question: "What is the root directory in Linux, and what is its symbol?",
    answer: "The root directory is the top-level directory in the entire Linux filesystem hierarchy from which all other directories and files stem. It is represented by a single forward slash '/'."
  },
  {
    id: 6,
    question: "What does the 'ls' command do?",
    answer: "The 'ls' command lists all files and directories inside your current working directory. Adding flags like '-l' shows detailed list information (permissions, owner, size) and '-a' shows hidden files starting with a dot."
  },
  {
    id: 7,
    question: "What does the 'pwd' command do?",
    answer: "The 'pwd' command stands for 'Print Working Directory'. It displays the absolute, complete path of the directory you are currently working in."
  },
  {
    id: 8,
    question: "How do you create a new directory in Linux?",
    answer: "You create a new directory using the 'mkdir' command followed by the directory name (e.g., 'mkdir projects')."
  },
  {
    id: 9,
    question: "How do you create an empty file in Linux?",
    answer: "You can create an empty file quickly using the 'touch' command followed by the filename (e.g., 'touch index.html'). It is also used to update the modification timestamp of an existing file."
  },
  {
    id: 10,
    question: "How do you copy files or directories in Linux?",
    answer: "You use the 'cp' command. For example, 'cp file.txt backup.txt' copies a file. To copy a directory and all of its contents recursively, you must add the '-r' flag (e.g., 'cp -r folder/ backup-folder/')."
  },
  {
    id: 11,
    question: "How do you move or rename files and directories?",
    answer: "You use the 'mv' command for both operations. To rename a file: 'mv old.txt new.txt'. To move a file to another folder: 'mv file.txt /path/to/destination/'."
  },
  {
    id: 12,
    question: "How do you delete files and directories in Linux?",
    answer: "You delete files using the 'rm' command (e.g., 'rm file.txt'). To delete directories and their contents recursively, you use the '-r' flag (e.g., 'rm -r myfolder/'). To delete an empty directory, you can also use 'rmdir'."
  },
  {
    id: 13,
    question: "What is the purpose of the 'sudo' command?",
    answer: "The 'sudo' command stands for 'Superuser Do'. It allows a permitted user to execute administrative commands with superuser/root privileges, usually asking for the user's password for verification."
  },
  {
    id: 14,
    question: "What is the root user in Linux?",
    answer: "The root user is the default superuser/system administrator account in Linux. It has absolute, unrestricted access to all files, directories, commands, and system configurations."
  },
  {
    id: 15,
    question: "What does the 'chmod' command do?",
    answer: "The 'chmod' (change mode) command changes the read (r), write (w), and execute (x) permissions of a file or directory for the owner, group, and others."
  },
  {
    id: 16,
    question: "What do the permissions r, w, and x stand for in Linux?",
    answer: "In Linux, permissions are: 'r' for read (ability to open and view contents), 'w' for write (ability to edit, modify, or delete), and 'x' for execute (ability to run a file as a program or script, or enter a directory)."
  },
  {
    id: 17,
    question: "What is the purpose of the 'grep' command?",
    answer: "The 'grep' command stands for 'Global Regular Expression Print'. It searches for a specific string of characters or text pattern inside files and displays the matching lines."
  },
  {
    id: 18,
    question: "What does the 'cat' command do?",
    answer: "The 'cat' (concatenate) command is used to read, display, concatenate, and write file contents directly to the terminal."
  },
  {
    id: 19,
    question: "How do you check memory (RAM) usage in Linux?",
    answer: "You can check memory usage using the 'free' command (commonly 'free -m' or 'free -h' for human-readable megabytes/gigabytes), or by monitoring active memory usage in the 'top' dashboard."
  },
  {
    id: 20,
    question: "How do you check disk space usage in Linux?",
    answer: "You can check disk space usage using the 'df' command (usually 'df -h' for human-readable output, showing used and available space on mounted filesystems)."
  },
  {
    id: 21,
    question: "What is a package manager in Linux?",
    answer: "A package manager is a built-in software tool that automates the installation, updating, configuration, and removal of application packages and dependencies on Linux (examples include 'apt' for Debian/Ubuntu and 'yum' or 'dnf' for RedHat/CentOS)."
  },
  {
    id: 22,
    question: "How do you view active running processes in Linux?",
    answer: "You can use the 'ps' command (e.g., 'ps aux' for a static list of all system processes) or the 'top' / 'htop' commands for a live, interactive, real-time dashboard of processes."
  },
  {
    id: 23,
    question: "How do you terminate a running process in Linux?",
    answer: "You can terminate a running process using the 'kill' command followed by the process ID (PID) (e.g., 'kill 1234'). If it refuses to exit, you can use the force flag: 'kill -9 1234'."
  },
  {
    id: 24,
    question: "What is the purpose of the 'man' command?",
    answer: "The 'man' (manual) command is used to view the official reference manuals, options, and documentation for other commands (e.g., 'man grep')."
  },
  {
    id: 25,
    question: "What is the difference between a hard link and a soft (symbolic) link?",
    answer: "A soft link (symlink) is a shortcut that points to another filename path; if the original file is deleted, the symlink breaks. A hard link points directly to the underlying physical data (inode) on disk; it continues to work even if the original file is deleted."
  },
  {
    id: 26,
    question: "What is the /etc/passwd file in Linux?",
    answer: "The /etc/passwd file is a plain text file containing basic user account details, such as the username, user ID (UID), group ID (GID), home directory path, and default login shell for every user on the system."
  },
  {
    id: 27,
    question: "What is a zombie process in Linux?",
    answer: "A zombie process is a completed process whose execution is finished, but its entry still remains in the process table to let its parent read its exit status. It consumes no CPU or memory, but keeps its process ID."
  },
  {
    id: 28,
    question: "What is the purpose of the 'tar' command?",
    answer: "The 'tar' (Tape Archive) command is used to combine multiple files and directories into a single archive file (often compressed), commonly referred to as a 'tarball' (.tar or .tar.gz)."
  },
  {
    id: 29,
    question: "How do you find the IP address of a Linux machine?",
    answer: "You can find your IP address using commands like 'ip addr show' (or 'ip a') or the older 'ifconfig' command in the terminal."
  },
  {
    id: 30,
    question: "What is an inode in Linux?",
    answer: "An inode (index node) is a database metadata record that stores all characteristics and information about a file or directory (such as size, owner, permissions, creation date) except for its actual filename and content data."
  },
  {
    id: 31,
    question: "What is the difference between the 'chown' and 'chmod' commands?",
    answer: "'chown' is used to change the owner and group ownership of a file or directory, while 'chmod' is used to change the read, write, and execute permissions of that file or directory."
  },
  {
    id: 32,
    question: "What is the 'tail' command used for?",
    answer: "The 'tail' command displays the last few lines (default is 10) of a file. Adding the '-f' (follow) flag is extremely useful for watching logs update live in real-time."
  },
  {
    id: 33,
    question: "What is the 'head' command used for?",
    answer: "The 'head' command displays the very first few lines (default is 10) of a file, which is helpful to quickly inspect the header or beginning of large files."
  },
  {
    id: 34,
    question: "What is the difference between a CLI and a GUI in Linux?",
    answer: "CLI (Command Line Interface) is a text-based interface where users interact with the system by typing commands. GUI (Graphical User Interface) is a visual, mouse-driven interface with windows, icons, and menus."
  },
  {
    id: 35,
    question: "What is SSH (Secure Shell) and how is it used?",
    answer: "SSH is a cryptographic network protocol used to securely connect to and manage a remote Linux computer or server over an unsecured network using encrypted terminal communication."
  },
  {
    id: 36,
    question: "What are environment variables in Linux, and how do you view them?",
    answer: "Environment variables are system-wide key-value pairs used to configure the behavior of processes and shells. You can view them all by typing the 'env' command, or output a specific one using 'echo $VARIABLE_NAME' (e.g., 'echo $PATH')."
  },
  {
    id: 37,
    question: "What is swap space in Linux?",
    answer: "Swap space is a dedicated area on a hard drive or SSD that Linux uses as overflow memory when the physical RAM is completely full, temporarily moving inactive memory blocks (pages) to disk storage."
  },
  {
    id: 38,
    question: "What does the 'ping' command do?",
    answer: "The 'ping' command sends small ICMP echo request packets to a specified network host or IP address to test network connectivity and measure the round-trip response time."
  },
  {
    id: 39,
    question: "What is a daemon process in Linux?",
    answer: "A daemon is a background process that runs continuously to handle system tasks and service requests without any direct user interaction, typically ending with the letter 'd' (e.g., 'sshd', 'httpd', 'systemd')."
  },
  {
    id: 40,
    question: "How do you find files matching a specific name pattern in Linux?",
    answer: "You can find files using the 'find' command (e.g., 'find . -name \"*.txt\"' searches for text files starting from the current directory) or the quick indexed 'locate' command."
  },
  {
    id: 41,
    question: "What is the difference between command output redirection symbols '>' and '>>'?",
    answer: "The '>' symbol redirects standard output to a file, overwriting any existing content in that file. The '>>' symbol appends the output to the end of the file, preserving its existing contents."
  },
  {
    id: 42,
    question: "What is a pipe (|) in Linux?",
    answer: "A pipe (|) is a shell redirection operator that takes the standard output of one command and feeds it directly as the standard input into the next command (e.g., 'ls -l | grep \"reports\"')."
  },
  {
    id: 43,
    question: "What is the purpose of the /etc/hosts file?",
    answer: "The /etc/hosts file is a local plain text file that maps hostnames to IP addresses. The system checks this file to translate domains locally before querying external DNS servers."
  },
  {
    id: 44,
    question: "How can you view system log files in Linux?",
    answer: "System log files are usually stored in the '/var/log/' directory (e.g., /var/log/syslog or /var/log/messages). You can view them using commands like 'cat', 'less', 'tail', or using the modern 'journalctl' utility."
  },
  {
    id: 45,
    question: "What is a cron job and crontab in Linux?",
    answer: "A cron job is a scheduled background task that runs automatically at specified times or intervals. The schedules and commands are configured inside a configuration file called a 'crontab'."
  },
  {
    id: 46,
    question: "What is the difference between 'su' and 'sudo'?",
    answer: "'su' (switch user) logs you completely into another user's shell (usually the root user, requiring the root password). 'sudo' (superuser do) lets you run a single command with root privileges using your own password."
  },
  {
    id: 47,
    question: "What does the 'uname' command do?",
    answer: "The 'uname' command prints detailed information about the system architecture, operating system name, hostname, and the running Linux kernel version (using 'uname -a')."
  },
  {
    id: 48,
    question: "What is the /tmp directory used for?",
    answer: "The /tmp directory is used to store temporary files created by the system and running programs. Its contents are often cleared automatically whenever the system reboots."
  },
  {
    id: 49,
    question: "What is the 'history' command in Linux?",
    answer: "The 'history' command displays a numbered list of all the terminal commands that the current logged-in user has previously executed in their terminal session."
  },
  {
    id: 50,
    question: "What is an alias in Linux and how do you create one?",
    answer: "An alias is a custom, user-defined shortcut for a long or frequently used terminal command. You can create one temporarily using 'alias ll=\"ls -la\"' or make it permanent by adding it to your '~/.bashrc' file."
  },
  {
    id: 51,
    question: "What is the purpose of the 'wc' command in Linux?",
    answer: "The 'wc' (word count) command counts and displays the exact number of lines, words, characters, and bytes in a specified file or input text stream."
  },
  {
    id: 52,
    question: "What does the 'locate' command do?",
    answer: "The 'locate' command searches for files on your system quickly by querying a pre-built database of your system's files rather than searching the actual disk live (unlike 'find')."
  },
  {
    id: 53,
    question: "What is a soft limit vs a hard limit in Linux resource management?",
    answer: "A soft limit is the resource limit that a user or process has active at any time, which they can increase up to the hard limit. A hard limit is the absolute, unchangeable ceiling set by the system administrator."
  },
  {
    id: 54,
    question: "What is the /etc/fstab file?",
    answer: "The /etc/fstab (filesystem table) file is a configuration file that contains information about disk drives, partitions, and how they should be automatically mounted on system startup."
  },
  {
    id: 55,
    question: "What is the purpose of the 'chgrp' command?",
    answer: "The 'chgrp' command stands for 'change group'. It is used to change the group ownership of a file or directory in Linux."
  },
  {
    id: 56,
    question: "What does the 'top' command's 'load average' mean?",
    answer: "Load average represents the average system load (number of running or waiting processes) over three time periods: the last 1 minute, the last 5 minutes, and the last 15 minutes."
  },
  {
    id: 57,
    question: "What is the 'less' command, and why is it preferred over 'cat' for large files?",
    answer: "The 'less' command is a terminal pager that views text files one screenful at a time. It is much faster and more memory-efficient than 'cat' because it does not load the entire large file into memory at once."
  },
  {
    id: 58,
    question: "What are standard input (stdin), standard output (stdout), and standard error (stderr)?",
    answer: "These are the three standard data streams in Linux. stdin (file descriptor 0) is input to a command. stdout (1) is normal command output. stderr (2) is error output. By default, all three connect to the terminal."
  },
  {
    id: 59,
    question: "What is the difference between 'gzip' and 'tar'?",
    answer: "'tar' combines multiple files or directories into a single archive file without compressing them. 'gzip' is a utility used to compress a single file to make it smaller. They are often combined to create compressed '.tar.gz' files."
  },
  {
    id: 60,
    question: "What does 'chmod 755' mean in Linux file permissions?",
    answer: "It grants full read, write, and execute permissions (7) to the owner, and read and execute permissions (5) to both the group and all other users."
  },
  {
    id: 61,
    question: "What does 'chmod 644' mean in Linux file permissions?",
    answer: "It grants read and write permissions (6) to the owner, and read-only permissions (4) to both the group and all other users. This is standard for static web pages and configuration files."
  },
  {
    id: 62,
    question: "What is the purpose of the 'diff' command?",
    answer: "The 'diff' command compares two files line-by-line and displays the exact differences between them, making it easy to review changes."
  },
  {
    id: 63,
    question: "What is the purpose of the 'ln' command?",
    answer: "The 'ln' (link) command is used to create links (hard links or soft/symbolic links) between files or directories on your system."
  },
  {
    id: 64,
    question: "What does the 'sed' command do?",
    answer: "The 'sed' (stream editor) command performs basic text transformations, searches, and replacements on an input stream or file automatically without opening a text editor."
  },
  {
    id: 65,
    question: "What does the 'awk' command do?",
    answer: "'awk' is a pattern scanning and text processing language used to manipulate data, extract specific columns, and generate formatted text reports from files."
  },
  {
    id: 66,
    question: "What is the /dev/null device in Linux?",
    answer: "/dev/null is a special virtual file (often called the 'null device' or 'black hole') that instantly discards all data written to it, and yields an immediate End-Of-File (EOF) when read."
  },
  {
    id: 67,
    question: "What is the purpose of the 'curl' command?",
    answer: "The 'curl' command is a tool used to transfer data to or from a server over various network protocols (like HTTP, HTTPS, FTP), commonly used to test API endpoints or download resources."
  },
  {
    id: 68,
    question: "What does the 'wget' command do?",
    answer: "The 'wget' command is a non-interactive, command-line network utility used to download files directly from the web or FTP servers."
  },
  {
    id: 69,
    question: "What is a background job in Linux, and how do you run one?",
    answer: "A background job runs independently of the terminal shell without blocking user input. You can run a command in the background by appending an ampersand '&' to it (e.g., 'sleep 100 &')."
  },
  {
    id: 70,
    question: "What are the 'fg' and 'bg' commands used for?",
    answer: "'fg' (foreground) brings a suspended or background job into the foreground so you can interact with it. 'bg' (background) resumes a paused background job, letting it keep running behind the scenes."
  },
  {
    id: 71,
    question: "What does the 'jobs' command show?",
    answer: "The 'jobs' command lists all active, paused, or background tasks currently running or suspended in the current terminal session."
  },
  {
    id: 72,
    question: "What is the purpose of the 'file' command?",
    answer: "The 'file' command determines and outputs the exact file type (such as ASCII text, directory, JPEG image, or executable binary) of a given file by inspecting its internal headers and signatures."
  },
  {
    id: 73,
    question: "What is the difference between a login shell and a non-login shell?",
    answer: "A login shell is the first shell started after a successful user login (loading system configs like '.profile' or '.bash_profile'). A non-login shell is started afterwards (like opening a terminal window in a GUI, loading '.bashrc')."
  },
  {
    id: 74,
    question: "What is the /etc/resolv.conf file?",
    answer: "The /etc/resolv.conf file is a configuration file that specifies the IP addresses of DNS nameservers the system should query to resolve hostnames into IP addresses."
  },
  {
    id: 75,
    question: "What is the purpose of the 'shutdown' command?",
    answer: "The 'shutdown' command securely halts, reboots, or powers off the system at a specified time, safely notifying all logged-in users and closing active applications first."
  }
];
