import { supabase } from "./supabase-client.ts"

export async function fetch(table: string, id: string): Promise<any> {
    const { data, error } = await supabase.from(table).select("*").eq("id", id).single()
    if (error) {
        throw error
    }
    return data
}

export async function fetch_by(table: string, column: string, value: string): Promise<any> {
    const { data, error } = await supabase.from(table).select("*").eq(column, value).single()
    if (error) {
        throw error
    }
    return data
}

export async function fetch_all(table: string): Promise<any> {
    const { data, error } = await supabase.from(table).select("*")
    if (error) {
        throw error
    }
    return data
}

export async function fetch_all_by(table: string, column: string, value: string): Promise<any> {
    const { data, error } = await supabase.from(table).select("*").eq(column, value)
    if (error) {
        throw error
    }
    return data
}

export async function fetch_all_by_in(table: string, column: string, values: string[]): Promise<any> {
    console.log('fetch_all_by', table, column, values)

    const { data, error } = await supabase.from(table).select("*").in(column, values)

    console.log('data', data)
    console.log('error', error)
    if (error) {
        throw error
    }
    return data
}

export async function insert(table: string, data: any): Promise<any> {
    const { error } = await supabase.from(table).insert(data)
    if (error) {
        throw error
    }
}

export async function update(table: string, id: string, data: any): Promise<any> {
    const { error } = await supabase.from(table).update(data).eq("id", id)
    if (error) {
        throw error
    }
}

export async function upsert(table: string, data: any): Promise<any> {
    const { error } = await supabase.from(table).upsert(data)
    if (error) {
        throw error
    }
}

export async function delete_by(table: string, column: string, value: string): Promise<any> {
    const { error } = await supabase.from(table).delete().eq(column, value)
    if (error) {
        throw error
    }
}
