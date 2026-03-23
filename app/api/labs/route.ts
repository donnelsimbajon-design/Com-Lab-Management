import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { data: labs, error } = await supabase
      .from('laboratories')
      .select('id')
      .order('id', { ascending: true })

    if (error) throw error

    // Reconstructing the name since the DB currently does not have a `name` column
    const formattedLabs = labs.map(l => ({
      id: l.id,
      name: `Laboratory ${l.id}`
    }))

    return NextResponse.json(formattedLabs)
  } catch (error) {
    console.error("Error fetching labs:", error);
    return NextResponse.json(
      { error: "Failed to fetch laboratories" },
      { status: 500 }
    );
  }
}
