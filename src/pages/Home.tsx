import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Users,
  Home as HomeIcon,
  ExternalLink,
  ChevronRight,
  Clock,
  MapPin,
  UserCheck
} from 'lucide-react';

export function Home() {
  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur votre espace de travail</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Section Actualités */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HomeIcon className="h-5 w-5 text-[#ff3b30]" />
            <span>Actualités</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-[#ff3b30] pl-4">
              <h3 className="font-semibold text-gray-900">Nouvelle mise à jour disponible</h3>
              <p className="text-gray-600 text-sm">Des améliorations de performance ont été déployées.</p>
              <span className="text-xs text-gray-400">Il y a 2 heures</span>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900">Réunion équipe prévue</h3>
              <p className="text-gray-600 text-sm">Réunion hebdomadaire programmée pour demain à 14h.</p>
              <span className="text-xs text-gray-400">Il y a 5 heures</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carrousel de couvertures */}
      <Card>
        <CardHeader>
          <CardTitle>Projets en cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="relative group cursor-pointer">
                <div className="h-32 bg-gradient-to-br from-[#ff3b30] to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Projet {item}</span>
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <ChevronRight className="h-6 w-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-[#ff3b30]" />
              <span>Calendrier</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium text-sm">Réunion équipe</div>
                  <div className="text-xs text-gray-500">14:00 - 15:00</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium text-sm">Formation</div>
                  <div className="text-xs text-gray-500">16:00 - 17:30</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Absences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-[#ff3b30]" />
              <span>Absences</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Congés restants</span>
                <span className="font-semibold text-[#ff3b30]">12 jours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">RTT restants</span>
                <span className="font-semibold text-blue-600">5 jours</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Demander un congé
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Télétravail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HomeIcon className="h-5 w-5 text-[#ff3b30]" />
              <span>Télétravail</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Jours utilisés</span>
                <span className="font-semibold">8/20</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#ff3b30] h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Planifier télétravail
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-[#ff3b30]" />
            <span>Visites programmées</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Client ABC</h3>
              <p className="text-sm text-gray-600">Présentation produit</p>
              <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Demain 10:00</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Partenaire XYZ</h3>
              <p className="text-sm text-gray-600">Réunion stratégique</p>
              <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Vendredi 14:00</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3 colonnes de liens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ressources RH</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Fiches de paie', 'Demandes de congés', 'Formation', 'Évaluations'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
                >
                  <span className="text-sm text-gray-700">{link}</span>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Outils</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Messagerie', 'Drive partagé', 'Planning', 'Support IT'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
                >
                  <span className="text-sm text-gray-700">{link}</span>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Liens utiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Intranet', 'Documentation', 'Contacts', 'Aide'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
                >
                  <span className="text-sm text-gray-700">{link}</span>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}