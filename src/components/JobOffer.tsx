import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, Briefcase, Wallet, User, CalendarDays } from 'lucide-react';

export function JobOffer() {
  const jobInfo = [
    { icon: MapPin, text: 'Grenoble', color: 'text-[#004072]' },
    // { icon: MapPin, text: 'Boulogne', color: 'text-[#004072]' },
    { icon: Briefcase, text: 'CDI', sub: 'dès que possible', color: 'text-[#00D27A]' },
    { icon: User, text: 'Contact', sub: 'Anais Grillet', color: 'text-primary' },
    { icon: CalendarDays, text: 'Annonce du :', sub: '25/07/2025', color: 'text-[#F5803E]' },
    {
      icon: Wallet, text: 'Rémunération', sub: 'A définir selon le profil.', color: 'text-[#27BCFD]',
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold">
          Le Groupe Glénat recherche pour son service éditorial livres, un·e chargé·e de développement commercial (F/H).
        </CardTitle>
        <p className="text-base text-muted-foreground">
          Chargé·e de développement du couvent Sainte Cécile (F/H)
        </p>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-wrap gap-6 text-base font-medi  mb-6">
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
            <p className="text-base">
              Depuis 2009, le couvent Saint Cécile, édifice du XVIIe siècle installé au cœur du quartier historique de Grenoble est le siège social du groupe Glénat. Il abrite également les activités d’intérêt général du Fonds Glénat pour le patrimoine et la création de la Fondation d’entreprise.
            </p>
          </TabsContent>
          <TabsContent value="mission" className="mt-4">
            <p className="text-base">
              Au sein du pôle Livre Grenoble, vos missions principales seront les suivantes :
                - Assurer la régie publicitaire de L’Alpe, Ski Français, des ouvrages pratiques et de tout nouveau titre ou guide ;
                - Animer et développer le portefeuille d’abonnés de la revue L’Alpe ;
                - Développer les partenariats et coordonner les projets d’édition déléguée (magazines stations, territoires, guides, livres, BD, etc.) ;
                - Concourir à tous les projets permettant de développer le CA de la branche d’activités.
            </p>
          </TabsContent>
          <TabsContent value="profil" className="mt-4">
            <p className="text-base">
              - De formation supérieure (bac+5) dans le domaine commercial ou marketing, vous justifiez d’une première expérience professionnelle réussie dans les secteurs de l’édition ou du tourisme.
              - Vous bénéficiez d’une bonne connaissance des entreprises locales, du secteur de la montagne et avez envie de développer une activité et un chiffre d’affaires. 
              - Reconnu·e pour votre aisance relationnelle et votre excellente présentation, vous savez faire preuve de rigueur et d’autonomie. 
            </p>
          </TabsContent>
          <TabsContent value="avantages" className='mt-4'>
            <p className="text-base">
              13ème mois, participation et intéressement, mutuelle, titre-restaurant, télétravail partiel possible à partir de 6 mois d'ancienneté.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default JobOffer;
