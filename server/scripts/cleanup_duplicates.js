const supabase = require('../utils/supabase');

async function cleanupDuplicates() {
    console.log("🧹 Starting Duplicate Restaurant Cleanup...");

    try {
        // 1. Fetch all restaurants
        const { data: restaurants, error } = await supabase
            .from('restaurants')
            .select('id, name, created_at, email')
            .order('created_at', { ascending: false }); // Newest first

        if (error) throw error;

        console.log(`Found ${restaurants.length} total restaurants.`);

        const seenNames = new Set();
        const seenEmails = new Set();
        const toDelete = [];

        // 2. Identify duplicates (Keep the FIRST one found -> Newest)
        for (const r of restaurants) {
            const nameKey = r.name.trim().toLowerCase();
            const emailKey = r.email.trim().toLowerCase();

            if (seenNames.has(nameKey) || seenEmails.has(emailKey)) {
                toDelete.push(r.id);
                console.log(`❌ Marking Duplicate: ${r.name} (${r.email}) - ID: ${r.id}`);
            } else {
                seenNames.add(nameKey);
                seenEmails.add(emailKey);
                console.log(`✅ Keeping: ${r.name} (${r.email})`);
            }
        }

        if (toDelete.length === 0) {
            console.log("🎉 No duplicates found!");
            return;
        }

        console.log(`\n🗑️ Deleting ${toDelete.length} duplicates...`);

        // 3. Delete duplicates
        const { error: deleteError } = await supabase
            .from('restaurants')
            .delete()
            .in('id', toDelete);

        if (deleteError) throw deleteError;

        console.log("✨ Cleanup Complete!");

    } catch (err) {
        console.error("🔥 Cleanup Failed:", err.message);
    }
}

cleanupDuplicates();
