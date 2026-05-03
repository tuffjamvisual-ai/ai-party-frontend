const { createClient } = require('@supabase/supabase-js');

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: ministers } = await s.from('dept_ministers').select('id, name, slug').is('photo_url', null);
  console.log('Ministers missing photos:', ministers.length);

  for (const minister of ministers) {
    try {
      const slug = minister.slug;
      if (!slug) continue;
      
      const res = await fetch(`https://www.gov.uk/api/content/government/people/${slug}`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'PeoplesChamber/1.0' }
      });
      
      if (!res.ok) { console.log('No data for:', minister.name); continue; }
      
      const data = await res.json();
      const photo = data.details?.image?.url;
      
      if (photo) {
        await s.from('dept_ministers').update({ photo_url: photo }).eq('id', minister.id);
        console.log('Updated:', minister.name);
      } else {
        console.log('No photo found for:', minister.name);
      }
      
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.log('Error for', minister.name, e.message);
    }
  }
  console.log('Done');
}

run();
