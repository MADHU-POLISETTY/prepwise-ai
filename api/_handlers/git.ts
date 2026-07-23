export const gitQuestions = [
  {
    id: 1,
    question: "What is Git?",
    answer: "Git is a free, open-source, distributed version control system designed to handle everything from small to very large projects with speed and efficiency. It allows multiple developers to work on the same codebase simultaneously without overwriting each other's changes."
  },
  {
    id: 2,
    question: "What is Version Control?",
    answer: "Version Control is a system that records changes to a file or set of files over time so that you can recall specific versions later, track who made modifications, and easily revert code back to a previous working state."
  },
  {
    id: 3,
    question: "What is the difference between Git and GitHub?",
    answer: "Git is a local command-line version control tool installed on your computer. GitHub is a web-based hosting platform in the cloud that lets you store your Git repositories online, share code, and collaborate with others."
  },
  {
    id: 4,
    question: "What is a repository in Git?",
    answer: "A repository (often called a 'repo') is a folder that contains all of your project files, including a hidden '.git' directory which stores the entire history of changes, branches, commits, and configurations for that project."
  },
  {
    id: 5,
    question: "How do you initialize a new Git repository?",
    answer: "You initialize a new repository by navigating to your project directory in the terminal and running the command 'git init'. This creates the hidden '.git' subdirectory."
  },
  {
    id: 6,
    question: "How do you clone an existing repository?",
    answer: "You clone an existing repository using the command 'git clone <repository_url>'. This copies the remote repository (including all history and branches) onto your local machine."
  },
  {
    id: 7,
    question: "What is the staging area in Git?",
    answer: "The staging area (or index) is a middle-ground preparation area between your working directory and your repository history. It's where you select and organize the exact modifications you want to include in your next commit snapshot."
  },
  {
    id: 8,
    question: "How do you add files to the staging area?",
    answer: "You add files to the staging area using the command 'git add <filename>' (e.g., 'git add App.tsx'). To add all modified and new files at once, you can run 'git add .'."
  },
  {
    id: 9,
    question: "What is a Git commit?",
    answer: "A Git commit is a saved snapshot of all changes staged in the staging area. Each commit gets a unique SHA-1 hash ID, is accompanied by a descriptive message, and represents a permanent point in the project's history."
  },
  {
    id: 10,
    question: "How do you commit changes in Git?",
    answer: "You commit your staged changes by running 'git commit -m \"Your descriptive commit message\"'. The '-m' flag allows you to write the commit message directly inside the terminal command."
  },
  {
    id: 11,
    question: "What is the purpose of the 'git status' command?",
    answer: "The 'git status' command displays the current state of your working directory and staging area, showing which files are modified but untracked, which files are staged for the next commit, and your current branch."
  },
  {
    id: 12,
    question: "What does the 'git log' command do?",
    answer: "The 'git log' command displays the chronological history of commits for the current branch, showing each commit's SHA hash, author, date, and commit message."
  },
  {
    id: 13,
    question: "What is a branch in Git?",
    answer: "A branch in Git is an independent, lightweight pointer to a line of development. It allows you to isolate new features, fixes, or experiments from the main codebase (usually called 'main' or 'master') until they are fully completed and tested."
  },
  {
    id: 14,
    question: "How do you create and switch to a new branch?",
    answer: "You can create a branch using 'git branch <branch_name>' and switch to it using 'git checkout <branch_name>' (or 'git switch <branch_name>'). To do both in a single command, you can run 'git checkout -b <branch_name>'."
  },
  {
    id: 15,
    question: "How do you merge a branch into the current branch?",
    answer: "First, you switch to the branch you want to merge *into* (usually main), and then you execute the command 'git merge <branch_to_merge_from>'. This combines the histories and changes."
  },
  {
    id: 16,
    question: "What is a merge conflict?",
    answer: "A merge conflict occurs when you try to merge two branches that modified the exact same line of the same file in different ways, and Git cannot automatically decide which version to use. Git will pause the merge and ask you to resolve it manually."
  },
  {
    id: 17,
    question: "How do you resolve a merge conflict in Git?",
    answer: "To resolve a conflict, open the conflicted files in an editor, find the conflict markers (<<<<<<<, =======, >>>>>>>), manually edit the file to select the correct code, remove the markers, save the file, run 'git add <filename>' to stage, and run 'git commit' to complete the merge."
  },
  {
    id: 18,
    question: "What is the purpose of the 'git pull' command?",
    answer: "The 'git pull' command fetches the latest updates and commits from a remote repository and immediately merges them into your current local branch to keep your code in sync."
  },
  {
    id: 19,
    question: "What is the purpose of the 'git push' command?",
    answer: "The 'git push' command uploads your local commits to a remote repository (such as GitHub) so that others can pull and access your latest changes."
  },
  {
    id: 20,
    question: "What is the difference between 'git fetch' and 'git pull'?",
    answer: "'git fetch' downloads new changes, tags, and branches from the remote repository to your local history but does NOT merge them into your working files. 'git pull' is a shortcut that performs both a 'git fetch' and a 'git merge' immediately."
  },
  {
    id: 21,
    question: "What is the '.gitignore' file?",
    answer: "The '.gitignore' file is a plain text file placed in your repository root. It lists patterns (such as node_modules/, .env, or system logs) of files and folders that you do NOT want Git to track or upload to GitHub."
  },
  {
    id: 22,
    question: "How do you discard local unstaged modifications in a file?",
    answer: "You can discard local changes made to a file before staging by running the command 'git restore <filename>' or 'git checkout -- <filename>'."
  },
  {
    id: 23,
    question: "What is the difference between 'git reset' and 'git revert'?",
    answer: "'git reset' changes the repository history by moving the HEAD pointer back to a previous commit, removing newer commits (should be used with caution). 'git revert' safely creates a new, separate commit that applies the exact opposite changes of a specified commit, preserving history."
  },
  {
    id: 24,
    question: "What is a 'remote' in Git?",
    answer: "A remote is a shared copy of your repository hosted on the internet or network (like GitHub or GitLab). The default remote name generated when you clone a repository is named 'origin'."
  },
  {
    id: 25,
    question: "What is the purpose of the 'git diff' command?",
    answer: "The 'git diff' command compares files and displays the line-by-line differences between your current working directory and either your staging area or your last commit."
  },
  {
    id: 26,
    question: "What is a commit message and why is it important?",
    answer: "A commit message is a short description of what changes were introduced in a commit. It is critical for maintaining an understandable history so teammates can quickly know *why* changes were made."
  },
  {
    id: 27,
    question: "What does the 'git log --oneline' command do?",
    answer: "The 'git log --oneline' command shows a highly condensed version of your commit history. It displays each commit on a single line, showing only its abbreviated SHA-1 hash and its commit message."
  },
  {
    id: 28,
    question: "What is 'git stash' and when would you use it?",
    answer: "'git stash' temporarily shelves (saves) your current uncommitted changes (both staged and unstaged) so you can switch branches to work on something else without losing or committing your incomplete work."
  },
  {
    id: 29,
    question: "How do you apply or bring back stashed changes?",
    answer: "You can restore your most recently stashed changes using 'git stash apply' (which keeps the changes in the stash) or 'git stash pop' (which applies the changes and removes them from the stash list)."
  },
  {
    id: 30,
    question: "What is the difference between 'git clone' and 'git fork'?",
    answer: "'git clone' is a Git command that copies any existing repository to your local computer. 'git fork' is a GitHub feature that creates a complete, duplicate copy of another user's repository directly on your cloud account."
  },
  {
    id: 31,
    question: "What is a Pull Request (PR) or Merge Request?",
    answer: "A Pull Request (PR) is a feature on hosting platforms like GitHub that lets you notify team members that you have completed changes in a branch and would like them to review and merge your code into the main repository."
  },
  {
    id: 32,
    question: "What is HEAD in Git?",
    answer: "HEAD is a special pointer in Git that references the current branch or commit you are currently checked out and working on in your working directory."
  },
  {
    id: 33,
    question: "What is 'git cherry-pick' used for?",
    answer: "The 'git cherry-pick <commit_hash>' command is used to select a single specific commit from one branch and apply its changes as a brand new commit on your current active branch."
  },
  {
    id: 34,
    question: "What is 'git rebase' and how is it different from 'git merge'?",
    answer: "'git rebase' takes all commits made on one branch and reapplies them on top of another branch, creating a completely flat, linear project history. Unlike 'git merge', it rewrites the commit history instead of creating a new merge commit."
  },
  {
    id: 35,
    question: "How do you delete a local Git branch?",
    answer: "You can safely delete a local branch that has already been merged by running 'git branch -d <branch_name>'. To forcefully delete a branch regardless of its merge status, use 'git branch -D <branch_name>'."
  },
  {
    id: 36,
    question: "How do you delete a remote Git branch?",
    answer: "You can delete a branch from your remote repository (like GitHub) using the command 'git push origin --delete <branch_name>'."
  },
  {
    id: 37,
    question: "What is the difference between 'origin' and 'upstream' in Git?",
    answer: "'origin' is the default name given to the remote repository you cloned your project from. 'upstream' is a custom name typically given to the original parent repository that you forked your project from."
  },
  {
    id: 38,
    question: "What does the 'git tag' command do?",
    answer: "The 'git tag' command is used to point to specific, important reference points in your commit history. It is most commonly used to mark release versions (e.g., 'v1.0.0')."
  },
  {
    id: 39,
    question: "How do you view the exact changes introduced in a specific commit?",
    answer: "You can view the details and line-by-line file differences of a specific commit by running 'git show <commit_hash>'."
  },
  {
    id: 40,
    question: "What is the purpose of configuring your Git username and email?",
    answer: "Git associates every commit you make with a specific name and email address. Configuring these ensures that anyone looking at the repository history knows exactly who authored each commit."
  },
  {
    id: 41,
    question: "How do you configure your Git username and email in the terminal?",
    answer: "You set them globally using: 'git config --global user.name \"Your Name\"' and 'git config --global user.email \"you@example.com\"'."
  },
  {
    id: 42,
    question: "What is Git LFS (Large File Storage)?",
    answer: "Git LFS is a Git extension that replaces large files (like videos, datasets, graphics, and binaries) with tiny text pointers inside Git, while storing the actual large files on an external cloud storage server to keep your repository fast."
  },
  {
    id: 43,
    question: "What is a 'bare repository' in Git?",
    answer: "A bare repository is a Git repository created without a working directory. It only contains the version control history files (the contents of the .git folder) and is used exclusively as a central repository for pushing and pulling."
  },
  {
    id: 44,
    question: "How do you change or edit the message of your most recent commit?",
    answer: "You can modify your latest unpushed commit message easily using the command 'git commit --amend -m \"New and corrected commit message\"'."
  },
  {
    id: 45,
    question: "What does the 'git clean' command do?",
    answer: "The 'git clean' command removes untracked files from your local working directory, which is useful to quickly wipe out build artifacts or temporary files not tracked by Git."
  },
  {
    id: 46,
    question: "What is a 'detached HEAD' state in Git?",
    answer: "A detached HEAD state occurs when you check out a specific commit hash directly instead of a branch pointer. Any new commits you make in this state won't belong to any branch and can easily be lost."
  },
  {
    id: 47,
    question: "How do you see who wrote a specific line in a file?",
    answer: "You can use the 'git blame <filename>' command, which displays a file line-by-line showing the commit hash, date, and author who last modified each line."
  },
  {
    id: 48,
    question: "What is a Git hook?",
    answer: "A Git hook is a custom script that Git executes automatically before or after key events (such as 'pre-commit' or 'post-merge') to automate tasks like running linters or automated testing."
  },
  {
    id: 49,
    question: "What is the difference between staging a file and committing a file?",
    answer: "Staging a file ('git add') is like placing an item in a packing box; it prepares the change to be saved. Committing ('git commit') is like sealing and labeling the box; it saves the snapshot permanently into the history."
  },
  {
    id: 50,
    question: "How do you view all configured remotes for your project?",
    answer: "You can view all registered remote repository URLs and their shortnames by running the command 'git remote -v'."
  },
  {
    id: 51,
    question: "What is the difference between 'git pull' and 'git fetch' followed by 'git merge'?",
    answer: "'git pull' is simply a shortcut command that runs 'git fetch' first and then immediately executes 'git merge' to integrate the remote changes into your local branch."
  },
  {
    id: 52,
    question: "How do you see the list of all branches, both local and remote?",
    answer: "You can list all local branches as well as remote-tracking branches registered on your machine by running the command 'git branch -a'."
  },
  {
    id: 53,
    question: "What is the difference between 'git checkout' and 'git switch'?",
    answer: "'git switch' is a newer, dedicated command introduced to switch branches safely. 'git checkout' is an older multi-purpose command that can switch branches, but also restore file changes."
  },
  {
    id: 54,
    question: "What does the command 'git init --bare' do?",
    answer: "It initializes a central, bare repository that contains only version control history files without an active working directory. It is used strictly for sharing and pushing code."
  },
  {
    id: 55,
    question: "How do you undo a commit that has already been pushed to a public remote repository safely?",
    answer: "You should use 'git revert <commit_hash>'. This creates a new, separate commit that applies the exact opposite changes of the target commit, preserving history and avoiding branch conflicts for others."
  },
  {
    id: 56,
    question: "How do you rename a local Git branch?",
    answer: "You can easily rename the current checked-out branch by running the command 'git branch -m <new_name>'."
  },
  {
    id: 57,
    question: "What does the 'git reflog' command do?",
    answer: "'git reflog' (reference log) records every single change made to the HEAD pointer (like switching branches, resetting, or making commits). This is highly useful for recovering lost commits or deleted branches."
  },
  {
    id: 58,
    question: "What is a fast-forward merge in Git?",
    answer: "A fast-forward merge occurs when the target branch has no new commits since you diverged. Git simply moves the branch pointer forward to match the source branch without creating a new merge commit."
  },
  {
    id: 59,
    question: "What is a three-way merge in Git?",
    answer: "A three-way merge occurs when both branches have diverged with independent commits. Git uses a common base ancestor commit and both branch tips to generate a new merge commit combining both histories."
  },
  {
    id: 60,
    question: "What is the purpose of the 'git prune' command?",
    answer: "The 'git prune' command cleans up and deletes unreachable or orphaned Git objects (commits, trees, files) that are no longer associated with any active branch or reference."
  },
  {
    id: 61,
    question: "What does the command 'git log -p' do?",
    answer: "It displays the commit history list along with the exact line-by-line code changes (diffs/patches) introduced in each individual commit."
  },
  {
    id: 62,
    question: "How do you check if a branch has been merged into your current branch?",
    answer: "You can run 'git branch --merged' to list all branches whose changes have already been successfully integrated into your current active branch."
  },
  {
    id: 63,
    question: "What does 'git checkout .' do?",
    answer: "It discards all unstaged local file modifications in your entire working directory, resetting your files back to the state of your last commit."
  },
  {
    id: 64,
    question: "How do you pull changes from a remote branch while rebasing instead of merging?",
    answer: "You can run the command 'git pull --rebase'. This fetches the remote updates and replays your local commits on top of them, maintaining a flat linear history."
  },
  {
    id: 65,
    question: "What is 'git-flow'?",
    answer: "Git-flow is a popular branching model and development workflow that defines a strict structure of branches (such as master, develop, feature, release, hotfix) to streamline software releases."
  },
  {
    id: 66,
    question: "What is the difference between 'soft', 'mixed', and 'hard' resets in Git?",
    answer: "'--soft' moves HEAD back but keeps all changes staged. '--mixed' (default) moves HEAD and unstages changes, keeping files modified. '--hard' discards all changes, resetting both the staging area and working directory completely."
  },
  {
    id: 67,
    question: "What is the difference between 'git diff --cached' and 'git diff'?",
    answer: "'git diff' displays changes in your working files compared to your staging area. 'git diff --cached' (or '--staged') displays changes in your staging area compared to your last commit."
  },
  {
    id: 68,
    question: "How do you configure a global exclude pattern for Git across all repositories?",
    answer: "You can create a global gitignore file on your computer and configure Git to use it by running: 'git config --global core.excludesfile <path_to_global_file>'."
  },
  {
    id: 69,
    question: "What is an annotated tag vs a lightweight tag in Git?",
    answer: "A lightweight tag is just a direct pointer to a specific commit. An annotated tag is stored as a full object in the Git database containing the tagger's name, email, date, and a custom tag message."
  },
  {
    id: 70,
    question: "How do you push a local tag to a remote repository?",
    answer: "You can push a specific tag using 'git push origin <tag_name>' or push all of your local tags at once using 'git push origin --tags'."
  },
  {
    id: 71,
    question: "What does 'git status -s' or '--short' do?",
    answer: "It displays a highly condensed, single-line summary of modified, staged, and untracked files using simple two-letter status codes."
  },
  {
    id: 72,
    question: "How do you view a graphical representation of the commit history and branch merges in the terminal?",
    answer: "You can run 'git log --graph --oneline --all' to render a clean, visual ASCII branch tree of your entire repository commits and merge paths."
  },
  {
    id: 73,
    question: "What is a submodule in Git?",
    answer: "A submodule is a feature that allows you to embed and track a separate Git repository inside a subdirectory of your main repository, keeping histories independent."
  },
  {
    id: 74,
    question: "How do you list all stashed items in your repository?",
    answer: "You can list all currently saved stashes in your repository by running the command 'git stash list'."
  },
  {
    id: 75,
    question: "How do you completely clear all stashed changes from your repository?",
    answer: "You can permanently delete all saved stashed changes from your local repository history by running the command 'git stash clear'."
  }
];
