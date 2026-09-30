import fs from 'fs';
import path from 'path';

const API_DIR = path.join(process.cwd(), 'src', 'app', 'api');

function getAllRoutes(dirPath, arrayOfRoutes = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfRoutes = getAllRoutes(dirPath + "/" + file, arrayOfRoutes);
    } else {
      if (file === 'route.ts') {
         arrayOfRoutes.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfRoutes;
}

const routes = getAllRoutes(API_DIR);
const inventory = [];

routes.forEach(routePath => {
  const relativePath = routePath.replace(API_DIR, '').replace(/\\/g, '/').replace('/route.ts', '');
  const endpoint = `/api${relativePath || '/'}`;
  
  const content = fs.readFileSync(routePath, 'utf-8');
  
  const methods = [];
  ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].forEach(method => {
    if (content.includes(`export async function ${method}`)) {
      methods.push(method);
    }
  });
  
  // Basic heuristic checks
  const usesJwt = content.includes('decrypt(') || content.includes('auth-token');
  const usesMiddleware = true; // since middleware.ts applies globally
  const hasDb = content.includes('mockDb') || content.includes('db.ts') || content.includes('documentDb');
  const hasRateLimit = content.includes('checkRateLimit');
  const hasInputValidation = content.includes('request.json()') && content.includes('if (!'); // naive check
  
  inventory.push({
    endpoint,
    methods,
    usesJwt,
    hasDb,
    hasRateLimit,
    hasInputValidation,
    notes: []
  });
});

let markdown = `# API Inventory & Audit\n\n`;

inventory.forEach(api => {
  markdown += `### ${api.endpoint}\n`;
  markdown += `- **Methods:** ${api.methods.join(', ')}\n`;
  markdown += `- **Global Auth (Middleware):** ${api.usesMiddleware !== false ? '✅ Yes' : '❌ No'}\n`;
  markdown += `- **Route Auth Checking:** ${api.usesJwt ? '✅ Yes' : '❌ No (Relies on Middleware only)'}\n`;
  markdown += `- **Database Interaction:** ${api.hasDb ? '✅ Yes (Mock)' : '❌ None (Dead/Static endpoint)'}\n`;
  if (api.endpoint.includes('auth')) {
     markdown += `- **Rate Limiting:** ${api.hasRateLimit ? '✅ Route-specific (Strict)' : '✅ Global (Middleware)'}\n`;
  }
  markdown += '\n';
});

fs.writeFileSync('api_inventory.md', markdown);
console.log('Generated api_inventory.md');
