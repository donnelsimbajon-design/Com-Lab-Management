import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const labIdStr = searchParams.get("labId");
    const datetimeStr = searchParams.get("datetime");

    if (!labIdStr) {
      return NextResponse.json(
        { error: "Missing labId parameter" },
        { status: 400 }
      );
    }

    const labId = parseInt(labIdStr, 10);
    if (isNaN(labId)) {
      return NextResponse.json({ error: "Invalid lab ID" }, { status: 400 });
    }

    // Default to current time if datetime is not provided
    const dateObj = datetimeStr ? new Date(datetimeStr) : new Date();
    const dayOfWeek = dateObj.getDay(); // 0-6 (0 is Sunday in JS, align DB accordingly)
    
    // Format Time to HH:mm for easy comparison if stored that way in DB
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const currentTimeStr = `${hours}:${minutes}`;

    const { data: schedule, error } = await supabase
      .from('sa_schedules')
      .select(`
        start_time,
        end_time,
        sa:profiles!sa_schedules_sa_id_fkey(id, full_name, last_name, role)
      `)
      .eq('lab_id', labId)
      .eq('day_of_week', dayOfWeek)
      .lte('start_time', currentTimeStr)
      .gt('end_time', currentTimeStr)
      .limit(1)
      .single()

    if (error || !schedule || !schedule.sa) {
      // Gracefully handle missing table or zero rows
      return NextResponse.json({ sa: null });
    }
    
    // Type casting
    const saProfile = Array.isArray(schedule.sa) ? schedule.sa[0] : schedule.sa;

    return NextResponse.json({
      sa: {
        id: saProfile.id,
        name: `${saProfile.full_name} ${saProfile.last_name}`,
      },
      schedule: {
        startTime: schedule.start_time,
        endTime: schedule.end_time,
      }
    });
  } catch (error) {
    console.error("Error fetching on-duty SA:", error);
    return NextResponse.json(
      { error: "Failed to fetch on-duty SA" },
      { status: 500 }
    );
  }
}
