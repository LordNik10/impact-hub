import { sql } from "@/app/(config)/postgres";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ user: string }> }
) {
  try {
    const { user } = await params;

    const body = await request.json();
    const { githubToken } = body;

    if (!user)
      return NextResponse.json(
        { error: "Missing user parameter" },
        { status: 400 }
      );

    if (!githubToken)
      return NextResponse.json(
        { error: "Missing GitHub token" },
        { status: 400 }
      );

    await sql`UPDATE public."Users" SET github_token = ${githubToken} WHERE id = ${user}`;

    return NextResponse.json(
      {
        message: "User token saved successfully",
      },
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
