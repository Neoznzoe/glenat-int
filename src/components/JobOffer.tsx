import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, Briefcase, Wallet } from 'lucide-react';

export function JobOffer() {
  const jobInfo = [
    { icon: MapPin, text: 'Grenoble' },
    { icon: MapPin, text: 'Boulogne' },
    { icon: Briefcase, text: 'CDD' },
    { icon: Wallet, text: 'Rémunération' },
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
          {jobInfo.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <Tabs defaultValue="resume">
          <TabsList>
            <TabsTrigger value="resume">RÉSUMÉ</TabsTrigger>
            <TabsTrigger value="mission">MISSION</TabsTrigger>
            <TabsTrigger value="profil">PROFIL</TabsTrigger>
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
