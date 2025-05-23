import { sql } from "@/app/(config)/postgres";
import { NextResponse } from "next/server";
import { computeReputationScoring } from "reputation-scoring";

export async function POST(request: Request) {
  try {
    // Parse the webhook payload
    const payload = await request.json();

    // Get the GitHub event type from headers
    const githubEvent = request.headers.get("x-github-event");

    console.log(`Received webhook: ${githubEvent}`, payload);

    // Here you would process the webhook data
    // For example, trigger a new analysis, update database records, etc.
    const scores = await computeReputationScoring({
      repo: payload.repository.name,
      owner: payload.repository.owner.login,
      token: process.env.GITHUB_TOKEN,
    });

    await sql`INSERT INTO public."Scores" (owner, repository, username, score) VALUES ${scores.userScores
      .map(
        (score) =>
          `('${payload.repository.owner.login}', '${payload.repository.name}', '${score.user}', ${score.score})`
      )
      .join(
        ", "
      )} ON CONFLICT (repository, username) DO UPDATE SET score = EXCLUDED.score;`;

    // Handle the webhook based on the event type

    // For now, we'll just log it and return a success response
    return NextResponse.json({
      success: true,
      message: `Updated ${githubEvent} webhook for ${
        payload.repository.name
      }: ${scores.userScores.map((score) => `${score.user}: ${score.score}`)}`,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
