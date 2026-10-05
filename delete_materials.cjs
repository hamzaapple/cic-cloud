const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL="?(.*?)"?$/m)[1];
const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="?(.*?)"?$/m)[1];

async function run() {
  // 1. Get all courses
  let res = await fetch(url + '/rest/v1/courses', { 
    headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } 
  });
  let courses = await res.json();
  
  // AI Cyber: ca4069a4-fc50-4e96-8fb7-c1f4ea67da4f, Cyber: 26da2520-a6e5-4a69-a1fc-2216503c1d93
  const targetCourseIds = courses
    .filter(c => c.department_id === 'ca4069a4-fc50-4e96-8fb7-c1f4ea67da4f' || c.department_id === '26da2520-a6e5-4a69-a1fc-2216503c1d93')
    .map(c => c.id);
    
  console.log('Courses to clear materials from:', targetCourseIds.length);
  
  if (targetCourseIds.length === 0) return;
  
  const courseIdsParam = `in.(${targetCourseIds.join(',')})`;
  
  // 2. Delete materials
  const delRes = await fetch(`${url}/rest/v1/materials?course_id=${courseIdsParam}`, {
    method: 'DELETE',
    headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
  });
  
  console.log('Delete materials status:', delRes.status);
  
  // 3. Just to be completely clean, the user said "خلي علوم حاسب زي مهو"
}
run();
