import { ArrowLeft, Github } from "lucide-react";
import Link from "next/link";

import { ActivityChart } from "@/components/chart/activity-chart";
import { CodeDistributionChart } from "@/components/chart/code-distributions-chart";
import { ContributionsChart } from "@/components/chart/contributions-chart";
import { ConnectRepoDialog } from "@/components/connect-repo-dialog";
import { RepositoryAnalyzerPage } from "@/components/repository-analyzer-page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cookies } from "next/headers";
import { GithubField } from "../GithubField";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("github_session");

  // In a real app, you would fetch the project data based on the ID
  const resProject = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/project/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const project: {
    id: string;
    name: string;
    repo_name: string;
    user_id: string;
    owner: string;
  } = await resProject.json();

  let contributors;
  let repoDetails;

  if (project.repo_name) {
    const repoRes = await fetch(
      `https://api.github.com/repos/${project.owner}/${project.repo_name}`,
      {
        headers: {
          Authorization: `token ${sessionCookie?.value}`,
        },
      }
    );

    if (repoRes.ok) {
      repoDetails = await repoRes.json();
    }

    const contribRes = await fetch(
      `https://api.github.com/repos/${project.owner}/${project.repo_name}/contributors`,
      {
        headers: {
          Authorization: `token ${sessionCookie?.value}`,
        },
      }
    );

    if (contribRes.ok) {
      contributors = await contribRes.json();
    }
  }

  return (
    <div className="container p-10 h-full">
      <div className="mb-8">
        <Link
          href="/"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Torna alla dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
      </div>

      {!project.repo_name || !contributors || !repoDetails ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">
                Collega un repository GitHub
              </CardTitle>
              <CardDescription className="text-center">
                Collega un repository GitHub per sbloccare tutte le funzionalità
                del progetto
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ConnectRepoDialog projectId={id}>
                <Button>
                  <Github className="mr-2 h-4 w-4" />
                  Collega Repository
                </Button>
              </ConnectRepoDialog>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analysis">Analisi</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="settings">Impostazioni</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Panoramica del Progetto</CardTitle>
                <CardDescription>
                  Visualizza le metriche principali del tuo progetto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Commit Totali
                    </div>
                    <div className="text-2xl font-bold">128</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Pull Requests
                    </div>
                    <div className="text-2xl font-bold">24</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Collaboratori
                    </div>
                    <div className="text-2xl font-bold">5</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Attività nel Tempo</CardTitle>
                  <CardDescription>
                    Commit e pull request negli ultimi 30 giorni
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ActivityChart />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contribuzioni per Utente</CardTitle>
                  <CardDescription>
                    Contributi totali per collaboratore
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ContributionsChart />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuzione del Codice</CardTitle>
                  <CardDescription>
                    Suddivisione per linguaggio di programmazione
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <CodeDistributionChart />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Punteggi Collaboratori</CardTitle>
                  <CardDescription>
                    Basati sui pesi configurati nelle impostazioni
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Marco Rossi", score: 87, avatar: "MR" },
                      { name: "Laura Bianchi", score: 76, avatar: "LB" },
                      { name: "Giovanni Verdi", score: 92, avatar: "GV" },
                      { name: "Sofia Neri", score: 65, avatar: "SN" },
                      { name: "Luca Gialli", score: 81, avatar: "LG" },
                    ].map((user) => (
                      <div key={user.name} className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
                          <span className="text-xs font-medium">
                            {user.avatar}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="w-full bg-muted rounded-full h-2 mt-1">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${user.score}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="ml-4 font-bold">{user.score}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Attività Recenti</CardTitle>
                <CardDescription>
                  Le ultime attività nel repository
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-start pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3">
                        <span className="text-xs font-medium">U{i}</span>
                      </div>
                      <div>
                        <div className="font-medium">
                          Aggiornato file README.md
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {i} {i === 1 ? "ora" : "ore"} fa da Utente {i}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analysis" className="space-y-6">
            <RepositoryAnalyzerPage
              owner={project.owner}
              repo={project.repo_name}
              initialRepoDetails={repoDetails}
              initialContributors={contributors}
            />
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informazioni Generali</CardTitle>
                  <CardDescription>
                    Gestisci le impostazioni del tuo progetto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="project-name">Nome del Progetto</Label>
                      <Input id="project-name" defaultValue={project.name} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="project-description">Descrizione</Label>
                      <Textarea
                        id="project-description"
                        defaultValue="Descrizione del progetto"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Repository GitHub
                      </h3>
                      <div className="flex items-center">
                        <Github className="mr-2 h-5 w-5" />
                        <span>{project.name}</span>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          Cambia Repository
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurazione Punteggi</CardTitle>
                  <CardDescription>
                    Imposta i pesi per il calcolo dei punteggi dei collaboratori
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="commit-weight">Peso Commit</Label>
                          <span className="text-sm font-medium">5</span>
                        </div>
                        <Input
                          id="commit-weight"
                          type="range"
                          min="1"
                          max="10"
                          defaultValue="5"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Punti assegnati per ogni commit
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="pr-weight">Peso Pull Request</Label>
                          <span className="text-sm font-medium">8</span>
                        </div>
                        <Input
                          id="pr-weight"
                          type="range"
                          min="1"
                          max="10"
                          defaultValue="8"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Punti assegnati per ogni pull request creata
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="review-weight">
                            Peso Code Review
                          </Label>
                          <span className="text-sm font-medium">7</span>
                        </div>
                        <Input
                          id="review-weight"
                          type="range"
                          min="1"
                          max="10"
                          defaultValue="7"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Punti assegnati per ogni code review completata
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="issue-weight">
                            Peso Issue Risolte
                          </Label>
                          <span className="text-sm font-medium">6</span>
                        </div>
                        <Input
                          id="issue-weight"
                          type="range"
                          min="1"
                          max="10"
                          defaultValue="6"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Punti assegnati per ogni issue risolta
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="comment-weight">Peso Commenti</Label>
                          <span className="text-sm font-medium">3</span>
                        </div>
                        <Input
                          id="comment-weight"
                          type="range"
                          min="1"
                          max="10"
                          defaultValue="3"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Punti assegnati per ogni commento costruttivo
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button>Salva Configurazione</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Impostazioni Avanzate</CardTitle>
                <CardDescription>
                  Opzioni avanzate per il tuo progetto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GithubField user_id={project.user_id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
