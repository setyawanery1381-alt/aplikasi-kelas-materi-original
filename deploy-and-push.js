import { execSync } from 'child_process';

const gitPath = 'C:\\Users\\Saka Farma\\AppData\\Local\\Programs\\MinGit\\cmd\\git.exe';

try {
  console.log('1. Committing fixes...');
  execSync(`"${gitPath}" add .`, { stdio: 'inherit' });
  execSync(`"${gitPath}" commit -m "Fix member session role Customer and auto-route to home"`, { stdio: 'inherit' });

  console.log('2. Pushing to GitHub...');
  execSync(`"${gitPath}" push origin main`, { stdio: 'inherit' });

  console.log('3. Deploying to Vercel production...');
  execSync('npx vercel --prod --yes', { stdio: 'inherit' });

  console.log('DEPLOYMENT COMPLETE!');
} catch (err) {
  console.error('Error:', err.message);
}
