const supabase = require('./utils/supabase');

async function clearChatHistory() {
    console.log('Clearing chat_history table...');
    const { data, error } = await supabase
        .from('chat_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (error) {
        console.error('Error clearing chat history:', error.message);
    } else {
        console.log('Successfully cleared chat history.');
    }
}

clearChatHistory();
