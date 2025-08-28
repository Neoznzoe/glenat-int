import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export interface JobInfo {
  icon: LucideIcon;
  text: string;
  sub?: string;
  color: string;
}

export interface JobOfferProps {
  title: string;
  subtitle: string;
  jobInfo: JobInfo[];
  resume: string;
  mission: string[];
  profil: string[];
  avantages: string[];
}

export function JobOffer({
  title,
  subtitle,
  jobInfo,
  resume,
  mission,
  profil,
  avantages,
}: JobOfferProps) {
  const missionItems = mission.filter((item) => item.trim());
  const profilItems = profil.filter((item) => item.trim());
  const avantagesItems = avantages.filter((item) => item.trim());
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <p className="text-base text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-wrap gap-10 text-base font-medium mb-6">
          {jobInfo.map(({ icon: Icon, text, sub, color }) => (
            <li key={text} className="flex items-center gap-2">
              <Icon className={`h-6 w-6 ${color}`} />
              <div
                className={
                  sub
                    ? 'flex flex-col justify-center leading-tight'
                    : 'flex items-center h-6'
                }
              >
                <span>{text}</span>
                {sub && (
                  <span className="block text-xs text-muted-foreground">
                    {sub}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
        <Tabs defaultValue="resume" className="w-full">
          <TabsList className="flex justify-start border-b bg-transparent p-0 text-sm text-muted-foreground rounded-none">
            <TabsTrigger
              value="resume"
              className="w-32 rounded-none border-b-2 border-transparent px-4 py-2 flex items-center justify-center text-center data-[state=active]:border-[#ff3b30] data-[state=active]:bg-transparent data-[state=active]:text-[#ff3b30] data-[state=active]:shadow-none"
            >
              RÉSUMÉ
            </TabsTrigger>
            <TabsTrigger
              value="mission"
              className="w-32 rounded-none border-b-2 border-transparent px-4 py-2 flex items-center justify-center text-center data-[state=active]:border-[#ff3b30] data-[state=active]:bg-transparent data-[state=active]:text-[#ff3b30] data-[state=active]:shadow-none"
            >
              MISSION
            </TabsTrigger>
            <TabsTrigger
              value="profil"
              className="w-32 rounded-none border-b-2 border-transparent px-4 py-2 flex items-center justify-center text-center data-[state=active]:border-[#ff3b30] data-[state=active]:bg-transparent data-[state=active]:text-[#ff3b30] data-[state=active]:shadow-none"
            >
              PROFIL
            </TabsTrigger>
            <TabsTrigger
              value="avantages"
              className="w-32 rounded-none border-b-2 border-transparent px-4 py-2 flex items-center justify-center text-center data-[state=active]:border-[#ff3b30] data-[state=active]:bg-transparent data-[state=active]:text-[#ff3b30] data-[state=active]:shadow-none"
            >
              AVANTAGES
            </TabsTrigger>
          </TabsList>
          <TabsContent value="resume" className="mt-4">
          {resume?.trim() ? (
              <p className="text-base">{resume}</p>
            ) : (
              <p className="text-base text-muted-foreground">
                Pas d'informations pour le moment
              </p>
            )}
          </TabsContent>
          <TabsContent value="mission" className="mt-4">
            {missionItems.length ? (
              <ul className="list-disc pl-6 space-y-2 text-base">
                {missionItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-muted-foreground">
                Pas d'informations pour le moment
              </p>
            )}
          </TabsContent>
          <TabsContent value="profil" className="mt-4">
            {profilItems.length ? (
              <ul className="list-disc pl-6 space-y-2 text-base">
                {profilItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-muted-foreground">
                Pas d'informations pour le moment
              </p>
            )}
          </TabsContent>
          <TabsContent value="avantages" className="mt-4">
            {avantagesItems.length ? (
              <ul className="list-disc pl-6 space-y-2 text-base">
                {avantagesItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-muted-foreground">
                Pas d'informations pour le moment
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default JobOffer;

