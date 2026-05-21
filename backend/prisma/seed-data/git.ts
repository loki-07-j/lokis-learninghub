import { CourseData } from './types';

export const gitCourse: CourseData = {
  title: 'Git & GitHub: Version Control Mastery',
  slug: 'git-github-mastery',
  description: 'Git is not just a backup tool — it\'s a content-addressable filesystem with a graph-based history model. Understanding how Git stores objects unlocks confident use of rebase, reflog, and recovery.',
  modules: [
    {
      title: 'Module 1: Git Internals & Collaboration',
      slug: 'git-internals-collaboration',
      description: 'From SHA-1 objects to merge strategies — the internal model that makes Git operations predictable.',
      sort_order: 10,
      topics: [
        {
          title: 'How Git Tracks Changes Internally',
          slug: 'git-internals',
          description: 'Git is a content-addressable key-value store. Everything is a hash. Understanding this explains why git is both reliable and recoverable.',
          sort_order: 10,
          lessons: [
            {
              title: 'Inside the .git Directory',
              slug: 'inside-git-directory',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why Git Was Created',
                  subtitle: 'Linus Torvalds, the Linux kernel, and BitKeeper',
                  content_json: {
                    history: 'In 2002, the Linux kernel switched from patches-via-email to BitKeeper — a proprietary VCS. In 2005, the free license was revoked. Linus Torvalds created Git in 2 weeks to replace it.',
                    design_goals: [
                      'Speed — fast branching/merging (Linux has 15,000+ files)',
                      'Simple design',
                      'Strong support for non-linear development (thousands of parallel branches)',
                      'Fully distributed — no central server required',
                      'Handle large projects efficiently',
                    ],
                    content_addressable: 'Linus\'s key design insight: store every object by the SHA-1 hash of its content. Same content = same hash. Different content = different hash. This makes Git\'s storage fundamentally reliable and deduplication automatic.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 3,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'Git\'s Four Object Types',
                  subtitle: 'Blob, Tree, Commit, Tag — the building blocks of history',
                  content_json: {
                    objects: [
                      {
                        type: 'Blob',
                        stores: 'File content. Just raw bytes.',
                        key_fact: 'Same file content = same blob hash, regardless of filename or location. Git deduplicates automatically.',
                      },
                      {
                        type: 'Tree',
                        stores: 'Directory listing: (mode, type, sha1, name) for each entry. Trees point to blobs (files) or other trees (subdirectories).',
                        key_fact: 'A tree represents the state of a directory at a point in time.',
                      },
                      {
                        type: 'Commit',
                        stores: 'tree SHA (root tree), parent commit SHA(s), author, committer, message.',
                        key_fact: 'A commit is a SNAPSHOT of the entire project, not a diff. But Git is space-efficient because unchanged files share the same blob.',
                      },
                      {
                        type: 'Tag (annotated)',
                        stores: 'Points to a commit, plus tagger, date, message.',
                        key_fact: 'Different from lightweight tags (just refs) — annotated tags are full objects.',
                      },
                    ],
                    the_graph: 'Commits form a directed acyclic graph (DAG). Each commit points to its parent(s). Merge commits have two parents. This graph IS your repository history.',
                  },
                  sort_order: 20,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'What Actually Happens During git commit',
                  subtitle: 'Tracing a commit from staging to .git/objects',
                  content_json: {
                    trace: [
                      '1. git add file.js — blob object created in .git/objects/ with SHA1(content). Index updated.',
                      '2. git commit — Git creates tree objects for each directory, pointing to blobs.',
                      '3. Git creates a commit object: { tree: <root-tree-sha>, parent: <prev-commit-sha>, author, message }.',
                      '4. The SHA1 of the commit object is the commit hash you see.',
                      '5. The current branch ref (.git/refs/heads/main) is updated to point to new commit SHA.',
                      '6. HEAD (.git/HEAD) still points to the branch (symbolic ref), which now points to the new commit.',
                    ],
                    why_commits_are_immutable: 'A commit\'s SHA1 is computed from its content (tree, parent, message, author). Changing anything changes the hash — creating a NEW object. The old object is still in .git/objects. This is why "rewriting history" actually creates new commits, not modifies old ones.',
                    git_dir_contents: {
                      '.git/objects/': 'All blobs, trees, commits — content-addressed',
                      '.git/refs/': 'Branch and tag pointers (text files with SHA)',
                      '.git/HEAD': 'Points to current branch (or detached HEAD commit)',
                      '.git/index': 'Staging area — tracks what will be in next commit',
                      '.git/COMMIT_EDITMSG': 'Last commit message',
                    },
                  },
                  sort_order: 30,
                  difficulty_level: 'ADVANCED',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'Using git reflog to Recover "Lost" Commits',
                  subtitle: 'How to undo almost any Git mistake',
                  content_json: {
                    what_is_reflog: 'git reflog records every change to HEAD — branch checkouts, commits, resets, merges. Even after git reset --hard, old commits are still in .git/objects for 90 days.',
                    recovery_scenario: `# Situation: You ran git reset --hard HEAD~3 accidentally
# Commits seem "lost"

git reflog
# Output:
# abc123 HEAD@{0}: reset: moving to HEAD~3
# def456 HEAD@{1}: commit: feature complete  ← this is your lost commit
# ...

git checkout def456  # or:
git reset --hard def456  # restore to the "lost" state
# Your commits are back!`,
                    other_recovery: [
                      'Deleted branch: git reflog shows where branch tip was. git checkout -b recovered-branch <sha>',
                      'Bad merge/rebase: ORIG_HEAD records state before. git reset --hard ORIG_HEAD',
                      'Stash dropped: git fsck --lost-found finds dangling objects',
                    ],
                    key_insight: 'Nothing is truly "lost" in Git until garbage collection runs (90 days by default). git reflog is your undo history for everything.',
                  },
                  sort_order: 40,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'Git Mistakes That Affect Teams',
                  subtitle: 'The commits that should never reach shared branches',
                  content_json: {
                    mistakes: [
                      {
                        mistake: 'Committing secrets (.env, API keys)',
                        consequence: 'Even after removing the file, the secret is in git history. Anyone who cloned has it.',
                        fix: 'Use git-secrets, .gitignore. If committed: rotate all credentials immediately. Use BFG Repo Cleaner to remove from history (requires force push).',
                      },
                      {
                        mistake: 'Force pushing to main/master',
                        consequence: 'Overwrites shared history. Team members\' local repos diverge. They cannot pull without conflicts. CI/CD pipelines may build wrong code.',
                        fix: 'Never: git push --force origin main. Use git push --force-with-lease (safer: checks remote hasn\'t changed). Better: never rewrite shared branch history.',
                      },
                      {
                        mistake: 'Giant binary files in repository',
                        consequence: 'Git stores entire history — a 100MB video added then removed is in .git forever. Clone size explodes. Slow operations.',
                        fix: 'Use .gitignore. Use Git LFS for binary assets. Remove with BFG: bfg --delete-files video.mp4',
                      },
                    ],
                  },
                  sort_order: 50,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: git rebase vs git merge',
                  subtitle: 'The most common Git interview question with real depth',
                  content_json: {
                    question: 'What is the difference between git rebase and git merge? When would you use each?',
                    answer: `Both integrate changes from one branch into another:

git merge:
- Creates a merge COMMIT with two parents
- Preserves complete history (all branch commits visible)
- Non-destructive — never modifies existing commits
- Safe for shared/public branches
- Result: "true" history showing exactly when branches diverged and merged

git rebase:
- Re-applies your commits on top of the target branch
- Creates NEW commits (same changes, different SHA, new parent)
- Linear history — looks like you developed directly on top of main
- DANGEROUS on shared branches — rewrites history others have
- Result: clean linear history, easier to git log / bisect

When to use:
- merge: integrating feature into main, any shared branches, when history accuracy matters
- rebase: keeping feature branch up-to-date with main (local only), cleaning up commits before PR (interactive rebase), team style that prefers linear history

Golden rule: "Never rebase public/shared branches"
Interactive rebase (git rebase -i) is powerful for squashing/fixing local commits before PR.`,
                    follow_up: 'What is git cherry-pick? — Apply a specific commit (by SHA) from another branch without merging the whole branch. Useful for hotfixes: cherry-pick the fix commit from main onto the release branch.',
                  },
                  sort_order: 60,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'Git Internals: Core Principles',
                  subtitle: 'The foundation that makes Git behavior predictable',
                  content_json: {
                    bullets: [
                      'Git is a content-addressable object store: SHA1(content) = object identifier',
                      'Four object types: blob (file), tree (directory), commit (snapshot), tag',
                      'Commits are immutable snapshots — changing history creates new commits',
                      'git reflog = undo button for almost any Git mistake (90-day window)',
                      'merge: preserves history, creates merge commit. rebase: rewrites to linear history.',
                      'Never force push to shared branches — it breaks team members\' local history',
                    ],
                  },
                  sort_order: 70,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 2,
                  is_interactive: false,
                  is_required: true,
                },
              ],
            },
          ],
          questions: [
            {
              question_type: 'MCQ',
              thinking_type: 'LOGIC',
              difficulty_level: 'BEGINNER',
              title: 'What git commit Stores',
              question_text: 'What does a Git commit object actually store?',
              options_json: {
                options: [
                  { id: 'a', text: 'A diff (patch) of changes from the previous commit' },
                  { id: 'b', text: 'A complete snapshot of all tracked files at that point in time, referenced by a tree SHA' },
                  { id: 'c', text: 'A list of changed filenames and their new content' },
                  { id: 'd', text: 'The compressed delta of each changed file from HEAD' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'Git commits store snapshots (full tree references), not diffs. Space efficiency comes from shared blobs for unchanged files.',
              explanation: 'A Git commit stores a SNAPSHOT — a pointer to a tree object that references the state of ALL tracked files. It does NOT store diffs. Space efficiency comes from Git\'s content-addressing: if a file is unchanged between commits, both commits point to the same blob object. "git show" and "git diff" compute diffs dynamically by comparing two snapshots.',
              complexity_score: 2,
              estimated_time: 60,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'INTERMEDIATE',
              title: 'Recover Lost Commit',
              question_text: 'A developer ran "git reset --hard HEAD~2" accidentally, losing 2 commits of work. How do you recover them?',
              scenario_context: `# Current state after the accident:
git log --oneline
# abc123 initial setup
# def456 feature base

# Lost commits were: "feature complete" and "tests added"
# git status is clean (hard reset)`,
              correct_answer: 'Use git reflog to find the SHAs of the lost commits, then git reset --hard <sha-of-last-lost-commit> to restore.',
              expected_reasoning: 'Hard reset doesn\'t delete commits from .git/objects — it just moves the branch pointer. reflog records where HEAD was before the reset.',
              explanation: `Recovery steps:
git reflog
# Shows: HEAD@{0}: reset: moving to HEAD~2
#        HEAD@{1}: commit: tests added      ← this is the commit you lost
# Copy the SHA from HEAD@{1}

git reset --hard HEAD@{1}
# or: git reset --hard <sha>

# Verify:
git log --oneline
# Should show all commits including the "recovered" ones

Why it works: git reset --hard moves the branch pointer. The commits and their objects remain in .git/objects. reflog remembers every HEAD position for 90 days.`,
              complexity_score: 2,
              estimated_time: 120,
            },
            {
              question_type: 'MCQ',
              thinking_type: 'INTERVIEW',
              difficulty_level: 'INTERMEDIATE',
              title: 'Rebase vs Merge for Feature Branch',
              question_text: 'Your feature branch is 5 commits behind main. Two teammates\' changes are now in main. You want to integrate main\'s changes into your feature branch WITHOUT creating a merge commit. What command do you use?',
              options_json: {
                options: [
                  { id: 'a', text: 'git merge main — creates a merge commit' },
                  { id: 'b', text: 'git rebase main — replays your commits on top of current main' },
                  { id: 'c', text: 'git cherry-pick main — applies main\'s commits to your branch' },
                  { id: 'd', text: 'git pull --rebase origin main — same as rebase against remote' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'rebase replays your commits on top of the target branch, creating new commits without a merge commit. Result: linear history.',
              explanation: 'git rebase main re-applies your feature branch commits ON TOP of the current main tip. Result: your feature branch has all of main\'s changes PLUS your commits on top — linear history, no merge commit. This is safe for feature branches that only you work on. Caution: rebasing changes commit SHAs — if others have checked out your branch, they\'ll have conflicts. Also accept: git pull --rebase origin main which does the same against the remote.',
              complexity_score: 2,
              estimated_time: 90,
            },
          ],
        },
      ],
    },
  ],
};
