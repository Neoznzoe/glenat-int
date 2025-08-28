import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, Briefcase, Wallet, User, CalendarDays } from 'lucide-react';

export function JobOffer() {
  const jobInfo = [
    { icon: MapPin, text: 'Grenoble' },
    { icon: MapPin, text: 'Boulogne' },
    { icon: Briefcase, text: 'CDD', sub: '1er trimestre 2025' },
    { icon: User, text: 'Contact', sub: 'Anais Grillet' },
    { icon: CalendarDays, text: 'Annonce du', sub: '29/11/2024' },
    { icon: Wallet, text: 'Rémunération', sub: 'A définir selon le profil.' },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-bold">
          Le fonds Glénat recherche, un·e chargé·e de développement du couvent sainte Cécile (F/H).
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Chargé·e de développement du couvent Sainte Cécile (F/H)
        </p>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
          {jobInfo.map(({ icon: Icon, text, sub }) => (
            <li
              key={text}
              className={`flex gap-2 ${sub ? 'items-start' : 'items-center'}`}
            >
              <Icon className="h-6 w-6 text-[#ff3b30]" />
              <div className={sub ? 'leading-tight' : 'flex items-center h-6'}>
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
          </TabsList>
          <TabsContent value="resume" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Depuis 2009, le couvent Saint Cécile, édifice du XVIIe siècle installé au cœur du quartier historique de Grenoble est le siège social du groupe Glénat. Il abrite également les activités d’intérêt général du Fonds Glénat pour le patrimoine et la création de la Fondation d’entreprise.
            </p>
          </TabsContent>
          <TabsContent value="mission" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Mission détaillée à compléter.
            </p>
          </TabsContent>
          <TabsContent value="profil" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Profil recherché à compléter.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default JobOffer;
