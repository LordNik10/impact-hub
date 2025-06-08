import { sql } from "@/app/(config)/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ user: string }> }
) {
  try {
    const { user } = await params;

    if (!user) {
      return NextResponse.json(
        { error: "Missing user ID parameter" },
        { status: 400 }
      );
    }

    const res =
      await sql`SELECT github_token FROM public."Users" WHERE id = ${user}`;

    return NextResponse.json(
      { github_token: res[0].github_token },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
