import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ labId: string }> }
) {
  try {
    const p = await params;
    const labId = parseInt(p.labId, 10);

    if (isNaN(labId)) {
      return NextResponse.json({ error: "Invalid lab ID" }, { status: 400 });
    }

    const { data: assignment, error } = await supabase
      .from('lab_assignments')
      .select(`
        sa_id,
        sa:profiles!lab_assignments_sa_id_fkey(id, full_name, last_name)
      `)
      .eq('lab_id', labId)
      .limit(1)
      .single()

    if (error || !assignment || !assignment.sa) {
      // Gracefully handle missing table or zero rows
      return NextResponse.json({ sa: null });
    }

    // Type casting because PostgREST returns related items as array or object depending on relation
    const saProfile = Array.isArray(assignment.sa) ? assignment.sa[0] : assignment.sa;

    return NextResponse.json({
      sa: {
        id: saProfile.id,
        name: `${saProfile.full_name} ${saProfile.last_name}`,
      },
    });
  } catch (error) {
    console.error("Error fetching assigned SA:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigned SA" },
      { status: 500 }
    );
  }
}
