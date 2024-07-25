# 40k_tool

### setup

#### dependencies

#### Husky Pre-Commit

First time setup steps

```
npm install 
```
```

```
```
chmod +x .husky/_/pre-commit
```
```
cat << 'EOF' > .husky/_/pre-commit
#!/bin/sh
npx lint-staged
EOF
```
```
npm init -y
```
```
node app.js
```

from then on project workflow is as follows

```
npm install
npm init -y
node app.js
```

### todo list:

#### Prioritised

- attacker drop down pulling from bs data pr (in dev)
- attacking weapon profile selection (in dev)
- Split saved profiles into att prof, def profile, and paired profiles (backlog)
- impliment local browser storage for saving profiles between sessions (backlog)
- clean up repo and remove aos logic and unused files (backlog)
- remove bs data from repo (use github as source of truth) (backlog)
- setup branch rules and javascript linting (backlog)
- write terraform module for deploying calculator to s3 with dns and networking (backlog)
- write actions pipeline to deploy terraform and application on merge (backlog)
- graph improvements (nth percentiles for different levels of condidence) (idea)

- given a defense profile -> what what are some general attack profiles would be required to kill the whole unit with 95 percent confidence (high level idea)
- given an attack profile -> what are some general defense profiles that result in the whole unit being killed with 95 percent confidence (high level idea)
- given a standard form army list -> some data-driven insights generated (high level idea)
-
