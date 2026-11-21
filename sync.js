import { execSync } from 'child_process';

const gitPath = 'C:\\Users\\Saka Farma\\AppData\\Local\\Programs\\MinGit\\cmd\\git.exe';

try {
  execSync(`"${gitPath}" add -A`, { stdio: 'inherit' });
  execSync(`"${gitPath}" commit -m "Update fixes"`, { stdio: 'inherit' });
  const token = execSync('gh auth token', { encoding: 'utf8' }).trim();
  const remoteWithToken = `https://x-access-token:${token}@github.com/setyawanery1381-alt/portal-kelas-sangcreator.git`;
  execSync(`"${gitPath}" push "${remoteWithToken}" main`, { stdio: 'inherit' });
  console.log('GitHub sync complete!');
} catch (e) {
  console.log('GitHub sync note:', e.message);
}
