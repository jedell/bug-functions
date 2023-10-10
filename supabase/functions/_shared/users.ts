import { supabase } from "./supabase-client.ts";

export async function sendFriendRequest(sender_id: string, recipient_id: string) {
    const { data, error } = await supabase
        .from('friend_requests')
        .insert([
            { sender_id: sender_id, recipient_id: recipient_id }
        ]);
    return { data, error };
}

export async function acceptFriendRequest(request_id: string, sender_id: string, recipient_id: string) {
    const { data: updateData, error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'ACCEPTED' })
        .eq('id', request_id)
        .eq('status', 'PENDING');

    const { data: insertData, error: insertError } = await supabase
        .from('friends')
        .insert([
            { user_id: sender_id, friend_id: recipient_id },
            { user_id: recipient_id, friend_id: sender_id }
        ]);

    return { updateData, updateError, insertData, insertError };
}

export async function declineFriendRequest(request_id: string) {
    const { data, error } = await supabase
        .from('friend_requests')
        .update({ status: 'DECLINED' })
        .eq('id', request_id)
        .eq('status', 'PENDING');
    return { data, error };
}
