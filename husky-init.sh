#!/bin/sh

chmod u+x .husky/_/pre-commit 

cat << 'EOF' > .husky/_/pre-commit
#!/bin/sh
npx lint-staged
EOF